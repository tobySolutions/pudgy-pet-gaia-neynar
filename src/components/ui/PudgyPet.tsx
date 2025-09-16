import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import MarkdownMessage from './MarkdownMessage';
import { 
  FaHeart, 
  FaGamepad, 
  FaBed, 
  FaUtensils,
  FaCommentDots,
  FaEye,
  FaTimes,
  FaPaperPlane,
  FaTrash,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaSmile,
  FaMeh,
  FaSadTear
} from 'react-icons/fa';

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
    if (value >= 80) return 'text-pudgy-mint';
    if (value >= 60) return 'text-pudgy-jasmine';
    if (value >= 40) return 'text-pudgy-coral';
    return 'text-red-500';
  };

  const getStatIcon = (statName: string, value: number) => {
    switch (statName) {
      case 'hunger':
        return <FaUtensils className={`text-lg ${getStatColor(value)}`} />;
      case 'happiness':
        if (value >= 80) return <FaSmile className="text-lg text-pudgy-mint" />;
        if (value >= 60) return <FaSmile className="text-lg text-pudgy-jasmine" />;
        if (value >= 40) return <FaMeh className="text-lg text-pudgy-coral" />;
        return <FaSadTear className="text-lg text-red-500" />;
      case 'energy':
        if (value >= 80) return <FaBatteryFull className="text-lg text-pudgy-mint" />;
        if (value >= 60) return <FaBatteryHalf className="text-lg text-pudgy-jasmine" />;
        if (value >= 40) return <FaBatteryQuarter className="text-lg text-pudgy-coral" />;
        return <FaBatteryEmpty className="text-lg text-red-500" />;
      default:
        return null;
    }
  };

  const getStatGradient = (value: number) => {
    if (value >= 80) return 'from-pudgy-mint to-green-400';
    if (value >= 60) return 'from-pudgy-jasmine to-yellow-400';
    if (value >= 40) return 'from-pudgy-coral to-orange-400';
    return 'from-red-400 to-red-500';
  };

  if (isLoading && !petData) {
    return (
      <div className="flex items-center justify-center p-8 bg-gradient-to-br from-pudgy-blizzard via-pudgy-azure to-pudgy-lavender rounded-2xl border-2 border-pudgy-sky/30 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 animate-pulse filter drop-shadow-lg mx-auto">
            <img 
              src="/pudgy-image.jpg" 
              alt="Pudgy Pet Loading" 
              className="w-full h-full rounded-full object-cover border-2 border-pudgy-sky"
            />
          </div>
          <div className="text-base text-pudgy-blue font-kvant tracking-wide">Loading your Pudgy pet...</div>
          <div className="mt-3">
            <div className="flex justify-center space-x-1">
              <div className="w-3 h-3 bg-pudgy-sky rounded-full animate-bounce shadow-sm"></div>
              <div className="w-3 h-3 bg-pudgy-blue rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-pudgy-oxford rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-pudgy-floral via-pudgy-lavender to-pudgy-coral/20 border-2 border-pudgy-coral/40 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="text-4xl mb-3 filter drop-shadow-sm">�💔</div>
          <div className="font-trailers mb-2 text-pudgy-oxford text-lg">Oops! Your Pudgy needs help!</div>
          <div className="text-sm text-pudgy-oxford/70 mb-4 leading-relaxed bg-white/50 p-3 rounded-lg">{error}</div>
          <Button
            onClick={loadPetStatus}
            variant="secondary"
            size="sm"
            className="bg-gradient-to-r from-pudgy-coral to-pudgy-plum hover:from-pudgy-plum hover:to-pudgy-coral text-white font-kvant py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              🔄 Try Again
            </span>
          </Button>
        </div>
      </div>
    );
  }

  if (!petData) {
    return null;
  }

  return (
    <div className="w-full mx-auto bg-gradient-to-br from-pudgy-blizzard via-pudgy-azure to-pudgy-lavender border border-pudgy-sky/40 rounded-2xl p-3 shadow-xl backdrop-blur-sm">
      {/* Pet Avatar */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <div className="w-16 h-16 mb-2 animate-bounce hover:animate-pulse transition-all duration-300 cursor-pointer filter drop-shadow-lg">
            <img 
              src="/pudgy-image.jpg" 
              alt="Pudgy Pet" 
              className="w-full h-full rounded-full object-cover border-2 border-pudgy-sky shadow-lg"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pudgy-mint to-pudgy-jasmine rounded-full border border-white shadow-lg flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="text-lg font-trailers text-pudgy-oxford mb-2 tracking-wide drop-shadow-sm">
          Your Pudgy Pet
        </div>
        <div className="text-xs font-kvant text-pudgy-blue capitalize bg-gradient-to-r from-pudgy-sky/20 to-pudgy-blue/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block border border-pudgy-sky/30 shadow-sm">
          Mood: <span className="text-pudgy-oxford">{petData.stats.mood}</span> ✨
        </div>
      </div>

      {/* Pet Message - Only show if chat is closed */}
      {!showChat && (
        <div className="bg-gradient-to-r from-pudgy-floral via-white to-pudgy-lavender rounded-xl p-3 mb-3 border border-pudgy-sky/30 shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 flex-shrink-0">
              <img 
                src="/pudgy-image.jpg" 
                alt="Pudgy Pet" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <MarkdownMessage 
                content={petData.message} 
                className="text-pudgy-oxford text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {showChat && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl mb-3 border border-pudgy-sky/30 shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-pudgy-sky/20 via-pudgy-azure to-pudgy-lavender/30 px-3 py-2 border-b border-pudgy-sky/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCommentDots className="text-pudgy-blue text-lg" />
                <div className="text-sm font-kvant text-pudgy-oxford tracking-wide">
                  Chat with your Pudgy
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setShowChat(false)}
                variant="outline"
                size="sm"
                className="!flex !items-center !justify-center text-xs px-3 py-2 h-auto border-pudgy-sky/30 text-pudgy-blue hover:text-pudgy-oxford hover:bg-pudgy-sky/10 rounded-lg transition-all duration-200 !max-w-none"
              >
                <FaTimes className="text-sm" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div 
            ref={chatContainerRef}
            className="max-h-48 min-h-24 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-pudgy-azure/30 to-white"
          >
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-pudgy-blue to-pudgy-sky text-white rounded-br-md'
                      : 'bg-gradient-to-r from-pudgy-floral to-pudgy-lavender text-pudgy-oxford rounded-bl-md border border-pudgy-sky/20'
                  }`}
                >
                  <div className="break-words">
                    {msg.sender === 'pet' ? (
                      <MarkdownMessage 
                        content={msg.text} 
                        className="text-pudgy-oxford"
                      />
                    ) : (
                      <div className="font-fobble text-white">{msg.text}</div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 opacity-75 ${
                      msg.sender === 'user' ? 'text-white/80' : 'text-pudgy-oxford/60'
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
                <div className="bg-gradient-to-r from-pudgy-floral to-pudgy-lavender text-pudgy-oxford rounded-2xl rounded-bl-md px-4 py-3 text-sm font-medium shadow-md border border-pudgy-sky/20">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-pudgy-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pudgy-sky rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pudgy-oxford rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-pudgy-blue font-kvant ml-2">🐧 typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {chatHistory.length === 0 && !isLoading && (
              <div className="text-center text-pudgy-oxford/60 text-sm py-8">
                <div className="text-3xl mb-3 filter drop-shadow-sm">🐧💭</div>
                <div className="font-bold mb-1">Start chatting with your Pudgy!</div>
                <div className="text-xs mt-2 bg-gradient-to-r from-pudgy-azure/30 to-pudgy-lavender/30 px-3 py-2 rounded-lg inline-block border border-pudgy-sky/20">
                  Try saying &quot;Hello&quot; or ask how they&apos;re feeling
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-pudgy-sky/20 bg-gradient-to-r from-pudgy-azure/30 to-pudgy-blizzard">
            <form onSubmit={handleChatSubmit} className="flex gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message to Pudgy..."
                className="flex-1 px-4 py-3 text-sm border border-pudgy-sky/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-pudgy-blue focus:border-pudgy-blue bg-white/90 backdrop-blur-sm font-medium placeholder-pudgy-oxford/50 text-pudgy-oxford"
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="submit"
                disabled={isLoading || !chatMessage.trim()}
                variant="primary"
                size="sm"
                className="!flex !items-center !justify-center bg-gradient-to-r from-pudgy-blue to-pudgy-sky hover:from-pudgy-sky hover:to-pudgy-blue px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 !max-w-none"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <FaPaperPlane className="text-sm" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(['hunger', 'happiness', 'energy'] as const).map((stat) => (
          <div key={stat} className="bg-white/90 backdrop-blur-md rounded-xl p-2 border border-pudgy-sky/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-lg mb-1 flex justify-center">
                {getStatIcon(stat, petData.stats[stat])}
              </div>
              <div className="text-xs font-kvant text-pudgy-oxford capitalize mb-1 tracking-wider">{stat}</div>
              <div className={`text-sm font-trailers mb-2 ${getStatColor(petData.stats[stat])}`}>
                {petData.stats[stat]}/100
              </div>
              <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getStatGradient(petData.stats[stat])} shadow-sm`}
                  style={{ width: `${Math.max(petData.stats[stat], 0)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => performAction('feed')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="!flex !items-center !justify-center !gap-1 bg-gradient-to-r from-pudgy-mint to-green-400 hover:from-green-400 hover:to-pudgy-mint text-white font-kvant py-2 px-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-green-300/30 !w-full !max-w-none"
        >
          <FaUtensils className="text-xs" />
          <span className="text-xs">Feed</span>
        </Button>
        <Button
          onClick={() => performAction('play')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="!flex !items-center !justify-center !gap-1 bg-gradient-to-r from-pudgy-blue to-pudgy-sky hover:from-pudgy-sky hover:to-pudgy-blue text-white font-kvant py-2 px-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-pudgy-sky/30 !w-full !max-w-none"
        >
          <FaGamepad className="text-xs" />
          <span className="text-xs">Play</span>
        </Button>
        <Button
          onClick={() => performAction('pet')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="!flex !items-center !justify-center !gap-1 bg-gradient-to-r from-pudgy-coral to-pudgy-plum hover:from-pudgy-plum hover:to-pudgy-coral text-white font-kvant py-2 px-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-pudgy-plum/30 !w-full !max-w-none"
        >
          <FaHeart className="text-xs" />
          <span className="text-xs">Pet</span>
        </Button>
        <Button
          onClick={() => performAction('sleep')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="!flex !items-center !justify-center !gap-1 bg-gradient-to-r from-pudgy-lavender to-purple-400 hover:from-purple-400 hover:to-pudgy-lavender text-white font-kvant py-2 px-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-purple-300/30 !w-full !max-w-none"
        >
          <FaBed className="text-xs" />
          <span className="text-xs">Sleep</span>
        </Button>
      </div>

      {/* Chat and Status Buttons */}
      <div className="mt-3 space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowChat(!showChat)}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="!flex !items-center !justify-center !gap-1 flex-1 bg-gradient-to-r from-pudgy-blue to-pudgy-sky hover:from-pudgy-sky hover:to-pudgy-blue text-white font-kvant py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 !max-w-none"
          >
            <FaCommentDots className="text-xs" />
            <span className="text-xs">{showChat ? 'Hide Chat' : 'Chat'}</span>
          </Button>
          
          {showChat && chatHistory.length > 0 && (
            <Button
              onClick={() => setChatHistory([])}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="!flex !items-center !justify-center text-pudgy-coral hover:text-white hover:bg-pudgy-coral/80 border-pudgy-coral/40 hover:border-pudgy-coral py-2 px-3 rounded-xl font-kvant transition-all duration-300 transform hover:scale-105 shadow-lg !max-w-none"
              title="Clear chat history"
            >
              <FaTrash className="text-xs" />
            </Button>
          )}
        </div>
        
        <Button
          onClick={() => performAction('status')}
          disabled={isLoading}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          className="!flex !items-center !justify-center !gap-1 w-full bg-gradient-to-r from-white/90 to-pudgy-blizzard hover:from-pudgy-azure hover:to-pudgy-blizzard border-pudgy-sky/30 hover:border-pudgy-blue/50 text-pudgy-oxford hover:text-pudgy-blue py-2 rounded-xl font-kvant transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 !max-w-none"
        >
          {!isLoading && (
            <>
              <FaEye className="text-xs" />
              <span className="text-xs">Status</span>
            </>
          )}
        </Button>
      </div>

      {/* Last Interaction Time */}
      <div className="mt-6 text-xs text-pudgy-oxford/60 text-center bg-gradient-to-r from-white/70 to-pudgy-blizzard/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-pudgy-sky/20 shadow-sm">
        <div className="font-medium">Last interaction</div>
        <div className="text-pudgy-blue font-bold mt-1">
          {new Date(petData.stats.lastInteraction).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
