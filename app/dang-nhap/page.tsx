'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await res.json();
      if (!j.ok) { setErr(j.error || 'Thất bại'); return; }
      document.cookie = 'jotun_admin=1; path=/; max-age=43200';
      router.push(j.user?.role === 'admin' ? '/dashboard' : '/cua-hang');
      router.refresh();
    } catch { setErr('Lỗi mạng, thử lại'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 w-full max-w-md">
        <div className="flex justify-center"><Logo height={52} /></div>
        <div className="text-5xl text-center mt-2">{tab === 'login' ? '🔐' : '📝'}</div>
        <h1 className="text-2xl font-black text-center mt-2">{tab === 'login' ? 'Đăng nhập' : 'Đăng ký khách hàng'}</h1>
        <p className="text-center text-sm text-slate-500">Mua sơn COD — nhận hàng mới trả tiền</p>
        <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setTab('login')} className={`py-2 rounded-lg font-bold text-sm ${tab === 'login' ? 'bg-white shadow' : ''}`}>Đăng nhập</button>
          <button onClick={() => setTab('register')} className={`py-2 rounded-lg font-bold text-sm ${tab === 'register' ? 'bg-white shadow' : ''}`}>Đăng ký</button>
        </div>
        <form onSubmit={submit} className="space-y-2 mt-4">
          {tab === 'register' && <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Họ tên *" className="w-full border rounded-xl px-4 py-3" />}
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email *" className="w-full border rounded-xl px-4 py-3" />
          {tab === 'register' && (<>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="SĐT" className="border rounded-xl px-4 py-3" />
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ" className="border rounded-xl px-4 py-3" />
            </div>
          </>)}
          <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" placeholder="Mật khẩu *" className="w-full border rounded-xl px-4 py-3" />
          {err && <div className="text-red-600 text-sm font-bold">{err}</div>}
          <button disabled={loading} className="w-full gradient-jotun text-white py-3 rounded-2xl font-bold disabled:opacity-50">
            {loading ? '⏳...' : tab === 'login' ? 'Đăng nhập' : 'Đăng ký & mua ngay'}
          </button>
        </form>
        <Link href="/" className="block text-center text-sm text-jotun-600 font-bold mt-3 hover:underline">← Về trang chủ mua hàng</Link>
      </motion.div>
    </div>
  );
}
