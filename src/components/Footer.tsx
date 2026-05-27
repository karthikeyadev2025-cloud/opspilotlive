import { Sun, Camera, Instagram, Youtube, Facebook } from 'lucide-react';

interface FooterProps {
  content: any;
}

export default function Footer({ content }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full">
                <Sun className="w-5 h-5 text-slate-950 absolute animate-spin" style={{ animationDuration: '20s' }} />
                <Camera className="w-4 h-4 text-white relative z-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {content?.hero?.title || 'Aadya Enterprises'}
                </h3>
                <p className="text-xs text-amber-500">
                  {content?.hero?.subtitle || 'CCTV & Solar'}
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              {content?.hero?.tagline || 'Smart Energy. Smarter Security.'}
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Services', 'Gallery', 'Careers', 'Invest', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-slate-400 hover:text-amber-500 transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Connect With Us</h4>
            <p className="text-slate-400 text-sm mb-2">
              {content?.contact?.phone || '+91 1234567890'}
            </p>
            <p className="text-slate-400 text-sm mb-2">
              {content?.contact?.email || 'info@aadyaenterprises.com'}
            </p>
            <p className="text-slate-400 text-sm mb-4">
              {content?.contact?.address || 'Your Address Here'}
            </p>

            <div className="flex items-center space-x-3">
              {content?.contact?.facebook && (
                <a
                  href={content.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-amber-500 flex items-center justify-center transition-all duration-300 group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-slate-400 group-hover:text-slate-950 transition-colors" />
                </a>
              )}
              {content?.contact?.instagram && (
                <a
                  href={content.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 flex items-center justify-center transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              )}
              {content?.contact?.youtube && (
                <a
                  href={content.contact.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-all duration-300 group"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} {content?.hero?.title || 'Aadya Enterprises'}. All rights reserved.
            </p>
            <p className="text-slate-600 text-xs">
              Powered by{' '}
              <span className="text-slate-500 font-semibold tracking-wide">
                K<sup className="text-amber-500">2</sup> Technologies
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
