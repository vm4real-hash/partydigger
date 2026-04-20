'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import {
  Search, Map, MessageSquare, Bell, Menu, X,
  LogOut, User, LayoutDashboard, Music2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) setProfile(data)

      // Unread messages count
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)
        .neq('sender_id', user.id)
      setUnreadMessages(msgCount || 0)

      // Unread notifications
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setUnreadNotifs(notifCount || 0)
    }

    fetchUser()
  }, [pathname])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const dashboardPath = profile?.role === 'artist'
    ? '/artist/profile'
    : profile?.role === 'organizer'
    ? '/organizer/profile'
    : '/admin'

  const navLinks = [
    { href: '/explore', label: 'Explorer', icon: Search },
    { href: '/explore/events', label: 'Événements', icon: Map },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-[#2a2a3a]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aff] to-[#ff3a8c] flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight gradient-text">PartyDigger</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-[#7c3aff]/15 text-[#9b60ff]'
                    : 'text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a24]'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {profile ? (
              <>
                {/* Messages */}
                <Link href="/messages" className="relative p-2 rounded-lg text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a24] transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff3a8c] rounded-full" />
                  )}
                </Link>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a24] transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#7c3aff] rounded-full text-[9px] font-bold text-white flex items-center justify-center px-1">
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[#1a1a24] transition-colors"
                  >
                    <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
                    <span className="hidden md:block text-sm font-medium text-[#f0f0ff] max-w-[120px] truncate">
                      {profile.full_name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-12 z-20 w-52 bg-[#111118] border border-[#2a2a3a] rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-3 border-b border-[#2a2a3a]">
                          <p className="text-sm font-semibold text-[#f0f0ff] truncate">{profile.full_name}</p>
                          <p className="text-xs text-[#8888aa] capitalize">{profile.role}</p>
                        </div>
                        <div className="p-1.5 flex flex-col gap-0.5">
                          <Link
                            href={dashboardPath}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#f0f0ff] hover:bg-[#1a1a24] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#8888aa]" />
                            Mon espace
                          </Link>
                          <Link
                            href={dashboardPath}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#f0f0ff] hover:bg-[#1a1a24] transition-colors"
                          >
                            <User className="w-4 h-4 text-[#8888aa]" />
                            Mon profil
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Se déconnecter
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button size="sm">Rejoindre</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu btn */}
            <button
              className="md:hidden p-2 rounded-lg text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a24] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#2a2a3a] bg-[#0a0a0f] p-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-[#7c3aff]/15 text-[#9b60ff]'
                    : 'text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a24]'
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            {!profile && (
              <div className="pt-3 border-t border-[#2a2a3a] mt-2 flex gap-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" fullWidth size="sm">Connexion</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button fullWidth size="sm">Rejoindre</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
