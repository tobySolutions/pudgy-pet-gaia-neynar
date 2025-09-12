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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Welcome to Pudgy Pet! 🐧✨
        </h2>
        <p className="text-base text-gray-700 mb-4 font-medium">
          Your adorable AI companion in the Farcaster ecosystem!
        </p>
      </div>
      
      <PudgyPet userId={userId} />
      
      <div className="mt-8 text-center max-w-md bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100">
        <p className="text-sm text-gray-600 font-medium mb-2">
          Your pet&rsquo;s stats decay over time, so make sure to check in regularly! 🕒💙
        </p>
        <p className="text-xs text-indigo-500 font-semibold">
          Powered by Gaia AI & Neynar 🪐
        </p>
      </div>
    </div>
  );
} 