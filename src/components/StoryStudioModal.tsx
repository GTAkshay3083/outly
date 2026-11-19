import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Type, 
  Sticker, 
  Share2, 
  Download, 
  Trash2, 
  Check,
  Award,
  Users,
  MapPin
} from 'lucide-react';
import type { OutingPlan } from '../types';

interface StoryElement {
  id: string;
  type: 'sticker' | 'text';
  text?: string;
  color?: string;
  bgStyle?: 'solid' | 'transparent' | 'outline';
  stickerType?: 'anti_flake' | 'squad_roster' | 'plan_tag' | 'vibe' | 'logo' | 'custom_badge';
  stickerImage?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
}

interface Props {
  plan?: OutingPlan | null;
  onClose: () => void;
}

const OFFICIAL_STICKERS = [
  { id: 'stepped_out', label: 'Stepped Out', src: '/stickers/stepped_out.png' },
  { id: 'pull_up_100', label: '100% Pull-Up Rate', src: '/stickers/pull_up_100.png' },
  { id: 'zero_flakes', label: 'Zero Flakes', src: '/stickers/zero_flakes.png' },
  { id: 'midnight_chai', label: 'Midnight Chai', src: '/stickers/midnight_chai.png' },
  { id: 'turf_squad', label: 'Turf Squad', src: '/stickers/turf_squad.png' },
  { id: 'live_radar', label: 'Live Radar', src: '/stickers/live_radar.png' },
];

const VIBE_TAGS = [
  '✨ ABSOLUTE VIBE',
  '⚽ MATCH POINT',
  '☕ MIDNIGHT FUEL',
  '🎬 CINEMA CLUB',
  '🍕 FOODIE RUN',
  '🚀 ZERO FLAKES'
];

const TEXT_COLORS = [
  '#FFFFFF',
  '#FF5E3A',
  '#1DB954',
  '#00F0FF',
  '#FFD700',
  '#E056FD',
  '#08080A'
];

