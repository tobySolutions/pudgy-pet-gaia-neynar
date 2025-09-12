# Pudgy AI Agent Integration 🐧✨

This integration adds an adorable AI-powered Pudgy pet companion to your Farcaster mini app! Your pet has personality, needs, and uses the Gaia AI API for intelligent responses.

## Features

### 🎮 Interactive Pet System
- **Feed** 🍎 - Keep your pet well-fed (increases hunger & happiness)
- **Play** 🎾 - Have fun together (increases happiness, decreases energy)
- **Pet/Cuddle** 🥰 - Show affection (increases happiness & energy)
- **Sleep** 😴 - Let your pet rest (increases energy)

### 🤖 AI-Powered Chat
- Natural conversations using Gaia AI
- Pet personality maintains consistency
- Responds to current mood and stats
- Fallback system for reliability

### 📊 Pet Stats System
- **Hunger** (0-100) - Decreases over time
- **Happiness** (0-100) - Affected by interactions
- **Energy** (0-100) - Used for activities, restored by sleep
- **Mood** - Calculated from all stats (ecstatic, happy, content, sad, cranky)

### ⏰ Time-Based Decay
- Stats naturally decrease over time
- Encourages regular check-ins
- Creates realistic pet care experience

## API Endpoints

### `/api/pudgy-ai`
Main AI interaction endpoint with Gaia AI integration.

**POST** - Perform actions
```json
{
  "action": "feed|play|pet|sleep|chat|status",
  "userId": "user123",
  "message": "optional chat message for 'chat' action"
}
```

**GET** - Check pet status
```
/api/pudgy-ai?userId=user123
```

### `/api/pudgy-frame`
Farcaster Frame interface with AI-powered responses.

**GET/POST** - Frame interactions
```
/api/pudgy-frame?action=feed&userId=user123
```

### `/api/pudgy-frame/image`
Dynamic image generation for frames.

## Components

### `PudgyPet`
React component providing the full interactive interface:
- Action buttons for pet care
- Real-time stat display with progress bars
- Chat interface for free-form conversations
- Error handling and loading states

## Integration with Gaia AI

The system integrates with the Gaia AI API at:
```
https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/v1/chat/completions
```

### Personality System
The AI maintains a consistent Pudgy pet personality:
- Super cute and expressive 🐾
- Uses lots of emojis ✨
- Sometimes mischievous but loveable 😈
- Remembers how you treat them
- Part of Pudgy Penguins ecosystem 🐧

### Smart Responses
- Contextual reactions based on current stats
- Dynamic mood-based interactions
- Intelligent fallbacks if AI is unavailable
- Natural conversation flow

## Storage

Uses Redis (Upstash) or in-memory fallback for:
- Pet statistics persistence
- User-specific pet states
- Time-based stat decay tracking

## Usage in Mini App

The integration is added to the HomeTab of your Farcaster mini app:

```tsx
import PudgyPet from '@/components/ui/PudgyPet';

// In your component
<PudgyPet userId={context?.user?.fid?.toString() || 'demo-user'} />
```

## Frame Integration

Works as a Farcaster Frame with:
- Interactive buttons for pet actions
- Dynamic image generation showing stats
- AI-powered response messages
- Shareable pet status

## Setup Requirements

1. **Environment Variables** (optional):
   - `KV_REST_API_URL` - Upstash Redis URL
   - `KV_REST_API_TOKEN` - Upstash Redis token
   - `NEXT_PUBLIC_URL` - Your app's public URL

2. **Dependencies**:
   - `@upstash/redis` - For persistent storage
   - Next.js API routes
   - React for UI components

## Personality Examples

- **When happy**: "🌟✨ Life is amazing with you as my owner! *bounces excitedly*"
- **When hungry**: "Grumble grumble... 🍽️😋 My tummy needs food!"
- **When tired**: "Zzz... 😴💤 Need sleepy time to recharge my batteries!"
- **When playing**: "Wheee! 🎾😄 So much fun! *bounces excitedly*"
- **When cuddled**: "Purrrr~ 🥰 *snuggles* I love you SO much!"

Your Pudgy pet learns and remembers how you treat them, creating a unique bond! 💙

## Troubleshooting

- If AI responses fail, the system falls back to predefined cute responses
- Stats are preserved across sessions using persistent storage
- Frame integration works standalone without the main app
- All errors are handled gracefully with adorable error messages

Enjoy your new AI-powered Pudgy companion! 🐧🎉
