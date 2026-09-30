'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-extrabold text-shimmer">{title}</motion.h1>
        {sub && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .1 }} className="text-slate-500 text-sm mt-1">{sub}</motion.p>}
      </div>
      <div className="flex gap-2 no-print">{actions}</div>
    </div>
  );
}
export function StatCard({ label, value, delta, emoji, color }: { label: string; value: string; delta?: string; emoji: string; color: string }) {
  return (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="glass rounded-2xl p-5 card-hover relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 ${color}`} />
      <div className="text-3xl">{emoji}</div>
      <div className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-extrabold text-jotun-900">{value}</div>
      {delta && <div className="text-xs font-bold text-emerald-600 mt-1">{delta}</div>}
    </motion.div>
  );
}
