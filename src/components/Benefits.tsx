import { useEffect, useState, useRef } from 'react';
import { Shield, Zap, Award, Headphones as HeadphonesIcon, Wrench, BadgeCheck, TrendingUp, Users } from 'lucide-react';

export default function Benefits() {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const cards = document.querySelectorAll('.benefit-card');
    cards.forEach((card) => observerRef.current?.observe(card));

    return () => observerRef.current?.disconnect();
  }, []);
  const benefits = [
    {
      icon: Shield,
      title: 'Trusted Quality',
      description: 'Only genuine products from authorized dealers. No compromise on quality.',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      icon: Award,
      title: 'Industry Certified',
      description: '15+ years experience with ISO certified processes and trained professionals.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: Zap,
      title: 'Quick Installation',
      description: 'Fast and efficient installation within 24-48 hours for most projects.',
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Round-the-clock customer support and emergency service available.',
      gradient: 'from-green-500 to-green-700'
    },
    {
      icon: Wrench,
      title: 'Free Maintenance',
      description: 'Complimentary annual maintenance and cleaning for first year.',
      gradient: 'from-red-500 to-red-700'
    },
    {
      icon: BadgeCheck,
      title: 'Extended Warranty',
      description: 'Industry-leading warranty up to 25 years on solar panels.',
      gradient: 'from-indigo-500 to-indigo-700'
    },
    {
      icon: TrendingUp,
      title: 'Best ROI',
      description: 'Maximum returns on investment with energy savings and tax benefits.',
      gradient: 'from-teal-500 to-teal-700'
    },
    {
      icon: Users,
      title: '5000+ Happy Clients',
      description: 'Join thousands of satisfied customers across residential and commercial sectors.',
      gradient: 'from-orange-500 to-orange-700'
    }
  ];

  const whyChooseUs = [
    {
      title: 'Competitive Pricing',
      description: 'Best prices in the market without compromising on quality. We match or beat any genuine quote.'
    },
    {
      title: 'Customized Solutions',
      description: 'Every project is unique. We design systems tailored to your specific needs and budget.'
    },
    {
      title: 'Transparent Process',
      description: 'No hidden charges. Clear quotations with detailed breakdown of all costs upfront.'
    },
    {
      title: 'Government Subsidies',
      description: 'Complete assistance in availing government subsidies and net metering approvals.'
    },
    {
      title: 'EMI Options',
      description: 'Flexible payment plans and EMI options available to make it affordable for everyone.'
    },
    {
      title: 'Proven Track Record',
      description: 'Successfully completed 5000+ installations across homes, offices, factories, and warehouses.'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-float"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Why Choose Aadya Enterprises?
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Your trusted partner for smart energy and security solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => {
            const isVisible = visibleCards.has(index);
            return (
              <div
                key={index}
                data-index={index}
                className={`benefit-card group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-700 hover-lift perspective-card ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg animate-pulse-glow`}>
                    <benefit.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{benefit.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 md:p-12">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4 text-center">
            Our Competitive Advantages
          </h3>
          <p className="text-slate-400 text-center mb-12 text-lg">
            What sets us apart from the competition
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border border-blue-500/20 rounded-2xl p-8 text-center">
            <div className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text mb-3">
              15+
            </div>
            <div className="text-xl font-bold text-white mb-2">Years Experience</div>
            <p className="text-slate-400">
              Delivering excellence since 2009
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-8 text-center">
            <div className="text-5xl font-black text-transparent bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text mb-3">
              5000+
            </div>
            <div className="text-xl font-bold text-white mb-2">Projects Completed</div>
            <p className="text-slate-400">
              Across residential and commercial
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-700/10 border border-green-500/20 rounded-2xl p-8 text-center">
            <div className="text-5xl font-black text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text mb-3">
              100%
            </div>
            <div className="text-xl font-bold text-white mb-2">Satisfaction Rate</div>
            <p className="text-slate-400">
              Customer happiness is our priority
            </p>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer"></div>
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4 relative z-10 animate-[fadeInUp_1s_ease-out]">
            Ready to Get Started?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto relative z-10 animate-[fadeInUp_1s_ease-out_0.2s_backwards]">
            Join thousands of satisfied customers. Get a free consultation and quote today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 animate-[fadeInUp_1s_ease-out_0.4s_backwards]">
            <a
              href="#contact"
              className="group inline-flex items-center justify-center space-x-2 bg-white text-slate-900 px-10 py-5 rounded-xl font-bold hover:bg-slate-100 transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-110 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">Get Free Quote</span>
            </a>
            <a
              href="tel:+919876543210"
              className="group inline-flex items-center justify-center space-x-2 bg-slate-900 text-white px-10 py-5 rounded-xl font-bold hover:bg-slate-800 transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-110"
            >
              <HeadphonesIcon className="w-5 h-5 group-hover:animate-wiggle" />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
