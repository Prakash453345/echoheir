// src/pages/DashboardPage.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

import LegacyWizardPage from "./LegacyWizardPage";

const DashboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [memoryMood, setMemoryMood] = useState("nostalgic");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [legacies, setLegacies] = useState([]); // 👈 ADD THIS LINE
  const [conversations, setConversations] = useState([]); // 👈 ADD THIS LINE
  const [activities, setActivities] = useState([]);

  const getDisplayNameFromEmail = (email) => {
    if (!email) return "User";
    const localPart = email.split("@")[0];
    const parts = localPart.split(/[._]/);
    const firstWord = parts[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  };

  // --- DYNAMIC STATS CALCULATED FROM REAL DATA ---
  // --- REAL-TIME ANALYTICS CALCULATIONS ---
  const stats = {
    totalMemories: legacies.reduce((sum, l) => sum + (l.totalMemories || 0), 0),
    activeLegacies: legacies.filter((l) => l.status === "active").length,
    voiceTrainingAvg:
      legacies.length > 0
        ? Math.round(
            legacies.reduce((sum, l) => sum + (l.voiceTraining || 0), 0) /
              legacies.length
          )
        : 0,

    // 👇 NEW: Memory Distribution by Type
    memoryDistribution: () => {
      const totalPhotos = legacies.reduce(
        (sum, l) => sum + (l.photoCount || 0),
        0
      );
      const totalAudio = legacies.reduce(
        (sum, l) => sum + (l.audioCount || 0),
        0
      );
      const totalText = legacies.reduce(
        (sum, l) => sum + (l.textCount || 0),
        0
      );
      const total = totalPhotos + totalAudio + totalText;

      if (total === 0)
        return [
          { percent: 0, color: "stroke-gray-400", label: "Photos" },
          { percent: 0, color: "stroke-gray-400", label: "Voice" },
          { percent: 0, color: "stroke-gray-400", label: "Text" },
        ];

      return [
        {
          percent: Math.round((totalPhotos / total) * 100),
          color: "stroke-blue-400",
          label: "Photos",
        },
        {
          percent: Math.round((totalAudio / total) * 100),
          color: "stroke-pink-400",
          label: "Voice",
        },
        {
          percent: Math.round((totalText / total) * 100),
          color: "stroke-purple-400",
          label: "Text",
        },
      ];
    },
  };

  const navigate = useNavigate();

  const createLegacy = () => {
    navigate("/wizard"); // 👈 Navigate programmatically
  };

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
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: (p.y + p.speed) % 100,
          x: p.x + Math.sin(Date.now() * 0.001 + p.id) * 0.1,
        }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate memory mood
  useEffect(() => {
    const moods = ["nostalgic", "joyful", "peaceful", "reflective"];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    setMemoryMood(randomMood);
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          setUser({
            name: data.user.displayName || data.user.name || getDisplayNameFromEmail(data.user.email),
            email: data.user.email,
            avatar: data.user.avatar,
            displayName: data.user.displayName || data.user.name || getDisplayNameFromEmail(data.user.email),
            streak: data.user.streak?.currentStreak || 0,
            longestStreak: data.user.streak?.longestStreak || 0
          });

          setLegacies(data.legacies || []);
          setConversations(data.conversations || []);
          setActivities(data.activities || []);
        } else {
          console.error('Failed to fetch dashboard data');
          setUser({ 
            name: 'User', 
            email: '', 
            avatar: null, 
            displayName: 'User',
            streak: 0, 
            longestStreak: 0 
          });
          setLegacies([]);
          setConversations([]);
          setActivities([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUser({ 
          name: 'User', 
          email: '', 
          avatar: null, 
          displayName: 'User',
          streak: 0, 
          longestStreak: 0 
        });
        setLegacies([]);
        setConversations([]);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Quick actions
  const quickActions = [
    {
      id: 1,
      label: "Create New Legacy",
      icon: "➕",
      color: "from-pink-400 to-rose-500",
      path: "/wizard",
    },
    {
      id: 2,
      label: "Import Memories",
      icon: "📥",
      color: "from-blue-400 to-cyan-500",
      path: "/import",
    },
    {
      id: 3,
      label: "Voice Training",
      icon: "🎙",
      color: "from-purple-400 to-indigo-500",
      path: "/voice-lab",
    },
    {
      id: 4,
      label: "Settings",
      icon: "⚙",
      color: "from-gray-400 to-gray-500",
      path: "/settings",
    },
  ];

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
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full pointer-events-none animate-pulse"
                style={{
                  left: `${particle.x}%`, // ✅ Fixed: Wrapped in backticks
                  top: `${particle.y}%`, // ✅ Fixed
                  width: `${particle.size}px`, // ✅ Fixed
                  height: `${particle.size}px`, // ✅ Fixed
                  background: `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`, // ✅ Fixed
                  boxShadow: `0 0 ${particle.size * 4}px hsla(${
                    particle.hue
                  }, 70%, 60%, ${particle.opacity * 0.5})`,
                  animation: `float ${
                    3 + Math.random() * 4
                  }s ease-in-out infinite`, // ✅ Fixed
                  animationDelay: `${Math.random() * 2}s`, // ✅ Fixed
                }}
              />
            ))}
          </div>
          {/* Interactive Mouse Glow */}
          <div
            className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: `${mousePos.x}%`, // ✅ Fixed
              top: `${mousePos.y}%`, // ✅ Fixed
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div
          className="flex h-screen"
          style={{ overflow: "visible", height: "auto" }}
        >
          {/* Sidebar Navigation */}
          <aside
            className={`${
              sidebarCollapsed ? "w-20" : "w-64"
            } bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out`}
          >
            {/* User Profile Section */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User"
                    className="w-12 h-12 rounded-full border-2 border-white/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center text-white text-lg font-semibold border-2 border-white/30">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                {!sidebarCollapsed && (
                  <div>
                    <p className="font-medium text-white">
                      {user?.displayName || user?.name || (user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'User')}
                    </p>
                    <p className="text-xs text-white/60">Online</p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="mt-4 p-3 bg-white/10 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Legacies</span>
                    <span className="text-white font-medium animate-pulse">
                      {legacies.length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2">
              {[
                { id: "overview", label: "Overview", icon: "🏠" },
                { id: "memories", label: "Memory Browser", icon: "📚" },
                { id: "conversations", label: "Conversations", icon: "💬" },
                { id: "analytics", label: "Analytics", icon: "📊" },
                { id: "settings", label: "Settings", icon: "⚙" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>

            {/* Collapse Button */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
              >
                <span
                  className={`transform transition-transform duration-300 ${
                    sidebarCollapsed ? "rotate-0" : "rotate-180"
                  }`}
                >
                  {sidebarCollapsed ? "◀" : "▶"}
                </span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            {/* Header Section */}
            <header className="p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h1 className="text-3xl font-serif text-white">
                    Good{" "}
                    {currentTime.getHours() < 12
                      ? "Morning"
                      : currentTime.getHours() < 18
                      ? "Afternoon"
                      : "Evening"}
                    , {user?.displayName || user?.name || (user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'User')}
                  </h1>
                  <p className="text-white/70">
                    Here's your Memory Mission Control
                  </p>
                </div>
                {/* Memory Mood Widget */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-4 py-2 rounded-xl bg-gradient-to-r ${
                      memoryMood === "nostalgic"
                        ? "from-amber-400 to-orange-500"
                        : memoryMood === "joyful"
                        ? "from-pink-400 to-rose-500"
                        : memoryMood === "peaceful"
                        ? "from-blue-400 to-cyan-500"
                        : "from-purple-400 to-indigo-500"
                    } text-white`}
                  >
                    <span className="text-sm">
                      Memory Mood:{" "}
                      {memoryMood.charAt(0).toUpperCase() + memoryMood.slice(1)}
                    </span>
                  </div>
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search memories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-violet-400 focus:outline-none transition-all text-white placeholder-white/50"
                    />
                    <svg
                      className="w-5 h-5 absolute left-3 top-2.5 text-white/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  {
                    label: "Total Memories",
                    value: stats.totalMemories,
                    icon: "💭",
                    color: "from-blue-400 to-cyan-500",
                  },
                  {
                    label: "Active Legacies",
                    value: stats.activeLegacies,
                    icon: "👥",
                    color: "from-pink-400 to-rose-500",
                  },
                  {
                    label: "7-Day Streak",
                    value: "🔥",
                    icon: "🔥",
                    color: "from-orange-400 to-red-500",
                  },
                  {
                    label: "Voice Training",
                    value: `${stats.voiceTrainingAvg}%`, // ✅ Fixed: Template literal
                    icon: "🎙",
                    color: "from-purple-400 to-indigo-500",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-white mb-2`} // ✅ Fixed: Added backticks around ${stat.color}
                    >
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </header>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "overview" && (
                <>
                  {/* Legacy Overview Cards */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-serif text-white mb-6">
                      Your Legacies
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Render real legacies from API */}
                      {legacies.length === 0 ? (
                        <></>
                      ) : (
                        /* Render each real legacy as a card */
                        legacies.map((legacy) => (
                          <div
                            key={legacy._id} // ✅ Use legacy._id from DB
                            className={`relative rounded-2xl p-6 transition-all duration-500 cursor-pointer overflow-hidden bg-black/20 backdrop-blur-xl border border-white/20 hover:bg-black/30 ${
                              hoveredCard === legacy._id
                                ? "transform translate-y-[-10px] shadow-2xl shadow-violet-500/30"
                                : ""
                            }`}
                            style={{
                              background: `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1)), 
               radial-gradient(circle at 30% 30%, rgba(${legacy._id * 30}, ${
                                100 + legacy._id * 20
                              }, ${
                                150 + legacy._id * 10
                              }, 0.2), transparent 70%),
               radial-gradient(circle at 70% 70%, rgba(${
                 255 - legacy._id * 30
               }, ${150 - legacy._id * 20}, ${
                                100 - legacy._id * 10
                              }, 0.15), transparent 70%)`,
                              borderImage: `linear-gradient(45deg, hsl(${
                                legacy._id * 60 + 240
                              }, 70%, 60%), hsl(${
                                legacy._id * 60 + 270
                              }, 70%, 50%)) 1`,
                              boxShadow:
                                hoveredCard === legacy._id
                                  ? "0 20px 40px rgba(147, 51, 234, 0.2)"
                                  : "0 5px 15px rgba(0, 0, 0, 0.1)",
                            }}
                            onMouseEnter={() => setHoveredCard(legacy._id)}
                            onMouseLeave={() => setHoveredCard(null)}
                          >
                            {/* Cosmic Background Particles (UNCHANGED) */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              {[...Array(15)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute rounded-full animate-pulse"
                                  style={{
                                    left: `${(i * 13) % 100}%`,
                                    top: `${(i * 23) % 100}%`,
                                    width: `${1 + Math.random() * 3}px`,
                                    height: `${1 + Math.random() * 3}px`,
                                    background: `hsla(${
                                      legacy._id * 60 + 240 + i * 10
                                    }, 70%, 70%, 0.6)`,
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: `${
                                      3 + Math.random() * 4
                                    }s`,
                                  }}
                                ></div>
                              ))}
                            </div>

                            {/* Glowing Edge (UNCHANGED) */}
                            <div
                              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{
                                background: `radial-gradient(circle, transparent 70%, hsla(${
                                  legacy._id * 60 + 240
                                }, 70%, 60%, 0.3) 100%)`,
                              }}
                            ></div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <img
                                    src={
                                      legacy.photo ||
                                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                                    }
                                    alt={legacy.name}
                                    className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg"
                                  />
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white">
                                    {legacy.name}
                                  </h3>
                                  <p className="text-sm text-white/60">
                                    {legacy.relationship || "Other"}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-3 h-3 rounded-full animate-pulse ${
                                  legacy.status === "active"
                                    ? "bg-emerald-400"
                                    : "bg-gray-400"
                                }`}
                              ></div>
                            </div>

                            <div className="mb-4 p-3 bg-white/5 rounded-xl relative z-10 backdrop-blur-sm border border-white/10">
                              <p className="text-sm text-white/70">
                                "
                                {legacy.recentMessage ||
                                  "No recent message yet."}
                                "
                              </p>
                              <p className="text-xs text-white/50 mt-2">
                                Last active: {legacy.lastActive || "Just now"}
                              </p>
                            </div>

                            <div className="space-y-3 relative z-10">
                              <div>
                                <div className="flex justify-between text-xs text-white/60 mb-1">
                                  <span>Memories</span>
                                  <span>{legacy.totalMemories || 0}</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        ((legacy.totalMemories || 0) / 500) *
                                          100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs text-white/60 mb-1">
                                  <span>Voice Training</span>
                                  <span>{legacy.voiceTraining || 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 rounded-full"
                                    style={{
                                      width: `${legacy.voiceTraining || 0}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Quick Action Buttons (appear on hover) */}
                            {hoveredCard === legacy._id && (
                              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <button className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-all text-white/80 border border-white/20 hover:scale-110 hover:shadow-lg hover:shadow-violet-500/20">
                                  <span className="text-xs">💬</span>
                                </button>
                                <button className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-all text-white/80 border border-white/20 hover:scale-110 hover:shadow-lg hover:shadow-violet-500/20">
                                  <span className="text-xs">📝</span>
                                </button>
                                <button className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-all text-white/80 border border-white/20 hover:scale-110 hover:shadow-lg hover:shadow-violet-500/20">
                                  <span className="text-xs">⋮</span>
                                </button>
                              </div>
                            )}

                            {/* Floating Memory Orbs (UNCHANGED) */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-violet-400 to-pink-400 opacity-60 animate-ping"></div>
                            <div
                              className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-40 animate-pulse"
                              style={{ animationDelay: "1s" }}
                            ></div>
                          </div>
                        ))
                      )}

                      {/* ALWAYS SHOW "Create New Legacy" Card — BELOW ALL LEGACIES */}
                      <div
                        key="create-new"
                        className="relative rounded-2xl p-6 transition-all duration-500 cursor-pointer overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-105 shadow-2xl shadow-purple-500/20"
                        style={{
                          background:
                            "linear-gradient(135deg, #a855f7, #8b5cf6)",
                        }}
                      >
                        <div className="relative z-10">
                          <div className="text-4xl mb-4 animate-pulse">✨</div>
                          <button
                            onClick={createLegacy}
                            style={{ cursor: "pointer" }}
                            className="text-xl font-semibold mb-2"
                          >
                            Create New Legacy
                          </button>
                          <p className="text-sm opacity-90">
                            Start preserving someone special
                          </p>
                          <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm border border-white/30 hover:bg-white/50 transition-all">
                            <span className="animate-bounce">➕</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Recent Conversations */}
                  <section className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif text-white">
                        Recent Conversations
                      </h2>
                      <Link
                        to="/chat"
                        className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                      >
                        View All
                      </Link>
                    </div>

                    {conversations.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-2xl">
                        <p className="text-xl text-white/70">
                          You haven't had any conversations yet.
                        </p>
                        <p className="text-white/50 mt-2">
                          Start chatting with your digital legacy.
                        </p>
                      </div>
                    ) : (
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {conversations.map((conv) => (
                          <div
                            key={conv._id}
                            className="flex-shrink-0 w-80 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-white">
                                {conv.legacyName || "Unknown"}{" "}
                                {/* ✅ Use legacyName from API */}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    conv.emotionalTone === "joyful"
                                      ? "bg-amber-400"
                                      : conv.emotionalTone === "nostalgic"
                                      ? "bg-purple-400"
                                      : conv.emotionalTone === "loving"
                                      ? "bg-pink-400"
                                      : "bg-blue-400"
                                  }`}
                                ></div>
                                <span className="text-xs text-white/50">
                                  {conv.time || "Just now"}{" "}
                                  {/* ✅ Fallback if time is missing */}
                                </span>
                              </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl mb-3">
                              <p className="text-sm text-white/70">
                                "{conv.message || "No message yet."}"{" "}
                                {/* ✅ Fallback if message is empty */}
                              </p>
                            </div>
                            {conv.unread > 0 && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-r from-violet-400 to-pink-500 flex items-center justify-center text-xs text-white animate-pulse">
                                {conv.unread}
                              </div>
                            )}
                            {/* Quick Reply (appears on hover) — UNCHANGED */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                              <input
                                type="text"
                                placeholder="Quick reply..."
                                className="w-full px-3 py-2 text-sm rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-violet-400 text-white placeholder-white/50"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Analytics Dashboard */}
                  <section>
                    <h2 className="text-2xl font-serif text-white mb-6">
                      Memory Analytics
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Donut Charts */}
                      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <h3 className="font-semibold text-white mb-4">
                          Memory Distribution
                        </h3>
                        <div className="flex items-center justify-center h-48 relative">
                          <svg
                            width="200"
                            height="200"
                            className="transform -rotate-90"
                          >
                            {stats.memoryDistribution().map((item, idx) => {
                              const radius = 80;
                              const circumference = 2 * Math.PI * radius;
                              const offset =
                                circumference -
                                (item.percent / 100) * circumference;

                              return (
                                <circle
                                  key={idx}
                                  cx="100"
                                  cy="100"
                                  r={radius - idx * 15}
                                  fill="transparent"
                                  stroke="currentColor"
                                  strokeWidth="15"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={offset}
                                  className={`${item.color} transition-all duration-1000 ease-out`}
                                  style={{
                                    transitionDelay: `${idx * 200}ms`,
                                  }}
                                />
                              );
                            })}
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">
                                {stats.totalMemories}
                              </div>
                              <div className="text-sm text-white/60">Total</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center space-x-6 mt-4">
                          {stats.memoryDistribution().map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2"
                            >
                              <div
                                className={`w-3 h-3 rounded-full ${item.color.replace(
                                  "stroke-",
                                  "bg-"
                                )}`}
                              ></div>
                              <span className="text-xs text-white/60">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Activity Timeline */}
                      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <h3 className="font-semibold text-white mb-4">
                          Recent Activity
                        </h3>
                        <div className="space-y-4">
                          {activities.length === 0 ? (
                            <div className="text-center py-12 text-white/50">
                              No recent activity yet.
                            </div>
                          ) : (
                            activities.map((activity) => {
                              const getActivityIcon = (type) => {
                                switch (type) {
                                  case 'memory_added':
                                    return '📸';
                                  case 'conversation':
                                    return '💬';
                                  case 'legacy_created':
                                    return '✨';
                                  default:
                                    return '📝';
                                }
                              };

                              const getActivityColor = (type) => {
                                switch (type) {
                                  case 'memory_added':
                                    return 'bg-blue-500';
                                  case 'conversation':
                                    return 'bg-green-500';
                                  case 'legacy_created':
                                    return 'bg-purple-500';
                                  default:
                                    return 'bg-gray-500';
                                }
                              };

                              return (
                                <div key={activity._id} className="flex items-start space-x-3">
                                  <div className={`w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-sm`}>
                                    {getActivityIcon(activity.type)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-white/70">
                                      {activity.message}
                                    </p>
                                    <p className="text-xs text-white/50">
                                      {new Date(
                                        activity.createdAt
                                      ).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}{" "}
                                      • You
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "memories" && (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Memory Browser
                  </h2>
                  <p className="text-white/70 mb-8">
                    All your preserved memories in one place
                  </p>
                  <Link
                    to="/memory-browser"
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all"
                  >
                    Browse Memories
                  </Link>
                </div>
              )}

              {activeTab === "conversations" && (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Conversations
                  </h2>
                  <p className="text-white/70 mb-8">
                    Chat history with your digital legacies
                  </p>
                  <Link
                    to="/chat"
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all"
                  >
                    View Conversations
                  </Link>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Advanced Analytics
                  </h2>
                  <p className="text-white/70 mb-8">
                    Deep insights into your memory preservation journey
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all">
                    View Analytics
                  </button>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Settings
                  </h2>
                  <p className="text-white/70 mb-8">
                    Manage your account and preferences
                  </p>
                  <Link
                    to="/settings"
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all"
                  >
                    Go to Settings
                  </Link>
                </div>
              )}
            </div>
          </main>

          {/* Floating Action Button */}
          <div className="fixed bottom-8 right-8 z-50">
            <div className="relative">
              <button
                onClick={() =>
                  setActiveQuickAction(activeQuickAction ? null : "menu")
                }
                className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white text-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
              >
                {activeQuickAction ? "×" : "+"}
              </button>

              {/* Quick Action Menu */}
              {activeQuickAction === "menu" && (
                <div className="absolute bottom-20 right-0 flex flex-col space-y-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.id}
                      to={action.path}
                      className={`w-14 h-14 rounded-full bg-gradient-to-r ${action.color} text-white flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-all duration-300 transform`} // ✅ Fixed: Added backticks around ${action.color}
                      style={{
                        animation: `slideIn 0.3s ease-out ${
                          action.id * 0.1
                        }s both`, // ✅ Fixed: Backticks around ${action.id * 0.1}s
                      }}
                    >
                      {action.icon}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Global Animations */}
          <style jsx="true" global="true">{`
            @keyframes float {
              0%,
              100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-10px) rotate(180deg);
              }
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(100%);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
