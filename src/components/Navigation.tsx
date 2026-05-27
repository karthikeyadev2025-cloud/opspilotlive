import { useState, useEffect } from 'react';
import { Menu, X, Sun, Camera, LogIn } from 'lucide-react';

interface NavigationProps {
  content: any;
}

export default function Navigation({ content }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#services', label: 'Services' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#careers', label: 'Careers' },
    { href: '#invest', label: 'Invest' },
    { href: '#contact', label: 'Contact' },
  ];

  function goToLogin() {
    window.location.href = '/login';
    setIsOpen(false);
  }

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-slate-950/95 backdrop-blur-md shadow-lg shadow-amber-500/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full">
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 absolute animate-spin" style={{ animationDuration: '20s' }} />
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate">
                {content?.hero?.title || 'Aadya Enterprises'}
              </h1>
              <p className="text-xs text-amber-500 font-medium whitespace-nowrap">
                {content?.hero?.subtitle || 'CCTV & Solar'}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 ml-10">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="relative text-slate-300 hover:text-amber-500 transition-colors duration-300 font-medium group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
            <button
              onClick={goToLogin}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              <LogIn className="w-4 h-4" />
              Staff Login
            </button>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={goToLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-semibold rounded-lg transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-amber-500 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-900/95 backdrop-blur-md">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:text-amber-500 hover:bg-slate-800/50 rounded-md transition-all"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={goToLogin}
            className="w-full flex items-center gap-2 px-3 py-2.5 mt-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <LogIn className="w-4 h-4" />
            Staff Login
          </button>
        </div>
      </div>
    </nav>
  );
}
