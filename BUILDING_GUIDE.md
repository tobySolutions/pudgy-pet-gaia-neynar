# Building an AI Pet Companion for Farcaster Mini Apps 🐧✨

This guide will walk you through building your own AI-powered pet companion similar to the Pudgy Pet, complete with personality, stats, and interactive features for Farcaster mini apps.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Core Architecture](#core-architecture)
4. [Building the Pet System](#building-the-pet-system)
5. [AI Integration](#ai-integration)
6. [UI Components](#ui-components)
7. [Farcaster Frame Integration](#farcaster-frame-integration)
8. [Deployment](#deployment)
9. [Customization Ideas](#customization-ideas)

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v18 or later)
- **Next.js** knowledge (React framework)
- **TypeScript** familiarity
- **Farcaster** account and basic understanding
- **API access** to an AI service (we'll use Gaia AI)
- **Optional**: Upstash Redis for persistent storage

### Required Accounts & Keys

1. **Neynar API Key** - For Farcaster integration
2. **Gaia AI API Key** - For AI personality
3. **Upstash Redis** (optional) - For data persistence

## Project Setup

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest ai-pet-companion --typescript --tailwind --eslint
cd ai-pet-companion
```

### 2. Install Required Dependencies

```bash
npm install @neynar/react @upstash/redis lucide-react react-icons
```

### 3. Environment Configuration

Create `.env.local`:

```bash
# Farcaster Integration
NEYNAR_API_KEY="your_neynar_api_key"
NEYNAR_CLIENT_ID="your_neynar_client_id"

# AI Service
GAIA_API_KEY="your_gaia_ai_api_key"

# Optional: Persistent Storage
KV_REST_API_URL="your_upstash_redis_url"
KV_REST_API_TOKEN="your_upstash_redis_token"

# App URLs
NEXT_PUBLIC_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
USE_TUNNEL="true"
```

## Core Architecture

### Pet Stats System

Every AI pet needs core stats that change over time:

```typescript
interface PetStats {
  hunger: number;      // 0-100, decreases over time
  happiness: number;   // 0-100, affected by interactions
  energy: number;      // 0-100, used for activities
  mood: string;        // calculated from other stats
  lastInteraction: number; // timestamp
}
```

### Actions System

Define what users can do with their pet:

```typescript
type PetAction = 
  | 'feed'    // Increases hunger & happiness
  | 'play'    // Increases happiness, decreases energy
  | 'pet'     // Increases happiness & energy slightly
  | 'sleep'   // Increases energy significantly
  | 'chat';   // Free-form AI conversation
```

## Building the Pet System

### 1. Create the Core Pet Logic

```typescript
// lib/petSystem.ts
export class PetSystem {
  // Calculate mood based on stats
  static calculateMood(stats: PetStats): string {
    const avgStat = (stats.happiness + stats.energy + stats.hunger) / 3;
    if (avgStat >= 80) return 'ecstatic';
    if (avgStat >= 60) return 'happy';
    if (avgStat >= 40) return 'content';
    if (avgStat >= 20) return 'sad';
    return 'cranky';
  }

  // Apply time-based stat decay
  static decayStats(stats: PetStats): PetStats {
    const now = Date.now();
    const hoursPassed = (now - stats.lastInteraction) / (1000 * 60 * 60);
    
    return {
      ...stats,
      hunger: Math.max(0, stats.hunger - Math.floor(hoursPassed * 5)),
      energy: Math.max(0, stats.energy - Math.floor(hoursPassed * 2)),
      happiness: Math.max(0, stats.happiness - Math.floor(hoursPassed * 3)),
      lastInteraction: now
    };
  }

  // Process user actions
  static processAction(action: string, stats: PetStats): PetStats {
    const newStats = { ...stats };
    
    switch (action) {
      case 'feed':
        newStats.hunger = Math.min(100, newStats.hunger + 30);
        newStats.happiness = Math.min(100, newStats.happiness + 10);
        break;
      case 'play':
        if (newStats.energy >= 20) {
          newStats.happiness = Math.min(100, newStats.happiness + 20);
          newStats.energy = Math.max(0, newStats.energy - 15);
        }
        break;
      case 'pet':
        newStats.happiness = Math.min(100, newStats.happiness + 15);
        newStats.energy = Math.min(100, newStats.energy + 5);
        break;
      case 'sleep':
        newStats.energy = Math.min(100, newStats.energy + 40);
        break;
    }
    
    newStats.mood = this.calculateMood(newStats);
    newStats.lastInteraction = Date.now();
    return newStats;
  }
}
```

### 2. Set Up Data Storage

Create a storage abstraction that works with or without Redis:

```typescript
// lib/storage.ts
import { Redis } from '@upstash/redis';

const localStore = new Map<string, any>();
const useRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

export const storage = useRedis
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
```

## AI Integration

### 1. Create AI Service

```typescript
// lib/aiService.ts
export class AIService {
  static async generateResponse(prompt: string, stats: PetStats): Promise<string> {
    if (!process.env.GAIA_API_KEY) {
      return this.getFallbackResponse(prompt);
    }

    const systemPrompt = `You are an adorable AI pet companion! 🐾
    
Your personality:
- Super cute and expressive ✨
- Love using emojis
- Sometimes mischievous but loveable 😈
- Remember how users treat you

Current Stats:
- Hunger: ${stats.hunger}/100 🍎
- Happiness: ${stats.happiness}/100 😊 
- Energy: ${stats.energy}/100 ⚡
- Mood: ${stats.mood}

Respond with 1-2 sentences full of personality!`;

    try {
      const response = await fetch('https://qwen72b.gaia.domains/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GAIA_API_KEY}`
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-72B-Instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 200
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.getFallbackResponse(prompt);
    } catch (error) {
      return this.getFallbackResponse(prompt);
    }
  }

  static getFallbackResponse(prompt: string): string {
    // Contextual fallback responses
    if (prompt.includes('feed')) return "Yum yum! 🍎✨ Thanks for feeding me!";
    if (prompt.includes('play')) return "Wheee! 🎾😄 That was so fun!";
    if (prompt.includes('pet')) return "Purrrr~ 🥰 I love cuddles!";
    return "Hello! 😊 I'm your cute AI pet! What should we do?";
  }
}
```

### 2. Create API Endpoints

```typescript
// app/api/pet/route.ts
import { NextResponse } from 'next/server';
import { PetSystem } from '@/lib/petSystem';
import { AIService } from '@/lib/aiService';
import { storage } from '@/lib/storage';

const DEFAULT_STATS = {
  hunger: 50,
  happiness: 70,
  energy: 80,
  mood: 'content',
  lastInteraction: Date.now()
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    let stats = await storage.get(`pet:${userId}`) || DEFAULT_STATS;
    stats = PetSystem.decayStats(stats);
    
    const message = await AIService.generateResponse(
      `Greet your owner! Current mood: ${stats.mood}`, 
      stats
    );

    await storage.set(`pet:${userId}`, stats);

    return NextResponse.json({ message, stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get pet status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, userId, message } = await request.json();
    
    if (!action || !userId) {
      return NextResponse.json({ error: 'Action and userId required' }, { status: 400 });
    }

    let stats = await storage.get(`pet:${userId}`) || DEFAULT_STATS;
    stats = PetSystem.decayStats(stats);
    stats = PetSystem.processAction(action, stats);

    const prompt = message || `User performed action: ${action}. React accordingly!`;
    const aiMessage = await AIService.generateResponse(prompt, stats);

    await storage.set(`pet:${userId}`, stats);

    return NextResponse.json({ message: aiMessage, stats, action });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
```

## UI Components

### 1. Main Pet Component

```typescript
// components/Pet.tsx
'use client';

import { useState, useEffect } from 'react';
import { PetStats } from '@/lib/types';

interface PetProps {
  userId: string;
}

export default function Pet({ userId }: PetProps) {
  const [petData, setPetData] = useState<{message: string, stats: PetStats} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load pet data
  useEffect(() => {
    loadPet();
  }, [userId]);

  const loadPet = async () => {
    try {
      const response = await fetch(`/api/pet?userId=${userId}`);
      const data = await response.json();
      setPetData(data);
    } catch (error) {
      console.error('Failed to load pet:', error);
    }
  };

  const performAction = async (action: string, message?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, message })
      });
      const data = await response.json();
      setPetData(data);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!petData) return <div>Loading your pet...</div>;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
      {/* Pet Avatar */}
      <div className="text-center mb-4">
        <div className="text-6xl mb-2 animate-bounce">🐾</div>
        <h2 className="text-xl font-bold">Your AI Pet</h2>
        <p className="text-sm text-gray-600 capitalize">Mood: {petData.stats.mood}</p>
      </div>

      {/* Pet Message */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <p className="text-gray-800">{petData.message}</p>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(['hunger', 'happiness', 'energy'] as const).map((stat) => (
          <div key={stat} className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">
              {stat === 'hunger' && '🍎'}
              {stat === 'happiness' && '😊'}
              {stat === 'energy' && '⚡'}
            </div>
            <div className="text-sm font-medium capitalize">{stat}</div>
            <div className="text-lg font-bold">{petData.stats[stat]}/100</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${petData.stats[stat]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => performAction('feed')}
          disabled={isLoading}
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          🍎 Feed
        </button>
        <button
          onClick={() => performAction('play')}
          disabled={isLoading}
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          🎾 Play
        </button>
        <button
          onClick={() => performAction('pet')}
          disabled={isLoading}
          className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 disabled:opacity-50"
        >
          🥰 Pet
        </button>
        <button
          onClick={() => performAction('sleep')}
          disabled={isLoading}
          className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          😴 Sleep
        </button>
      </div>
    </div>
  );
}
```

### 2. Chat Interface (Optional)

```typescript
// components/PetChat.tsx
'use client';

import { useState } from 'react';

interface PetChatProps {
  userId: string;
  onMessage: (message: string) => void;
}

export default function PetChat({ userId, onMessage }: PetChatProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'chat', 
          userId, 
          message: message.trim() 
        })
      });
      
      const data = await response.json();
      onMessage(data.message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Chat with your pet..."
        className="flex-1 p-3 border rounded-lg"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
```

## Farcaster Frame Integration

### 1. Frame API Endpoint

```typescript
// app/api/frame/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'demo-user';

  // Get pet stats (implementation similar to above)
  // Generate frame HTML with meta tags

  const frameHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL}/api/frame/image?userId=${userId}" />
        <meta property="fc:frame:button:1" content="🍎 Feed" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_URL}/api/frame?action=feed&userId=${userId}" />
        <!-- Add more buttons -->
      </head>
      <body>
        <h1>AI Pet Frame</h1>
      </body>
    </html>
  `;

  return new NextResponse(frameHtml, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(request: NextRequest) {
  // Handle frame interactions
  // Process actions and return updated frame
}
```

### 2. Frame Image Generation

```typescript
// app/api/frame/image/route.ts
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'demo-user';
  
  // Get pet stats and generate image
  
  return new ImageResponse(
    (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ fontSize: '120px' }}>🐾</div>
        <div style={{ fontSize: '48px', color: 'white', fontWeight: 'bold' }}>
          AI Pet Companion
        </div>
        {/* Add stats display */}
      </div>
    ),
    {
      width: 800,
      height: 600,
    }
  );
}
```

## Deployment

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Set up custom domain (optional)
```

### 2. Environment Variables Setup

In your Vercel dashboard, add:
- `GAIA_API_KEY`
- `NEYNAR_API_KEY` 
- `NEYNAR_CLIENT_ID`
- `KV_REST_API_URL` (if using Upstash)
- `KV_REST_API_TOKEN` (if using Upstash)
- `NEXT_PUBLIC_URL` (your deployed URL)

## Customization Ideas

### 1. Different Pet Types
- Create multiple pet personalities (cat, dog, dragon, etc.)
- Different stat systems per type
- Unique behaviors and responses

### 2. Advanced Features
- **Breeding System**: Combine two pets to create new ones
- **Items & Accessories**: Virtual items to customize pets
- **Mini Games**: Interactive games that affect stats
- **Social Features**: Pet playdates, leaderboards
- **Evolution**: Pets that change appearance based on care

### 3. Monetization Options
- **Premium Pets**: Special breeds with unique abilities
- **Cosmetic Items**: Backgrounds, accessories, animations
- **Boost Items**: Temporary stat multipliers
- **Social Features**: Group activities, tournaments

### 4. Technical Enhancements
- **Real-time Updates**: WebSocket connections for live interactions
- **Push Notifications**: Remind users when pets need care
- **Analytics**: Track user engagement and pet statistics
- **A/B Testing**: Test different personalities and features

## Best Practices

1. **Performance**: Cache AI responses when possible
2. **Error Handling**: Always provide fallback responses
3. **User Experience**: Keep interactions fast and responsive
4. **Data Privacy**: Secure user data and pet information
5. **Scalability**: Design for growth from the start

## Troubleshooting

### Common Issues

1. **AI API Failures**: Always implement fallback responses
2. **Rate Limiting**: Add delays between API calls
3. **Storage Issues**: Test both Redis and local storage modes
4. **Frame Display**: Validate meta tags with Farcaster debugger

### Debugging Tips

- Log AI API responses for debugging
- Test with different user IDs
- Monitor pet stat changes over time
- Use browser dev tools for frame testing

## Next Steps

After building your basic AI pet:

1. **User Testing**: Get feedback from real users
2. **Feature Iteration**: Add requested features
3. **Performance Optimization**: Monitor and improve speed
4. **Community Building**: Engage with your users
5. **Scaling**: Plan for growth and new features

## Resources

- [Neynar Documentation](https://docs.neynar.com/)
- [Farcaster Frame Spec](https://docs.farcaster.xyz/reference/frames/spec)
- [Gaia AI Documentation](https://gaia.domains/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Upstash Redis](https://upstash.com/)

---

Happy building! 🚀 Your AI pet companion awaits! 🐾✨
