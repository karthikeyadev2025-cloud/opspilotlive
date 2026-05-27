import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Navigation from './Navigation';
import Hero from './Hero';
import Services from './Services';
import SolarDetails from './SolarDetails';
import CCTVDetails from './CCTVDetails';
import MDSection from './MDSection';
import Gallery from './Gallery';
import TechnicianTeam from './TechnicianTeam';
import Benefits from './Benefits';
import Testimonials from './Testimonials';
import CareerForm from './CareerForm';
import InvestmentForm from './InvestmentForm';
import Contact from './Contact';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';
import WhatsAppButton from './WhatsAppButton';
import SEOContent from './SEOContent';

interface SiteContent {
  [section: string]: {
    [key: string]: string;
  };
}

export default function PublicSite() {
  const [content, setContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    const { data } = await supabase.from('site_content').select('*');

    if (data) {
      const organized: SiteContent = {};
      data.forEach(item => {
        if (!organized[item.section]) {
          organized[item.section] = {};
        }
        organized[item.section][item.key] = item.value;
      });
      setContent(organized);
    }
    setLoading(false);
  }

  if (showLoading) {
    return <LoadingScreen onLoadingComplete={() => setShowLoading(false)} />;
  }

  if (loading) {
    return null;
  }

  return (
    <div className="bg-slate-950">
      <SEOContent />
      <Navigation content={content} />
      <Hero content={content} />
      <Services />
      <SolarDetails />
      <CCTVDetails />
      <MDSection />
      <Gallery />
      <TechnicianTeam />
      <Benefits />
      <Testimonials />
      <CareerForm />
      <InvestmentForm />
      <Contact content={content} />
      <Footer content={content} />
      <WhatsAppButton />
    </div>
  );
}
