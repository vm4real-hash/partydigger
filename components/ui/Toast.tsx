'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  const success = useCallback((title: string, message?: string) => toast('success', title, message), [toast])
  const error = useCallback((title: string, message?: string) => toast('error', title, message), [toast])
  const warning = useCallback((title: string, message?: string) => toast('warning', title, message), [toast])
  const info = useCallback((title: string, message?: string) => toast('info', title, message), [toast])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#22c55e]" />,
    error: <XCircle className="w-5 h-5 text-[#ef4444]" />,
    warning: <AlertCircle className="w-5 h-5 text-[#f59e0b]" />,
    info: <Info className="w-5 h-5 text-[#7c3aff]" />,
  }

  const colors = {
    success: 'border-[#22c55e]/30',
    error: 'border-[#ef4444]/30',
    warning: 'border-[#f59e0b]/30',
    info: 'border-[#7c3aff]/30',
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            'flex items-start gap-3 p-4 rounded-xl border bg-[#111118] shadow-2xl',
            'animate-in slide-in-from-right-4 fade-in duration-200',
            colors[t.type]
          )}>
            {icons[t.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#f0f0ff]">{t.title}</p>
              {t.message && <p className="text-xs text-[#8888aa] mt-0.5">{t.message}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="text-[#8888aa] hover:text-[#f0f0ff] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
