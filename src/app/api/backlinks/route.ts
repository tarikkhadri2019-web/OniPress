import { NextResponse } from 'next/server';
import { getBacklinks, saveBacklink, deleteBacklink, Backlink } from '@/lib/db';

export async function GET() {
  try {
    const backlinks = getBacklinks();
    return NextResponse.json(backlinks);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, url, anchorText, type, targetKeyword, active } = data;

    if (!url || !url.trim()) {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }
    if (!anchorText || !anchorText.trim()) {
      return NextResponse.json({ error: 'Anchor text is required.' }, { status: 400 });
    }

    const backlink: Backlink = {
      id: id || `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: url.trim(),
      anchorText: anchorText.trim(),
      type: type === 'external' ? 'external' : 'internal',
      targetKeyword: targetKeyword?.trim() || undefined,
      active: active !== undefined ? Boolean(active) : true,
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
    };

    saveBacklink(backlink);
    return NextResponse.json({ success: true, backlink });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Link ID is required.' }, { status: 400 });
    }

    deleteBacklink(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
