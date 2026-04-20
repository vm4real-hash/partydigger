import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'accent' | 'neon' | 'success' | 'warning' | 'error' | 'ghost'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'ghost', size = 'md', className }: BadgeProps) {
  const variants = {
    primary: 'bg-[#7c3aff]/20 text-[#9b60ff] border border-[#7c3aff]/30',
    accent: 'bg-[#ff3a8c]/20 text-[#ff6aaa] border border-[#ff3a8c]/30',
    neon: 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30',
    success: 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30',
    warning: 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30',
    error: 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30',
    ghost: 'bg-[#1a1a24] text-[#8888aa] border border-[#2a2a3a]',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-semibold rounded-full uppercase tracking-wider',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}
