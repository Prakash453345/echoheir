// src/pages/VoiceLabPage.jsx
import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const VoiceLabPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTab, setCurrentTab] = useState('record');
  const [recordings, setRecordings] = useState([
    {
      id: 1,
      name: "Morning Stories - Take 1",
      duration: 127,
      quality: 92,
      emotion: 'nostalgic',
      waveform: generateRandomWaveform(),
      status: 'complete'
    },
    {
      id: 2,
      name: "Recipe Instructions - Take 3",
      duration: 89,
      quality: 88,
      emotion: 'loving',
      waveform: generateRandomWaveform(),
      status: 'complete'
    },
    {
      id: 3,
      name: "Life Advice - Take 2",
      duration: 215,
      quality: 95,
      emotion: 'wise',
      waveform: generateRandomWaveform(),
      status: 'processing'
    }
  ]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [volume, setVolume] = useState(75);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonA, setComparisonA] = useState(null);
  const [comparisonB, setComparisonB] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(65);
  const [networkNodes, setNetworkNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  // Helper to generate random waveform data
  function generateRandomWaveform() {
    return Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.1);
  }

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

  // Initialize neural network visualization
  useEffect(() => {
    const nodes = [];
    const totalNodes = 50;
    
    // Create nodes in layers
    for (let layer = 0; layer < 5; layer++) {
      for (let i = 0; i < 10; i++) {
        nodes.push({
          id: layer * 10 + i,
          x: 100 + layer * 120,
          y: 80 + i * 40,
          layer,
          activation: Math.random(),
          hue: 200 + Math.random() * 160
        });
      }
    }
    
    setNetworkNodes(nodes);
    
    // Create connections
    const conns = [];
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].layer < 4) {
        // Connect to next layer
        for (let j = 0; j < 10; j++) {
          const targetId = (nodes[i].layer + 1) * 10 + j;
          conns.push({
            from: i,
            to: targetId,
            weight: Math.random(),
            active: Math.random() > 0.7
          });
        }
      }
    }
    
    setConnections(conns);
  }, []);

  // Setup audio visualization
  useEffect(() => {
    if (isRecording) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      // Simulate audio data
      const simulateAudio = () => {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
          analyserRef.current.getByteFrequencyData(dataArray);
          // Simulate audio level based on random data
          const level = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;
          setAudioLevel(level);
          animationFrameRef.current = requestAnimationFrame(draw);
        };
        
        draw();
      };
      
      simulateAudio();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

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
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = () => {
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const newRecording = {
        id: Date.now(),
        name: `New Recording - Take ${recordings.length + 1}`,
        duration: recordingTime,
        quality: Math.floor(Math.random() * 20) + 80,
        emotion: ['nostalgic', 'loving', 'wise', 'joyful'][Math.floor(Math.random() * 4)],
        waveform: generateRandomWaveform(),
        status: 'complete'
      };
      
      setRecordings(prev => [newRecording, ...prev]);
      setIsProcessing(false);
    }, 2000);
  };

  // Play recording
  const playRecording = (recording) => {
    setSelectedRecording(recording);
    setIsPlaying(true);
    setPlaybackPosition(0);
    
    // Simulate playback
    const interval = setInterval(() => {
      setPlaybackPosition(prev => {
        const newPosition = prev + 1;
        if (newPosition >= recording.duration) {
          clearInterval(interval);
          setIsPlaying(false);
          return recording.duration;
        }
        return newPosition;
      });
    }, 1000);
  };

  // Toggle comparison mode
  const toggleComparison = () => {
    setShowComparison(!showComparison);
    if (!showComparison && recordings.length >= 2) {
      setComparisonA(recordings[0]);
      setComparisonB(recordings[1]);
    }
  };

  // Neural network animation
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections
        connections.forEach(conn => {
          const fromNode = networkNodes[conn.from];
          const toNode = networkNodes[conn.to];
          
          if (conn.active) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.strokeStyle = `hsla(${fromNode.hue}, 70%, 60%, ${conn.weight * 0.5})`;
            ctx.lineWidth = 1 + conn.weight * 2;
            ctx.stroke();
            
            // Draw particle moving along connection
            if (Math.random() > 0.99) {
              const particleX = fromNode.x + (toNode.x - fromNode.x) * Math.random();
              const particleY = fromNode.y + (toNode.y - fromNode.y) * Math.random();
              ctx.beginPath();
              ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
              ctx.fillStyle = `hsl(${fromNode.hue}, 70%, 60%)`;
              ctx.fill();
            }
          }
        });
        
        // Draw nodes
        networkNodes.forEach(node => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8 + node.activation * 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${node.hue}, 70%, 60%, ${0.3 + node.activation * 0.7})`;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${node.hue}, 70%, 60%)`;
          ctx.fill();
        });
        
        requestAnimationFrame(animate);
      };
      
      animate();
    }
  }, [networkNodes, connections]);

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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif text-white mb-2">Audio Studio of Dreams</h1>
            <p className="text-white/70">Capture, refine, and perfect the voice of your loved ones</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 p-1 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20">
              {[
                { id: 'record', label: 'Record', icon: '🎙️' },
                { id: 'library', label: 'Library', icon: '📚' },
                { id: 'train', label: 'Train AI', icon: '🧠' },
                { id: 'compare', label: 'Compare', icon: '⚖️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    currentTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recording Studio */}
          {currentTab === 'record' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Central Recording Area */}
              <div className="lg:col-span-2">
                <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-white mb-2">Recording Studio</h2>
                    <p className="text-white/70">Capture the perfect take with our dreamy audio tools</p>
                  </div>

                  {/* Record Button */}
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing}
                      className={`relative w-48 h-48 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl transition-all duration-300 transform ${
                        isRecording
                          ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse scale-110'
                          : isProcessing
                            ? 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'
                      }`}
                    >
                      {isRecording ? (
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-white animate-ping mb-2"></div>
                          <span>● RECORDING</span>
                        </div>
                      ) : isProcessing ? (
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>PROCESSING</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span>●</span>
                          <span className="mt-2 text-sm">START RECORDING</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Recording Timer */}
                  {isRecording && (
                    <div className="text-center mb-8">
                      <div className="text-3xl font-mono text-white animate-pulse">
                        {formatTime(recordingTime)}
                      </div>
                    </div>
                  )}

                  {/* Audio Visualization */}
                  <div className="p-6 bg-white/10 rounded-2xl mb-8">
                    <h3 className="text-lg font-medium text-white mb-4">Real-time Audio Visualization</h3>
                    <div className="flex items-end justify-center h-32 space-x-1">
                      {Array.from({ length: 128 }, (_, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-purple-500 via-pink-500 to-rose-500 rounded-t transition-all duration-75 ease-out"
                          style={{
                            height: isRecording ? `${Math.random() * 100}%` : '10px',
                            width: '3px',
                            minHeight: '2px'
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Audio Quality Indicators */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/10 text-center">
                      <div className="text-2xl mb-2">🔊</div>
                      <div className="text-sm font-medium text-white mb-2">Volume</div>
                      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, audioLevel * 200)}%` }}
                        ></div>
                      </div>
                      <div className={`text-xs ${
                        audioLevel < 0.2 ? 'text-red-400' : 
                        audioLevel < 0.8 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {audioLevel < 0.2 ? 'Too Quiet' : 
                         audioLevel < 0.8 ? 'Perfect' : 'Too Loud'}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/10 text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-sm font-medium text-white mb-2">Clarity</div>
                      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '85%' }}></div>
                      </div>
                      <div className="text-xs text-white/50">Excellent</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/10 text-center">
                      <div className="text-2xl mb-2">🌡️</div>
                      <div className="text-sm font-medium text-white mb-2">Consistency</div>
                      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '78%' }}></div>
                      </div>
                      <div className="text-xs text-white/50">Good</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Tips */}
              <div className="space-y-6">
                <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                  <h3 className="text-xl font-medium text-white mb-4">Recording Tips</h3>
                  <div className="space-y-4">
                    {[
                      { tip: "Find a quiet space", desc: "Minimize background noise for best quality", icon: "🔇" },
                      { tip: "Speak naturally", desc: "Don't force it — authenticity matters most", icon: "🗣️" },
                      { tip: "Get close to mic", desc: "6-12 inches away for optimal capture", icon: "📏" },
                      { tip: "Record multiple takes", desc: "Variety helps train a more natural AI", icon: "🔄" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{item.tip}</h4>
                            <p className="text-xs text-white/50">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                  <h3 className="text-xl font-medium text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all">
                      Import Existing Audio
                    </button>
                    <button className="w-full p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg transition-all">
                      Voice Quality Check
                    </button>
                    <button className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg transition-all">
                      Noise Reduction Tool
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Library */}
          {currentTab === 'library' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-serif text-white mb-2">Your Recordings</h2>
                <p className="text-white/70">All your captured voice memories in one place</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-white mb-1">{recording.name}</h3>
                        <p className="text-sm text-white/50">{formatTime(recording.duration)}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recording.emotion === 'loving' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                        recording.emotion === 'joyful' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        recording.emotion === 'nostalgic' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                        recording.emotion === 'wise' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        'bg-gradient-to-r from-gray-500 to-gray-600'
                      } text-white`}>
                        {recording.emotion}
                      </div>
                    </div>

                    {/* Waveform */}
                    <div className="mb-4 p-3 bg-white/10 rounded-xl">
                      <div className="flex items-end space-x-1 h-16">
                        {recording.waveform.map((bar, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all duration-300"
                            style={{
                              height: `${bar * 100}%`,
                              width: '4px',
                              minHeight: '2px'
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Quality and Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs text-white/50 mb-1">Quality</div>
                        <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              recording.quality > 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                              recording.quality > 70 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                              'bg-gradient-to-r from-red-500 to-pink-500'
                            }`}
                            style={{ width: `${recording.quality}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {recording.status === 'processing' ? (
                          <div className="flex items-center space-x-1">
                            <svg className="animate-spin h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-amber-400">Processing</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-emerald-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Complete</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => playRecording(recording)}
                        disabled={recording.status === 'processing'}
                        className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPlaying && selectedRecording?.id === recording.id ? '⏸️ Pause' : '▶️ Play'}
                      </button>
                      <button className="px-3 py-2 rounded-xl bg-white/30 hover:bg-white/50 transition-all text-sm text-white/80">
                        📥
                      </button>
                      <button className="px-3 py-2 rounded-xl bg-white/30 hover:bg-white/50 transition-all text-sm text-white/80">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training */}
          {currentTab === 'train' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-serif text-white mb-2">Voice Training Progress</h2>
                <p className="text-white/70">Watch as our AI learns and perfects your loved one's voice</p>
              </div>

              {/* Progress Ring */}
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-64">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#gradient)"
                      strokeWidth="5"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - trainingProgress / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">{trainingProgress}%</div>
                      <div className="text-sm text-white/60">Complete</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neural Network Visualization */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-medium text-white mb-4">Neural Network Visualization</h3>
                <p className="text-white/70 mb-6">Watch as data flows through our AI model, learning the unique characteristics of your voice</p>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="border border-white/20 rounded-xl bg-black/10"
                  ></canvas>
                </div>
              </div>

              {/* Training Stages */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { stage: "Data Analysis", complete: true, percent: 100, icon: "🔍" },
                  { stage: "Feature Extraction", complete: true, percent: 100, icon: "📊" },
                  { stage: "Model Training", complete: false, percent: trainingProgress, icon: "🧠" },
                  { stage: "Voice Synthesis", complete: false, percent: trainingProgress / 2, icon: "🗣️" }
                ].map((stage, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/10">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        {stage.icon}
                      </div>
                      <h4 className="font-medium text-white">{stage.stage}</h4>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                        style={{ width: `${stage.percent}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-white/50">{stage.percent}%</div>
                  </div>
                ))}
              </div>

              {/* Quality Assessment */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-medium text-white mb-4">Voice Quality Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { metric: "Pitch Accuracy", score: 92, color: "from-emerald-500 to-teal-500" },
                    { metric: "Tone Consistency", score: 88, color: "from-blue-500 to-cyan-500" },
                    { metric: "Emotional Range", score: 95, color: "from-purple-500 to-pink-500" }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-3xl mb-2">{item.score}/100</div>
                      <div className="text-sm font-medium text-white mb-2">{item.metric}</div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comparison */}
          {currentTab === 'compare' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-serif text-white mb-2">Voice Comparison Tool</h2>
                <p className="text-white/70">Compare different recordings or AI voice versions side by side</p>
              </div>

              {/* Toggle Comparison Mode */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={toggleComparison}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <span>{showComparison ? 'Hide' : 'Show'} Comparison Mode</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                </button>
              </div>

              {showComparison && recordings.length >= 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Comparison A */}
                  <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                    <h3 className="text-xl font-medium text-white mb-4">Version A</h3>
                    <select
                      value={comparisonA?.id || ''}
                      onChange={(e) => setComparisonA(recordings.find(r => r.id === parseInt(e.target.value)))}
                      className="w-full px-4 py-3 mb-6 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-500 focus:outline-none transition-all text-white"
                    >
                      <option value="">Select Recording</option>
                      {recordings.map(recording => (
                        <option key={recording.id} value={recording.id}>{recording.name}</option>
                      ))}
                    </select>
                    
                    {comparisonA && (
                      <>
                        <div className="mb-4 p-3 bg-white/10 rounded-xl">
                          <div className="flex items-end space-x-1 h-20">
                            {comparisonA.waveform.map((bar, idx) => (
                              <div
                                key={idx}
                                className="bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t transition-all duration-300"
                                style={{
                                  height: `${bar * 100}%`,
                                  width: '4px',
                                  minHeight: '2px'
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Playback Speed</label>
                            <select
                              value={playbackSpeed}
                              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                              className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-500 focus:outline-none transition-all text-white"
                            >
                              <option value={0.5}>0.5x</option>
                              <option value={0.75}>0.75x</option>
                              <option value={1.0} selected>1.0x</option>
                              <option value={1.25}>1.25x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2.0}>2.0x</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Volume</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={(e) => setVolume(parseInt(e.target.value))}
                              className="w-full h-2 bg-white/20 rounded-full appearance-none slider"
                              style={{
                                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
                              }}
                            />
                          </div>
                          
                          <button
                            onClick={() => playRecording(comparisonA)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
                          >
                            {isPlaying && selectedRecording?.id === comparisonA.id ? '⏸️ Pause Version A' : '▶️ Play Version A'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Comparison B */}
                  <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                    <h3 className="text-xl font-medium text-white mb-4">Version B</h3>
                    <select
                      value={comparisonB?.id || ''}
                      onChange={(e) => setComparisonB(recordings.find(r => r.id === parseInt(e.target.value)))}
                      className="w-full px-4 py-3 mb-6 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-500 focus:outline-none transition-all text-white"
                    >
                      <option value="">Select Recording</option>
                      {recordings.map(recording => (
                        <option key={recording.id} value={recording.id}>{recording.name}</option>
                      ))}
                    </select>
                    
                    {comparisonB && (
                      <>
                        <div className="mb-4 p-3 bg-white/10 rounded-xl">
                          <div className="flex items-end space-x-1 h-20">
                            {comparisonB.waveform.map((bar, idx) => (
                              <div
                                key={idx}
                                className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all duration-300"
                                style={{
                                  height: `${bar * 100}%`,
                                  width: '4px',
                                  minHeight: '2px'
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Playback Speed</label>
                            <select
                              value={playbackSpeed}
                              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                              className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-500 focus:outline-none transition-all text-white"
                            >
                              <option value={0.5}>0.5x</option>
                              <option value={0.75}>0.75x</option>
                              <option value={1.0} selected>1.0x</option>
                              <option value={1.25}>1.25x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2.0}>2.0x</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Volume</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={(e) => setVolume(parseInt(e.target.value))}
                              className="w-full h-2 bg-white/20 rounded-full appearance-none slider"
                              style={{
                                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
                              }}
                            />
                          </div>
                          
                          <button
                            onClick={() => playRecording(comparisonB)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                          >
                            {isPlaying && selectedRecording?.id === comparisonB.id ? '⏸️ Pause Version B' : '▶️ Play Version B'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!showComparison && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚖️</div>
                  <h3 className="text-xl font-medium text-white mb-2">Select Recordings to Compare</h3>
                  <p className="text-white/70 mb-6">Toggle comparison mode to select and compare different voice recordings</p>
                  <button
                    onClick={toggleComparison}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all"
                  >
                    Start Comparison
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Styles */}
        <style jsx global>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #a855f7;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #a855f7;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default VoiceLabPage;