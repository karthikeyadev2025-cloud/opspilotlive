import { useEffect, useState, useRef } from 'react';
import { Camera, Sun, Shield, Settings, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
}

const iconMap: { [key: string]: any } = {
  Camera,
  Sun,
  Shield,
  Settings,
  Wrench,
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    loadServices();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('.service-card');
    elements.forEach((el) => observerRef.current?.observe(el));
  }, [services]);

  async function loadServices() {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('order_index');

    if (data) setServices(data);
  }

  return (
    <section id="services" className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Our Services
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto mb-6"></div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Comprehensive solutions for your security and energy needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Camera;
            const isVisible = visibleItems.has(index);

            return (
              <div
                key={service.id}
                data-index={index}
                className={`service-card group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-amber-500 transition-all duration-700 hover-lift overflow-hidden ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 rounded-2xl transition-all duration-500"></div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-shimmer"></div>
                </div>

                <div className="relative z-10">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-glow"></div>
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-full border-2 border-amber-500 animate-ping"></div>
                    </div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center transform group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-700">
                      <Icon className="w-10 h-10 text-slate-950 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-500 transition-all duration-300 group-hover:translate-x-2">
                    {service.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                    {service.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-700 group-hover:border-amber-500/50 transition-all duration-300">
                    <span className="inline-flex items-center text-amber-500 font-medium group-hover:gap-2 gap-0 transition-all duration-300">
                      Learn more
                      <span className="inline-block transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
