import { Mail, Phone, MapPin, Send } from 'lucide-react';

interface ContactProps {
  content: any;
}

export default function Contact({ content }: ContactProps) {
  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: content?.contact?.phone || '+91 1234567890',
      href: `tel:${content?.contact?.phone || '+911234567890'}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: content?.contact?.email || 'info@aadyaenterprises.com',
      href: `mailto:${content?.contact?.email || 'info@aadyaenterprises.com'}`,
    },
    {
      icon: MapPin,
      label: 'Address',
      value: content?.contact?.address || 'Your Address Here',
      href: '#',
    },
  ];

  return (
    <section id="contact" className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto mb-6"></div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Ready to secure your property or go solar? Let's talk!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white mb-8">Contact Information</h3>

            {contactInfo.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="group flex items-start space-x-4 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 hover:border-amber-500 transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-slate-950" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-amber-500 font-medium mb-1">{item.label}</p>
                  <p className="text-lg text-white group-hover:text-amber-500 transition-colors">
                    {item.value}
                  </p>
                </div>
              </a>
            ))}

            <div className="mt-12 p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30">
              <h4 className="text-xl font-bold text-white mb-4">Why Choose Us?</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Expert installation and support
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Premium quality products
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Competitive pricing
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  24/7 customer service
                </li>
              </ul>
            </div>
          </div>

          <div>
            <form className="space-y-6 bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  placeholder="+91 1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Service Interest
                </label>
                <select className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all">
                  <option>CCTV Installation</option>
                  <option>Solar Panel Systems</option>
                  <option>Both CCTV & Solar</option>
                  <option>Maintenance & Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                  placeholder="Tell us about your requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/50 flex items-center justify-center"
              >
                Send Message
                <Send className="ml-2 w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
