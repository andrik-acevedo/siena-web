import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { userData } = useUser(); // includes display_name, avatar_url, avatar_emoji

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Safe fallbacks if profile hasn’t loaded yet
  const handle = userData?.display_name || 'Member';
  const emoji = userData?.avatar_emoji || '🌿';
  const avatarUrl = (userData as any)?.avatar_url || null;

  const isAuthed = Boolean(userData?.id);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[#021E3C] py-4 transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <span className="text-white text-lg font-bold">Heal • Evolve • Connect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/features" className="text-white hover:text-[#01B1AF] transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-white hover:text-[#01B1AF] transition-colors">
            Pricing
          </Link>

          {!isAuthed ? (
            <Link to="/login">
              <Button className="ml-2">Log In</Button>
            </Link>
          ) : (
            <Link
              to="/settings"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition"
              title="Account settings"
            >
              <span className="h-6 w-6 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={handle} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl leading-none">{emoji}</span>
                )}
              </span>
              <span className="text-sm font-medium">{handle}</span>
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none p-2"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#021E3C] px-4 pb-6">
          <div className="flex flex-col items-start space-y-4 mt-4">
            <Link
              to="/features"
              className="text-white text-lg hover:text-[#01B1AF]"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-white text-lg hover:text-[#01B1AF]"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>

            {!isAuthed ? (
              <Link
                to="/login"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full text-white">Log In</Button>
              </Link>
            ) : (
              <Link
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="w-full"
              >
                <div className="w-full flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-white">
                  <span className="h-8 w-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={handle} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl leading-none">{emoji}</span>
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">{handle}</span>
                    <span className="text-xs text-white/70">Account settings</span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
