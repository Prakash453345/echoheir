// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const LandingPage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [particles, setParticles] = useState([]);
  const [hoveredFeature, setHoveredFeature] = useState(null);

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

    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
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

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    { 
      quote: "It's like she's still here with me, sharing stories every morning...", 
      author: "Maria Thompson",
      role: "Daughter",
      avatar: "https://www.perfocal.com/blog/content/images/size/w960/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg"
    },
    { 
      quote: "I hear his laugh in the kitchen. Technology became magic.", 
      author: "David Chen",
      role: "Grandson", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    { 
      quote: "The AI captured her humor perfectly. I cry tears of joy daily.", 
      author: "Sophie Rodriguez",
      role: "Niece",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
  ];

  const features = [
    {
      icon: "🎭",
      title: "Preserve Essence",
      description: "Capture the unique voice, mannerisms, and personality that made them who they were.",
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      color: "violet",
    },
    {
      icon: "🧠",
      title: "AI Training",
      description: "Advanced neural networks learn their speech patterns, humor, and wisdom.",
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      color: "cyan",
    },
    {
      icon: "♾️",
      title: "Eternal Bond",
      description: "Have meaningful conversations and keep their memory alive forever.",
      gradient: "from-pink-500 via-rose-500 to-red-500",
      color: "pink",
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

        {/* Hero Section */}
        <section className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div 
            className="mb-8"
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="block text-white/90 mb-2">Your Legacy</span>
              <span className="block bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Lives Forever
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-white/70 mb-12 leading-relaxed">
              Transform memories into living conversations. AI technology that preserves the essence, 
              voice, and wisdom of your loved ones for eternity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                className="group relative px-8 py-4 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Begin Your Journey
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          {/* <div className="absolute bottom-10 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gradient-to-b from-violet-400 to-transparent rounded-full mt-2 animate-pulse" />
            </div>
          </div> */}
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-20 py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Technology Meets
                <span className="block bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  Human Connection
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Our advanced AI doesn't just store memories—it brings them to life with unprecedented authenticity.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative"
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`
                    relative p-8 h-80 rounded-3xl backdrop-blur-xl border transition-all duration-500 cursor-pointer
                    ${hoveredFeature === index 
                      ? 'bg-white/20 border-white/30 scale-105 shadow-2xl shadow-violet-500/20' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }
                  `}>
                    {/* Gradient Orb */}
                    <div className={`
                      w-16 h-16 rounded-full mb-6 flex items-center justify-center text-2xl
                      bg-gradient-to-r ${feature.gradient} shadow-lg
                      ${hoveredFeature === index ? 'animate-pulse' : ''}
                    `}>
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className={`
                      text-white/70 leading-relaxed transition-all duration-500
                      ${hoveredFeature === index ? 'text-white/90' : ''}
                    `}>
                      {feature.description}
                    </p>

                    {/* Hover Effect */}
                    {hoveredFeature === index && (
                      <div className={`
                        absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-10 animate-pulse
                      `} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="relative z-20 py-24 px-6 bg-gradient-to-b from-transparent to-black/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-20">
              Three Steps to
              <span className="block bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Digital Immortality
              </span>
            </h2>

            <div className="relative">
              {/* Connection Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 transform -translate-y-1/2 hidden md:block" />
              
              {/* Animated Particles on Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 hidden md:block">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
                    style={{
                      top: '50%',
                      left: '0%',
                      transform: 'translateY(-50%)',
                      animation: `slideAcross 4s ease-in-out infinite`,
                      animationDelay: `${i * 1.3}s`,
                    }}
                  />
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-12 relative z-10">
                {[
                  { 
                    step: "01", 
                    title: "Capture", 
                    desc: "Upload photos, videos, voice recordings, and written memories",
                    icon: "📸",
                    gradient: "from-violet-500 to-purple-500"
                  },
                  { 
                    step: "02", 
                    title: "Train", 
                    desc: "Our AI learns speech patterns, personality traits, and mannerisms",
                    icon: "🤖",
                    gradient: "from-pink-500 to-rose-500"
                  },
                  { 
                    step: "03", 
                    title: "Connect", 
                    desc: "Have natural conversations and keep memories alive forever",
                    icon: "💫",
                    gradient: "from-cyan-500 to-blue-500"
                  },
                ].map((step, index) => (
                  <div key={index} className="text-center group">
                    <div className={`
                      relative w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.gradient} 
                      flex items-center justify-center text-3xl shadow-xl
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      {step.icon}
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-black">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-white/70">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="relative z-20 py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stories That Touch
              <span className="block bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                The Heart
              </span>
            </h2>
            
            <div className="relative h-80 overflow-hidden rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`
                    absolute inset-0 flex items-center justify-center p-12 transition-all duration-1000
                    ${index === currentTestimonial 
                      ? 'opacity-100 transform translate-x-0' 
                      : index < currentTestimonial 
                        ? 'opacity-0 transform -translate-x-full' 
                        : 'opacity-0 transform translate-x-full'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="mb-8">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.author}
                        className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-violet-400 shadow-xl"
                      />
                      <blockquote className="text-2xl md:text-3xl text-white italic leading-relaxed mb-6">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="text-white/90 font-semibold text-lg">{testimonial.author}</div>
                      <div className="text-white/60">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`
                    w-4 h-4 rounded-full transition-all duration-300
                    ${index === currentTestimonial 
                      ? 'bg-gradient-to-r from-violet-400 to-pink-400 scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-20 py-24 px-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Create
              <span className="block bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Something Eternal?
              </span>
            </h2>
            
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Don't let precious memories fade away. Start preserving the voices and wisdom 
              of your loved ones today with our revolutionary AI technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group relative px-10 py-5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full text-white font-bold text-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25">
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <span className="relative z-10">Start Free Trial</span>
              </button>
              
              <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-bold text-xl hover:bg-white/20 transition-all duration-300">
                Learn More
              </button>
            </div>

            <div className="mt-12 text-white/50 text-sm">
              💫 No credit card required • 🔒 Your memories stay private • ✨ Cancel anytime
            </div>
          </div>
        </section>

        {/* Custom Styles */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
          }
          
          @keyframes slideAcross {
            0% { left: 0%; opacity: 1; }
            50% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default LandingPage;