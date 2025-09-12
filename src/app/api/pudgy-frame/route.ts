import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Same KV setup as in pudgy-ai route
const localStore = new Map<string, any>();
const useRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const kv = useRedis
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : {
      async get(key: string) {
        return localStore.get(key) || null;
      },
      async set(key: string, value: any) {
        localStore.set(key, value);
      }
    };

interface PudgyStats {
  hunger: number;
  happiness: number;
  energy: number;
  mood: string;
  lastInteraction: number;
}

const DEFAULT_STATS: PudgyStats = {
  hunger: 50,
  happiness: 70,
  energy: 80,
  mood: 'content',
  lastInteraction: Date.now()
};

function calculateMood(stats: PudgyStats): string {
  const avgStat = (stats.happiness + stats.energy + stats.hunger) / 3;
  if (avgStat >= 80) return 'ecstatic';
  if (avgStat >= 60) return 'happy';
  if (avgStat >= 40) return 'content';
  if (avgStat >= 20) return 'sad';
  return 'cranky';
}

function decayStats(stats: PudgyStats): PudgyStats {
  const now = Date.now();
  const timeDiff = now - stats.lastInteraction;
  const hoursPassed = timeDiff / (1000 * 60 * 60);
  
  const hungerDecay = Math.floor(hoursPassed * 5);
  const energyDecay = Math.floor(hoursPassed * 2);
  const happinessDecay = Math.floor(hoursPassed * 3);
  
  return {
    ...stats,
    hunger: Math.max(0, stats.hunger - hungerDecay),
    energy: Math.max(0, stats.energy - energyDecay),
    happiness: Math.max(0, stats.happiness - happinessDecay),
    lastInteraction: now
  };
}

function getFrameHtml(message: string, stats: PudgyStats, userId: string, error: boolean = false) {
  const moodEmoji = stats.mood === 'ecstatic' ? '🤩' : 
                   stats.mood === 'happy' ? '😊' : 
                   stats.mood === 'content' ? '😌' : 
                   stats.mood === 'sad' ? '😔' : '😤';

  const bgColor = error ? '#ff6b6b' : '#4dabf7';
  const textColor = '#ffffff';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Pudgy Pet ${moodEmoji}</title>
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/pudgy-frame/image?message=${encodeURIComponent(message)}&hunger=${stats.hunger}&happiness=${stats.happiness}&energy=${stats.energy}&mood=${stats.mood}&error=${error}">
        <meta property="fc:frame:button:1" content="🍎 Feed">
        <meta property="fc:frame:button:1:action" content="post">
        <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/pudgy-frame?action=feed&userId=${userId}">
        
        <meta property="fc:frame:button:2" content="🎾 Play">
        <meta property="fc:frame:button:2:action" content="post">
        <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/pudgy-frame?action=play&userId=${userId}">
        
        <meta property="fc:frame:button:3" content="🥰 Pet">
        <meta property="fc:frame:button:3:action" content="post">
        <meta property="fc:frame:button:3:target" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/pudgy-frame?action=pet&userId=${userId}">
        
        <meta property="fc:frame:button:4" content="😴 Sleep">
        <meta property="fc:frame:button:4:action" content="post">
        <meta property="fc:frame:button:4:target" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/pudgy-frame?action=sleep&userId=${userId}">
      </head>
      <body>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, ${bgColor}, #74c0fc); color: ${textColor}; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px;">
          <h1 style="font-size: 3em; margin-bottom: 0.2em;">🐧</h1>
          <h2 style="font-size: 1.5em; margin-bottom: 0.5em;">Pudgy Pet Frame ${moodEmoji}</h2>
          <p style="font-size: 1em; margin-bottom: 1em; max-width: 400px;">${message}</p>
          <div style="display: flex; gap: 20px; margin-top: 20px;">
            <div>🍎 ${stats.hunger}/100</div>
            <div>😊 ${stats.happiness}/100</div>
            <div>⚡ ${stats.energy}/100</div>
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">Open in app for full experience!</p>
        </div>
      </body>
    </html>
  `;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId') || 'frame-user';
  
  try {
    const statsKey = `pudgy:${userId}`;
    let currentStats: PudgyStats = await kv.get(statsKey) || DEFAULT_STATS;
    currentStats = decayStats(currentStats);
    
    let message = `Hey there! 🐾💙 Your Pudgy pet is feeling ${currentStats.mood}! What should we do? ${currentStats.mood === 'ecstatic' ? '🤩' : currentStats.mood === 'happy' ? '😊' : '😌'}`;
    
    if (action) {
      try {
        // Try to use AI-powered response first
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/pudgy-ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, userId }),
        });
        
        if (response.ok) {
          const aiResponse = await response.json();
          message = aiResponse.message;
          currentStats = aiResponse.stats;
        } else {
          throw new Error('AI API failed');
        }
      } catch (aiError) {
        // Fallback to simple responses if AI fails
        console.log('AI fallback for frame:', aiError);
        const newStats = { ...currentStats };
        
        switch (action.toLowerCase()) {
          case 'feed':
            if (newStats.hunger >= 90) {
              message = "I'm already super full! 🤢🍎 Maybe save that yummy food for later?";
            } else {
              const hungerIncrease = Math.min(30, 100 - newStats.hunger);
              newStats.hunger = Math.min(100, newStats.hunger + hungerIncrease);
              newStats.happiness = Math.min(100, newStats.happiness + 10);
              message = `Om nom nom! 🍎✨ My hunger went up to ${newStats.hunger}! You're the best! *happy wiggle*`;
            }
            break;
          case 'play':
            if (newStats.energy < 20) {
              message = "Zzz... 😴💤 Too sleepy to play! Let me rest first!";
            } else {
              newStats.happiness = Math.min(100, newStats.happiness + 20);
              newStats.energy = Math.max(0, newStats.energy - 15);
              message = `Wheee! 🎾😄 So much fun! Happiness +20 but energy -15! *bounces*`;
            }
            break;
          case 'pet':
            newStats.happiness = Math.min(100, newStats.happiness + 15);
            newStats.energy = Math.min(100, newStats.energy + 5);
            message = "Purrrr~ 🥰 *snuggles* I love you SO much! You give the best cuddles! ✨💕";
            break;
          case 'sleep':
            if (newStats.energy >= 90) {
              message = "I'm already super energized! ⚡🌟 Let's do something fun instead!";
            } else {
              const energyIncrease = Math.min(40, 100 - newStats.energy);
              newStats.energy = Math.min(100, newStats.energy + energyIncrease);
              message = `Zzz... 😴💤 *stretches* Ahh! Energy recharged to ${newStats.energy}! Ready for adventures! ✨⚡`;
            }
            break;
        }
        
        newStats.mood = calculateMood(newStats);
        newStats.lastInteraction = Date.now();
        currentStats = newStats;
        
        // Save updated stats
        await kv.set(statsKey, currentStats);
      }
    }
    
    return new NextResponse(getFrameHtml(message, currentStats, userId), {
      headers: { 'Content-Type': 'text/html' },
    });
    
  } catch (error) {
    console.error('Pudgy frame error:', error);
    const errorStats = DEFAULT_STATS;
    return new NextResponse(getFrameHtml(
      "Oops! 😅 Something went wrong! *sad penguin noises* 🐧💔", 
      errorStats, 
      userId, 
      true
    ), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

export async function POST(request: Request) {
  // Handle POST requests from frame interactions
  return GET(request);
}
