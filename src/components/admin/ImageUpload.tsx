import { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  folder?: string;
}

export default function ImageUpload({ currentUrl, onUploadComplete, folder = 'general' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
      setUploadSuccess(true);

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearImage = () => {
    setPreviewUrl('');
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${folder}`}
        />
        <label
          htmlFor={`file-upload-${folder}`}
          className={`px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all flex items-center gap-2 ${
            uploading
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : uploadSuccess
              ? 'bg-green-600 text-white'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:shadow-lg hover:shadow-amber-500/50'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : uploadSuccess ? (
            <>
              <Check className="w-5 h-5" />
              <span>Uploaded!</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload from PC</span>
            </>
          )}
        </label>

        {previewUrl && (
          <button
            onClick={handleClearImage}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            type="button"
          >
            <X className="w-5 h-5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-48 h-48 object-cover rounded-lg border-2 border-slate-700 shadow-lg"
          />
        </div>
      )}

      <p className="text-sm text-slate-400">
        Max file size: 5MB. Supported formats: JPG, PNG, WebP, GIF
      </p>
    </div>
  );
}
