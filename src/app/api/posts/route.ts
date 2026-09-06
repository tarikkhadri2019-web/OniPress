import { NextResponse } from 'next/server';
import { getPosts, savePost, deletePost, PostRecord } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(getPosts());
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newPost: PostRecord = {
      id: uuidv4(),
      title: data.title || 'Untitled Post',
      siteName: data.siteName || 'Default Site',
      siteUrl: data.siteUrl || '',
      postUrl: data.postUrl || '',
      status: data.status || 'Live',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      performance: data.performance || '95% SEO',
      type: data.type || 'Blog Post',
    };
    savePost(newPost);
    return NextResponse.json(newPost);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required.' }, { status: 400 });
    }
    deletePost(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
