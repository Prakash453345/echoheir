// src/components/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative z-20 py-12 text-center text-white/60 bg-black/20 backdrop-blur-sm border-t border-white/10" style={{backgroundColor:'#36454f'}}>
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
        <div>
          <h5 className="font-semibold text-white mb-4 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            EchoHeir
          </h5>
          <p className="text-sm">Where memories whisper forever.</p>
        </div>
        <div>
          <h5 className="font-semibold text-white mb-4">Explore</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-violet-400 transition">Home</Link></li>
            <li><Link to="/dashboard" className="hover:text-violet-400 transition">Dashboard</Link></li>
            <li><Link to="/wizard" className="hover:text-violet-400 transition">Create Legacy</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-white mb-4">Support</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="#" className="hover:text-violet-400 transition">Help Center</Link></li>
            <li><Link to="#" className="hover:text-violet-400 transition">Contact</Link></li>
            <li><Link to="#" className="hover:text-violet-400 transition">Community</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-white mb-4">Connect</h5>
          <div className="flex space-x-4 justify-start">
            {['twitter', 'instagram', 'facebook'].map(s => (
              <a key={s} href="#" className="text-white/60 hover:text-violet-400 transition transform hover:scale-110">
                <span className="sr-only">{s}</span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition border border-white/20">
                  {s[0].toUpperCase()}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-white/10">
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} EchoHeir. Crafted with stardust and reverence.
        </p>
      </div>
    </footer>
  );
};

export default Footer;