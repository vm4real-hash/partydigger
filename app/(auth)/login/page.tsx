'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Music2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      showError('Connexion impossible', error.message.includes('Invalid') ? 'Email ou mot de passe incorrect.' : error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single()

      success('Connexion réussie', 'Bienvenue sur PartyDigger !')

      if (profile?.role === 'admin') {
        router.push('/admin')
      } else if (profile?.role === 'artist') {
        router.push('/artist/profile')
      } else if (profile?.role === 'organizer') {
        router.push('/organizer/profile')
      } else {
        router.push('/')
      }
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 animated-gradient">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#7c3aff]/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-[#ff3a8c]/10 rounded-full blur-[70px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aff] to-[#ff3a8c] flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl gradient-text">PartyDigger</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-black text-[#f0f0ff] mb-1">Connexion</h1>
          <p className="text-sm text-[#8888aa] mb-6">Content de te revoir 👋</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#f0f0ff]/80">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f0ff] placeholder:text-[#4a4a6a] transition-all outline-none focus:border-[#7c3aff] focus:shadow-[0_0_0_3px_rgba(124,58,255,0.15)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} fullWidth className="mt-2">
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm text-[#8888aa] mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-[#9b60ff] hover:text-[#7c3aff] font-semibold transition-colors">
              Rejoindre
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
