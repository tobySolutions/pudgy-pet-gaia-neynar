import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';

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

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'pet';
  timestamp: Date;
}

interface PudgyPetProps {
  userId: string;
}

export default function PudgyPet({ userId }: PudgyPetProps) {
  const [petData, setPetData] = useState<PudgyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const loadPetStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/pudgy-ai?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load pet status');
      }
      
      setPetData(data);
      
      // Add pet's initial message to chat history if it's a new load
      if (data.message && chatHistory.length === 0) {
        const initialMessage: ChatMessage = {
          id: `pet-${Date.now()}`,
          text: data.message,
          sender: 'pet',
          timestamp: new Date()
        };
        setChatHistory([initialMessage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId, chatHistory.length]);

  // Load initial pet status
  useEffect(() => {
    loadPetStatus();
  }, [loadPetStatus]);

    // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current && showChat) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, showChat]);

  const performAction = async (action: string, message?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const requestBody: any = { action, userId };
      if (message) {
        requestBody.message = message;
      }
      
      const response = await fetch('/api/pudgy-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Action failed');
      }
      
      setPetData(data);
      
      // Add pet response to chat history if this was a chat action
      if (action === 'chat' && data.message) {
        const petMessage: ChatMessage = {
          id: `pet-${Date.now()}`,
          text: data.message,
          sender: 'pet',
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, petMessage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: chatMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    const messageToSend = chatMessage.trim();
    setChatMessage('');
    
    await performAction('chat', messageToSend);
  };

  const getStatColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 50) return 'text-yellow-500';
    if (value >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getStatEmoji = (statName: string, value: number) => {
    switch (statName) {
      case 'hunger':
        return value >= 80 ? '🍎✨' : value >= 50 ? '🍎' : value >= 30 ? '🍽️' : '😋💔';
      case 'happiness':
        return value >= 80 ? '😍🌟' : value >= 50 ? '😊' : value >= 30 ? '😐' : '😢';
      case 'energy':
        return value >= 80 ? '⚡✨' : value >= 50 ? '⚡' : value >= 30 ? '🔋' : '😴💤';
      default:
        return '';
    }
  };

  if (isLoading && !petData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🐧</div>
          <div className="text-base text-indigo-600 font-medium">Loading your Pudgy pet...</div>
          <div className="mt-2">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-3">😅</div>
          <div className="font-semibold mb-2 text-red-800 text-lg">Oops!</div>
          <div className="text-sm text-red-700 mb-4 leading-relaxed">{error}</div>
          <Button
            onClick={loadPetStatus}
            variant="secondary"
            size="sm"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Try Again 🔄
          </Button>
        </div>
      </div>
    );
  }

  if (!petData) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-xl">
      {/* Pet Avatar */}
      <div className="text-center mb-6">
        <div className="text-7xl mb-3 animate-bounce hover:animate-pulse transition-all duration-300 cursor-pointer">🐧</div>
        <div className="text-xl font-bold text-gray-800 mb-1">Your Pudgy Pet</div>
        <div className="text-sm font-medium text-indigo-600 capitalize bg-indigo-100 px-3 py-1 rounded-full inline-block">
          Mood: {petData.stats.mood} ✨
        </div>
      </div>

      {/* Pet Message - Only show if chat is closed */}
      {!showChat && (
        <div className="bg-gradient-to-r from-white to-indigo-50 rounded-xl p-5 mb-6 border border-indigo-200 shadow-md backdrop-blur-sm">
          <div className="text-base text-gray-800 leading-relaxed font-medium">
            {petData.message}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {showChat && (
        <div className="bg-white rounded-xl mb-6 border border-indigo-200 shadow-lg overflow-hidden backdrop-blur-sm">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 px-5 py-3 border-b border-indigo-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-indigo-800">
                💬 Chat with your Pudgy pet
              </div>
              <Button
                type="button"
                onClick={() => setShowChat(false)}
                variant="outline"
                size="sm"
                className="text-xs px-3 py-2 h-auto border-indigo-200 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div 
            ref={chatContainerRef}
            className="max-h-64 min-h-32 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-indigo-50/30 to-white"
          >
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm font-medium shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-br-md'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-md border border-gray-200'
                  }`}
                >
                  <div className="break-words">{msg.text}</div>
                  <div
                    className={`text-xs mt-2 opacity-75 ${
                      msg.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator for pet response */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm font-medium shadow-md border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-indigo-600 font-medium ml-2">🐧 typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {chatHistory.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 text-sm py-8">
                <div className="text-2xl mb-2">🐧💭</div>
                <div>Start chatting with your Pudgy pet!</div>
                <div className="text-xs mt-1">Try saying &ldquo;Hello&rdquo; or ask how they&rsquo;re feeling</div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-white">
            <form onSubmit={handleChatSubmit} className="flex gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 text-sm border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm font-medium placeholder-gray-500"
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="submit"
                disabled={isLoading || !chatMessage.trim()}
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-5 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? '⏳' : '�'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['hunger', 'happiness', 'energy'] as const).map((stat) => (
          <div key={stat} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {getStatEmoji(stat, petData.stats[stat])}
              </div>
              <div className="text-xs font-semibold text-gray-700 capitalize mb-2 tracking-wide">{stat}</div>
              <div className={`text-lg font-bold mb-2 ${getStatColor(petData.stats[stat])}`}>
                {petData.stats[stat]}/100
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ease-out ${
                    petData.stats[stat] >= 80
                      ? 'bg-gradient-to-r from-green-400 to-green-500'
                      : petData.stats[stat] >= 50
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      : petData.stats[stat] >= 30
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                      : 'bg-gradient-to-r from-red-400 to-red-500'
                  }`}
                  style={{ width: `${Math.max(petData.stats[stat], 0)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => performAction('feed')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          🍎 Feed
        </Button>
        <Button
          onClick={() => performAction('play')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          🎾 Play
        </Button>
        <Button
          onClick={() => performAction('pet')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          🥰 Pet
        </Button>
        <Button
          onClick={() => performAction('sleep')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          😴 Sleep
        </Button>
      </div>

      {/* Chat and Status Buttons */}
      <div className="mt-4 space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={() => setShowChat(!showChat)}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {showChat ? '📝 Hide Chat' : '💬 Chat with Pet'}
          </Button>
          
          {showChat && chatHistory.length > 0 && (
            <Button
              onClick={() => setChatHistory([])}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 py-3 px-4 rounded-xl font-medium"
              title="Clear chat history"
            >
              🗑️
            </Button>
          )}
        </div>
        
        <Button
          onClick={() => performAction('status')}
          disabled={isLoading}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          className="w-full bg-white/80 hover:bg-white border-indigo-200 hover:border-indigo-300 text-indigo-700 hover:text-indigo-800 py-3 rounded-xl font-semibold transition-all duration-200"
        >
          {!isLoading && '📊 Check Status'}
        </Button>
      </div>

      {/* Last Interaction Time */}
      <div className="mt-4 text-xs text-gray-500 text-center bg-white/50 px-3 py-2 rounded-lg">
        Last interaction: {new Date(petData.stats.lastInteraction).toLocaleTimeString()}
      </div>
    </div>
  );
}
