import Image from 'next/image';
import { cn } from '@/lib/utils';

// Logo Jotun chính hãng dạng vector (public/jotun-logo.svg) — nét ở mọi kích thước, không vỡ
export default function Logo({ className, imgClassName, height = 30 }: { className?: string; imgClassName?: string; height?: number }) {
  return (
    <span className={cn('inline-flex items-center justify-center bg-white rounded-lg px-1.5 py-0.5 shrink-0', className)}>
      <Image src="/jotun-logo.svg" alt="Jotun" width={Math.round(height * 2.55)} height={height} className={cn('object-contain', imgClassName)} style={{ height, width: 'auto' }} priority />
    </span>
  );
}
