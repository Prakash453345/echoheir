// src/pages/SettingsPage.jsx
import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    bio: 'Preserving the legacy of my loved ones, one memory at a time.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
  });
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    publicProfile: false,
    familyAccess: true,
    downloadPermissions: true,
    aiTrainingOptIn: true
  });
  const [appearance, setAppearance] = useState({
    theme: 'cosmic',
    fontSize: 'medium',
    reduceMotion: false,
    animationIntensity: 70
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    memoryReminders: true,
    anniversaryAlerts: true,
    soundEnabled: true,
    soundVolume: 60
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const fileInputRef = useRef(null);

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

  // Theme presets
  const themes = [
    {
      id: 'cosmic',
      name: 'Cosmic Dreams',
      colors: {
        primary: 'from-violet-500 via-purple-500 to-pink-500',
        secondary: 'from-blue-500 to-cyan-500',
        background: 'from-black via-gray-900 to-purple-900'
      }
    },
    {
      id: 'serene',
      name: 'Serene Blues',
      colors: {
        primary: 'from-blue-500 via-cyan-500 to-indigo-500',
        secondary: 'from-green-500 to-emerald-500',
        background: 'from-sky-50 via-blue-50 to-indigo-50'
      }
    },
    {
      id: 'sunset',
      name: 'Golden Sunset',
      colors: {
        primary: 'from-amber-500 via-orange-500 to-red-500',
        secondary: 'from-pink-500 to-rose-500',
        background: 'from-orange-50 via-amber-50 to-red-50'
      }
    },
    {
      id: 'midnight',
      name: 'Midnight Dreams',
      colors: {
        primary: 'from-purple-600 via-indigo-700 to-blue-800',
        secondary: 'from-pink-600 to-purple-700',
        background: 'from-gray-900 via-purple-900 to-blue-900'
      }
    }
  ];

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileData(prev => ({ ...prev, avatar: e.target.result }));
          setIsUploading(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        };
        reader.readAsDataURL(file);
      }, 1500);
    }
  };

  // Update profile field
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle switch handler
  const toggleSwitch = (setting, group) => {
    if (group === 'privacy') {
      setPrivacySettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    } else if (group === 'notifications') {
      setNotifications(prev => ({ ...prev, [setting]: !prev[setting] }));
    } else if (group === 'appearance') {
      setAppearance(prev => ({ ...prev, [setting]: !prev[setting] }));
    }
  };

  // Range input handler
  const handleRangeChange = (setting, value, group) => {
    if (group === 'appearance') {
      setAppearance(prev => ({ ...prev, [setting]: parseInt(value) }));
    } else if (group === 'notifications') {
      setNotifications(prev => ({ ...prev, [setting]: parseInt(value) }));
    }
  };

  // Save settings
  const saveSettings = () => {
    // Simulate save
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
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

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif text-white mb-2">Personal Control Center</h1>
            <p className="text-white/70">Manage your account, preferences, and privacy settings</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 p-1 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
                { id: 'appearance', label: 'Appearance', icon: '🎨' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-white mb-2">Profile Information</h2>
                  <p className="text-white/70">Manage your personal details and avatar</p>
                </div>

                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={profileData.avatar}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white/30 shadow-lg"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                    >
                      ✏️
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {isUploading && (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-white/70">Uploading...</span>
                    </div>
                  )}
                  
                  {showSuccess && (
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm">Avatar updated successfully!</span>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all text-white placeholder-white/50"
                      />
                      <label className="absolute left-4 top-3 text-white/50 transition-all duration-300 focus-within:text-xs focus-within:top-2 focus-within:text-violet-400">
                        
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all text-white placeholder-white/50"
                      />
                      <label className="absolute left-4 top-3 text-white/50 transition-all duration-300 focus-within:text-xs focus-within:top-2 focus-within:text-violet-400">
                        
                      </label>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      placeholder="Bio (Tell us about yourself)"
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all resize-none text-white placeholder-white/50"
                    ></textarea>
                    <label className="absolute left-4 top-3 text-white/50 transition-all duration-300 focus-within:text-xs focus-within:top-2 focus-within:text-violet-400">
                      
                    </label>
                    <div className="flex justify-between mt-1 text-xs text-white/50">
                      <span>{profileData.bio?.length || 0}/500</span>
                      <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, ((profileData.bio?.length || 0) / 500) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legacy Management */}
                <div className="space-y-6">
                  <h3 className="text-xl font-medium text-white">Your Legacies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Grandma Eleanor", memories: 247, status: "active" },
                      { name: "Uncle Marcus", memories: 183, status: "active" }
                    ].map((legacy, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/10 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{legacy.name}</h4>
                            <p className="text-sm text-white/50">{legacy.memories} memories</p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                            <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all">
                    Create New Legacy
                  </button>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-white/20">
                  <button
                    onClick={saveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Save Profile Settings
                  </button>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-white mb-2">Privacy & Security</h2>
                  <p className="text-white/70">Control who can access your memories and data</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Data Sharing Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Share anonymized data for AI improvement</h4>
                          <p className="text-sm text-white/50">Help us improve our AI models while preserving your privacy</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('dataSharing', 'privacy')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            privacySettings.dataSharing
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}} 
                          ></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Allow public tribute pages</h4>
                          <p className="text-sm text-white/50">Create public memorial pages for your loved ones</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('publicProfile', 'privacy')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            privacySettings.publicProfile
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              privacySettings.publicProfile ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Grant family access</h4>
                          <p className="text-sm text-white/50">Allow immediate family members to view and contribute</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('familyAccess', 'privacy')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            privacySettings.familyAccess
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              privacySettings.familyAccess ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Allow memory downloads</h4>
                          <p className="text-sm text-white/50">Permit downloading of original memory files</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('downloadPermissions', 'privacy')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            privacySettings.downloadPermissions
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              privacySettings.downloadPermissions ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Opt-in to AI training</h4>
                          <p className="text-sm text-white/50">Allow your interactions to improve our AI models</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('aiTrainingOptIn', 'privacy')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            privacySettings.aiTrainingOptIn
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              privacySettings.aiTrainingOptIn ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="p-6 rounded-2xl bg-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Storage Usage</h4>
                          <p className="text-sm text-white/50">2.4 GB of 5 GB used</p>
                        </div>
                        <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: '48%' }}></div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <button className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-sm text-white">
                          Export All Data
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-sm text-white">
                          Request Data Deletion
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="p-6 rounded-2xl bg-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Security</h3>
                    <div className="space-y-4">
                      <button className="w-full px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-left text-white">
                        <div className="flex items-center justify-between">
                          <span>Change Password</span>
                          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </button>
                      <button className="w-full px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-left text-white">
                        <div className="flex items-center justify-between">
                          <span>Two-Factor Authentication</span>
                          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </button>
                      <button className="w-full px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-left text-white">
                        <div className="flex items-center justify-between">
                          <span>View Security Audit Log</span>
                          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-white/20">
                  <button
                    onClick={saveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-white mb-2">Appearance & Preferences</h2>
                  <p className="text-white/70">Customize your EchoHeir experience</p>
                </div>

                {/* Theme Selection */}
                <div className="space-y-6">
                  <h3 className="text-xl font-medium text-white">Theme Selection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        onClick={() => setAppearance(prev => ({ ...prev, theme: theme.id }))}
                        className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                          appearance.theme === theme.id
                            ? 'ring-4 ring-violet-400 bg-white/20'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.colors.primary}`}></div>
                          <h4 className="font-medium text-white">{theme.name}</h4>
                          {appearance.theme === theme.id && (
                            <svg className="w-5 h-5 text-violet-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <div className="h-8 rounded-lg bg-gradient-to-r" style={{ 
                          background: `linear-gradient(90deg, ${theme.colors.primary})`
                        }}></div>
                      </div>
                    ))}
                  </div>

                  {/* Live Preview */}
                  <div className="p-6 rounded-2xl bg-white/10">
                    <h4 className="font-medium text-white mb-4">Live Preview</h4>
                    <div className="p-4 rounded-xl bg-gradient-to-r" style={{ 
                      background: themes.find(t => t.id === appearance.theme)?.colors.background || 'from-black via-gray-900 to-purple-900'
                    }}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r" style={{ 
                          background: themes.find(t => t.id === appearance.theme)?.colors.primary || 'from-violet-500 to-pink-500'
                        }}></div>
                        <div>
                          <h5 className="font-medium text-white">This is how your theme looks</h5>
                          <p className="text-sm text-white/50">The primary accent color and background</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-xl bg-gradient-to-r text-white text-sm" style={{ 
                        background: themes.find(t => t.id === appearance.theme)?.colors.secondary || 'from-blue-500 to-cyan-500'
                      }}>
                        Sample Button
                      </button>
                    </div>
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-6">
                  <h3 className="text-xl font-medium text-white">Font Size</h3>
                  <div className="flex space-x-4">
                    {[
                      { id: 'small', label: 'Small', size: '14px' },
                      { id: 'medium', label: 'Medium', size: '16px' },
                      { id: 'large', label: 'Large', size: '18px' },
                      { id: 'xlarge', label: 'Extra Large', size: '20px' }
                    ].map((sizeOption) => (
                      <button
                        key={sizeOption.id}
                        onClick={() => setAppearance(prev => ({ ...prev, fontSize: sizeOption.id }))}
                        className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                          appearance.fontSize === sizeOption.id
                            ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white/20 text-white/70 hover:bg-white/30'
                        }`}
                      >
                        <div className="font-medium">{sizeOption.label}</div>
                        <div className="text-xs opacity-75">{sizeOption.size}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation Preferences */}
                <div className="space-y-6">
                  <h3 className="text-xl font-medium text-white">Animation Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <div>
                        <h4 className="font-medium text-white">Reduce Motion</h4>
                        <p className="text-sm text-white/50">Minimize animations for accessibility</p>
                      </div>
                      <button
                        onClick={() => toggleSwitch('reduceMotion', 'appearance')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          appearance.reduceMotion
                            ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                            appearance.reduceMotion ? 'translate-x-6' : 'translate-x-1'
                          }`}style={{right:'30px',bottom:'5px'}}
                        ></span>
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">Animation Intensity</h4>
                        <span className="text-sm text-white/50">{appearance.animationIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={appearance.animationIntensity}
                        onChange={(e) => handleRangeChange('animationIntensity', e.target.value, 'appearance')}
                        className="w-full h-2 bg-white/20 rounded-full appearance-none slider"
                        style={{
                          background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${appearance.animationIntensity}%, rgba(255,255,255,0.2) ${appearance.animationIntensity}%, rgba(255,255,255,0.2) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-white/50 mt-1">
                        <span>Subtle</span>
                        <span>Vibrant</span>
                      </div>
                    </div>

                    {/* Performance Impact */}
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          appearance.animationIntensity < 30 ? 'bg-green-400' :
                          appearance.animationIntensity < 70 ? 'bg-amber-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-sm text-white/50">
                          {appearance.animationIntensity < 30 ? 'Low performance impact' :
                           appearance.animationIntensity < 70 ? 'Moderate performance impact' : 'High performance impact'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-white/20">
                  <button
                    onClick={saveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Save Appearance Settings
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-white mb-2">Notification Settings</h2>
                  <p className="text-white/70">Manage how and when you receive notifications</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Email Notifications</h4>
                          <p className="text-sm text-white/50">Receive important updates via email</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('emailNotifications', 'notifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            notifications.emailNotifications
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Push Notifications</h4>
                          <p className="text-sm text-white/50">Get alerts on your device</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('pushNotifications', 'notifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            notifications.pushNotifications
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Memory Reminders</h4>
                          <p className="text-sm text-white/50">Get prompted to add new memories</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('memoryReminders', 'notifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            notifications.memoryReminders
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              notifications.memoryReminders ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Anniversary Alerts</h4>
                          <p className="text-sm text-white/50">Remember important dates</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('anniversaryAlerts', 'notifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            notifications.anniversaryAlerts
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              notifications.anniversaryAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sound Settings */}
                  <div className="p-6 rounded-2xl bg-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Sound Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white">Notification Sounds</h4>
                          <p className="text-sm text-white/50">Play sounds for notifications</p>
                        </div>
                        <button
                          onClick={() => toggleSwitch('soundEnabled', 'notifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            notifications.soundEnabled
                              ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
                              notifications.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}style={{right:'30px',bottom:'5px'}}
                          ></span>
                        </button>
                      </div>

                      {notifications.soundEnabled && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">Sound Volume</h4>
                            <span className="text-sm text-white/50">{notifications.soundVolume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={notifications.soundVolume}
                            onChange={(e) => handleRangeChange('soundVolume', e.target.value, 'notifications')}
                            className="w-full h-2 bg-white/20 rounded-full appearance-none slider"
                            style={{
                              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${notifications.soundVolume}%, rgba(255,255,255,0.2) ${notifications.soundVolume}%, rgba(255,255,255,0.2) 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs text-white/50 mt-1">
                            <span>Quiet</span>
                            <span>Loud</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-white mb-2">Sound Preview</h4>
                        <button className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-white">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 000 12.728"></path>
                            </svg>
                            <span>Play Notification Sound</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scheduling */}
                  <div className="p-6 rounded-2xl bg-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Notification Scheduling</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Quiet Hours</h4>
                        <div className="flex items-center space-x-4">
                          <select className="px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all text-white">
                            <option style={{ color: 'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>10:00 PM</option>
                            <option style={{ color: 'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>11:00 PM</option>
                            <option selected style={{ color: 'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>12:00 AM</option>
                            <option style={{ color: 'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>1:00 AM</option>
                          </select>
                          <span className="text-white/50">to</span>
                          <select className="px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all text-white">
                            <option style={{ color: 'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>6:00 AM</option>
                            <option style={{ color: 'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>7:00 AM</option>
                            <option selected style={{ color: 'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>8:00 AM</option>
                            <option style={{ color: 'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>9:00 AM</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-white mb-2">Notification Frequency</h4>
                        <div className="flex space-x-4">
                          {[
                            { id: 'minimal', label: 'Minimal', desc: 'Only critical alerts' },
                            { id: 'balanced', label: 'Balanced', desc: 'Recommended for most users' },
                            { id: 'frequent', label: 'Frequent', desc: 'Stay always informed' }
                          ].map((freq) => (
                            <button
                              key={freq.id}
                              className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                                'balanced' === freq.id
                                  ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                                  : 'bg-white/20 text-white/70 hover:bg-white/30'
                              }`}
                            >
                              <div className="font-medium">{freq.label}</div>
                              <div className="text-xs opacity-75">{freq.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-white/20">
                  <button
                    onClick={saveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Save Notification Settings
                  </button>
                </div>
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
      </div>
    </Layout>
  );
};

export default SettingsPage;