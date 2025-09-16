"use client";

import { useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import { HomeTab, ActionsTab, ContextTab, WalletTab } from "~/components/ui/tabs";
import { USE_WALLET } from "~/lib/constants";
import { useNeynarUser } from "../hooks/useNeynarUser";

// --- Types ---
export enum Tab {
  Home = "home",
  Actions = "actions",
  Context = "context",
  Wallet = "wallet",
}

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 * 
 * This component orchestrates the overall mini app experience by:
 * - Managing tab navigation and state
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * - Rendering the appropriate tab content based on user selection
 * 
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management. It provides a complete mini app
 * experience with multiple tabs for different functionality areas.
 * 
 * Features:
 * - Tab-based navigation (Home, Actions, Context, Wallet)
 * - Farcaster mini app integration
 * - Wallet connection management
 * - Error handling and display
 * - Loading states for async operations
 * 
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "Neynar Starter Kit")
 * 
 * @example
 * ```tsx
 * <App title="My Mini App" />
 * ```
 */
export default function App(
  { title }: AppProps = { title: "Pudgy Pet Agent" }
) {
  // --- Hooks ---
  const {
    isSDKLoaded,
    context,
    setInitialTab,
    setActiveTab,
    currentTab,
  } = useMiniApp();

  // --- Neynar user hook ---
  const { user: neynarUser } = useNeynarUser(context || undefined);

  // --- Effects ---
  /**
   * Sets the initial tab to "home" when the SDK is loaded.
   * 
   * This effect ensures that users start on the home tab when they first
   * load the mini app. It only runs when the SDK is fully loaded to
   * prevent errors during initialization.
   */
  useEffect(() => {
    if (isSDKLoaded) {
      setInitialTab(Tab.Home);
    }
  }, [isSDKLoaded, setInitialTab]);

  // --- Early Returns ---
  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pudgy-blizzard via-pudgy-azure to-pudgy-lavender">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 animate-pulse filter drop-shadow-lg mx-auto">
            <img 
              src="/pudgy-image.jpg" 
              alt="Pudgy Pet Loading" 
              className="w-full h-full rounded-full object-cover border-2 border-pudgy-sky shadow-lg"
            />
          </div>
          <div className="spinner h-10 w-10 mx-auto mb-4 border-4 border-pudgy-sky/30 border-t-pudgy-blue"></div>
          <p className="text-lg font-bold text-pudgy-oxford tracking-wide">Loading Pudgy Agent...</p>
          <p className="text-sm text-pudgy-blue mt-2">Preparing your penguin companion</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pudgy-blizzard via-pudgy-azure to-pudgy-lavender"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      {/* Header should be full width */}
      <Header neynarUser={neynarUser} />

      {/* Main content optimized for mini-app frame */}
      <div className="pb-20">
        <div className="max-w-sm mx-auto px-3 py-2">
          {/* Main title - smaller for mini-app */}
          <h1 className="text-xl font-trailers text-center mb-4 bg-gradient-to-r from-pudgy-blue via-pudgy-sky to-pudgy-oxford bg-clip-text text-transparent tracking-wide drop-shadow-sm">{title}</h1>

          {/* Tab content rendering with compact spacing */}
          <div className="mb-4">
            {currentTab === Tab.Home && <HomeTab />}
            {currentTab === Tab.Actions && <ActionsTab />}
            {currentTab === Tab.Context && <ContextTab />}
            {currentTab === Tab.Wallet && <WalletTab />}
          </div>
        </div>
      </div>

      {/* Footer with navigation - fixed position */}
      <Footer activeTab={currentTab as Tab} setActiveTab={setActiveTab} showWallet={USE_WALLET} />
    </div>
  );
}

