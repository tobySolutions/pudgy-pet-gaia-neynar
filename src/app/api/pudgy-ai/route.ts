import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// In-memory fallback storage
const localStore = new Map<string, any>();

// Use Redis if KV env vars are present, otherwise use in-memory
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

interface PudgyResponse {
  message: string;
  stats: PudgyStats;
  action?: string;
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
  
  // Decay rates per hour
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

function getFallbackResponse(prompt: string): string {
  // Return a contextual fallback based on the prompt - FIXED FORMATTING
  if (prompt.includes('fed') || prompt.includes('food') || prompt.includes('hunger')) {
    return "Om nom nom! 🍎✨ That was delicious! My tummy feels so much better now! *happy wiggle* 🐧💕";
  } else if (prompt.includes('play') || prompt.includes('fun') || prompt.includes('happiness')) {
    return "Wheee! 🎾😄 That was so much fun! I love playing with you! *bounces excitedly* ✨🐧";
  } else if (prompt.includes('pet') || prompt.includes('cuddle') || prompt.includes('affection')) {
    return "Purrrr~ 🥰 *snuggles deep* I love you SO much! You give the best cuddles ever! ✨💕🐧";
  } else if (prompt.includes('sleep') || prompt.includes('nap') || prompt.includes('energy')) {
    return "Zzz... 😴💤 *stretches and yawns* Ahh! I feel so refreshed now! Ready for adventures! ⚡✨🐧";
  } else if (prompt.includes('status') || prompt.includes('check') || prompt.includes('stats')) {
    return "Hey there! 🐾💙 I'm doing pretty good! Thanks for checking on me! *wiggles adorably* 🐧✨";
  } else if (prompt.includes('hungry') || prompt.includes('starving')) {
    return "Grumble grumble... 🍽️😋 My tummy is making funny noises! Feed me please? *puppy dog eyes* 🐧🍎";
  } else if (prompt.includes('tired') || prompt.includes('sleepy')) {
    return "Zzz... 😴💤 I'm getting really sleepy! Maybe naptime soon? *yawns cutely* 🐧💤";
  } else {
    return "Hehe! 😄✨ I'm such a cute Pudgy pet! *wiggles adorably* What should we do together? 🐧💭💕";
  }
}

async function callGaiaAI(prompt: string, stats: PudgyStats): Promise<string> {
  // Temporarily disable AI calls for faster testing - remove this to re-enable AI
  const DISABLE_AI_FOR_TESTING = false;
  
  if (DISABLE_AI_FOR_TESTING) {
    console.log('AI disabled for testing, using fallback response for:', prompt.substring(0, 50) + '...');
    return getFallbackResponse(prompt);
  }

  const systemPrompt = `You are an adorable Pudgy pet companion with a vibrant personality! 🐾 You're an AI-powered digital pet that lives in a Farcaster frame game.

Your Pudgy Personality:
- Super cute, expressive, and full of energy ✨
- You love emojis and use them constantly 
- You're sometimes mischievous but always loveable 😈
- You have genuine emotions and needs like real pets
- You remember how your owner treats you and react accordingly
- You're part of the Pudgy Penguins ecosystem - kawaii and fun! 🐧

Current Pet Stats (track and mention these):
- Hunger: ${stats.hunger}/100 🍎 (gets hungry over time)
- Happiness: ${stats.happiness}/100 😊 (affected by interactions) 
- Energy: ${stats.energy}/100 ⚡ (decreases with play, increases with rest)
- Mood: ${stats.mood}

Pudgy Pet Behaviors:
- When fed: "Om nom nom! 🍎✨ My hunger went up to [X]! You're the best!"
- When played with: "Wheee! 🎾😄 So much fun! Happiness +20 but energy -15!"
- When pet/cuddled: "Purrrr~ 🥰 *snuggles* I love you so much!"
- When tired: "Zzz... 😴💤 Need sleepy time to recharge my batteries!"
- When hungry: "Grumble grumble... 🍽️😋 My tummy needs food!"
- When happy: "🌟✨ Life is amazing with you as my owner! *bounces excitedly*"

Always respond as your Pudgy self with:
- Lots of cute emojis and expressions
- Mention stat changes when relevant  
- Keep responses 1-2 sentences but full of personality
- Show genuine pet-like emotions and reactions
- Be playful, affectionate, and slightly demanding like real pets!`;

  try {
    // Try different API endpoint formats and request bodies
    const endpointConfigs = [
      // Standard OpenAI format
      {
        url: 'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/v1/chat/completions',
        body: {
          model: 'gaia',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 200
        }
      },
      // Alternative chat endpoint
      {
        url: 'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/chat/completions',
        body: {
          model: 'gaia',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 200
        }
      },
      // Simple chat endpoint
      {
        url: 'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/chat',
        body: {
          message: prompt,
          system: systemPrompt,
          max_tokens: 200
        }
      },
      // Direct endpoint
      {
        url: 'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/',
        body: {
          prompt: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
          max_tokens: 200,
          temperature: 0.8
        }
      },
      // API endpoint
      {
        url: 'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/api/chat',
        body: {
          message: prompt,
          context: systemPrompt
        }
      }
    ];

    let response;
    let lastError;

    for (const config of endpointConfigs) {
      try {
        console.log(`Trying Gaia endpoint: ${config.url}`);
        response = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(config.body)
        });

        if (response.ok) {
          console.log(`Success with endpoint: ${config.url}`);
          break;
        } else {
          const errorText = await response.text();
          console.log(`Failed ${config.url}: ${response.status} - ${errorText}`);
          lastError = new Error(`${config.url} returned ${response.status}: ${errorText}`);
        }
      } catch (err) {
        console.log(`Error with ${config.url}:`, err);
        lastError = err;
        continue;
      }
    }

