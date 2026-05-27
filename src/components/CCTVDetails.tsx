import { Camera, ShoppingCart, Wrench, Eye, Wifi, HardDrive, Clock, Shield } from 'lucide-react';

export default function CCTVDetails() {
  const services = [
    {
      icon: ShoppingCart,
      title: 'CCTV Sales',
      description: 'Premium Quality Products',
      features: [
        'HD & 4K Cameras',
        'Night Vision Technology',
        'Weatherproof Outdoor Cameras',
        'PTZ & Dome Cameras',
        'Bullet & Turret Models',
        'Branded Products Only'
      ]
    },
    {
      icon: Wrench,
      title: 'Installation & Service',
      description: 'Expert Technical Support',
      features: [
        'Professional Installation',
        'Cable Management',
        'Network Configuration',
        'Remote Access Setup',
        'Annual Maintenance',
        '24/7 Emergency Support'
      ]
    }
  ];

  const cctvFeatures = [
    {
      icon: Eye,
      title: 'Crystal Clear Video',
      description: 'Up to 4K resolution with advanced image processing'
    },
    {
      icon: Wifi,
      title: 'Remote Monitoring',
      description: 'View live footage from anywhere via mobile app'
    },
    {
      icon: HardDrive,
      title: 'Large Storage',
      description: 'DVR/NVR systems with TB storage capacity'
    },
    {
      icon: Clock,
      title: '24/7 Recording',
      description: 'Continuous recording with motion detection'
    }
  ];

  const brands = [
    'Hikvision', 'Dahua', 'CP Plus', 'Honeywell', 'Bosch', 'Samsung'
  ];

  const packages = [
    {
      title: 'Basic Package',
      cameras: '4 Cameras',
      price: 'Starting ₹25,000',
      features: [
        '2MP HD Cameras',
        '1TB DVR',
        'Installation Included',
        '1 Year Warranty',
        'Basic Configuration'
      ]
    },
    {
      title: 'Professional Package',
      cameras: '8 Cameras',
      price: 'Starting ₹50,000',
      features: [
        '4MP Full HD Cameras',
        '2TB DVR/NVR',
        'Professional Installation',
        '2 Year Warranty',
        'Remote Access Setup',
        'Mobile App Configuration'
      ],
      popular: true
    },
    {
      title: 'Enterprise Package',
      cameras: '16+ Cameras',
      price: 'Custom Quote',
      features: [
        '4K Ultra HD Cameras',
        '4TB+ NVR Storage',
        'Complete Installation',
        '3 Year Warranty',
        'Cloud Backup Option',
        'Dedicated Support',
        'AI Analytics'
      ]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-6 shadow-lg shadow-blue-500/20">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            CCTV Sales & Service
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Complete security solutions with premium cameras and professional installation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-blue-400 mb-6">{service.description}</p>
              <ul className="space-y-3">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-slate-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full mr-3"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {cctvFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group text-center"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700 rounded-3xl p-8 md:p-12 mb-20">
          <h3 className="text-3xl font-black text-white mb-8 text-center">Authorized Dealer of Top Brands</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-center hover:border-blue-500/50 transition-all duration-300 group"
              >
                <span className="text-white font-bold group-hover:text-blue-400 transition-colors duration-300">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4 text-center">
            CCTV Packages
          </h3>
          <p className="text-slate-400 text-center mb-12 text-lg">
            Choose the perfect security solution for your needs
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`relative bg-gradient-to-br from-slate-900 to-slate-800 border rounded-3xl p-8 hover:scale-105 transition-all duration-300 ${
                  pkg.popular ? 'border-amber-500 shadow-2xl shadow-amber-500/20' : 'border-slate-700'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-white mb-2">{pkg.title}</h4>
                  <p className="text-blue-400 font-bold text-lg mb-1">{pkg.cameras}</p>
                  <p className="text-amber-500 font-black text-2xl">{pkg.price}</p>
                </div>
                <ul className="space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-300">
                      <Shield className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-8 w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-xl'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  <span>Get Quote</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
