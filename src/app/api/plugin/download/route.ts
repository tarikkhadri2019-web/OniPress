import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function GET() {
  try {
    const cwd = process.cwd();
    const zipPath = join(cwd, 'public', 'onipress-connect.zip');
    const pluginDir = join(cwd, 'wp-plugin', 'onipress-connect');

    // If zip does not exist or plugin files were modified, ensure fresh zip
    if (!existsSync(zipPath) && existsSync(pluginDir)) {
      try {
        const psCommand = `Compress-Archive -Path '${pluginDir.replace(/\\/g, '/')}' -DestinationPath '${zipPath.replace(/\\/g, '/')}' -Force`;
        await execFileAsync('powershell', ['-NoProfile', '-NonInteractive', '-Command', psCommand]);
      } catch (err) {
        console.error('[Plugin Download API] Error auto-generating zip:', err);
      }
    }

    if (!existsSync(zipPath)) {
      return NextResponse.json({ error: 'Plugin package not found on server.' }, { status: 404 });
    }

    const fileBuffer = readFileSync(zipPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="onipress-connect.zip"',
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
