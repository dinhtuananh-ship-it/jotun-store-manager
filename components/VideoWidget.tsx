'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Film, MoveDiagonal } from 'lucide-react';

// === CẤU HÌNH VIDEO ===
// Copy file video khổ dọc của bạn vào thư mục public/ đặt tên "promo-video.mp4"
// (file này đi theo deployment Vercel, vẫn còn sau khi deploy).
// Hoặc điền YouTube ID vào YOUTUBE_ID để phát từ YouTube.
const LOCAL_SRC = '/promo-video.mp4';
const YOUTUBE_ID = ''; // VD: 'dQw4w9WgXcQ' — để trống '' nếu dùng file local
const TITLE = 'Đại lý phân phối sơn Phúc Thành';

// Kích thước có sẵn (rộng x cao video)
const PRESETS = [
  { label: 'S', w: 190, h: 300 },
  { label: 'M', w: 240, h: 380 },
  { label: 'L', w: 300, h: 480 },
];

export default function VideoWidget() {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [size, setSize] = useState({ w: 240, h: 380 });
  const drag = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem('jotun-video') !== 'closed') setOpen(true);
      const s = JSON.parse(localStorage.getItem('jotun-video-size') || 'null');
      if (s?.w && s?.h) setSize({ w: Math.min(420, Math.max(170, s.w)), h: Math.min(720, Math.max(260, s.h)) });
    } catch {}
  }, []);

  const toggle = (v: boolean) => {
    setOpen(v);
    try { localStorage.setItem('jotun-video', v ? 'open' : 'closed'); } catch {}
  };
  const applySize = (w: number, h: number) => {
    const s = { w: Math.round(Math.min(420, Math.max(170, w))), h: Math.round(Math.min(720, Math.max(260, h))) };
    setSize(s);
    try { localStorage.setItem('jotun-video-size', JSON.stringify(s)); } catch {}
  };

  // Kéo tay nắm ở góc trên-trái để chỉnh rộng + cao tự do (neo góc dưới-phải)
  const onGripDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
  };
  const onGripMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    applySize(drag.current.w + (drag.current.x - e.clientX), drag.current.h + (drag.current.y - e.clientY));
  };
  const onGripUp = () => { drag.current = null; };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 24, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: .95 }}
            style={{ width: size.w }}
            className="relative rounded-2xl overflow-hidden shadow-card border border-white/60 bg-jotun-900 max-w-[calc(100vw-2rem)]">
            {/* Tay nắm kéo chỉnh kích thước */}
            <div onPointerDown={onGripDown} onPointerMove={onGripMove} onPointerUp={onGripUp} onPointerCancel={onGripUp}
              title="Giữ và kéo để chỉnh độ rộng + chiều cao"
              className="absolute left-1 top-8 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 grid place-items-center cursor-nwse-resize touch-none">
              <MoveDiagonal size={13} className="text-white -scale-x-100" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-white">
              <Film size={15} className="shrink-0 text-brand-yellow" />
              <span className="text-xs font-bold truncate flex-1">{TITLE}</span>
              <button onClick={() => toggle(false)} title="Đóng video" className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 grid place-items-center shrink-0">
                <X size={14} />
              </button>
            </div>
            {/* Video khổ dọc — khách tự chỉnh rộng/cao, video co vừa khung */}
            <div className="bg-black w-full overflow-hidden" style={{ height: size.h }}>
              {YOUTUBE_ID ? (
                <iframe src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0`} title={TITLE} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : failed ? (
                <div className="w-full h-full grid place-items-center text-center p-4 text-xs text-slate-300">
                  Chưa có file video.<br />Copy video vào <b>public/promo-video.mp4</b>
                </div>
              ) : (
                <video src={LOCAL_SRC} controls playsInline preload="metadata" className="w-full h-full object-contain" onError={() => setFailed(true)} />
              )}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-jotun-900">
              <span className="text-[10px] text-blue-100 mr-auto">Cỡ video:</span>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applySize(p.w, p.h)}
                  className={`text-[11px] font-black w-7 h-6 rounded-lg ${size.w === p.w && size.h === p.h ? 'bg-brand-yellow text-jotun-900' : 'bg-white/15 text-white hover:bg-white/30'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileTap={{ scale: .9 }} onClick={() => toggle(!open)} title={open ? 'Thu gọn video' : 'Mở video'}
        className="flex items-center gap-2 gradient-jotun text-white pl-3 pr-4 py-2.5 rounded-full font-bold text-sm shadow-glow hover:scale-105 transition">
        {open ? <X size={16} /> : <Play size={16} />}
        {open ? 'Đóng' : 'Xem video'}
      </motion.button>
    </div>
  );
}
