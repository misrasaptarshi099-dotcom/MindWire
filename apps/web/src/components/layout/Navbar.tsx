import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Sync token state dynamically during render
  const userToken = localStorage.getItem('user_token');
  const adminToken = sessionStorage.getItem('admin_token');

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    sessionStorage.removeItem('admin_token');
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tight text-glow transition-all group-hover:text-primary">
            Mind<span className="text-primary font-extrabold">Wire</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link
            to="/workshops"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/workshops') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Workshops
          </Link>

          {userToken && (
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 ${
                isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}

          {adminToken && (
            <Link
              to="/admin/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 ${
                isActive('/admin/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Shield className="w-4 h-4 text-glow" />
              Admin Command
            </Link>
          )}

          {/* User Actions */}
          {userToken || adminToken ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-border hover:bg-muted text-sm font-medium rounded-lg transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border px-6 py-6 space-y-4 shadow-xl z-40"
        >
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block text-lg font-medium ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Home
          </Link>
          <Link
            to="/workshops"
            onClick={() => setIsOpen(false)}
            className={`block text-lg font-medium ${isActive('/workshops') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Workshops
          </Link>

          {userToken && (
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={`block text-lg font-medium flex items-center gap-2 ${
                isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
          )}

          {adminToken && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className={`block text-lg font-medium flex items-center gap-2 ${
                isActive('/admin/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Shield className="w-5 h-5 text-glow" />
              Admin Command
            </Link>
          )}

          <hr className="border-border" />

          {userToken || adminToken ? (
            <button
              onClick={handleLogout}
              className="w-full py-3 border border-border text-center rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full py-3 text-center rounded-lg border border-border font-medium text-muted-foreground"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="block w-full py-3 bg-primary text-primary-foreground text-center font-semibold rounded-lg shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}
