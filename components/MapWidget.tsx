'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, KeyRound } from 'lucide-react';

// === VỊ TRÍ CỬA HÀNG ===
const LAT = 21.069;
const LON = 105.884;
const ADDRESS = 'Số 46 Đường Lý Sơn, Thượng Thanh, Long Biên, Hà Nội';
const HOTLINE = '0903123456';

// Bản đồ MapTiler
const KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';

export default function MapWidget() {
  const [open, setOpen] = useState(true);
  const [err, setErr] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { if (localStorage.getItem('jotun-map') === 'closed') setOpen(false); } catch {}
  }, []);

  useEffect(() => {
    if (!open || !KEY || !ref.current) return;
    let map: any;
    (async () => {
      try {
        const maptilersdk = await import('@maptiler/sdk');
        
        maptilersdk.config.apiKey = KEY;
        
        map = new maptilersdk.Map({
          container: ref.current as HTMLElement,
          style: maptilersdk.MapStyle.STREETS,
          center: [LON, LAT],
          zoom: 16,
        });
        
        map.addControl(new maptilersdk.NavigationControl(), 'top-right');
        
        const el = document.createElement('div');
        el.innerHTML = '📍';
        el.style.fontSize = '32px';
        el.style.cursor = 'pointer';
        
        new maptilersdk.Marker({ element: el })
          .setLngLat([LON, LAT])
          .setPopup(new maptilersdk.Popup({ offset: 28 }).setHTML(`<b>Cửa hàng Phúc Thành</b><br/>${ADDRESS}`))
          .addTo(map)
          .togglePopup();
      } catch (e: any) { 
        console.error(e);
        setErr('Không tải được bản đồ (key sai hoặc mất mạng)'); 
      }
    })();
    return () => { try { map?.remove(); } catch {} };
  }, [open]);

  const toggle = (v: boolean) => {
    setOpen(v);
    try { localStorage.setItem('jotun-map', v ? 'open' : 'closed'); } catch {}
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 24, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: .95 }}
            className="w-64 sm:w-72 rounded-2xl overflow-hidden shadow-card border border-white/60 bg-white">
            <div className="flex items-center gap-2 px-3 py-2 gradient-jotun text-white">
              <MapPin size={15} className="shrink-0 text-brand-yellow" />
              <span className="text-xs font-bold truncate flex-1">Cửa hàng Phúc Thành</span>
              <button onClick={() => toggle(false)} title="Đóng bản đồ" className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 grid place-items-center shrink-0">
                <X size={14} />
              </button>
            </div>
            {!KEY ? (
              <div className="p-4 text-xs leading-relaxed text-slate-600">
                <div className="font-bold flex items-center gap-1.5"><KeyRound size={14}/> Chưa có key bản đồ MapTiler</div>
                <ol className="list-decimal ml-4 mt-1.5 space-y-1">
                  <li>Đăng ký miễn phí tại <b>cloud.maptiler.com</b></li>
                  <li>Vào mục <b>API Keys</b>, copy key mặc định</li>
                  <li>Thêm vào <b>.env.local</b>:<br /><code className="bg-slate-100 px-1 rounded break-all">NEXT_PUBLIC_MAPTILER_API_KEY=key-cua-ban</code></li>
                </ol>
                <div className="font-bold mt-2">📍 {ADDRESS}</div>
                <a href={`tel:${HOTLINE}`} className="mt-2 w-full gradient-jotun text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5">
                  <Phone size={14}/> Gọi {HOTLINE}
                </a>
              </div>
            ) : err ? (
              <div className="p-4 text-xs text-red-600 font-bold">⚠️ {err}<div className="font-bold mt-2 text-slate-700">📍 {ADDRESS}</div></div>
            ) : (
              <>
                <div ref={ref} className="w-full h-44 sm:h-52 relative" />
                <div className="p-3 text-xs">
                  <div className="font-bold text-slate-700">📍 {ADDRESS}</div>
                  <div className="text-slate-500 mt-0.5">Mở cửa T2–T7: 7h30–18h00 • CN: 8h–12h</div>
                  <a href={`tel:${HOTLINE}`} className="mt-2 w-full gradient-jotun text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5">
                    <Phone size={14}/> Gọi cửa hàng
                  </a>
                  <div className="text-[10px] text-slate-400 mt-2 text-center border-t pt-2 border-slate-100">Bản đồ: MapTiler</div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileTap={{ scale: .9 }} onClick={() => toggle(!open)} title={open ? 'Thu gọn bản đồ' : 'Mở bản đồ'}
        className="flex items-center gap-2 bg-white border border-jotun-200 text-jotun-800 pl-3 pr-4 py-2.5 rounded-full font-bold text-sm shadow-card hover:scale-105 transition">
        {open ? <X size={16} /> : <MapPin size={16} />}
        {open ? 'Đóng' : 'Vị trí cửa hàng'}
      </motion.button>
    </div>
  );
}
