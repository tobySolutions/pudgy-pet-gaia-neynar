"use client";

import { useMiniApp } from "@neynar/react";

/**
 * ContextTab component displays the current mini app context in JSON format.
 * 
 * This component provides a developer-friendly view of the Farcaster mini app context,
 * including user information, client details, and other contextual data. It's useful
 * for debugging and understanding what data is available to the mini app.
 * 
 * The context includes:
 * - User information (FID, username, display name, profile picture)
 * - Client information (safe area insets, platform details)
 * - Mini app configuration and state
 * 
 * @example
 * ```tsx
 * <ContextTab />
 * ```
 */
export function ContextTab() {
  const { context } = useMiniApp();
  
  return (
    <div className="space-y-3 w-full mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="text-2xl mb-1">📋🐧</div>
        <h2 className="text-lg font-trailers text-pudgy-oxford mb-1">Developer Context</h2>
        <p className="text-xs text-pudgy-oxford/70 font-fobble bg-gradient-to-r from-pudgy-azure/30 to-pudgy-lavender/30 px-2 py-1 rounded-lg">
          Mini app debug information
        </p>
      </div>

      {/* Context Display */}
      <div className="bg-gradient-to-br from-pudgy-floral via-white to-pudgy-azure rounded-2xl p-6 border border-pudgy-sky/30 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🔍</span>
          <h3 className="text-lg font-kvant text-pudgy-oxford">App Context</h3>
        </div>
        <div className="bg-pudgy-oxford/5 rounded-xl p-4 border border-pudgy-sky/20 max-h-96 overflow-y-auto">
          <pre className="font-mono text-xs whitespace-pre-wrap break-words w-full text-pudgy-oxford leading-relaxed">
            {JSON.stringify(context, null, 2)}
          </pre>
        </div>
      </div>

      {/* Quick Stats */}
      {context && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-pudgy-mint/20 to-pudgy-jasmine/20 rounded-xl p-4 border border-pudgy-mint/30 text-center">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm font-bold text-pudgy-oxford">User FID</div>
            <div className="text-lg font-black text-pudgy-blue">{context.user?.fid || 'N/A'}</div>
          </div>
          <div className="bg-gradient-to-br from-pudgy-coral/20 to-pudgy-plum/20 rounded-xl p-4 border border-pudgy-coral/30 text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm font-bold text-pudgy-oxford">Platform</div>
            <div className="text-sm font-black text-pudgy-blue">Mobile</div>
          </div>
        </div>
      )}
    </div>
  );
} 