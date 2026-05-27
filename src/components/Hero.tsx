import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Shield, Zap, Camera, Sun, Play } from 'lucide-react';

interface HeroProps {
  content: any;
}

export default function Hero({ content }: HeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (videoRef.current && !videoError) {
      videoRef.current.play().catch(() => {
        setVideoError(true);
      });
    }
  }, [videoError]);

  const videoUrl = content?.hero?.video_url || 'https://cdn.pixabay.com/video/2023/05/12/161729-826094078_large.mp4';
  const posterUrl = content?.hero?.video_poster || 'https://images.pexels.com/photos/8092172/pexels-photo-8092172.jpeg?auto=compress&cs=tinysrgb&w=1920';
  const showVideo = content?.hero?.show_video !== 'false' && !videoError;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {showVideo && (
        <>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={posterUrl}
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/30 to-orange-950/30"></div>
        </>
      )}

      {!showVideo && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-amber-500/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] animate-float animate-morph" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-orange-500/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] animate-float animate-morph" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-amber-600/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] animate-float animate-morph" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-orange-500/5 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] animate-float animate-morph" style={{ animationDelay: '3s' }}></div>
      </div>

      <div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ transform: `translateY(${scrollY * 0.3}px)`, opacity: 1 - scrollY / 500 }}
      >
        <div className="mb-6 sm:mb-8 flex items-center justify-center space-x-4 opacity-0 animate-[fadeInUp_1s_ease-out_0.2s_forwards]">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur-xl sm:blur-2xl opacity-50 group-hover:opacity-100 transition-all duration-500 animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full opacity-20 animate-ping"></div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-full flex items-center justify-center transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-morph">
              <Sun className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-950 absolute animate-spin-slow" />
              <Camera className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-3 sm:mb-4 px-4 opacity-0 animate-[fadeInUp_1s_ease-out_0.4s_forwards]">
          <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            {content?.hero?.title || 'Aadya Enterprises'}
          </span>
        </h1>

        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4 opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            {content?.hero?.subtitle || 'CCTV & Solar'}
          </span>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6 px-4 opacity-0 animate-[fadeInUp_1s_ease-out_0.8s_forwards]">
          <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-pulse flex-shrink-0" />
          <p className="text-base sm:text-xl md:text-2xl text-amber-500 font-medium tracking-wider text-center">
            {content?.hero?.tagline || 'Smart Energy. Smarter Security.'}
          </p>
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-pulse flex-shrink-0" />
          <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
        </div>

        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 sm:px-6 opacity-0 animate-[fadeInUp_1s_ease-out_1s_forwards]">
          {content?.hero?.description || 'Leading provider of cutting-edge CCTV surveillance systems and sustainable solar energy solutions'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 sm:mb-16 px-4 opacity-0 animate-[fadeInUp_1s_ease-out_1.2s_forwards]">
          <a
            href="#services"
            className="w-full sm:w-auto group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-full overflow-hidden transition-all duration-500 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl hover:shadow-amber-500/60 animate-pulse-glow text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>Explore Services</span>
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
            </span>
          </a>

          <a
            href="#contact"
            className="w-full sm:w-auto group relative px-8 sm:px-10 py-4 sm:py-5 border-2 border-amber-500 text-amber-500 font-bold rounded-full hover:bg-amber-500 hover:text-slate-950 transition-all duration-500 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl hover:shadow-amber-500/40 overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>Get Quote</span>
              <Play className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </a>
        </div>

        <div className="flex items-center justify-center space-x-6 sm:space-x-12 text-slate-400 px-4 opacity-0 animate-[fadeInUp_1s_ease-out_1.4s_forwards]">
          <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-300 group-hover:to-orange-400 transition-all duration-300 animate-[scaleIn_0.5s_ease-out]">
                500+
              </div>
            </div>
            <div className="text-xs sm:text-sm mt-1 sm:mt-2 font-semibold group-hover:text-amber-500 group-hover:translate-y-1 transition-all duration-300">Projects</div>
          </div>
          <div className="h-10 sm:h-12 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
          <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-300 group-hover:to-orange-400 transition-all duration-300 animate-[scaleIn_0.5s_ease-out]">
                10+
              </div>
            </div>
            <div className="text-xs sm:text-sm mt-1 sm:mt-2 font-semibold group-hover:text-amber-500 group-hover:translate-y-1 transition-all duration-300">Years</div>
          </div>
          <div className="h-10 sm:h-12 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
          <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-300 group-hover:to-orange-400 transition-all duration-300 animate-[scaleIn_0.5s_ease-out]">
                100%
              </div>
            </div>
            <div className="text-xs sm:text-sm mt-1 sm:mt-2 font-semibold group-hover:text-amber-500 group-hover:translate-y-1 transition-all duration-300">Satisfaction</div>
          </div>
        </div>
      </div>

      <a
        href="#services"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-amber-500 animate-bounce opacity-0 animate-[fadeInUp_1s_ease-out_1.6s_forwards]"
      >
        <ChevronDown className="w-8 h-8" />
      </a>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  );
}
