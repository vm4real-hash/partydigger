'use client'

import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#f0f0ff]/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-[#1a1a24] border rounded-lg px-3.5 py-2.5 text-sm text-[#f0f0ff] placeholder:text-[#4a4a6a] transition-all outline-none resize-none',
            error ? 'border-[#ef4444] focus:border-[#ef4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : 'border-[#2a2a3a] focus:border-[#7c3aff] focus:shadow-[0_0_0_3px_rgba(124,58,255,0.15)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#8888aa]">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
