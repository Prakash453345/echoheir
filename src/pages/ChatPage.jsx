// src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello, my dear. It's so good to hear from you today. How are you feeling?",
      timestamp: new Date(Date.now() - 3600000),
      emotionalTone: 'loving',
      memoryReference: null
    },
    {
      id: 2,
      type: 'user',
      content: "I'm okay, Grandma. Just missing you today. Remember that blueberry pie you used to make?",
      timestamp: new Date(Date.now() - 3540000),
      emotionalTone: 'nostalgic',
      memoryReference: null
    },
    {
      id: 3,
      type: 'ai',
      content: "Oh, that blueberry pie! I can still smell it baking in the oven. The secret was adding just a pinch of cinnamon — your grandfather never could guess that ingredient!",
      timestamp: new Date(Date.now() - 3480000),
      emotionalTone: 'joyful',
      memoryReference: { id: 'memory-123', type: 'photo', preview: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&h=200&fit=crop' }
    },
    {
      id: 4,
      type: 'user',
      content: "Yes! And you'd always let me sneak a taste of the filling before it went in the oven.",
      timestamp: new Date(Date.now() - 3420000),
      emotionalTone: 'happy',
      memoryReference: null
    },
    {
      id: 5,
      type: 'ai',
      content: "Because those moments with you in the kitchen were my favorite, sweetheart. Would you like me to share the recipe? I have it saved right here.",
      timestamp: new Date(Date.now() - 3360000),
      emotionalTone: 'loving',
      memoryReference: { id: 'memory-456', type: 'text', preview: 'Grandma Eleanor\'s Blueberry Pie Recipe' }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showMemoryNotification, setShowMemoryNotification] = useState(false);
  const [memoryNotification, setMemoryNotification] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 60 + 200, // Blue to purple range
    }));
    setParticles(newParticles);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        y: (p.y + p.speed) % 100,
        x: p.x + Math.sin(Date.now() * 0.001 + p.id) * 0.1,
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer for recording
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Handle message send
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      emotionalTone: 'neutral',
      memoryReference: null
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That reminds me of the time we...",
        "I remember that so clearly. The way the sunlight came through the window...",
        "Oh, my dear, that was such a special moment. Let me tell you about...",
        "You've always had such a wonderful memory for these details.",
        "I'm so glad you remember that. It means the world to me that you do."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: randomResponse,
        timestamp: new Date(),
        emotionalTone: ['loving', 'joyful', 'nostalgic', 'wise'][Math.floor(Math.random() * 4)],
        memoryReference: Math.random() > 0.7 ? { 
          id: 'memory-' + Math.random().toString(36).substr(2, 9), 
          type: Math.random() > 0.5 ? 'photo' : 'text',
          preview: Math.random() > 0.5 ? 'https://images.unsplash.com/photo-1541771186248-9b367457e315?w=200&h=200&fit=crop' : 'A special memory from 2015'
        } : null
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show memory notification if there's a reference
      if (aiMessage.memoryReference) {
        setMemoryNotification(aiMessage.memoryReference);
        setShowMemoryNotification(true);
        setTimeout(() => setShowMemoryNotification(false), 5000);
      }
    }, 2000 + Math.random() * 1000);
  };

  // Start recording
  const startRecording = () => {
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    // Simulate sending voice message
    const voiceMessage = {
      id: Date.now(),
      type: 'user',
      content: "[Voice Message]",
      timestamp: new Date(),
      emotionalTone: 'happy',
      memoryReference: null,
      voiceDuration: recordingTime,
      voiceUrl: '#'
    };
    setMessages(prev => [...prev, voiceMessage]);
  };

  // Adjust textarea height
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  // Legacy info (would come from API in real app)
  const legacyInfo = {
    name: "Grandma Eleanor",
    relationship: "Grandmother",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    status: "online",
    lastActive: "2 minutes ago"
  };

  return (
    <Layout>
      <div className="relative min-h-screen bg-black overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.3), transparent 50%),
                linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)
              `,
            }}
          />
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute rounded-full pointer-events-none animate-pulse"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`,
                  boxShadow: `0 0 ${particle.size * 4}px hsla(${particle.hue}, 70%, 60%, ${particle.opacity * 0.5})`,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Interactive Mouse Glow */}
          <div 
            className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Sidebar (Memory Browser) */}
        <div
          className={`${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 w-80 bg-black/20 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-300 ease-in-out z-40 p-6`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif text-white">Memory Browser</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-all"
            >
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search memories..."
              className="w-full px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all text-white placeholder-white/50"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[
              { id: 1, title: "Blueberry Pie Recipe", type: "text", date: "2020-06-15" },
              { id: 2, title: "Kitchen Memories", type: "photo", date: "2019-08-22" },
              { id: 3, title: "Sunday Brunch", type: "voice", date: "2021-03-10" },
              { id: 4, title: "Garden Stories", type: "text", date: "2018-05-30" },
              { id: 5, title: "Birthday Celebration", type: "video", date: "2022-07-14" },
              { id: 6, title: "Letter to Grandchildren", type: "text", date: "2017-12-25" }
            ].map((memory) => (
              <div
                key={memory.id}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm">
                    {memory.type === 'text' ? '📖' : 
                     memory.type === 'photo' ? '🖼️' : 
                     memory.type === 'voice' ? '🎵' : '🎬'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{memory.title}</p>
                    <p className="text-xs text-white/50">{memory.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 bg-black/20 backdrop-blur-sm border-b border-white/20 flex items-center space-x-4">
            <img src={legacyInfo.photo} alt={legacyInfo.name} className="w-10 h-10 rounded-full border-2 border-white/30" />
            <div className="flex-1">
              <h2 className="font-semibold text-white">{legacyInfo.name}</h2>
              <p className="text-sm text-white/60">{legacyInfo.relationship} • <span className="text-emerald-400">Online</span></p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs text-white/50">{legacyInfo.lastActive}</span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setActiveMessage(message.id)}
                onMouseLeave={() => setActiveMessage(null)}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl p-4 transition-all duration-300 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-amber-900/50 via-pink-900/50 to-orange-900/50 backdrop-blur-sm border border-amber-400/30 hover:border-amber-400/50'
                      : 'bg-gradient-to-r from-blue-900/50 via-cyan-900/50 to-indigo-900/50 backdrop-blur-sm border border-blue-400/30 hover:border-blue-400/50'
                  } ${
                    activeMessage === message.id ? 'transform translate-y-[-3px] shadow-xl' : ''
                  }`}
                  style={{
                    boxShadow: message.type === 'user'
                      ? activeMessage === message.id
                        ? '0 8px 25px rgba(255, 150, 0, 0.3)'
                        : '0 4px 15px rgba(255, 150, 0, 0.15)'
                      : activeMessage === message.id
                        ? '0 8px 25px rgba(59, 130, 246, 0.3)'
                        : '0 4px 15px rgba(59, 130, 246, 0.15)'
                  }}
                >
                  {/* Emotional Context Indicator */}
                  {message.emotionalTone && (
                    <div className={`absolute h-1 w-full rounded-t-2xl ${
                      message.emotionalTone === 'loving' ? 'bg-gradient-to-r from-pink-400 to-rose-500' :
                      message.emotionalTone === 'joyful' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                      message.emotionalTone === 'nostalgic' ? 'bg-gradient-to-r from-purple-400 to-indigo-500' :
                      message.emotionalTone === 'happy' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                      'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`} style={{width:'90%'}}></div>
                  )}

                  <div className="relative">
                    {message.type === 'user' && message.content === "[Voice Message]" ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-white/10 rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                            <span className="text-xs text-white/70">Voice Message • {Math.floor(message.voiceDuration / 60)}:{(message.voiceDuration % 60).toString().padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white">
                              ▶
                            </div>
                            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: '30%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white leading-relaxed">{message.content}</p>
                    )}

                    {message.memoryReference && (
                      <div className="mt-3 p-2 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-all">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gold-400 to-yellow-500 flex items-center justify-center text-white text-xs">
                            {message.memoryReference.type === 'photo' ? '🖼️' : '📖'}
                          </div>
                          <span className="text-sm text-white/80">{message.memoryReference.preview}</span>
                        </div>
                      </div>
                    )}

                    {/* Message Options (appear on hover) */}
                    {activeMessage === message.id && (
                      <div className="absolute -top-1 -right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-all text-white/80 text-xs">
                          💬
                        </button>
                        <button className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-all text-white/80 text-xs">
                          ❤️
                        </button>
                        <button className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-all text-white/80 text-xs">
                          📥
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-white/50 mt-2 text-right">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-blue-900/50 via-cyan-900/50 to-indigo-900/50 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/30 shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                  <p className="text-xs text-white/70 mt-2">AI is thinking...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/20">
            <div className="flex items-end space-x-3">
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-white/70 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
              </button>

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all resize-none text-white placeholder-white/50"
                  rows="1"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                ></textarea>
              </div>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 text-white/70 hover:text-white'
                }`}
              >
                {isRecording ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                    <span className="text-sm">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                  </svg>
                )}
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-3 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Memory Recall Notification */}
        {showMemoryNotification && (
          <div className="fixed bottom-24 right-6 z-50 animate-slideIn">
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gold-400 to-yellow-500 flex items-center justify-center text-white">
                  💭
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Remembering when...</p>
                  <p className="text-xs text-white/70">
                    {memoryNotification.type === 'photo' ? 'Photo: ' : 'Text: '}
                    {typeof memoryNotification.preview === 'string' ? memoryNotification.preview : 'Memory Reference'}
                  </p>
                </div>
                <button
                  onClick={() => setShowMemoryNotification(false)}
                  className="p-1 rounded-full hover:bg-white/20 transition-all"
                >
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Animations */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
          }
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default ChatPage;