import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string, blob: Blob) => void;
  onClose: () => void;
  title?: string;
  hint?: string;
  stampLabel?: string;
}

export default function CameraCapture({ onCapture, onClose, title = 'Take Photo', hint, stampLabel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
      setError('');
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('permission_denied');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setError('no_camera');
      } else {
        setError('Camera could not be started. Please check your browser settings and try again.');
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [facingMode, startCamera]);

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facingMode === 'user') {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.drawImage(video, 0, 0);
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const lines = stampLabel ? [stampLabel, `${dateStr}  ${timeStr}`] : [`${dateStr}  ${timeStr}`];

    const padding = 10;
    const fontSize = Math.max(16, Math.round(canvas.width / 36));
    ctx.font = `bold ${fontSize}px monospace`;
    const maxW = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    const boxH = lines.length * (fontSize + 4) + padding * 2;
    const boxW = maxW + padding * 2;
    const x = canvas.width - boxW - 12;
    const y = canvas.height - boxH - 12;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + boxW - r, y);
    ctx.quadraticCurveTo(x + boxW, y, x + boxW, y + r);
    ctx.lineTo(x + boxW, y + boxH - r);
    ctx.quadraticCurveTo(x + boxW, y + boxH, x + boxW - r, y + boxH);
    ctx.lineTo(x + r, y + boxH);
    ctx.quadraticCurveTo(x, y + boxH, x, y + boxH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px monospace`;
    lines.forEach((line, i) => {
      ctx.fillText(line, x + padding, y + padding + fontSize + i * (fontSize + 4));
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCaptured(dataUrl);
  }

  function retake() {
    setCaptured(null);
  }

  function confirm() {
    if (!captured || !canvasRef.current) return;
    canvasRef.current.toBlob(blob => {
      if (blob) onCapture(captured, blob);
    }, 'image/jpeg', 0.85);
  }

  function flipCamera() {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    setCaptured(null);
    setReady(false);
  }

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 z-10">
        <h3 className="text-white font-semibold">{title}</h3>
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {hint && !captured && (
        <div className="px-4 pb-2">
          <p className="text-amber-400/80 text-xs text-center">{hint}</p>
        </div>
      )}

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 text-center">
          <AlertCircle className="w-14 h-14 text-red-400" />
          {error === 'permission_denied' ? (
            <>
              <div>
                <p className="text-white font-semibold text-base mb-1">Camera Access Blocked</p>
                <p className="text-slate-400 text-sm">Your browser has blocked camera access for this site.</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left max-w-xs w-full space-y-2">
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide">How to fix:</p>
                <p className="text-slate-300 text-xs">1. Tap the <strong className="text-white">lock / info icon</strong> in your browser's address bar</p>
                <p className="text-slate-300 text-xs">2. Find <strong className="text-white">Camera</strong> and change it to <strong className="text-white">Allow</strong></p>
                <p className="text-slate-300 text-xs">3. Refresh the page and try again</p>
              </div>
              <button onClick={() => startCamera(facingMode)} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm">
                Try Again
              </button>
            </>
          ) : error === 'no_camera' ? (
            <>
              <div>
                <p className="text-white font-semibold text-base mb-1">No Camera Found</p>
                <p className="text-slate-400 text-sm">No camera was detected on this device. Please check your device settings.</p>
              </div>
              <button onClick={onClose} className="px-6 py-2.5 bg-slate-700 text-white rounded-xl font-medium text-sm">Close</button>
            </>
          ) : (
            <>
              <p className="text-white text-center text-sm">{error}</p>
              <button onClick={() => startCamera(facingMode)} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm">
                Retry
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 relative overflow-hidden bg-black">
            {!captured ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 border-2 border-white/30 rounded-2xl" />
                </div>
              </>
            ) : (
              <img src={captured} alt="Captured" className="w-full h-full object-cover" />
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="bg-black/90 px-6 py-6 flex items-center justify-center gap-8">
            {!captured ? (
              <>
                <button onClick={flipCamera} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!ready}
                  className="w-18 h-18 rounded-full bg-white flex items-center justify-center shadow-lg disabled:opacity-40 active:scale-95 transition-transform"
                  style={{ width: '72px', height: '72px' }}
                >
                  <Camera className="w-7 h-7 text-black" />
                </button>
                <div className="w-12 h-12" />
              </>
            ) : (
              <>
                <button onClick={retake} className="flex flex-col items-center gap-1 text-white/70 hover:text-white">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><RotateCcw className="w-5 h-5" /></div>
                  <span className="text-xs">Retake</span>
                </button>
                <button onClick={confirm} className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg"><Check className="w-7 h-7 text-white" /></div>
                  <span className="text-xs font-semibold">Use Photo</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