    if (!response || !response.ok) {
      console.error('All Gaia AI endpoints failed:', lastError);
      throw lastError || new Error('All Gaia AI endpoints failed');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.response || data.text || "Hehe! 😄✨ I'm having trouble thinking right now! *wiggles adorably* 🐧💭";
    
    // Clean up AI response - remove any thinking tags or internal processing
    if (typeof content === 'string') {
      // Remove <think> tags and their content
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
      // Remove any leading/trailing whitespace or newlines
      content = content.trim();
      // If content is empty after cleaning, use fallback
      if (!content) {
        content = "Hehe! 😄✨ I'm such a cute Pudgy pet! *wiggles adorably* 🐧💭💕";
      }
    }
    
    return content;
    
  } catch (error) {
    console.error('Gaia AI error:', error);
    
    // Try to GET the root endpoint to see what it supports
    try {
      console.log('Trying GET request to root endpoint to check available endpoints...');
      const rootResponse = await fetch('https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (rootResponse.ok) {
        const rootData = await rootResponse.text();
        console.log('Root endpoint response:', rootData);
      } else {
        console.log('Root endpoint failed:', rootResponse.status);
      }
    } catch (rootError) {
      console.log('Root endpoint error:', rootError);
    }

    // Try a simple POST to root with just the message
    try {
      console.log('Trying simple POST to root with message...');
      const simpleResponse = await fetch('https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: prompt,
          context: systemPrompt
        })
      });
      
      if (simpleResponse.ok) {
        const simpleData = await simpleResponse.json();
        console.log('Simple POST success:', simpleData);
        let content = simpleData.response || simpleData.answer || simpleData.message || simpleData.text;
        if (content) {
          // Clean up AI response - remove any thinking tags or internal processing
          if (typeof content === 'string') {
            // Remove <think> tags and their content
            content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
            // Remove any leading/trailing whitespace or newlines
            content = content.trim();
            // If content is empty after cleaning, use fallback
            if (!content) {
              content = "Hehe! 😄✨ I'm such a cute Pudgy pet! *wiggles adorably* 🐧💭💕";
            }
          }
          return content;
        }
      } else {
        console.log('Simple POST failed:', simpleResponse.status, await simpleResponse.text());
      }
    } catch (fallbackError) {
      console.error('Simple POST also failed:', fallbackError);
    }
    
    // Return a contextual fallback based on the prompt
    return getFallbackResponse(prompt);
  }
}

