import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';
import ProfileEditor from './ProfileEditor';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export default function ProfileAvatar({ size = 'md', showName = false, className = '' }: ProfileAvatarProps) {
  const { user } = useAuth();
  const [showEditor, setShowEditor] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <button
        onClick={() => setShowEditor(true)}
        className={`flex items-center gap-2 hover:opacity-80 transition-opacity group ${className}`}
        title="Edit Profile"
      >
        <div className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 group-hover:border-amber-500/50 transition-colors flex items-center justify-center shrink-0`}>
          {user?.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt={user.full_name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="font-bold text-slate-300">{initials}</span>
          )}
        </div>
        {showName && user && (
          <span className="text-slate-300 text-sm hidden sm:block">{user.full_name}</span>
        )}
      </button>
      {showEditor && <ProfileEditor onClose={() => setShowEditor(false)} />}
    </>
  );
}
