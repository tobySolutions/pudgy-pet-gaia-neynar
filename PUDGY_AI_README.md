# Pudgy AI Pet Integration 🐧✨

## Overview

This integration adds an adorable Pudgy AI pet companion to your Farcaster mini app! The pet has a vibrant personality, genuine emotions, and needs just like a real pet. It's part of the Pudgy Penguins ecosystem and brings kawaii fun to your app.

## Features

### 🐾 Pet Personality
- Super cute, expressive, and full of energy
- Uses lots of emojis and has a playful personality
- Sometimes mischievous but always loveable
- Remembers how users treat them and reacts accordingly
- Part of the Pudgy Penguins ecosystem

### 📊 Pet Stats System
- **Hunger (🍎)**: Gets hungry over time, feed to increase
- **Happiness (😊)**: Affected by interactions, play and pet to increase
- **Energy (⚡)**: Decreases with play, increases with rest
- **Mood**: Changes based on overall stats (ecstatic, happy, content, sad, cranky)

### 🎮 Interactive Actions
- **Feed (🍎)**: Increases hunger and happiness
- **Play (🎾)**: Increases happiness but decreases energy
- **Pet/Cuddle (🥰)**: Increases happiness and slightly increases energy
- **Sleep (😴)**: Increases energy significantly
- **Check Status (📊)**: Get current stats and mood

### ⏰ Time-Based Decay
- Stats naturally decrease over time to encourage regular interaction
- Hunger decreases by ~5 points per hour
- Energy decreases by ~2 points per hour  
- Happiness decreases by ~3 points per hour

## API Endpoints

### `/api/pudgy-ai`

Main API endpoint for pet interactions.

#### GET Request
```
GET /api/pudgy-ai?userId=USER_ID
```
Returns current pet status and a greeting message.

#### POST Request
```javascript
{
  "action": "feed|play|pet|sleep|status",
  "userId": "unique_user_id"
}
```

**Response Format:**
```javascript
{
  "message": "Om nom nom! 🍎✨ My hunger went up to 80! You're the best!",
  "stats": {
    "hunger": 80,
    "happiness": 75,
    "energy": 65,
    "mood": "happy",
    "lastInteraction": 1672531200000
  },
  "action": "feed"
}
```

### `/api/pudgy-frame`

Farcaster Frame integration for the pet.

#### Features:
- Interactive frame with action buttons
- Dynamic image generation showing pet stats
- Persistent state across frame interactions
- Beautiful gradient backgrounds and emoji indicators

## React Component Usage

### PudgyPet Component

```tsx
import PudgyPet from '@/components/ui/PudgyPet';

function MyApp() {
  const userId = user?.fid?.toString() || 'demo-user';
  
  return (
    <div>
      <PudgyPet userId={userId} />
    </div>
  );
}
```

### Integration in Existing App

The integration is already added to the HomeTab component:

```tsx
// src/components/ui/tabs/HomeTab.tsx
export function HomeTab() {
  const { context } = useMiniApp();
  const userId = context?.user?.fid?.toString() || 'demo-user';

  return (
    <div>
      <PudgyPet userId={userId} />
    </div>
  );
}
```

## Data Storage

### Redis/KV Storage
- Uses Upstash Redis if `KV_REST_API_URL` and `KV_REST_API_TOKEN` are available
- Falls back to in-memory storage for development
- Data is stored with keys like `pudgy:USER_ID`

### Default Stats
```javascript
{
  hunger: 50,
  happiness: 70,
  energy: 80,
  mood: 'content',
  lastInteraction: Date.now()
}
```

## Environment Variables

Optional for persistent storage:
```
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
NEXT_PUBLIC_URL=your_app_url (for frames)
```

## Sample Pet Responses

### Feeding Response
> "Om nom nom! 🍎✨ My hunger went up to 80! You're the best owner ever! *happy wiggle*"

### Play Response  
> "Wheee! 🎾😄 So much fun! Happiness +20 but energy -15! *bounces excitedly* Let's play more!"

### Petting Response
> "Purrrr~ 🥰 *snuggles deep* I love you SO much! *melts into your arms* You give the best cuddles! ✨💕"

### Sleep Response
> "Zzz... 😴💤 *stretches and yawns* Ahh! Energy recharged to 85! Ready for adventures! ✨⚡"

### Hungry State
> "Grumble grumble... 🍽️😋 My tummy needs food! Hunger: 25/100 😤💢"

### Low Energy State  
> "Zzz... 😴💤 Too sleepy to play right now! Let me rest first, then we can have mega fun! *yawns*"

## UI Features

### Stats Display
- Color-coded stat bars (green/yellow/orange/red)
- Emoji indicators for each stat type
- Real-time updates after interactions
- Animated progress bars

### Action Buttons
- Colorful, themed buttons for each action
- Disabled states during loading
- Responsive grid layout
- Clear emoji indicators

### Mood Visualization
- Pet emoji changes based on mood
- Background colors reflect pet state
- Contextual messages based on needs

## Frame Integration

The Pudgy AI also works as a Farcaster Frame at `/api/pudgy-frame`:

### Frame Features
- Dynamic SVG image generation
- Interactive buttons for all pet actions  
- Persistent state across interactions
- Error handling with friendly messages
- Beautiful gradient backgrounds
- Stats visualization in frame image

### Frame Actions
- 🍎 Feed - Increases hunger and happiness
- 🎾 Play - Increases happiness, decreases energy
- 🥰 Pet - Increases happiness and energy slightly
- 😴 Sleep - Significantly increases energy

## Getting Started

1. The integration is already set up in your HomeTab
2. Users with Farcaster accounts get persistent pets tied to their FID
3. Demo users get a temporary pet experience
4. Stats decay over time to encourage engagement
5. All interactions provide immediate feedback with cute responses

## Customization Options

### Personality Tweaks
- Modify response messages in the `generatePudgyResponse` function
- Adjust stat changes for different actions
- Change decay rates for different engagement patterns

### Visual Customization  
- Update colors and styling in the PudgyPet component
- Modify frame SVG generation for different visual themes
- Add new emoji combinations and mood states

### New Actions
- Add new interaction types in the switch statement
- Create corresponding UI buttons and handlers
- Implement unique stat effects and responses

This Pudgy AI integration brings life and personality to your Farcaster mini app, creating an engaging pet companion experience that users will love to interact with! 🐧💙✨
