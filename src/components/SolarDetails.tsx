import { Sun, Battery, TrendingDown, Shield, Zap, CheckCircle2, Home, Building2, Factory } from 'lucide-react';

export default function SolarDetails() {
  const benefits = [
    {
      icon: TrendingDown,
      title: 'Save Up to 90% on Bills',
      description: 'Drastically reduce your monthly electricity expenses with solar power'
    },
    {
      icon: Battery,
      title: 'Energy Independence',
      description: 'Generate your own clean energy and reduce grid dependency'
    },
    {
      icon: Shield,
      title: '25-Year Warranty',
      description: 'Premium panels with industry-leading performance guarantee'
    },
    {
      icon: Zap,
      title: 'Quick ROI',
      description: 'Recover your investment in 3-5 years through savings'
    }
  ];

  const solarTypes = [
    {
      icon: Home,
      title: 'Residential Solar',
      size: '1-10 kW',
      features: ['Rooftop Installation', 'Net Metering', 'Battery Backup Option', 'Smart Monitoring']
    },
    {
      icon: Building2,
      title: 'Commercial Solar',
      size: '10-100 kW',
      features: ['Large-Scale Systems', 'Tax Benefits', 'Corporate Sustainability', 'Priority Support']
    },
    {
      icon: Factory,
      title: 'Industrial Solar',
      size: '100+ kW',
      features: ['Mega Projects', 'Custom Solutions', 'Maximum Savings', 'Dedicated Team']
    }
  ];

  const bestPractices = [
    'Professional site survey and shadow analysis',
    'High-efficiency monocrystalline solar panels',
    'Premium inverters with 10-year warranty',
    'Weather-resistant mounting structures',
    'Safety compliance and earthing systems',
    'Mobile app for real-time monitoring',
    'Annual maintenance and cleaning',
    'Government subsidy assistance'
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-amber-500/20">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Rooftop Solar Solutions
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Harness the power of the sun with our premium solar installations. Clean energy, maximum savings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-slate-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {solarTypes.map((type, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-amber-500/50 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <type.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{type.title}</h3>
              <p className="text-amber-500 font-bold text-lg mb-6">{type.size}</p>
              <ul className="space-y-3">
                {type.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-black text-white mb-4">Our Solar Installation Best Practices</h3>
            <p className="text-slate-400 text-lg">
              Industry-leading standards for maximum efficiency and longevity
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {bestPractices.map((practice, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-slate-800 hover:border-amber-500/50 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-slate-300 pt-1">{practice}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Go Solar?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Get a free site survey and customized quote. Start saving from day one!
          </p>
          <a
            href="#contact"
            className="inline-flex items-center space-x-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <span>Get Free Quote</span>
            <Sun className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
