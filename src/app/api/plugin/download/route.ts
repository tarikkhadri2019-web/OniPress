import { NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { deflateRawSync } from 'zlib';

/**
 * Builds a standard POSIX zip archive with forward slashes (/)
 * ensuring 100% compatibility with Linux WordPress hosts.
 */
function buildPosixZip(files: { name: string; content: Buffer }[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  // CRC32 calculation table
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function calcCrc32(buf: Buffer): number {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  for (const f of files) {
    const nameBuf = Buffer.from(f.name.replace(/\\/g, '/'), 'utf8');
    const dataBuf = f.content;
    const crc = calcCrc32(dataBuf);

    const compressed = deflateRawSync(dataBuf);
    const useDeflate = compressed.length < dataBuf.length;
    const finalData = useDeflate ? compressed : dataBuf;
    const method = useDeflate ? 8 : 0;

    // Local file header (30 bytes + name)
    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0); // Local header signature
    lh.writeUInt16LE(20, 4);         // Version needed
    lh.writeUInt16LE(0, 6);          // General purpose flags
    lh.writeUInt16LE(method, 8);     // Compression method
    lh.writeUInt16LE(0, 10);         // Last mod time
    lh.writeUInt16LE(0, 12);         // Last mod date
    lh.writeUInt32LE(crc, 14);       // CRC-32
    lh.writeUInt32LE(finalData.length, 18); // Compressed size
    lh.writeUInt32LE(dataBuf.length, 22);   // Uncompressed size
    lh.writeUInt16LE(nameBuf.length, 26);   // File name length
    lh.writeUInt16LE(0, 28);         // Extra field length
    nameBuf.copy(lh, 30);

    localHeaders.push(lh, finalData);

    // Central directory header (46 bytes + name)
    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0); // Central directory signature
    cd.writeUInt16LE(20, 4);         // Version made by
    cd.writeUInt16LE(20, 6);         // Version needed
    cd.writeUInt16LE(0, 8);          // General purpose flags
    cd.writeUInt16LE(method, 10);    // Compression method
    cd.writeUInt16LE(0, 12);         // Last mod time
    cd.writeUInt16LE(0, 14);         // Last mod date
    cd.writeUInt32LE(crc, 16);       // CRC-32
    cd.writeUInt32LE(finalData.length, 20); // Compressed size
    cd.writeUInt32LE(dataBuf.length, 24);   // Uncompressed size
    cd.writeUInt16LE(nameBuf.length, 28);   // File name length
    cd.writeUInt16LE(0, 30);         // Extra field length
    cd.writeUInt16LE(0, 32);         // File comment length
    cd.writeUInt16LE(0, 34);         // Disk number start
    cd.writeUInt16LE(0, 36);         // Internal file attributes
    cd.writeUInt32LE(0, 38);         // External file attributes
    cd.writeUInt32LE(offset, 42);    // Relative offset of local header
    nameBuf.copy(cd, 46);

    centralHeaders.push(cd);
    offset += lh.length + finalData.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const c of centralHeaders) cdSize += c.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4);          // Number of this disk
  eocd.writeUInt16LE(0, 6);          // Disk where central directory starts
  eocd.writeUInt16LE(files.length, 8); // Number of central directory records on this disk
  eocd.writeUInt16LE(files.length, 10); // Total number of central directory records
  eocd.writeUInt32LE(cdSize, 12);     // Size of central directory
  eocd.writeUInt32LE(cdOffset, 16);   // Offset of start of central directory
  eocd.writeUInt16LE(0, 20);         // Comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

export async function GET() {
  try {
    const cwd = process.cwd();
    const pluginPhpPath = join(cwd, 'wp-plugin', 'onipress-connect', 'onipress-connect.php');
    const pluginReadmePath = join(cwd, 'wp-plugin', 'onipress-connect', 'README.md');
    const publicZipPath = join(cwd, 'public', 'onipress-connect.zip');

    if (!existsSync(pluginPhpPath)) {
      return NextResponse.json({ error: 'Plugin source file not found.' }, { status: 404 });
    }

    const phpBuffer = readFileSync(pluginPhpPath);
    const readmeBuffer = existsSync(pluginReadmePath) ? readFileSync(pluginReadmePath) : Buffer.from('');

    // Generate POSIX-compliant zip archive with forward slashes
    const zipBuffer = buildPosixZip([
      { name: 'onipress-connect/onipress-connect.php', content: phpBuffer },
      { name: 'onipress-connect/README.md', content: readmeBuffer },
    ]);

    // Keep public zip updated
    try {
      writeFileSync(publicZipPath, zipBuffer);
    } catch {
      // Non-blocking in read-only environments
    }

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="onipress-connect.zip"',
        'Content-Length': String(zipBuffer.length),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
