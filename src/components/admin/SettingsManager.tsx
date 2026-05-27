import { useState, useEffect } from 'react';
import { Save, MessageCircle, Settings, Instagram, Youtube, Facebook, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SettingsManager() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [facebook, setFacebook] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPoster, setVideoPoster] = useState('');
  const [showVideo, setShowVideo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: contactData } = await supabase
      .from('site_content')
      .select('key, value')
      .eq('section', 'contact')
      .in('key', ['whatsapp', 'instagram', 'youtube', 'facebook']);

    if (contactData) {
      contactData.forEach(item => {
        if (item.key === 'whatsapp') setWhatsappNumber(item.value);
        if (item.key === 'instagram') setInstagram(item.value);
        if (item.key === 'youtube') setYoutube(item.value);
        if (item.key === 'facebook') setFacebook(item.value);
      });
    }

    const { data: heroData } = await supabase
      .from('site_content')
      .select('key, value')
      .eq('section', 'hero')
      .in('key', ['video_url', 'video_poster', 'show_video']);

    if (heroData) {
      heroData.forEach(item => {
        if (item.key === 'video_url') setVideoUrl(item.value);
        if (item.key === 'video_poster') setVideoPoster(item.value);
        if (item.key === 'show_video') setShowVideo(item.value === 'true');
      });
    }
  }

  async function saveWhatsApp() {
    setSaving(true);

    const { data: existing } = await supabase
      .from('site_content')
      .select('id')
      .eq('section', 'contact')
      .eq('key', 'whatsapp')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('site_content')
        .update({ value: whatsappNumber })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('site_content')
        .insert([{
          section: 'contact',
          key: 'whatsapp',
          value: whatsappNumber
        }]);
    }

    setSaving(false);
    alert('WhatsApp settings saved successfully!');
  }

  async function saveSocialMedia() {
    setSavingSocial(true);

    const socialLinks = [
      { key: 'instagram', value: instagram },
      { key: 'youtube', value: youtube },
      { key: 'facebook', value: facebook },
    ];

    for (const link of socialLinks) {
      if (!link.value) continue;

      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section', 'contact')
        .eq('key', link.key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('site_content')
          .update({ value: link.value })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('site_content')
          .insert([{
            section: 'contact',
            key: link.key,
            value: link.value
          }]);
      }
    }

    setSavingSocial(false);
    alert('Social media links saved successfully!');
  }

  async function saveVideoSettings() {
    setSavingVideo(true);

    const videoSettings = [
      { key: 'video_url', value: videoUrl },
      { key: 'video_poster', value: videoPoster },
      { key: 'show_video', value: showVideo.toString() },
    ];

    for (const setting of videoSettings) {
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section', 'hero')
        .eq('key', setting.key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('site_content')
          .update({ value: setting.value })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('site_content')
          .insert([{
            section: 'hero',
            key: setting.key,
            value: setting.value
          }]);
      }
    }

    setSavingVideo(false);
    alert('Video settings saved successfully!');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="w-8 h-8 text-amber-500" />
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Video className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-semibold text-white">Hero Video Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="show-video"
              checked={showVideo}
              onChange={(e) => setShowVideo(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="show-video" className="text-slate-400">
              Show background video on hero section
            </label>
          </div>

          <div>
            <label className="block text-slate-400 mb-2">
              Video URL (MP4)
            </label>
            <input
              type="url"
              placeholder="https://example.com/video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
            <p className="text-slate-500 text-sm mt-2">
              Direct link to an MP4 video file. Free videos from Pexels or Pixabay work great!
            </p>
          </div>

          <div>
            <label className="block text-slate-400 mb-2">
              Video Poster Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/poster.jpg"
              value={videoPoster}
              onChange={(e) => setVideoPoster(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
            <p className="text-slate-500 text-sm mt-2">
              Image shown before the video loads
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Tips:</h4>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• Use short, looping videos (10-30 seconds)</li>
              <li>• Keep file size under 10MB for faster loading</li>
              <li>• Videos will autoplay muted in the background</li>
              <li>• If video fails to load, a beautiful gradient background will show</li>
            </ul>
          </div>

          <button
            onClick={saveVideoSettings}
            disabled={savingVideo}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{savingVideo ? 'Saving...' : 'Save Video Settings'}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MessageCircle className="w-6 h-6 text-green-500" />
          <h3 className="text-xl font-semibold text-white">WhatsApp Integration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-2">
              WhatsApp Number (with country code, no spaces)
            </label>
            <input
              type="text"
              placeholder="e.g., 919876543210"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
            <p className="text-slate-500 text-sm mt-2">
              Format: Country code + number without + or spaces (e.g., 919876543210 for India)
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">How it works:</h4>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• A floating WhatsApp button will appear on your website</li>
              <li>• When clicked, it opens WhatsApp with a pre-filled message</li>
              <li>• Customers can instantly start chatting with you</li>
              <li>• The button is visible on all pages</li>
            </ul>
          </div>

          {whatsappNumber && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">Preview Link:</h4>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline text-sm break-all"
              >
                https://wa.me/{whatsappNumber.replace(/\D/g, '')}
              </a>
              <p className="text-slate-400 text-sm mt-2">
                Click to test if this number works correctly
              </p>
            </div>
          )}

          <button
            onClick={saveWhatsApp}
            disabled={saving || !whatsappNumber}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save WhatsApp Settings'}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex space-x-2">
            <Facebook className="w-6 h-6 text-blue-500" />
            <Instagram className="w-6 h-6 text-pink-500" />
            <Youtube className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-white">Social Media Links</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-2 flex items-center space-x-2">
              <Facebook className="w-5 h-5 text-blue-500" />
              <span>Facebook Page URL</span>
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/yourpage"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-2 flex items-center space-x-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              <span>Instagram Profile URL</span>
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/yourprofile"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-2 flex items-center space-x-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <span>YouTube Channel URL</span>
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/@yourchannel"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">How it works:</h4>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• Social media icons will appear in your website footer</li>
              <li>• Visitors can click to visit your social profiles</li>
              <li>• Only filled links will be shown</li>
              <li>• Helps build your social media presence</li>
            </ul>
          </div>

          <button
            onClick={saveSocialMedia}
            disabled={savingSocial}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-pink-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{savingSocial ? 'Saving...' : 'Save Social Media Links'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
