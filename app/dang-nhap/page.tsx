'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/components/Logo';
import styles from './login.module.css';

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [flashlightMode, setFlashlightMode] = useState(false);
  const [flashlightPos, setFlashlightPos] = useState({ x: -999, y: -999 });
  const [canTilt, setCanTilt] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const [currentColor, setCurrentColor] = useState('#f43f5e');
  const [isRainbow, setIsRainbow] = useState(false);
  const [lineWidth, setLineWidth] = useState(45);
  
  const currentColorRef = useRef(currentColor);
  const isRainbowRef = useRef(isRainbow);
  const lineWidthRef = useRef(lineWidth);

  useEffect(() => {
    currentColorRef.current = currentColor;
    isRainbowRef.current = isRainbow;
    lineWidthRef.current = lineWidth;
  }, [currentColor, isRainbow, lineWidth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanTilt(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('paintCanvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let isPainting = false;
      
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
      
      let hue = 0;
      
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 45;
      
      const startPainting = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(`.${styles.colorPalette}`) || target.closest(`.${styles.loginContainer}`)) return;
        e.preventDefault();
        isPainting = true;
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
      };
      
      const paint = (e: MouseEvent) => {
        if (!isPainting) return;
        ctx.lineWidth = lineWidthRef.current;
        if (isRainbowRef.current) {
          ctx.strokeStyle = `hsl(${hue}, 85%, 65%)`;
          hue += 2;
          if (hue >= 360) hue = 0;
        } else {
          ctx.strokeStyle = currentColorRef.current;
        }
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
      };
      
      const stopPainting = () => {
        isPainting = false;
        ctx.beginPath();
      };
      
      window.addEventListener('mousedown', startPainting);
      window.addEventListener('mousemove', paint);
      window.addEventListener('mouseup', stopPainting);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('mousedown', startPainting);
        window.removeEventListener('mousemove', paint);
        window.removeEventListener('mouseup', stopPainting);
      };
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const rotateX = (mouseY / (rect.height / 2)) * -12;
    const rotateY = (mouseX / (rect.width / 2)) * 12;
    
    setTiltStyle({
      transition: 'transform 0.1s ease',
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    });
  };

  const handleMouseLeave = () => {
    if (!canTilt) return;
    setTiltStyle({
      transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    });
  };

  const handlePasswordMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!flashlightMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setFlashlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePasswordMouseLeave = () => {
    if (!flashlightMode) return;
    setFlashlightPos({ x: -999, y: -999 });
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr(''); setLoading(true);
    
    try {
      const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await res.json();
      
      if (!j.ok) { 
        setErr(j.error || 'Thất bại'); 
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setLoading(false);
        return; 
      }
      
      setSuccess(true);
      document.cookie = 'jotun_admin=1; path=/; max-age=43200';
      
      setTimeout(() => {
        router.push(j.user?.role === 'admin' ? '/dashboard' : '/cua-hang');
        router.refresh();
      }, 1500);
      
    } catch { 
      setErr('Lỗi mạng, thử lại'); 
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.customCursor}>
        <canvas id="paintCanvas" className={styles.paintCanvas} style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none'}}></canvas>
        
        <div className={styles.colorPalette} id="colorPalette">
          <div className={`${styles.colorSwatch} ${!isRainbow && currentColor === '#f43f5e' ? styles.active : ''} ${styles.customCursorBlue}`} style={{ background: '#f43f5e' }} title="Đỏ dâu" onClick={() => { setIsRainbow(false); setCurrentColor('#f43f5e'); }}></div>
          <div className={`${styles.colorSwatch} ${!isRainbow && currentColor === '#3b82f6' ? styles.active : ''} ${styles.customCursorBlue}`} style={{ background: '#3b82f6' }} title="Xanh dương" onClick={() => { setIsRainbow(false); setCurrentColor('#3b82f6'); }}></div>
          <div className={`${styles.colorSwatch} ${!isRainbow && currentColor === '#10b981' ? styles.active : ''} ${styles.customCursorBlue}`} style={{ background: '#10b981' }} title="Xanh lá" onClick={() => { setIsRainbow(false); setCurrentColor('#10b981'); }}></div>
          <div className={`${styles.colorSwatch} ${!isRainbow && currentColor === '#f59e0b' ? styles.active : ''} ${styles.customCursorBlue}`} style={{ background: '#f59e0b' }} title="Vàng cam" onClick={() => { setIsRainbow(false); setCurrentColor('#f59e0b'); }}></div>
          <div className={`${styles.colorSwatch} ${!isRainbow && currentColor === '#8b5cf6' ? styles.active : ''} ${styles.customCursorBlue}`} style={{ background: '#8b5cf6' }} title="Tím" onClick={() => { setIsRainbow(false); setCurrentColor('#8b5cf6'); }}></div>
          <div className={`${styles.colorSwatch} ${styles.rainbowSwatch} ${isRainbow ? styles.active : ''} ${styles.customCursorBlue}`} title="Cầu vồng" onClick={() => setIsRainbow(true)}></div>
          <div className={`${styles.colorPickerWrapper} ${!isRainbow && !['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].includes(currentColor) ? styles.active : ''} ${styles.customCursorBlue}`} title="Bảng màu tùy chỉnh">
            <input type="color" value={!isRainbow ? currentColor : '#0f172a'} onChange={(e) => { setIsRainbow(false); setCurrentColor(e.target.value); }} className={styles.customCursorBlue} />
          </div>
          <div className={styles.brushSizeWrapper} title="Độ dày nét vẽ">
            <i className='bx bx-pencil text-slate-500 mb-1 text-lg'></i>
            <input type="range" min="5" max="100" value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))} className={styles.brushSlider} />
          </div>
        </div>

        <div className={styles.background}>
          <div className={`${styles.shape} ${styles.shape1}`}></div>
          <div className={`${styles.shape} ${styles.shape2}`}></div>
          <div className={`${styles.shape} ${styles.shape3}`}></div>
          <div className={styles.noiseOverlay}></div>
        </div>

        <div className="flex justify-center items-center min-h-[100vh] w-full">
          <div className={`${styles.loginContainer}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <form 
              className={`${styles.loginForm} ${shake ? styles.errorShake : ''} ${success ? styles.successAnimation : ''}`} 
              style={tiltStyle} 
              onSubmit={submit}
            >
              <div className="flex justify-center mb-4"><Logo height={52} /></div>
            <div className="text-4xl text-center mb-2">{tab === 'login' ? '🔐' : '📝'}</div>
            <h1 className="text-2xl font-black text-center mb-1 text-slate-800">{tab === 'login' ? 'Đăng nhập' : 'Đăng ký khách hàng'}</h1>
            <p className="text-center text-sm text-slate-500 mb-6 font-medium">Mua sơn COD — nhận hàng mới trả tiền</p>

            <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 p-1 rounded-xl shadow-inner">
              <button type="button" onClick={() => { setTab('login'); setErr(''); }} className={`py-2 rounded-lg font-bold text-sm transition-all ${tab === 'login' ? 'bg-white shadow text-rose-500' : 'text-slate-500 hover:bg-slate-200'}`}>Đăng nhập</button>
              <button type="button" onClick={() => { setTab('register'); setErr(''); }} className={`py-2 rounded-lg font-bold text-sm transition-all ${tab === 'register' ? 'bg-white shadow text-blue-500' : 'text-slate-500 hover:bg-slate-200'}`}>Đăng ký</button>
            </div>

            {tab === 'register' && (
              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <i className={`bx bx-user ${styles.inputFieldIcon}`}></i>
                  <input type="text" id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder=" " />
                  <label htmlFor="name">Họ tên *</label>
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <i className={`bx bx-user ${styles.inputFieldIcon}`}></i>
                <input type="text" id="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder=" " />
                <label htmlFor="email">Tài khoản / Email *</label>
              </div>
            </div>

            {tab === 'register' && (
              <>
                <div className={styles.inputGroup}>
                  <div className={styles.inputField}>
                    <i className={`bx bx-phone ${styles.inputFieldIcon}`}></i>
                    <input type="text" id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder=" " />
                    <label htmlFor="phone">SĐT</label>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <div className={styles.inputField}>
                    <i className={`bx bx-map ${styles.inputFieldIcon}`}></i>
                    <input type="text" id="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder=" " />
                    <label htmlFor="address">Địa chỉ</label>
                  </div>
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <div 
                className={styles.inputField} 
                onMouseMove={handlePasswordMouseMove}
                onMouseLeave={handlePasswordMouseLeave}
                style={{ '--mouse-x': `${flashlightPos.x}px`, '--mouse-y': `${flashlightPos.y}px` } as React.CSSProperties}
              >
                <i className={`bx bx-lock-alt ${styles.inputFieldIcon}`}></i>
                <input 
                  type="password" 
                  id="password" 
                  required 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  placeholder=" " 
                  className={flashlightMode ? styles.flashlightActive : ''}
                  style={flashlightMode ? { cursor: 'crosshair' } : {}}
                />
                <input 
                  type="text" 
                  className={`${styles.passwordPlainOverlay} ${flashlightMode ? styles.active : ''}`} 
                  value={form.password} 
                  readOnly 
                  tabIndex={-1} 
                  aria-hidden="true" 
                />
                <label htmlFor="password">Mật khẩu *</label>
                <i 
                  className={`bx ${flashlightMode ? 'bx-bulb' : 'bx-hide'} ${styles.togglePassword}`} 
                  onClick={() => setFlashlightMode(!flashlightMode)} 
                  title="Bật/Tắt đèn pin"
                  style={flashlightMode ? { color: '#fbbf24', textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' } : {}}
                ></i>
              </div>
            </div>

            {err && <div className="text-red-500 text-sm font-bold text-center mb-4">{err}</div>}

            <button 
              type="submit" 
              className={`${styles.loginBtn} ${loading ? styles.loading : ''}`} 
              disabled={loading}
              onMouseDown={handleRipple}
              style={success ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)' } : {}}
            >
              <span className={styles.btnText}>{success ? 'Thành công!' : tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}</span>
              <i className={`bx ${success ? 'bx-check' : 'bx-right-arrow-alt'}`}></i>
              <div className={styles.loader}></div>
              
              {ripple && (
                <div 
                  style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%) scale(25)',
                    left: `${ripple.x}px`,
                    top: `${ripple.y}px`,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                    opacity: 0,
                  }}
                />
              )}
            </button>

            <Link href="/" className="block text-center text-sm text-rose-500 font-bold mt-6 hover:underline transition-colors hover:text-rose-600">
              ← Về trang chủ mua hàng
            </Link>
          </form>
          </div>
        </div>
      </div>
    </>
  );
}
