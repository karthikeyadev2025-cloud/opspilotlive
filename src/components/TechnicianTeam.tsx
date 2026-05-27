import { useEffect, useState } from 'react';
import { Users, Award, Wrench, GraduationCap, Clock, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Technician {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialization: string;
  image_url: string;
  order_index: number;
}

const FALLBACK_TECHNICIANS: Technician[] = [
  { id: '1', name: 'Rahul Kumar', role: 'Senior Solar Technician', experience: '12 Years', specialization: 'Rooftop Solar Installation', image_url: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=300', order_index: 0 },
  { id: '2', name: 'Amit Singh', role: 'Lead CCTV Specialist', experience: '10 Years', specialization: 'Network & IP Cameras', image_url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300', order_index: 1 },
  { id: '3', name: 'Pradeep Sharma', role: 'Installation Expert', experience: '8 Years', specialization: 'Commercial Projects', image_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300', order_index: 2 },
  { id: '4', name: 'Vijay Patel', role: 'Service Manager', experience: '15 Years', specialization: 'Maintenance & Support', image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300', order_index: 3 },
];

export default function TechnicianTeam() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('technicians').select('*').order('order_index').then(({ data }) => {
      setTechnicians(data && data.length > 0 ? data : FALLBACK_TECHNICIANS);
      setLoading(false);
    });
  }, []);

  const teamStats = [
    { icon: Users, number: '50+', label: 'Expert Technicians' },
    { icon: Award, number: '15+', label: 'Years Experience' },
    { icon: ThumbsUp, number: '5000+', label: 'Happy Clients' },
    { icon: Clock, number: '24/7', label: 'Support Available' },
  ];

  const expertise = [
    {
      icon: GraduationCap,
      title: 'Certified Professionals',
      description: 'All technicians are certified and trained by leading manufacturers including Hikvision, Dahua, and solar panel companies.',
    },
    {
      icon: Wrench,
      title: 'Skilled Installation',
      description: 'Expert in both CCTV camera installation and solar panel mounting with perfect cable management and weatherproofing.',
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'Every installation undergoes rigorous quality checks and testing before handover to ensure perfect functionality.',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-amber-500/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Our Expert Technicians</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Meet the skilled professionals who make every installation perfect
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {teamStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 text-center hover:border-amber-500/50 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 sm:mb-2">{stat.number}</div>
              <div className="text-slate-400 text-xs sm:text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {expertise.map((item, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4 text-center">Meet Our Team Leaders</h3>
          <p className="text-slate-400 text-center mb-12 text-lg">Experienced professionals dedicated to excellence</p>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {technicians.map((tech) => (
                <div key={tech.id} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 group hover:scale-105">
                  <div className="aspect-square overflow-hidden bg-slate-800">
                    <img
                      src={tech.image_url}
                      alt={tech.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=300';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-white mb-1">{tech.name}</h4>
                    <p className="text-amber-500 font-semibold mb-3">{tech.role}</p>
                    <div className="space-y-1.5 text-sm text-slate-400">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        {tech.experience}
                      </p>
                      <p className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        {tech.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-20 bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-black text-white mb-4">Why Our Technicians Are The Best</h3>
              <ul className="space-y-4">
                {[
                  { title: 'Regular Training', desc: 'Continuous updates on latest technologies and best practices' },
                  { title: 'Safety First', desc: 'All safety protocols followed during installation' },
                  { title: 'Quick Response', desc: 'Same-day service for urgent repairs and maintenance' },
                  { title: 'Professional Conduct', desc: 'Uniformed, courteous, and respectful service' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-slate-300">
                      <span className="font-bold text-white">{item.title}:</span> {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
              <div className="text-6xl font-black text-transparent bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text mb-4">100%</div>
              <div className="text-2xl font-bold text-white mb-2">Customer Satisfaction</div>
              <p className="text-slate-400">Every installation comes with our quality guarantee and dedicated after-sales support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
