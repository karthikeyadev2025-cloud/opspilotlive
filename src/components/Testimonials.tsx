import { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Testimonial {
  id: string;
  client_name: string;
  client_company: string;
  testimonial: string;
  rating: number;
  image_url: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    loadTestimonials();
  }, []);

  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 1) {
      const interval = setInterval(() => {
        next();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, isAutoPlaying, testimonials.length]);

  async function loadTestimonials() {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('active', true)
      .order('order_index');

    if (data && data.length > 0) {
      setTestimonials(data);
    }
  }

  const next = () => {
    setSlideDirection('right');
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setSlideDirection('left');
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      next();
    }
    if (touchStart - touchEnd < -75) {
      prev();
    }
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            What Our Clients Say
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto mb-12"></div>
          <p className="text-slate-500 text-lg">No testimonials yet.</p>
        </div>
      </section>
    );
  }

  const current = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-500 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-amber-500 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            What Our Clients Say
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto"></div>
        </div>

        <div className="relative">
          <div
            className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-slate-700 shadow-2xl overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>

            <div className="absolute -top-10 sm:-top-20 -right-10 sm:-right-20 w-20 h-20 sm:w-40 sm:h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 sm:-bottom-20 -left-10 sm:-left-20 w-20 h-20 sm:w-40 sm:h-40 bg-orange-500/10 rounded-full blur-3xl"></div>

            <Quote className="absolute top-4 sm:top-8 left-4 sm:left-8 w-8 h-8 sm:w-12 sm:h-12 text-amber-500/20" />
            <Quote className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-8 h-8 sm:w-12 sm:h-12 text-amber-500/20 rotate-180" />

            <div
              key={currentIndex}
              className={`relative z-10 animate-[fadeIn_0.5s_ease-out]`}
            >
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                      i < current.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-600'
                    }`}
                    style={{
                      animation: i < current.rating ? `scaleIn 0.3s ease-out ${i * 0.1}s both` : 'none'
                    }}
                  />
                ))}
              </div>

              <p className="text-lg sm:text-xl md:text-2xl text-slate-300 text-center mb-6 sm:mb-8 leading-relaxed italic px-4">
                "{current.testimonial}"
              </p>

              <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                {current.image_url && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur-md opacity-50 animate-pulse-glow"></div>
                    <img
                      src={current.image_url}
                      alt={current.client_name}
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-amber-500"
                    />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-lg sm:text-xl font-bold text-white">{current.client_name}</p>
                  {current.client_company && (
                    <p className="text-sm sm:text-base text-amber-500">{current.client_company}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {testimonials.length > 1 && (
            <>
              <button
                onClick={() => {
                  prev();
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg shadow-amber-500/50"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
              </button>

              <button
                onClick={() => {
                  next();
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg shadow-amber-500/50"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
              </button>

              <div className="flex justify-center mt-6 sm:mt-8 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 5000);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-amber-500 w-8'
                        : 'bg-slate-600 hover:bg-slate-500 w-2'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
