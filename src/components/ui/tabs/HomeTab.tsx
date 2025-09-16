"use client";

import { useMiniApp } from "@neynar/react";
import PudgyPet from "../PudgyPet";

/**
 * HomeTab component displays the main Pudgy AI pet interface.
 * 
 * This is the default tab that users see when they first open the mini app.
 * It features an interactive Pudgy AI pet that users can feed, play with,
 * pet, and put to sleep. The pet has stats that change over time and based
 * on user interactions.
 * 
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  const { context } = useMiniApp();
  
  // Use the user's FID as the userId for the Pudgy pet
  const userId = context?.user?.fid?.toString() || 'demo-user';

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-3">
        <div className="w-12 h-12 mb-2 animate-bounce filter drop-shadow-lg mx-auto">
          <img 
            src="/pudgy-image.jpg" 
            alt="Pudgy Pet" 
            className="w-full h-full rounded-full object-cover border-2 border-pudgy-sky shadow-lg"
          />
        </div>
        <h2 className="text-lg font-trailers bg-gradient-to-r from-pudgy-blue via-pudgy-sky to-pudgy-oxford bg-clip-text text-transparent mb-2 tracking-wide">
          Meet Your Pudgy Pal! ✨
        </h2>
        <p className="text-xs text-pudgy-oxford/80 mb-3 font-fobble bg-gradient-to-r from-pudgy-azure/30 to-pudgy-lavender/30 px-3 py-1 rounded-lg border border-pudgy-sky/20">
          Your AI companion in the Pudgy Penguins universe! 🌊
        </p>
      </div>
      
      <div className="w-full">
        <PudgyPet userId={userId} />
      </div>
      
      <div className="mt-3 text-center bg-gradient-to-br from-pudgy-floral via-white to-pudgy-azure backdrop-blur-md rounded-xl p-3 border border-pudgy-sky/30 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">⏰</span>
          <p className="text-xs text-pudgy-oxford font-kvant">
            Stats decay over time - visit regularly!
          </p>
        </div>
        <div className="flex items-center justify-center gap-1 text-xs text-pudgy-blue font-fobble bg-pudgy-sky/10 px-2 py-1 rounded-lg">
          <span className="text-sm">🪐</span>
          Powered by Gaia AI & Neynar
        </div>
      </div>
    </div>
  );
} 