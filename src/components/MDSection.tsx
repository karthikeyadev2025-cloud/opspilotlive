import { useEffect, useState } from 'react';
import { Quote, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MDData {
  name: string;
  photo_url: string;
  title: string;
  message: string;
  address: string;
}

export default function MDSection() {
  const [mdData, setMdData] = useState<MDData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMDData();
  }, []);

  useEffect(() => {
    if (!mdData) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.querySelector('.md-section');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, [mdData]);

  async function loadMDData() {
    try {
      const { data, error } = await supabase
        .from('managing_director')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading MD data:', error);
      }

      if (data) {
        setMdData(data);
      }
    } catch (err) {
      console.error('Failed to load MD data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Message from Our Leader
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto"></div>
          </div>
          <div className="text-center text-slate-400">Loading...</div>
        </div>
      </section>
    );
  }

  if (!mdData) return null;

  return (
    <section className="md-section py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-float animate-morph"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-float animate-morph" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Message from Our Leader
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center opacity-100 transition-opacity duration-1000">
          <div className="relative translate-x-0 transition-all duration-1000 delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-3xl blur-2xl"></div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <img
                src={mdData.photo_url}
                alt={mdData.name}
                className="relative w-full h-[500px] object-cover rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-8 rounded-b-3xl">
                <h3 className="text-3xl font-black text-white mb-2">{mdData.name}</h3>
                <p className="text-amber-500 text-xl font-semibold mb-3">{mdData.title}</p>
                <div className="flex items-center text-slate-300 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-amber-500" />
                  {mdData.address}
                </div>
              </div>
            </div>
          </div>

          <div className="translate-x-0 transition-all duration-1000 delay-400">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 hover:border-amber-500/50 transition-all duration-500">
              <Quote className="w-16 h-16 text-amber-500/20 absolute top-4 right-4" />

              <div className="relative z-10">
                <div className="mb-6">
                  <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mb-4"></div>
                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-6">
                    {mdData.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-700">
                  <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-3xl font-black text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text mb-2">
                      15+
                    </div>
                    <div className="text-sm text-slate-400">Years Leading</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-3xl font-black text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text mb-2">
                      5000+
                    </div>
                    <div className="text-sm text-slate-400">Projects Delivered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
