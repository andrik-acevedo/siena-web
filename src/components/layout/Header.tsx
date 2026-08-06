import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Safe fallbacks if profile hasn’t loaded yet


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

          {/* Auth entry point removed: the web app is no longer routed and
              accounts live in the Siena mobile app. */}
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

            {/* Auth entry point removed: see the desktop nav above. */}
          </div>
        </div>
      )}
    </header>
  );
}
