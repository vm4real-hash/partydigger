'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Music2, Mic2, Building2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success, error: showError } = useToast()

  const defaultRole = (searchParams.get('role') as UserRole) || 'artist'
  const [role, setRole] = useState<'artist' | 'organizer'>(defaultRole === 'organizer' ? 'organizer' : 'artist')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    city: 'Toulouse',
    bio: '',
    instagram_handle: '',
    phone: '',
    // Artist specific
    stage_name: '',
    // Organizer specific
    organization_name: '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (step === 1) {
      if (!form.full_name || !form.email || !form.password) return
      if (form.password.length < 6) {
        showError('Mot de passe trop court', 'Minimum 6 caractères.')
        return
      }
      setStep(2)
      return
    }

    setLoading(true)
    const supabase = createClient()

    // 1. Créer le compte auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError || !authData.user) {
      showError('Erreur inscription', authError?.message || 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    // 2. Créer le profil
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      role,
      status: role === 'organizer' ? 'pending' : 'active',
      full_name: form.full_name,
      city: form.city,
      bio: form.bio || null,
      instagram_handle: form.instagram_handle || null,
      phone: form.phone || null,
      email_contact: form.email,
    })

    if (profileError) {
      showError('Erreur profil', profileError.message)
      setLoading(false)
      return
    }

    // 3. Créer profil artiste si besoin
    if (role === 'artist') {
      await supabase.from('artist_profiles').insert({
        id: authData.user.id,
        stage_name: form.stage_name || form.full_name,
        genres: [],
      })
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-[#22c55e]" />
        </div>
        <h2 className="text-2xl font-black text-[#f0f0ff] mb-2">
          {role === 'organizer' ? 'Demande envoyée !' : 'Compte créé !'}
        </h2>
        <p className="text-[#8888aa] text-sm mb-6">
          {role === 'organizer'
            ? "Ta demande est en cours de validation. Tu recevras un email dès que ton compte organisateur sera approuvé."
            : "Bienvenue sur PartyDigger ! Complète ton profil pour te démarquer."}
        </p>
        {role === 'artist' ? (
          <Button onClick={() => router.push('/login')} fullWidth>
            Se connecter
          </Button>
        ) : (
          <Button onClick={() => router.push('/')} variant="outline" fullWidth>
            Retour à l&apos;accueil
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-8">
      <h1 className="text-2xl font-black text-[#f0f0ff] mb-1">Créer un compte</h1>
      <p className="text-sm text-[#8888aa] mb-6">
        {step === 1 ? 'Étape 1/2 — Infos de connexion' : 'Étape 2/2 — Ton profil'}
      </p>

      {/* Sélecteur de rôle */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {(['artist', 'organizer'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                role === r
                  ? 'border-[#7c3aff] bg-[#7c3aff]/10 text-[#9b60ff]'
                  : 'border-[#2a2a3a] text-[#8888aa] hover:border-[#3a3a50]'
              )}
            >
              {r === 'artist' ? <Mic2 className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
              <span className="text-xs font-semibold">
                {r === 'artist' ? 'Artiste' : 'Organisateur'}
              </span>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        {step === 1 ? (
          <>
            <Input
              label="Nom complet"
              placeholder="Prénom Nom"
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="ton@email.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#f0f0ff]/80">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 caractères"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
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
            <Button type="submit" fullWidth className="mt-2">
              Continuer →
            </Button>
          </>
        ) : (
          <>
            {role === 'artist' && (
              <Input
                label="Nom de scène"
                placeholder="Ton nom d'artiste"
                value={form.stage_name}
                onChange={e => update('stage_name', e.target.value)}
                hint="Laisse vide pour utiliser ton nom complet"
              />
            )}
            <Input
              label="Ville"
              placeholder="Toulouse"
              value={form.city}
              onChange={e => update('city', e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#f0f0ff]/80">Bio courte</label>
              <textarea
                placeholder={role === 'artist' ? 'Décris ton style musical en quelques mots...' : 'Décris ton activité, tes événements...'}
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
                rows={3}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f0ff] placeholder:text-[#4a4a6a] transition-all outline-none focus:border-[#7c3aff] focus:shadow-[0_0_0_3px_rgba(124,58,255,0.15)] resize-none"
              />
            </div>
            <Input
              label="Instagram (optionnel)"
              placeholder="@tonhandle"
              value={form.instagram_handle}
              onChange={e => update('instagram_handle', e.target.value)}
            />
            <Input
              label="Téléphone (optionnel)"
              type="tel"
              placeholder="+33 6 00 00 00 00"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
            />

            {role === 'organizer' && (
              <p className="text-xs text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg p-3">
                ⚡ Les comptes organisateurs sont validés manuellement sous 24h pour garantir la qualité de la plateforme.
              </p>
            )}

            <div className="flex gap-2 mt-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} fullWidth>
                ← Retour
              </Button>
              <Button type="submit" loading={loading} fullWidth>
                {role === 'organizer' ? 'Envoyer la demande' : "Créer mon compte"}
              </Button>
            </div>
          </>
        )}
      </form>

      <p className="text-center text-sm text-[#8888aa] mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-[#9b60ff] hover:text-[#7c3aff] font-semibold transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 animated-gradient">
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#ff3a8c]/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-[#7c3aff]/15 rounded-full blur-[70px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aff] to-[#ff3a8c] flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl gradient-text">PartyDigger</span>
        </div>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
