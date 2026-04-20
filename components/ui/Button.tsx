'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none'

    const variants = {
      primary: 'bg-[#7c3aff] hover:bg-[#9b60ff] text-white shadow-lg hover:shadow-[0_0_20px_rgba(124,58,255,0.4)] active:scale-[0.98]',
      accent: 'bg-[#ff3a8c] hover:bg-[#ff6aaa] text-white shadow-lg hover:shadow-[0_0_20px_rgba(255,58,140,0.4)] active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-[#1a1a24] text-[#f0f0ff] border border-transparent hover:border-[#2a2a3a]',
      outline: 'bg-transparent border border-[#2a2a3a] hover:border-[#7c3aff] text-[#f0f0ff] hover:text-[#9b60ff]',
      danger: 'bg-[#ef4444] hover:bg-[#f87171] text-white',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Chargement…
          </>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
