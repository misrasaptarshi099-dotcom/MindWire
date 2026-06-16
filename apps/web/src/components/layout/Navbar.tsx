import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const { user, setUser } = useAuth();
  const isLoggedIn = user?.role === 'user';
  const adminToken = sessionStorage.getItem('admin_token');

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    setUser(null);
    sessionStorage.removeItem('admin_token');
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Workshops', path: '/workshops' },
    ...(isLoggedIn ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(adminToken ? [{ name: 'Admin Command', path: '/admin/dashboard', icon: Shield }] : []),
  ];

  return (
    <header className="fixed top-4 left-0 w-full z-50 px-4 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-5xl rounded-full border border-white/10 bg-[#0a0a0c]/60 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(0,240,255,0.03)] px-6 h-16 flex items-center justify-between transition-all duration-300">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group relative z-20">
          <span className="text-xl font-bold tracking-tight text-glow transition-all group-hover:text-primary">
            Mind<span className="text-primary font-extrabold">Wire</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-2 relative z-10">
          {navLinks.map((link) => {
            const isLinkActive = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={() => setHoveredPath(link.path)}
                onMouseLeave={() => setHoveredPath(null)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full flex items-center gap-1.5 ${
                  isLinkActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {/* Active Indicator Background */}
                {isLinkActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.1)] z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Hover Indicator Background (only when not active) */}
                {!isLinkActive && hoveredPath === link.path && (
                  <motion.div
                    layoutId="hover-indicator"
                    className="absolute inset-0 bg-white/5 rounded-full border border-white/5 z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4 relative z-10">
          {isLoggedIn || adminToken ? (
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 border border-white/10 hover:border-primary/30 bg-white/5 hover:bg-primary/10 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 text-muted-foreground hover:text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground focus:outline-none relative z-20"
          aria-label="Toggle mobile menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer (Liquid Glass Dropdown) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden absolute top-22 left-4 right-4 bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl z-40 pointer-events-auto"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-lg font-medium transition-colors flex items-center gap-2 ${
                  isActive(link.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                {link.name}
              </Link>
            ))}

            <hr className="border-white/5" />

            {isLoggedIn || adminToken ? (
              <button
                onClick={handleLogout}
                className="w-full py-3 border border-white/10 text-center rounded-xl font-semibold hover:bg-primary/10 hover:text-primary transition-all duration-300 flex items-center justify-center gap-2 text-muted-foreground cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            ) : (
              <div className="space-y-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 text-center rounded-xl border border-white/10 font-medium text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 bg-primary text-primary-foreground text-center font-semibold rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
