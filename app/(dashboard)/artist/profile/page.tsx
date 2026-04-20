'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import type { Profile, ArtistProfile, MusicGenre } from '@/lib/types'
import { GENRE_LABELS } from '@/lib/types'
import {
  Music2, Edit3, Save, AtSign, Globe, Phone,
  Mail, MapPin, Clock, Users, Mic2, Link2,
  CheckCircle, AlertCircle, Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ALL_GENRES = Object.entries(GENRE_LABELS) as [MusicGenre, string][]

export default function ArtistProfilePage() {
  const { success, error: showError } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    city: '',
    instagram_handle: '',
    facebook_url: '',
    website_url: '',
    phone: '',
    email_contact: '',
    stage_name: '',
    genres: [] as MusicGenre[],
    subgenres: '',
    experience_years: 0,
    typical_setlength_min: 30,
    min_fee: 0,
    max_fee: 0,
    fee_negotiable: true,
    has_own_equipment: false,
    equipment_details: '',
    num_members: 1,
    promo_text: '',
    audio_links: '',
    video_links: '',
    press_kit_url: '',
    notable_events: '',
    available: true,
  })

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: p }, { data: ap }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('artist_profiles').select('*').eq('id', user.id).single(),
      ])

      if (p) {
        setProfile(p)
        setForm(prev => ({
          ...prev,
          full_name: p.full_name || '',
          bio: p.bio || '',
          city: p.city || '',
          instagram_handle: p.instagram_handle || '',
          facebook_url: p.facebook_url || '',
          website_url: p.website_url || '',
          phone: p.phone || '',
          email_contact: p.email_contact || '',
        }))
      }

      if (ap) {
        setArtistProfile(ap)
        setForm(prev => ({
          ...prev,
          stage_name: ap.stage_name || '',
          genres: ap.genres || [],
          subgenres: ap.subgenres || '',
          experience_years: ap.experience_years || 0,
          typical_setlength_min: ap.typical_setlength_min || 30,
          min_fee: ap.min_fee || 0,
          max_fee: ap.max_fee || 0,
          fee_negotiable: ap.fee_negotiable ?? true,
          has_own_equipment: ap.has_own_equipment || false,
          equipment_details: ap.equipment_details || '',
          num_members: ap.num_members || 1,
          promo_text: ap.promo_text || '',
          audio_links: (ap.audio_links || []).join('\n'),
          video_links: (ap.video_links || []).join('\n'),
          press_kit_url: ap.press_kit_url || '',
          notable_events: ap.notable_events || '',
          available: ap.available ?? true,
        }))
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const toggleGenre = (g: MusicGenre) => {
    setForm(prev => ({
      ...prev,
      genres: prev.genres.includes(g)
        ? prev.genres.filter(x => x !== g)
        : [...prev.genres, g],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('profiles').update({
        full_name: form.full_name,
        bio: form.bio,
        city: form.city,
        instagram_handle: form.instagram_handle || null,
        facebook_url: form.facebook_url || null,
        website_url: form.website_url || null,
        phone: form.phone || null,
        email_contact: form.email_contact || null,
      }).eq('id', user.id),

      supabase.from('artist_profiles').upsert({
        id: user.id,
        stage_name: form.stage_name || form.full_name,
        genres: form.genres,
        subgenres: form.subgenres || null,
        experience_years: form.experience_years,
        typical_setlength_min: form.typical_setlength_min,
        min_fee: form.min_fee,
        max_fee: form.max_fee,
        fee_negotiable: form.fee_negotiable,
        has_own_equipment: form.has_own_equipment,
        equipment_details: form.equipment_details || null,
        num_members: form.num_members,
        promo_text: form.promo_text || null,
        audio_links: form.audio_links ? form.audio_links.split('\n').filter(Boolean) : [],
        video_links: form.video_links ? form.video_links.split('\n').filter(Boolean) : [],
        press_kit_url: form.press_kit_url || null,
        notable_events: form.notable_events || null,
        available: form.available,
      }),
    ])

    if (e1 || e2) {
      showError('Erreur', 'Impossible de sauvegarder.')
    } else {
      success('Profil mis à jour !', 'Tes informations ont été sauvegardées.')
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7c3aff]/30 border-t-[#7c3aff] rounded-full animate-spin" />
      </div>
    )
  }

  const completionFields = [
    form.bio, form.genres.length > 0, form.instagram_handle,
    form.promo_text, form.audio_links, form.stage_name,
  ]
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#f0f0ff]">Mon profil artiste</h1>
          <p className="text-sm text-[#8888aa] mt-1">Rends ton profil le plus complet possible</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
            <Button size="sm" loading={saving} onClick={handleSave} className="gap-1.5">
              <Save className="w-4 h-4" />
              Sauvegarder
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
            <Edit3 className="w-4 h-4" />
            Modifier
          </Button>
        )}
      </div>

      {/* Completion bar */}
      <div className="glass-card p-4 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#f0f0ff]">Complétude du profil</span>
            <span className={cn(
              'text-sm font-bold',
              completion >= 80 ? 'text-[#22c55e]' : completion >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
            )}>{completion}%</span>
          </div>
          <div className="h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completion}%`,
                background: completion >= 80 ? '#22c55e' : completion >= 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>
        {completion >= 80 ? (
          <CheckCircle className="w-6 h-6 text-[#22c55e] flex-shrink-0" />
        ) : (
          <AlertCircle className="w-6 h-6 text-[#f59e0b] flex-shrink-0" />
        )}
      </div>

      {/* Avatar + nom de scène */}
      <Card className="mb-4">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar src={profile?.avatar_url} name={form.full_name || 'Artiste'} size="xl" />
              {editing && (
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#7c3aff] rounded-full flex items-center justify-center border-2 border-[#111118]">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Nom de scène"
                    value={form.stage_name}
                    onChange={e => setForm(p => ({ ...p, stage_name: e.target.value }))}
                  />
                  <Input
                    placeholder="Nom complet"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-[#f0f0ff]">
                    {artistProfile?.stage_name || profile?.full_name}
                  </h2>
                  <p className="text-sm text-[#8888aa]">{profile?.full_name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7c3aff]" />
                    <span className="text-sm text-[#8888aa]">{profile?.city || 'Toulouse'}</span>
                    <Badge variant={form.available ? 'success' : 'ghost'} size="sm">
                      {form.available ? 'Disponible' : 'Non dispo'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Genres musicaux */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#7c3aff]" />
            <h3 className="font-bold text-[#f0f0ff]">Genres musicaux</h3>
          </div>
        </CardHeader>
        <CardBody>
          {editing ? (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {ALL_GENRES.map(([g, label]) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
                      form.genres.includes(g)
                        ? 'bg-[#7c3aff] border-[#7c3aff] text-white'
                        : 'bg-transparent border-[#2a2a3a] text-[#8888aa] hover:border-[#7c3aff]/40'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Sous-genres, précisions... (optionnel)"
                value={form.subgenres}
                onChange={e => setForm(p => ({ ...p, subgenres: e.target.value }))}
              />
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {form.genres.length > 0 ? form.genres.map(g => (
                <Badge key={g} variant="primary">{GENRE_LABELS[g]}</Badge>
              )) : (
                <p className="text-sm text-[#4a4a6a]">Aucun genre sélectionné</p>
              )}
              {form.subgenres && (
                <span className="text-sm text-[#8888aa]">· {form.subgenres}</span>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Bio & promo */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-[#ff3a8c]" />
            <h3 className="font-bold text-[#f0f0ff]">Bio & présentation</h3>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {editing ? (
            <>
              <Textarea
                label="Bio (courte)"
                placeholder="Qui tu es, ton histoire, ton style..."
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3}
              />
              <Textarea
                label="Texte promo (pour les organisateurs)"
                placeholder="Pourquoi t'inviter ? Qu'est-ce que tu apportes ? Donne envie..."
                value={form.promo_text}
                onChange={e => setForm(p => ({ ...p, promo_text: e.target.value }))}
                rows={4}
                hint="Ce texte sera vu par les organisateurs sur ton profil public"
              />
              <Textarea
                label="Événements notables"
                placeholder="Festivals, concerts passés, collaborations importantes..."
                value={form.notable_events}
                onChange={e => setForm(p => ({ ...p, notable_events: e.target.value }))}
                rows={2}
              />
            </>
          ) : (
            <>
              {form.bio && <p className="text-sm text-[#f0f0ff]/80 leading-relaxed">{form.bio}</p>}
              {form.promo_text && (
                <div className="border-l-2 border-[#7c3aff] pl-4">
                  <p className="text-xs text-[#8888aa] mb-1 uppercase tracking-wider font-semibold">Texte promo</p>
                  <p className="text-sm text-[#f0f0ff]/80 leading-relaxed">{form.promo_text}</p>
                </div>
              )}
              {form.notable_events && (
                <div>
                  <p className="text-xs text-[#8888aa] mb-1 uppercase tracking-wider font-semibold">Références</p>
                  <p className="text-sm text-[#f0f0ff]/80">{form.notable_events}</p>
                </div>
              )}
              {!form.bio && !form.promo_text && (
                <p className="text-sm text-[#4a4a6a]">Pas encore de bio. Clique sur Modifier !</p>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Infos pratiques */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00e5ff]" />
            <h3 className="font-bold text-[#f0f0ff]">Infos pratiques</h3>
          </div>
        </CardHeader>
        <CardBody>
          {editing ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expérience (années)"
                type="number"
                min={0}
                value={form.experience_years}
                onChange={e => setForm(p => ({ ...p, experience_years: +e.target.value }))}
              />
              <Input
                label="Durée set (min)"
                type="number"
                min={15}
                value={form.typical_setlength_min}
                onChange={e => setForm(p => ({ ...p, typical_setlength_min: +e.target.value }))}
              />
              <Input
                label="Cachet min (€)"
                type="number"
                min={0}
                value={form.min_fee}
                onChange={e => setForm(p => ({ ...p, min_fee: +e.target.value }))}
              />
              <Input
                label="Cachet max (€)"
                type="number"
                min={0}
                value={form.max_fee}
                onChange={e => setForm(p => ({ ...p, max_fee: +e.target.value }))}
              />
              <Input
                label="Nombre de membres"
                type="number"
                min={1}
                value={form.num_members}
                onChange={e => setForm(p => ({ ...p, num_members: +e.target.value }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#f0f0ff]/80">Matériel</label>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, has_own_equipment: !p.has_own_equipment }))}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    form.has_own_equipment
                      ? 'border-[#7c3aff] bg-[#7c3aff]/10 text-[#9b60ff]'
                      : 'border-[#2a2a3a] text-[#8888aa]'
                  )}
                >
                  {form.has_own_equipment ? '✓ Matériel propre' : 'Sans matériel'}
                </button>
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, fee_negotiable: !p.fee_negotiable }))}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                    form.fee_negotiable
                      ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                      : 'border-[#2a2a3a] text-[#8888aa]'
                  )}
                >
                  {form.fee_negotiable ? '✓ Cachet négociable' : 'Cachet fixe'}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, available: !p.available }))}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                    form.available
                      ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                      : 'border-[#2a2a3a] text-[#8888aa]'
                  )}
                >
                  {form.available ? '✓ Disponible' : 'Non disponible'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Clock, label: 'Expérience', val: `${form.experience_years} an${form.experience_years > 1 ? 's' : ''}` },
                { icon: Mic2, label: 'Durée set', val: `${form.typical_setlength_min} min` },
                { icon: Users, label: 'Membres', val: `${form.num_members} pers.` },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1a1a24]">
                  <item.icon className="w-4 h-4 text-[#7c3aff]" />
                  <div>
                    <p className="text-xs text-[#8888aa]">{item.label}</p>
                    <p className="text-sm font-bold text-[#f0f0ff]">{item.val}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1a1a24]">
                <span className="text-base">💰</span>
                <div>
                  <p className="text-xs text-[#8888aa]">Cachet</p>
                  <p className="text-sm font-bold text-[#f0f0ff]">
                    {form.min_fee === 0 && form.max_fee === 0 ? 'À discuter' : `${form.min_fee}–${form.max_fee}€`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Liens & médias */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="font-bold text-[#f0f0ff]">Liens & médias</h3>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {editing ? (
            <>
              <Input
                label="Instagram"
                placeholder="@tonhandle (sans @)"
                value={form.instagram_handle}
                onChange={e => setForm(p => ({ ...p, instagram_handle: e.target.value }))}
                icon={<AtSign className="w-4 h-4" />}
              />
              <Input
                label="Site web / Linktree"
                placeholder="https://..."
                value={form.website_url}
                onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))}
                icon={<Globe className="w-4 h-4" />}
              />
              <Input
                label="Kit de presse (URL)"
                placeholder="Google Drive, Notion, PDF..."
                value={form.press_kit_url}
                onChange={e => setForm(p => ({ ...p, press_kit_url: e.target.value }))}
              />
              <Textarea
                label="Liens audio (1 par ligne)"
                placeholder="Spotify, SoundCloud, YouTube..."
                value={form.audio_links}
                onChange={e => setForm(p => ({ ...p, audio_links: e.target.value }))}
                rows={3}
              />
              <Textarea
                label="Liens vidéo (1 par ligne)"
                placeholder="YouTube, Instagram Reels, TikTok..."
                value={form.video_links}
                onChange={e => setForm(p => ({ ...p, video_links: e.target.value }))}
                rows={3}
              />
              <Input
                label="Email de contact"
                type="email"
                value={form.email_contact}
                onChange={e => setForm(p => ({ ...p, email_contact: e.target.value }))}
                icon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Téléphone"
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                icon={<Phone className="w-4 h-4" />}
              />
            </>
          ) : (
            <div className="flex flex-col gap-2">
              {[
                { icon: AtSign, label: form.instagram_handle ? `@${form.instagram_handle}` : null, color: 'text-[#ff3a8c]' },
                { icon: Globe, label: form.website_url, color: 'text-[#00e5ff]' },
                { icon: Mail, label: form.email_contact, color: 'text-[#7c3aff]' },
                { icon: Phone, label: form.phone, color: 'text-[#f59e0b]' },
              ].filter(i => i.label).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-[#f0f0ff]">{item.label}</span>
                </div>
              ))}
              {!form.instagram_handle && !form.website_url && !form.email_contact && (
                <p className="text-sm text-[#4a4a6a]">Aucun lien renseigné</p>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Candidatures rapides */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f0f0ff]">Mes candidatures</p>
          <p className="text-xs text-[#8888aa]">Voir toutes tes candidatures en cours</p>
        </div>
        <a href="/artist/candidatures">
          <Button size="sm" variant="outline">Voir →</Button>
        </a>
      </div>
    </div>
  )
}
