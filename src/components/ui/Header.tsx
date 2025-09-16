"use client";

import { useState } from "react";
import { APP_NAME } from "~/lib/constants";
import sdk from "@farcaster/miniapp-sdk";
import { useMiniApp } from "@neynar/react";

type HeaderProps = {
  neynarUser?: {
    fid: number;
    score: number;
  } | null;
};

export function Header({ neynarUser }: HeaderProps) {
  const { context } = useMiniApp();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <div 
        className="mt-2 mb-2 mx-3 px-3 py-2 bg-gradient-to-r from-pudgy-floral via-white to-pudgy-azure rounded-xl flex items-center justify-between border border-pudgy-sky/30 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5">
            <img 
              src="/pudgy-image.jpg" 
              alt="Pudgy" 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="text-sm font-trailers text-pudgy-oxford tracking-wide">
            Welcome to {APP_NAME}!
          </div>
        </div>
        {context?.user && (
          <div 
            className="cursor-pointer transition-all duration-200 hover:scale-105"
            onClick={() => {
              setIsUserDropdownOpen(!isUserDropdownOpen);
            }}
          >
            {context.user.pfpUrl && (
              <img 
                src={context.user.pfpUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border-2 border-pudgy-blue shadow-md hover:shadow-lg transition-shadow duration-200"
              />
            )}
          </div>
        )}
      </div>
      {context?.user && (
        <>      
          {isUserDropdownOpen && (
            <div className="absolute top-full right-0 z-50 w-fit mt-1 mx-3 bg-gradient-to-br from-white via-pudgy-blizzard to-pudgy-azure rounded-lg shadow-xl border border-pudgy-sky/30 backdrop-blur-md">
              <div className="p-3 space-y-2">
                <div className="text-right">
                  <h3 
                    className="font-bold text-sm hover:text-pudgy-blue transition-colors duration-200 cursor-pointer inline-block text-pudgy-oxford"
                    onClick={() => sdk.actions.viewProfile({ fid: context.user.fid })}
                  >
                    {context.user.displayName || context.user.username}
                  </h3>
                  <p className="text-xs text-pudgy-blue font-medium">
                    @{context.user.username}
                  </p>
                  <p className="text-xs text-pudgy-oxford/60 bg-pudgy-sky/10 px-2 py-1 rounded-full inline-block mt-1">
                    FID: {context.user.fid}
                  </p>
                  {neynarUser && (
                    <p className="text-xs text-pudgy-oxford/60 bg-pudgy-mint/20 px-2 py-1 rounded-full inline-block mt-1 ml-1">
                      Score: {neynarUser.score}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
