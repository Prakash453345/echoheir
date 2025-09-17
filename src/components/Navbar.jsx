// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname.includes('/auth');

  // Hide navbar on auth pages
  if (isAuthPage) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/10" style={{backgroundColor:'#36454f'}}>
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2">
          <span
            className="text-2xl md:text-3xl font-serif tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent"
            style={{ textShadow: '0 0 10px rgba(147, 51, 234, 0.3)' }}
          >
            EchoHeir
          </span>
        </Link>
      </div>

      <div className="hidden md:flex space-x-8">
        <NavLink to="/">Home</NavLink>
        {user && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/memory-browser">Memories</NavLink>
            <NavLink to="/chat">Chat</NavLink>
            <NavLink to="/voice-lab">Voice Lab</NavLink>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border-2 border-violet-400/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-white/80 text-sm font-medium hidden sm:block">
                {user.name || user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2 text-white rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-xl hover:shadow-red-500/25 hover:scale-105 transition-all duration-300 text-sm font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="px-5 py-2 text-white rounded-full bg-gradient-to-r from-violet-500 to-pink-500 hover:shadow-xl hover:shadow-violet-500/25 hover:scale-105 transition-all duration-300 text-sm font-medium"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="text-white/80 hover:text-violet-400 transition-colors duration-300 relative group font-medium"
    >
      {children}
      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-violet-400 to-pink-400 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

export default Navbar;