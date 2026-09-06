import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';

const MASK = '***************************';

export async function GET() {
  const settings = getSettings();
  
  // Don't expose full API keys to client for security
  const maskedSettings = {
    openRouterApiKey: settings.openRouterApiKey ? MASK : '',
    openaiApiKey: settings.openaiApiKey ? MASK : '',
    anthropicApiKey: settings.anthropicApiKey ? MASK : '',
    geminiApiKey: settings.geminiApiKey ? MASK : '',
    customApiUrl: settings.customApiUrl || '',
    customApiKey: settings.customApiKey ? MASK : ''
  };
  return NextResponse.json(maskedSettings);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const currentSettings = getSettings();
    
    // Only update keys if a real one was provided (not the mask)
    const updateIfValid = (key: keyof typeof data) => {
      if (data[key] && !data[key].includes('***')) {
        currentSettings[key as keyof typeof currentSettings] = data[key];
      } else if (data[key] === '') {
        currentSettings[key as keyof typeof currentSettings] = '';
      }
    };

    updateIfValid('openRouterApiKey');
    updateIfValid('openaiApiKey');
    updateIfValid('anthropicApiKey');
    updateIfValid('geminiApiKey');
    updateIfValid('customApiKey');
    
    // URL doesn't need masking
    if (data.customApiUrl !== undefined) {
      currentSettings.customApiUrl = data.customApiUrl;
    }
    
    saveSettings(currentSettings);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