export default function StoryStudioModal({ plan, onClose }: Props) {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [elements, setElements] = useState<StoryElement[]>([]);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [showStickerTray, setShowStickerTray] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedBgStyle, setSelectedBgStyle] = useState<'solid' | 'transparent' | 'outline'>('solid');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize with plan badges if plan exists
  useEffect(() => {
    const initialElements: StoryElement[] = [];

    if (plan) {
      initialElements.push({
        id: 'plan_badge',
        type: 'sticker',
        stickerType: 'plan_tag',
        x: 50,
        y: 18,
        scale: 1,
      });

      initialElements.push({
        id: 'anti_flake_badge',
        type: 'sticker',
        stickerType: 'anti_flake',
        x: 50,
        y: 82,
        scale: 1,
      });
    } else {
      initialElements.push({
        id: 'logo_badge',
        type: 'sticker',
        stickerType: 'logo',
        x: 50,
        y: 15,
        scale: 1,
      });
    }

    setElements(initialElements);
  }, [plan]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a Sticker
  const addSticker = (stickerType: StoryElement['stickerType'], customText?: string, stickerImage?: string) => {
    const newEl: StoryElement = {
      id: `el_${Date.now()}`,
      type: 'sticker',
      stickerType,
      text: customText,
      stickerImage,
      x: 50,
      y: 50,
      scale: 1,
    };
    setElements((prev) => [...prev, newEl]);
    setActiveElementId(newEl.id);
    setShowStickerTray(false);
  };

  // Add Custom Text
  const handleAddText = () => {
    if (!newText.trim()) {
      setShowTextInput(false);
      return;
    }

    const newEl: StoryElement = {
      id: `el_${Date.now()}`,
      type: 'text',
      text: newText.trim(),
      color: selectedColor,
      bgStyle: selectedBgStyle,
      x: 50,
      y: 50,
      scale: 1,
    };

    setElements((prev) => [...prev, newEl]);
    setActiveElementId(newEl.id);
    setNewText('');
    setShowTextInput(false);
  };

  // Dragging interaction
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveElementId(id);

    const preview = previewRef.current;
    if (!preview) return;

    const rect = preview.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const targetEl = elements.find((el) => el.id === id);
    if (!targetEl) return;

    const initialX = targetEl.x;
    const initialY = targetEl.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;

      const newX = Math.max(10, Math.min(90, initialX + deltaX));
      const newY = Math.max(10, Math.min(90, initialY + deltaY));

      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, x: newX, y: newY } : el))
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const removeActiveElement = () => {
    if (activeElementId) {
      setElements((prev) => prev.filter((el) => el.id !== activeElementId));
      setActiveElementId(null);
    }
  };

  // Render high-res Canvas and Export
  const generateStoryBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Draw Background
    if (bgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Cover 9:16
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = height * imgRatio;
        offsetX = -(drawWidth - width) / 2;
      } else {
        drawHeight = width / imgRatio;
        offsetY = -(drawHeight - height) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Subtle dark vignette gradient for legibility
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(8, 8, 10, 0.4)');
      grad.addColorStop(0.5, 'rgba(8, 8, 10, 0.1)');
      grad.addColorStop(1, 'rgba(8, 8, 10, 0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Obsidian mesh background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#08080A');
      grad.addColorStop(0.5, '#121214');
      grad.addColorStop(1, '#1A0C08');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Elements onto Canvas
    for (const el of elements) {
      const cx = (el.x / 100) * width;
      const cy = (el.y / 100) * height;

      ctx.save();
      ctx.translate(cx, cy);

      if (el.type === 'sticker') {
        if (el.stickerType === 'anti_flake') {
          // Anti-Flake Verified Stamp
          ctx.fillStyle = 'rgba(18, 18, 20, 0.9)';
          ctx.strokeStyle = '#1DB954';
          ctx.lineWidth = 6;
          roundRect(ctx, -280, -55, 560, 110, 55);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#1DB954';
          ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏆 100% ATTENDANCE • ZERO FLAKES', 0, 0);
        } else if (el.stickerType === 'plan_tag') {
          // Plan Tag
          ctx.fillStyle = 'rgba(8, 8, 10, 0.88)';
          ctx.strokeStyle = '#FF5E3A';
          ctx.lineWidth = 5;
          roundRect(ctx, -320, -75, 640, 150, 40);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(plan?.title || 'Outly Meetup', 0, -15);

          ctx.fillStyle = '#FF5E3A';
          ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(`📍 ${plan?.venue || 'Chennai'} • Verified Outing`, 0, 35);
        } else if (el.stickerType === 'squad_roster') {
          // Squad Showed Up
          ctx.fillStyle = 'rgba(18, 18, 20, 0.92)';
          ctx.strokeStyle = '#FF5E3A';
          ctx.lineWidth = 6;
          roundRect(ctx, -260, -50, 520, 100, 50);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔥 SQUAD LOCKED & LOADED', 0, 0);
        } else if (el.stickerType === 'vibe') {
          // Vibe Pill
          ctx.fillStyle = '#FF5E3A';
          roundRect(ctx, -220, -45, 440, 90, 45);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text || '✨ ABSOLUTE VIBE', 0, 0);
        } else if (el.stickerType === 'custom_badge' && el.stickerImage) {
          // Minimalist Badge Image
          const badgeImg = new Image();
          badgeImg.src = el.stickerImage;
          await new Promise((res) => {
            badgeImg.onload = res;
            badgeImg.onerror = res;
          });
          const baseW = 340;
          const aspect = badgeImg.width ? (badgeImg.height / badgeImg.width) : 1;
          const w = baseW * (el.scale || 1);
          const h = w * aspect;
          ctx.drawImage(badgeImg, -w / 2, -h / 2, w, h);
        } else if (el.stickerType === 'logo') {
          // Official Watermark
          ctx.fillStyle = 'rgba(8, 8, 10, 0.7)';
          roundRect(ctx, -180, -40, 360, 80, 40);
          ctx.fill();

          ctx.fillStyle = '#F5F5F7';
          ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡ Outly', 0, 0);
        }
      } else if (el.type === 'text' && el.text) {
        // Custom text caption
        ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
        const textWidth = ctx.measureText(el.text).width;
        const padX = 40;

        if (el.bgStyle === 'solid') {
          ctx.fillStyle = el.color === '#08080A' ? '#FFFFFF' : '#08080A';
          roundRect(ctx, -textWidth / 2 - padX, -45, textWidth + padX * 2, 90, 25);
          ctx.fill();
        } else if (el.bgStyle === 'outline') {
          ctx.strokeStyle = el.color || '#FFFFFF';
          ctx.lineWidth = 4;
          roundRect(ctx, -textWidth / 2 - padX, -45, textWidth + padX * 2, 90, 25);
          ctx.stroke();
        }

        ctx.fillStyle = el.color || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.text, 0, 0);
      }

      ctx.restore();
    }

    // 3. Footer Branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Make Plans That Actually Happen • getoutly.app', width / 2, height - 60);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
    });
  };

  // Helper for rounded rect on canvas
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // 1-Tap Share to WhatsApp Status & Instagram
  const handleExportShare = async () => {
    setIsExporting(true);
    setExportFeedback(null);

    try {
      const blob = await generateStoryBlob();
      if (!blob) throw new Error('Could not create story image');

      const file = new File([blob], `outly-story-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // If navigator.share supports files (Android WhatsApp Status & Instagram)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Outly Story',
          text: 'Our squad met up on Outly! 🚀',
        });
        setExportFeedback('Shared successfully!');
      } else {
        // Fallback: direct download to phone gallery
        const link = document.createElement('a');
        link.download = `outly-story-${Date.now()}.jpg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        setExportFeedback('Saved to your device! Open WhatsApp or Instagram to post.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        // Fallback download if share was cancelled or failed
        const blob = await generateStoryBlob();
        if (blob) {
          const link = document.createElement('a');
          link.download = `outly-story-${Date.now()}.jpg`;
          link.href = URL.createObjectURL(blob);
          link.click();
          setExportFeedback('Saved to Gallery!');
        }
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Save to Gallery
  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const blob = await generateStoryBlob();
      if (blob) {
        const link = document.createElement('a');
        link.download = `outly-story-${Date.now()}.jpg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        setExportFeedback('Saved directly to Photos/Gallery!');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Action Bar */}
      <header className="px-5 pt-12 pb-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-[#1C1C1F]/80 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2">
          {activeElementId && (
            <button
              onClick={removeActiveElement}
              className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1 active:scale-95"
            >
              <Trash2 size={13} /> Delete Sticker
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-3.5 rounded-full bg-[#1C1C1F]/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-[#2A2A2E] active:scale-95"
          >
            <ImageIcon size={16} className="text-[#FF5E3A]" />
            <span>{bgImage ? 'Change Photo' : 'Add Photo'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          <button
            onClick={() => setShowTextInput(true)}
            className="h-10 w-10 rounded-full bg-[#1C1C1F]/80 backdrop-blur-md text-white flex items-center justify-center border border-[#2A2A2E] active:scale-95"
            title="Add text"
          >
            <Type size={18} />
          </button>

          <button
            onClick={() => setShowStickerTray(true)}
            className="h-10 px-3.5 rounded-full bg-[#FF5E3A] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#FF5E3A]/20 active:scale-95"
          >
            <Sticker size={16} />
            <span>Stickers</span>
          </button>
        </div>
      </header>

      {/* Center 9:16 Story Canvas Preview */}
      <main className="flex-1 flex items-center justify-center p-3 overflow-hidden">
        <div
          ref={previewRef}
          className="relative w-full max-w-sm aspect-[9/16] rounded-[32px] overflow-hidden shadow-2xl border border-[#2A2A2E] select-none touch-none bg-[#08080A]"
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Subtle Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

          {/* Fallback prompt when no photo is loaded */}
          {!bgImage && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
            >
              <div className="h-16 w-16 rounded-full bg-[#FF5E3A]/15 border border-[#FF5E3A]/40 flex items-center justify-center text-[#FF5E3A] mb-3 group-hover:scale-110 transition-transform">
                <ImageIcon size={28} />
              </div>
              <h4 className="font-extrabold text-white text-base">Tap to choose a photo</h4>
              <p className="text-xs text-[#A1A1A6] mt-1 max-w-[200px]">
                Pick a photo from your outing or capture one with your camera!
              </p>
            </div>
          )}

          {/* Render Movable Stickers & Text */}
          {elements.map((el) => {
            const isActive = el.id === activeElementId;

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handlePointerDown(el.id, e)}
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute cursor-move select-none transition-shadow ${
                  isActive ? 'ring-2 ring-[#FF5E3A] rounded-2xl shadow-xl' : ''
                }`}
              >
                {el.type === 'sticker' && el.stickerType === 'anti_flake' && (
                  <div className="px-3.5 py-2 rounded-full bg-[#121214]/90 backdrop-blur-md border border-[#1DB954] text-[#1DB954] text-xs font-black tracking-wide flex items-center gap-1.5 shadow-lg">
                    <span>🏆</span>
                    <span>100% ATTENDANCE • ZERO FLAKES</span>
                  </div>
                )}

                {el.type === 'sticker' && el.stickerType === 'plan_tag' && (
                  <div className="p-3 rounded-2xl bg-[#08080A]/90 backdrop-blur-md border border-[#FF5E3A] text-center shadow-lg min-w-[200px]">
                    <span className="font-black text-sm text-white block truncate">
                      {plan?.title || 'Epic Outing'}
                    </span>
                    <span className="text-[10px] font-bold text-[#FF5E3A] flex items-center justify-center gap-1 mt-0.5">
                      <MapPin size={10} /> {plan?.venue || 'Chennai'}
                    </span>
                  </div>
                )}

                {el.type === 'sticker' && el.stickerType === 'squad_roster' && (
                  <div className="px-3.5 py-1.5 rounded-full bg-[#121214]/90 backdrop-blur-md border border-[#FF5E3A] text-white text-xs font-black flex items-center gap-1.5 shadow-lg">
                    <span>🔥</span>
                    <span>SQUAD LOCKED & LOADED</span>
                  </div>
                )}

                {el.type === 'sticker' && el.stickerType === 'vibe' && (
                  <div className="px-3 py-1.5 rounded-full bg-[#FF5E3A] text-white text-xs font-black tracking-wide shadow-lg">
                    {el.text || '✨ ABSOLUTE VIBE'}
                  </div>
                )}

                {el.type === 'sticker' && el.stickerType === 'logo' && (
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5">
                    <img src="/outly-logo.png" alt="outly" className="w-3.5 h-3.5 object-contain" />
                    <span>outly</span>
                  </div>
                )}

                {el.type === 'sticker' && el.stickerType === 'custom_badge' && el.stickerImage && (
                  <img
                    src={el.stickerImage}
                    alt="sticker"
                    className="w-28 sm:w-32 object-contain drop-shadow-2xl pointer-events-none select-none"
                    draggable={false}
                  />
                )}

                {el.type === 'text' && (
                  <div
                    style={{ color: el.color }}
                    className={`px-3 py-1 rounded-xl text-sm font-black tracking-wide ${
                      el.bgStyle === 'solid'
                        ? 'bg-black/80 backdrop-blur-sm'
                        : el.bgStyle === 'outline'
                        ? 'border-2'
                        : ''
                    }`}
                  >
                    {el.text}
                  </div>
                )}
              </div>
            );
          })}

          {/* Outly Watermark on Canvas */}
          <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none flex items-center justify-center gap-1.5">
            <img src="/outly-logo.png" alt="outly" className="w-3.5 h-3.5 object-contain opacity-80" />
            <span className="text-[10px] font-bold text-white/70 tracking-wider">
              outly • Make Plans That Actually Happen
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Export Bar */}
      <footer className="p-5 bg-gradient-to-t from-black via-black/90 to-transparent z-10 flex flex-col gap-2">
        {exportFeedback && (
          <div className="p-2.5 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954] text-xs font-bold text-center animate-in fade-in">
            {exportFeedback}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="p-3.5 rounded-2xl bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#2A2A2E] active:scale-95 transition-transform"
          >
            <Download size={16} /> Save Image
          </button>

          <button
            onClick={handleExportShare}
            disabled={isExporting}
            className="flex-1 py-3.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#ff7352] text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#FF5E3A]/25 active:scale-[0.98] transition-transform"
          >
            <Share2 size={18} />
            <span>{isExporting ? 'Preparing Story...' : 'Share to WhatsApp & Instagram'}</span>
          </button>
        </div>
      </footer>

      {/* STICKER TRAY DRAWER */}
      {showStickerTray && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[32px] p-6 max-w-md w-full mx-auto max-h-[60vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-black text-base text-white">Outly Sticker Tray</h3>
              <button onClick={() => setShowStickerTray(false)} className="text-[#A1A1A6] p-1">
                <X size={18} />
              </button>
            </div>

            {/* Minimalist Social Badges */}
            <div>
              <span className="text-[11px] font-bold text-[#A1A1A6] uppercase tracking-wider block mb-2.5">
                Minimalist IRL Badges
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {OFFICIAL_STICKERS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => addSticker('custom_badge', st.label, st.src)}
                    className="p-2.5 rounded-2xl bg-[#08080A] border border-[#2A2A2E] hover:border-[#FF5E3A] flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all group"
                  >
                    <img src={st.src} alt={st.label} className="h-14 w-auto object-contain group-hover:scale-105 transition-transform" />
                    <span className="text-[10px] font-bold text-[#A1A1A6] group-hover:text-white truncate max-w-full text-center">
                      {st.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Official Badges */}
            <div>
              <span className="text-[11px] font-bold text-[#A1A1A6] uppercase tracking-wider block mb-2">
                Outly Verified Badges
              </span>
              <div className="space-y-2">
                <button
                  onClick={() => addSticker('anti_flake')}
                  className="w-full p-3 rounded-2xl bg-[#08080A] border border-[#1DB954]/40 text-[#1DB954] text-xs font-black flex items-center justify-between hover:bg-[#1DB954]/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Award size={16} /> 🏆 100% ATTENDANCE • ZERO FLAKES
                  </span>
                  <Check size={14} />
                </button>

                <button
                  onClick={() => addSticker('squad_roster')}
                  className="w-full p-3 rounded-2xl bg-[#08080A] border border-[#FF5E3A]/40 text-white text-xs font-black flex items-center justify-between hover:bg-[#FF5E3A]/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users size={16} className="text-[#FF5E3A]" /> 🔥 SQUAD LOCKED & LOADED
                  </span>
                  <Check size={14} />
                </button>

                <button
                  onClick={() => addSticker('plan_tag')}
                  className="w-full p-3 rounded-2xl bg-[#08080A] border border-white/20 text-white text-xs font-black flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#FF5E3A]" /> 📍 Plan & Venue Tag
                  </span>
                  <Check size={14} />
                </button>
              </div>
            </div>

            {/* Vibe Tags */}
            <div>
              <span className="text-[11px] font-bold text-[#A1A1A6] uppercase tracking-wider block mb-2">
                Vibe Badges
              </span>
              <div className="flex flex-wrap gap-2">
                {VIBE_TAGS.map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => addSticker('vibe', vibe)}
                    className="px-3 py-1.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-bold text-white hover:border-[#FF5E3A] hover:text-[#FF5E3A] transition-colors"
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEXT CAPTION MODAL */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-center p-6">
          <div className="max-w-md w-full mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-[#A1A1A6]">Add Story Caption</span>
              <button onClick={() => setShowTextInput(false)} className="text-white p-1">
                <X size={20} />
              </button>
            </div>

            <textarea
              autoFocus
              placeholder="Type your caption..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full h-28 bg-[#121214] border border-[#2A2A2E] rounded-2xl p-4 text-white font-bold text-base focus:outline-none focus:border-[#FF5E3A] resize-none"
            />

            {/* Color Chooser */}
            <div className="flex items-center justify-center gap-3 py-2">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    selectedColor === c ? 'scale-125 border-white' : 'border-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Style Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedBgStyle('solid')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  selectedBgStyle === 'solid'
                    ? 'bg-white text-black border-white'
                    : 'bg-[#1C1C1F] text-[#A1A1A6] border-[#2A2A2E]'
                }`}
              >
                Solid Banner
              </button>
              <button
                onClick={() => setSelectedBgStyle('outline')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  selectedBgStyle === 'outline'
                    ? 'bg-white text-black border-white'
                    : 'bg-[#1C1C1F] text-[#A1A1A6] border-[#2A2A2E]'
                }`}
              >
                Outline
              </button>
              <button
                onClick={() => setSelectedBgStyle('transparent')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  selectedBgStyle === 'transparent'
                    ? 'bg-white text-black border-white'
                    : 'bg-[#1C1C1F] text-[#A1A1A6] border-[#2A2A2E]'
                }`}
              >
                Plain Text
              </button>
            </div>

            <button
              onClick={handleAddText}
              className="w-full py-3.5 rounded-2xl bg-[#FF5E3A] text-white font-black text-sm tracking-wide active:scale-98 transition-transform shadow-lg shadow-[#FF5E3A]/20"
            >
              Add to Story
            </button>
          </div>
        </div>
      )}

      {/* Hidden high-res canvas for 1080x1920 export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
