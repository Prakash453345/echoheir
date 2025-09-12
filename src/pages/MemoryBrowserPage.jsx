// src/pages/MemoryBrowserPage.jsx
import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const MemoryBrowserPage = () => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemories, setSelectedMemories] = useState(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

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

  // Sample memory data
  const initialMemories = [
    {
      id: 1,
      type: 'voice',
      title: "Sunday Morning Stories",
      content: "Grandma telling stories about her childhood while making pancakes...",
      date: "2023-10-15",
      duration: "2:45",
      emotion: 'nostalgic',
      waveform: [0.2, 0.5, 0.8, 0.3, 0.6, 0.9, 0.4, 0.7, 0.2, 0.5],
      quality: 92,
      tags: ['family', 'morning', 'stories']
    },
    {
      id: 2,
      type: 'photo',
      title: "Beach Vacation 2019",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
      date: "2019-07-22",
      emotion: 'joyful',
      location: "Santa Monica Beach",
      tags: ['vacation', 'beach', 'family']
    },
    {
      id: 3,
      type: 'text',
      title: "Letter to Future Generations",
      content: "My dearest children and grandchildren, if you're reading this, know that I loved you more than words can express...",
      date: "2022-12-25",
      emotion: 'loving',
      wordCount: 427,
      tags: ['letter', 'christmas', 'legacy']
    },
    {
      id: 4,
      type: 'video',
      title: "Birthday Celebration",
      thumbnailUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop",
      date: "2021-05-14",
      duration: "15:32",
      emotion: 'celebratory',
      tags: ['birthday', 'party', 'family']
    },
    {
      id: 5,
      type: 'voice',
      title: "Recipe for Apple Pie",
      content: "First, you'll need to peel the apples just right — not too thin, not too thick...",
      date: "2023-09-03",
      duration: "4:18",
      emotion: 'loving',
      waveform: [0.3, 0.6, 0.9, 0.4, 0.7, 0.2, 0.5, 0.8, 0.3, 0.6],
      quality: 88,
      tags: ['recipe', 'cooking', 'family']
    },
    {
      id: 6,
      type: 'photo',
      title: "Garden Moments",
      imageUrl: "https://images.unsplash.com/photo-1457364887197-9150188c107b?w=400&h=300&fit=crop",
      date: "2020-06-18",
      emotion: 'peaceful',
      location: "Backyard Garden",
      tags: ['garden', 'nature', 'peace']
    },
    {
      id: 7,
      type: 'text',
      title: "Life Lessons Learned",
      content: "The most important thing I've learned in 87 years is that kindness costs nothing but means everything...",
      date: "2023-01-10",
      emotion: 'wise',
      wordCount: 312,
      tags: ['wisdom', 'life', 'lessons']
    },
    {
      id: 8,
      type: 'video',
      title: "Christmas Morning",
      thumbnailUrl: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=300&fit=crop",
      date: "2020-12-25",
      duration: "8:45",
      emotion: 'joyful',
      tags: ['christmas', 'family', 'holiday']
    }
  ];

  const [memories, setMemories] = useState(initialMemories);
  const [displayedMemories, setDisplayedMemories] = useState(initialMemories.slice(0, 6));

  // Filter and sort memories
  useEffect(() => {
    let filtered = memories.filter(memory => {
      if (filter !== 'all' && memory.type !== filter) return false;
      if (searchQuery && !memory.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Sort memories
    filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'emotion') return a.emotion.localeCompare(b.emotion);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    setDisplayedMemories(filtered.slice(0, 6));
  }, [filter, sortBy, searchQuery, memories]);

  // Load more memories (infinite scroll)
  const loadMore = () => {
    if (!hasMore) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const startIndex = displayedMemories.length;
      const newMemories = memories.slice(startIndex, startIndex + 3);
      setDisplayedMemories(prev => [...prev, ...newMemories]);
      if (displayedMemories.length + newMemories.length >= memories.length) {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 1000);
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasMore, isLoading, displayedMemories.length]);

  // Toggle selection
  const toggleSelection = (id) => {
    const newSelected = new Set(selectedMemories);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMemories(newSelected);
  };

  // Select all visible memories
  const selectAll = () => {
    if (selectedMemories.size === displayedMemories.length) {
      setSelectedMemories(new Set());
    } else {
      setSelectedMemories(new Set(displayedMemories.map(m => m.id)));
    }
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif text-white mb-2">Digital Memory Lane</h1>
            <p className="text-white/70">Walk through your cherished moments, preserved forever</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all text-white placeholder-white/50"
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>

              {/* Sort and Filter */}
              <div className="flex space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 focus:border-violet-400 focus:outline-none transition-all text-white"
                >
                  <option value="date" style={{color:'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>Sort by Date</option>
                  <option value="title" style={{color:'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>Sort by Title</option>
                  <option value="emotion" style={{color:'black',backgroundColor:"rgba(255, 255, 255, 0.1)"}}>Sort by Emotion</option>
                </select>

                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 transition-all flex items-center space-x-2 text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                  </svg>
                  <span>Filter</span>
                </button>

                {selectedMemories.size > 0 && (
                  <button className="px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-xl transition-all flex items-center space-x-2">
                    <span>{selectedMemories.size} Selected</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
              <div className="mt-6 p-4 bg-white/10 rounded-xl">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      filter === 'all'
                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                        : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setFilter('text')}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      filter === 'text'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setFilter('voice')}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      filter === 'voice'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                  >
                    Voice
                  </button>
                  <button
                    onClick={() => setFilter('photo')}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      filter === 'photo'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                  >
                    Photos
                  </button>
                  <button
                    onClick={() => setFilter('video')}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      filter === 'video'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                  >
                    Videos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Memory Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayedMemories.map((memory) => (
              <div
                key={memory.id}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-500 cursor-pointer"
                onClick={() => toggleSelection(memory.id)}
              >
                {/* Selection Overlay */}
                {selectedMemories.has(memory.id) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 bg-opacity-20 flex items-center justify-center z-10">
                    <div className="w-8 h-8 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Memory Type Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                  memory.type === 'text' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  memory.type === 'voice' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  memory.type === 'photo' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  'bg-gradient-to-r from-orange-500 to-red-500'
                } text-white`}>
                  {memory.type === 'text' ? 'Text' :
                   memory.type === 'voice' ? 'Voice' :
                   memory.type === 'photo' ? 'Photo' : 'Video'}
                </div>

                {/* Emotional Indicator */}
                <div className={`absolute top-0 left-0 h-1 w-full ${
                  memory.emotion === 'loving' ? 'bg-gradient-to-r from-pink-400 to-rose-500' :
                  memory.emotion === 'joyful' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                  memory.emotion === 'nostalgic' ? 'bg-gradient-to-r from-purple-400 to-indigo-500' :
                  memory.emotion === 'peaceful' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  memory.emotion === 'wise' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                  memory.emotion === 'celebratory' ? 'bg-gradient-to-r from-red-400 to-pink-500' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}></div>

                {/* Content */}
                <div className="p-6">
                  {memory.type === 'photo' && memory.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img
                        src={memory.imageUrl}
                        alt={memory.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {memory.type === 'video' && memory.thumbnailUrl && (
                    <div className="mb-4 relative overflow-hidden rounded-xl">
                      <img
                        src={memory.thumbnailUrl}
                        alt={memory.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {memory.type === 'voice' && (
                    <div className="mb-4 p-4 bg-white/10 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                          🎵
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{memory.title}</div>
                          <div className="text-xs text-white/50">{memory.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-end space-x-1 h-12">
                        {memory.waveform.map((bar, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all duration-300"
                            style={{
                              height: `${bar * 100}%`,
                              width: '8px',
                              minHeight: '2px'
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 text-xs text-white/50">
                        <span>Quality: {memory.quality}%</span>
                        <button className="text-purple-400 hover:text-purple-300">▶ Play</button>
                      </div>
                    </div>
                  )}

                  {memory.type === 'text' && (
                    <div className="mb-4 p-4 bg-white/10 rounded-xl">
                      <div className="text-sm italic text-white/70 line-clamp-3">
                        "{memory.content}"
                      </div>
                      <div className="text-xs text-white/50 mt-2">Word count: {memory.wordCount}</div>
                    </div>
                  )}

                  <h3 className="text-lg font-medium text-white mb-2">{memory.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-white/50">
                    <span>{new Date(memory.date).toLocaleDateString()}</span>
                    {memory.location && <span>{memory.location}</span>}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {memory.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white/20 rounded-full text-xs text-white/70"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                  <button className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-all text-white/80">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-all text-white/80">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More / Infinite Scroll Trigger */}
          <div ref={containerRef} className="h-10 flex items-center justify-center">
            {isLoading && (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-white/70">Loading more memories...</span>
              </div>
            )}
            {!hasMore && !isLoading && (
              <p className="text-white/50 text-sm">You've reached the end of your memory lane</p>
            )}
          </div>

          {/* Batch Actions */}
          {selectedMemories.size > 0 && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-xl z-50">
              <div className="flex items-center space-x-4">
                <button
                  onClick={selectAll}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  {selectedMemories.size === displayedMemories.length ? 'Deselect All' : 'Select All'}
                </button>
                <div className="w-px h-6 bg-white/30"></div>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all text-sm">
                  Download ({selectedMemories.size})
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all text-sm">
                  Share ({selectedMemories.size})
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all text-sm">
                  Delete ({selectedMemories.size})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Styles */}
        <style jsx global>{`
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
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

export default MemoryBrowserPage;