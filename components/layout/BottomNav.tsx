'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Calendar, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/explore', label: 'Explorer', icon: Search },
  { href: '/explore/events', label: 'Événements', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/artist/profile', label: 'Profil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-[#2a2a3a] pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors min-w-[60px]',
                active ? 'text-[#9b60ff]' : 'text-[#4a4a6a]'
              )}
            >
              <tab.icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(155,96,255,0.6)]')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-[#7c3aff] absolute bottom-2" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