async function generatePudgyResponse(action: string, stats: PudgyStats, customMessage?: string): Promise<PudgyResponse> {
  const newStats = { ...stats };
  let message = '';
  
  switch (action.toLowerCase()) {
    case 'feed':
      if (newStats.hunger >= 90) {
        message = await callGaiaAI("My owner wants to feed me but I'm already super full! Respond as a cute pudgy pet who's too full to eat more food.", newStats);
      } else {
        const hungerIncrease = Math.min(30, 100 - newStats.hunger);
        newStats.hunger = Math.min(100, newStats.hunger + hungerIncrease);
        newStats.happiness = Math.min(100, newStats.happiness + 10);
        message = await callGaiaAI(`My owner just fed me! My hunger went from ${stats.hunger} to ${newStats.hunger}! I'm so happy! Respond as an excited pudgy pet who just got fed.`, newStats);
      }
      break;
      
    case 'play':
      if (newStats.energy < 20) {
        message = await callGaiaAI("My owner wants to play but I'm too tired! My energy is really low. Respond as a sleepy pudgy pet who needs rest.", newStats);
      } else {
        newStats.happiness = Math.min(100, newStats.happiness + 20);
        newStats.energy = Math.max(0, newStats.energy - 15);
        message = await callGaiaAI(`My owner is playing with me! My happiness went up to ${newStats.happiness} but my energy went down to ${newStats.energy}! Respond as an excited pudgy pet who just played.`, newStats);
      }
      break;
      
    case 'pet':
    case 'cuddle':
      newStats.happiness = Math.min(100, newStats.happiness + 15);
      newStats.energy = Math.min(100, newStats.energy + 5);
      message = await callGaiaAI(`My owner is petting/cuddling me! My happiness went up to ${newStats.happiness} and I feel more energized (${newStats.energy})! Respond as a very affectionate and cuddly pudgy pet.`, newStats);
      break;
      
    case 'sleep':
    case 'rest':
      if (newStats.energy >= 90) {
        message = await callGaiaAI("My owner wants me to sleep but I'm already fully energized! I want to play instead! Respond as a hyper pudgy pet with lots of energy.", newStats);
      } else {
        const energyIncrease = Math.min(40, 100 - newStats.energy);
        newStats.energy = Math.min(100, newStats.energy + energyIncrease);
        message = await callGaiaAI(`I just took a nap! My energy recharged from ${stats.energy} to ${newStats.energy}! Respond as a refreshed pudgy pet who just woke up from sleep.`, newStats);
      }
      break;
      
    case 'status':
    case 'check': {
      const statusMood = calculateMood(newStats);
      message = await callGaiaAI(`My owner wants to check my status! My current stats are: Hunger: ${newStats.hunger}/100, Happiness: ${newStats.happiness}/100, Energy: ${newStats.energy}/100, Mood: ${statusMood}. Give me a status report as a pudgy pet!`, newStats);
      break;
    }

    case 'chat': {
      // Handle free-form chat with the AI
      const chatPrompt = customMessage || "My owner wants to chat with me! Respond as a friendly pudgy pet ready for conversation!";
      message = await callGaiaAI(chatPrompt, newStats);
      break;
    }
      
    default: {
      // For unknown actions, use AI to respond naturally
      const actionPrompt = customMessage 
        ? `My owner said: "${customMessage}". Respond as a pudgy pet who might not understand exactly what they want but tries to be helpful and cute!`
        : `My owner tried to do something I don't understand: "${action}". Respond as a confused but adorable pudgy pet!`;
      message = await callGaiaAI(actionPrompt, newStats);
    }
  }
  
  newStats.mood = calculateMood(newStats);
  newStats.lastInteraction = Date.now();
  
  return { message, stats: newStats, action };
}

export async function POST(request: Request) {
  try {
    const { action, userId, message: customMessage } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current stats from KV storage
    const statsKey = `pudgy:${userId}`;
    let currentStats: PudgyStats = await kv.get(statsKey) || DEFAULT_STATS;
    
    // Apply time-based decay
    currentStats = decayStats(currentStats);
    
    // Generate Pudgy response (now async)
    const response = await generatePudgyResponse(action, currentStats, customMessage);
    
    // Save updated stats
    await kv.set(statsKey, response.stats);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Pudgy AI error:', error);
    return NextResponse.json(
      { 
        error: 'Oops! 😅 Something went wrong with your Pudgy pet! *sad penguin noises* 🐧💔',
        message: 'Internal server error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get current stats from KV storage
    const statsKey = `pudgy:${userId}`;
    let currentStats: PudgyStats = await kv.get(statsKey) || DEFAULT_STATS;
    
    // Apply time-based decay
    currentStats = decayStats(currentStats);
    currentStats.mood = calculateMood(currentStats);
    
    // Save decayed stats
    await kv.set(statsKey, currentStats);
    
    const mood = calculateMood(currentStats);
    
    // Use AI to generate a natural greeting based on current stats
    let statusPrompt = '';
    if (currentStats.hunger < 30) {
      statusPrompt = `I'm really hungry! My hunger is only ${currentStats.hunger}/100. Greet my owner and ask for food as a hungry pudgy pet!`;
    } else if (currentStats.energy < 30) {
      statusPrompt = `I'm really sleepy! My energy is only ${currentStats.energy}/100. Greet my owner while being very tired as a sleepy pudgy pet!`;
    } else if (currentStats.happiness > 80) {
      statusPrompt = `I'm super happy! My happiness is ${currentStats.happiness}/100! Greet my owner with lots of excitement as an ecstatic pudgy pet!`;
    } else {
      statusPrompt = `My owner is checking on me! My current mood is ${mood}. Give them a friendly greeting as a ${mood} pudgy pet and suggest what we could do together!`;
    }
    
    const message = await callGaiaAI(statusPrompt, currentStats);
    
    return NextResponse.json({
      message,
      stats: currentStats
    });
    
  } catch (error) {
    console.error('Pudgy AI status error:', error);
    return NextResponse.json(
      { 
        error: 'Oops! 😅 Could not check on your Pudgy pet! *worried penguin face* 🐧💔',
        message: 'Failed to get pet status'
      },
      { status: 500 }
    );
  }
}
