import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const message = searchParams.get('message') || 'Hey there! Your Pudgy pet is waiting! 🐧💙';
    const hunger = parseInt(searchParams.get('hunger') || '50');
    const happiness = parseInt(searchParams.get('happiness') || '70');
    const energy = parseInt(searchParams.get('energy') || '80');
    const mood = searchParams.get('mood') || 'content';
    const isError = searchParams.get('error') === 'true';

    const moodEmoji = mood === 'ecstatic' ? '🤩✨' : 
                     mood === 'happy' ? '😊🌟' : 
                     mood === 'content' ? '😌💙' : 
                     mood === 'sad' ? '😔💔' : '😤💢';

    const bgColor = isError ? '#ff6b6b' : '#4dabf7';
    const statColors = {
      high: '#22c55e',
      medium: '#eab308', 
      low: '#f97316',
      critical: '#ef4444'
    };

    const getStatColor = (value: number) => {
      if (value >= 80) return statColors.high;
      if (value >= 50) return statColors.medium;
      if (value >= 30) return statColors.low;
      return statColors.critical;
    };

    // Create a simple SVG-based image
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${isError ? '#ff8e8e' : '#74c0fc'};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="800" height="600" fill="url(#bg)"/>
        
        <!-- Penguin emoji -->
        <text x="400" y="180" text-anchor="middle" font-size="120" fill="white">🐧</text>
        
        <!-- Title -->
        <text x="400" y="240" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="white">
          Pudgy Pet ${moodEmoji}
        </text>
        
        <!-- Message -->
        <text x="400" y="290" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="white">
          ${message.length > 60 ? message.substring(0, 60) + '...' : message}
        </text>
        
        <!-- Stats background -->
        <rect x="200" y="340" width="400" height="120" fill="rgba(255,255,255,0.2)" rx="10"/>
        
        <!-- Stats -->
        <text x="280" y="380" text-anchor="middle" font-family="system-ui, sans-serif" font-size="30" fill="white">🍎</text>
        <text x="280" y="410" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="${getStatColor(hunger)}">${hunger}/100</text>
        <text x="280" y="435" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Hunger</text>
        
        <text x="400" y="380" text-anchor="middle" font-family="system-ui, sans-serif" font-size="30" fill="white">😊</text>
        <text x="400" y="410" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="${getStatColor(happiness)}">${happiness}/100</text>
        <text x="400" y="435" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Happy</text>
        
        <text x="520" y="380" text-anchor="middle" font-family="system-ui, sans-serif" font-size="30" fill="white">⚡</text>
        <text x="520" y="410" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="${getStatColor(energy)}">${energy}/100</text>
        <text x="520" y="435" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Energy</text>
        
        <!-- Footer -->
        <text x="400" y="520" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)">
          Open in the mini app for full interactive experience! 🚀
        </text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    });

  } catch (error) {
    console.error('Frame image error:', error);
    
    const errorSvg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="errorBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff8e8e;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <rect width="800" height="600" fill="url(#errorBg)"/>
        <text x="400" y="200" text-anchor="middle" font-size="120" fill="white">🐧</text>
        <text x="400" y="300" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48" fill="white">Oops!</text>
        <text x="400" y="360" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" fill="white">Something went wrong with your Pudgy pet! 😅</text>
      </svg>
    `;

    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
