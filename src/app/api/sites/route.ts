import { NextResponse } from 'next/server';
import { getSites, saveSites, Site } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(getSites());
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const sites = getSites();
    
    // Add new site
    const newSite: Site = {
      id: uuidv4(),
      name: (data.name || '').trim(),
      url: (data.url || '').trim().replace(/\/+$/, ''),
      username: (data.username || '').trim(),
      applicationPassword: (data.applicationPassword || '').trim(),
      gscUrl: (data.gscUrl || '').trim(),
      ga4PropertyId: (data.ga4PropertyId || '').trim(),
      tags: data.tags || [],
    };
    
    sites.push(newSite);
    saveSites(sites);
    
    return NextResponse.json(newSite);
  } catch {
    return NextResponse.json({ error: 'Failed to save site' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Site ID required' }, { status: 400 });
    }
    
    let sites = getSites();
    sites = sites.filter(s => s.id !== id);
    saveSites(sites);
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 });
  }
}
