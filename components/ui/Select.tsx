'use client'

import { cn } from '@/lib/utils'
import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#f0f0ff]/80">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[#1a1a24] border rounded-lg pl-3.5 pr-9 py-2.5 text-sm text-[#f0f0ff] transition-all outline-none appearance-none cursor-pointer',
              error ? 'border-[#ef4444]' : 'border-[#2a2a3a] focus:border-[#7c3aff] focus:shadow-[0_0_0_3px_rgba(124,58,255,0.15)]',
              className
            )}
            {...props}
          >
            {placeholder && <option value="" className="text-[#4a4a6a]">{placeholder}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#8888aa]">{hint}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
