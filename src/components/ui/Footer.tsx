import React from "react";
import { Tab } from "~/components/App";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  showWallet?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab, showWallet = false }) => (
  <div className="fixed bottom-0 left-0 right-0 mx-4 mb-4 bg-gradient-to-r from-pudgy-floral via-white to-pudgy-azure border-2 border-pudgy-sky/40 px-2 py-3 rounded-2xl z-50 shadow-2xl backdrop-blur-md">
    <div className="flex justify-around items-center h-16">
      <button
        onClick={() => setActiveTab(Tab.Home)}
        className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-300 transform hover:scale-105 ${
          activeTab === Tab.Home 
            ? 'bg-gradient-to-b from-pudgy-blue to-pudgy-sky text-white shadow-lg' 
            : 'text-pudgy-oxford/60 hover:text-pudgy-blue hover:bg-pudgy-azure/30'
        }`}
      >
        <span className="text-2xl mb-1">🐧</span>
        <span className="text-xs font-kvant tracking-wide">Home</span>
      </button>
      <button
        onClick={() => setActiveTab(Tab.Actions)}
        className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-300 transform hover:scale-105 ${
          activeTab === Tab.Actions 
            ? 'bg-gradient-to-b from-pudgy-mint to-green-400 text-white shadow-lg' 
            : 'text-pudgy-oxford/60 hover:text-pudgy-mint hover:bg-pudgy-mint/20'
        }`}
      >
        <span className="text-2xl mb-1">⚡</span>
        <span className="text-xs font-kvant tracking-wide">Actions</span>
      </button>
      <button
        onClick={() => setActiveTab(Tab.Context)}
        className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-300 transform hover:scale-105 ${
          activeTab === Tab.Context 
            ? 'bg-gradient-to-b from-pudgy-jasmine to-yellow-400 text-white shadow-lg' 
            : 'text-pudgy-oxford/60 hover:text-pudgy-jasmine hover:bg-pudgy-jasmine/20'
        }`}
      >
        <span className="text-2xl mb-1">📋</span>
        <span className="text-xs font-kvant tracking-wide">Context</span>
      </button>
      {showWallet && (
        <button
          onClick={() => setActiveTab(Tab.Wallet)}
          className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-300 transform hover:scale-105 ${
            activeTab === Tab.Wallet 
              ? 'bg-gradient-to-b from-pudgy-plum to-purple-400 text-white shadow-lg' 
              : 'text-pudgy-oxford/60 hover:text-pudgy-plum hover:bg-pudgy-plum/20'
          }`}
        >
          <span className="text-2xl mb-1">�</span>
          <span className="text-xs font-kvant tracking-wide">Wallet</span>
        </button>
      )}
    </div>
  </div>
);
