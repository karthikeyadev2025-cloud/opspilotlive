import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  category: string;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'cctv' | 'solar'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  useEffect(() => {
    if (isAutoPlaying && filteredItems.length > 3) {
      const interval = setInterval(() => {
        handleNext();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentSlideIndex, isAutoPlaying, filter]);

  async function loadGallery() {
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .eq('active', true)
      .order('order_index');

    if (data) setItems(data);
  }

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.category === filter);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const itemsPerView = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, filteredItems.length - itemsPerView);

  const handleNext = () => {
    setCurrentSlideIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentSlideIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
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
      handleNext();
    }
    if (touchStart - touchEnd < -75) {
      handlePrev();
    }
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleFilterChange = (newFilter: 'all' | 'cctv' | 'solar') => {
    setFilter(newFilter);
    setCurrentSlideIndex(0);
  };

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-amber-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-orange-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.03),transparent_50%)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Our Work
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto mb-6"></div>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 px-4">
            Explore our portfolio of successful installations
          </p>

          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap px-4">
            {['all', 'cctv', 'solar'].map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange(category as any)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                  filter === category
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/50 scale-105'
                    : 'bg-slate-800 text-slate-400 hover:text-amber-500 border border-slate-700 hover:border-amber-500 hover:scale-105'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No gallery items yet. Check back soon!</p>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentSlideIndex * (100 / itemsPerView)}%)`
                }}
              >
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 px-2 sm:px-4"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <div
                      className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-video bg-slate-800 border border-slate-700 hover:border-amber-500 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer"
                      onClick={() => setSelectedImage(item)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-500 z-10"></div>

                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/20 backdrop-blur-sm border-2 border-amber-500 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-500">
                            <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-base sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                          <span className="inline-block px-2 sm:px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs sm:text-sm font-bold rounded-full shadow-lg">
                            {item.category.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredItems.length > itemsPerView && (
              <>
                <button
                  onClick={handlePrev}
                  className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg shadow-amber-500/50 z-30"
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
                </button>

                <button
                  onClick={handleNext}
                  className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg shadow-amber-500/50 z-30"
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
                </button>

                <div className="flex justify-center mt-6 sm:mt-8 gap-2">
                  {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlideIndex(index);
                        setIsAutoPlaying(false);
                        setTimeout(() => setIsAutoPlaying(true), 5000);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlideIndex
                          ? 'bg-amber-500 w-8'
                          : 'bg-slate-600 hover:bg-slate-500 w-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 sm:-right-12 w-10 h-10 bg-slate-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors z-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-full">
                {selectedImage.category.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
