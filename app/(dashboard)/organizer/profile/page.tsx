'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import type { Profile, Venue, VenueType, MusicGenre, AccountStatus } from '@/lib/types'
import { GENRE_LABELS, VENUE_TYPE_LABELS } from '@/lib/types'
import { Edit3, Save, MapPin, Phone, Mail, AtSign, Globe, Plus, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const VENUE_OPTIONS = Object.entries(VENUE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const ALL_GENRES = Object.entries(GENRE_LABELS) as [MusicGenre, string][]

const STATUS_INFO: Record<AccountStatus, { label: string; variant: 'warning' | 'success' | 'error' | 'ghost'; text: string }> = {
  pending: { label: 'En attente de validation', variant: 'warning', text: 'Ton compte est en cours de validation par notre équipe.' },
  active: { label: 'Compte actif', variant: 'success', text: 'Ton compte est validé. Tu peux gérer tes événements.' },
  rejected: { label: 'Compte refusé', variant: 'error', text: 'Contacte-nous pour plus d\'informations.' },
  suspended: { label: 'Compte suspendu', variant: 'error', text: 'Ton compte a été suspendu.' },
}

export default function OrganizerProfilePage() {
  const { success, error: showError } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [venue, setVenue] = useState<Venue | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    city: 'Toulouse',
    instagram_handle: '',
    facebook_url: '',
    website_url: '',
    phone: '',
    email_contact: '',
    venue_name: '',
    venue_type: 'bar' as VenueType,
    venue_description: '',
    venue_address: '',
    venue_capacity: 0,
    venue_accepted_genres: [] as MusicGenre[],
    venue_has_stage: false,
    venue_has_sound_system: false,
    venue_has_lighting: false,
    venue_min_fee: 0,
    venue_max_fee: 0,
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: p }, { data: v }, { data: ev }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('venues').select('*').eq('owner_id', user.id).single(),
        supabase.from('events').select('*, applications(count)').eq('organizer_id', user.id).order('date_start', { ascending: false }).limit(5),
      ])

      if (p) {
        setProfile(p)
        setForm(prev => ({
          ...prev,
          full_name: p.full_name || '',
          bio: p.bio || '',
          city: p.city || 'Toulouse',
          instagram_handle: p.instagram_handle || '',
          facebook_url: p.facebook_url || '',
          website_url: p.website_url || '',
          phone: p.phone || '',
          email_contact: p.email_contact || '',
        }))
      }

      if (v) {
        setVenue(v)
        setForm(prev => ({
          ...prev,
          venue_name: v.name || '',
          venue_type: v.type || 'bar',
          venue_description: v.description || '',
          venue_address: v.address || '',
          venue_capacity: v.capacity || 0,
          venue_accepted_genres: v.accepted_genres || [],
          venue_has_stage: v.has_stage || false,
          venue_has_sound_system: v.has_sound_system || false,
          venue_has_lighting: v.has_lighting || false,
          venue_min_fee: v.min_fee_offered || 0,
          venue_max_fee: v.max_fee_offered || 0,
        }))
      }

      setEvents(ev || [])
      setLoading(false)
    }
    load()
  }, [])

  const toggleGenre = (g: MusicGenre) => {
    setForm(prev => ({
      ...prev,
      venue_accepted_genres: prev.venue_accepted_genres.includes(g)
        ? prev.venue_accepted_genres.filter(x => x !== g)
        : [...prev.venue_accepted_genres, g],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      full_name: form.full_name,
      bio: form.bio,
      city: form.city,
      instagram_handle: form.instagram_handle || null,
      facebook_url: form.facebook_url || null,
      website_url: form.website_url || null,
      phone: form.phone || null,
      email_contact: form.email_contact || null,
    }).eq('id', user.id)

    const venueData = {
      owner_id: user.id,
      name: form.venue_name,
      type: form.venue_type,
      description: form.venue_description || null,
      address: form.venue_address,
      city: form.city,
      capacity: form.venue_capacity || null,
      accepted_genres: form.venue_accepted_genres,
      has_stage: form.venue_has_stage,
      has_sound_system: form.venue_has_sound_system,
      has_lighting: form.venue_has_lighting,
      min_fee_offered: form.venue_min_fee || null,
      max_fee_offered: form.venue_max_fee || null,
    }

    if (venue) {
      await supabase.from('venues').update(venueData).eq('id', venue.id)
    } else if (form.venue_name) {
      await supabase.from('venues').insert(venueData)
    }

    success('Profil mis à jour !', 'Tes informations ont été sauvegardées.')
    setEditing(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7c3aff]/30 border-t-[#7c3aff] rounded-full animate-spin" />
      </div>
    )
  }

  const statusInfo = STATUS_INFO[profile?.status || 'pending']

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#f0f0ff]">Mon espace organisateur</h1>
          <p className="text-sm text-[#8888aa] mt-1">Gère ton profil, ton lieu et tes événements</p>
        </div>
        {profile?.status === 'active' && (
          editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
              <Button size="sm" loading={saving} onClick={handleSave} className="gap-1.5">
                <Save className="w-4 h-4" />Sauvegarder
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
              <Edit3 className="w-4 h-4" />Modifier
            </Button>
          )
        )}
      </div>

      {/* Status badge */}
      <div className={`rounded-xl border p-4 mb-6 ${
        statusInfo.variant === 'success' ? 'border-[#22c55e]/30 bg-[#22c55e]/5' :
        statusInfo.variant === 'warning' ? 'border-[#f59e0b]/30 bg-[#f59e0b]/5' :
        'border-[#ef4444]/30 bg-[#ef4444]/5'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
        <p className="text-sm text-[#8888aa]">{statusInfo.text}</p>
      </div>

      {/* Profil de base */}
      <Card className="mb-4">
        <CardBody>
          <div className="flex items-center gap-4">
            <Avatar src={profile?.avatar_url} name={form.full_name || 'Organisateur'} size="xl" />
            <div className="flex-1">
              {editing ? (
                <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Nom / Nom de l'organisation" />
              ) : (
                <>
                  <h2 className="text-xl font-black text-[#f0f0ff]">{profile?.full_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#7c3aff]" />
                    <span className="text-sm text-[#8888aa]">{profile?.city || 'Toulouse'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {editing && (
            <div className="mt-3 flex flex-col gap-3">
              <Textarea label="Bio" placeholder="Décris ton activité, tes événements passés..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} />
              <Input label="Ville" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              <Input label="Instagram" placeholder="@handle" value={form.instagram_handle} onChange={e => setForm(p => ({ ...p, instagram_handle: e.target.value }))} icon={<AtSign className="w-4 h-4" />} />
              <Input label="Site web" placeholder="https://..." value={form.website_url} onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))} icon={<Globe className="w-4 h-4" />} />
              <Input label="Email" type="email" value={form.email_contact} onChange={e => setForm(p => ({ ...p, email_contact: e.target.value }))} icon={<Mail className="w-4 h-4" />} />
              <Input label="Téléphone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} icon={<Phone className="w-4 h-4" />} />
            </div>
          )}
          {!editing && (
            <div className="flex flex-wrap gap-3 mt-3">
              {form.instagram_handle && <span className="flex items-center gap-1.5 text-sm text-[#8888aa]"><AtSign className="w-3.5 h-3.5 text-[#ff3a8c]" />@{form.instagram_handle}</span>}
              {form.email_contact && <span className="flex items-center gap-1.5 text-sm text-[#8888aa]"><Mail className="w-3.5 h-3.5 text-[#7c3aff]" />{form.email_contact}</span>}
              {form.phone && <span className="flex items-center gap-1.5 text-sm text-[#8888aa]"><Phone className="w-3.5 h-3.5 text-[#f59e0b]" />{form.phone}</span>}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Lieu */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#f0f0ff]">Mon lieu</h3>
            {venue?.is_verified && <Badge variant="success">Vérifié</Badge>}
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {editing ? (
            <>
              <Input label="Nom du lieu" placeholder="Le nom de ton bar, salle, club..." value={form.venue_name} onChange={e => setForm(p => ({ ...p, venue_name: e.target.value }))} />
              <Select label="Type de lieu" options={VENUE_OPTIONS} value={form.venue_type} onChange={e => setForm(p => ({ ...p, venue_type: e.target.value as VenueType }))} />
              <Input label="Adresse" placeholder="Rue, quartier, ville..." value={form.venue_address} onChange={e => setForm(p => ({ ...p, venue_address: e.target.value }))} icon={<MapPin className="w-4 h-4" />} />
              <Input label="Capacité (personnes)" type="number" min={0} value={form.venue_capacity} onChange={e => setForm(p => ({ ...p, venue_capacity: +e.target.value }))} icon={<Users className="w-4 h-4" />} />
              <Textarea label="Description du lieu" placeholder="Ambiance, équipements, particularités..." value={form.venue_description} onChange={e => setForm(p => ({ ...p, venue_description: e.target.value }))} rows={3} />
              <div>
                <label className="text-sm font-medium text-[#f0f0ff]/80 mb-2 block">Genres acceptés</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map(([g, label]) => (
                    <button key={g} type="button" onClick={() => toggleGenre(g)}
                      className={cn('px-2.5 py-1 rounded-full text-xs font-semibold transition-all border',
                        form.venue_accepted_genres.includes(g) ? 'bg-[#7c3aff] border-[#7c3aff] text-white' : 'border-[#2a2a3a] text-[#8888aa] hover:border-[#7c3aff]/40'
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Cachet min proposé (€)" type="number" min={0} value={form.venue_min_fee} onChange={e => setForm(p => ({ ...p, venue_min_fee: +e.target.value }))} />
                <Input label="Cachet max proposé (€)" type="number" min={0} value={form.venue_max_fee} onChange={e => setForm(p => ({ ...p, venue_max_fee: +e.target.value }))} />
              </div>
              <div className="flex gap-2">
                {[
                  { key: 'venue_has_stage', label: 'Scène' },
                  { key: 'venue_has_sound_system', label: 'Sonorisation' },
                  { key: 'venue_has_lighting', label: 'Lumières' },
                ].map(item => (
                  <button key={item.key} type="button"
                    onClick={() => setForm(p => ({ ...p, [item.key]: !p[item.key as keyof typeof form] }))}
                    className={cn('flex-1 py-2 rounded-lg border text-xs font-semibold transition-all',
                      form[item.key as keyof typeof form] ? 'border-[#7c3aff] bg-[#7c3aff]/10 text-[#9b60ff]' : 'border-[#2a2a3a] text-[#8888aa]'
                    )}>
                    {form[item.key as keyof typeof form] ? '✓' : ''} {item.label}
                  </button>
                ))}
              </div>
            </>
          ) : venue ? (
            <>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-[#f0f0ff]">{venue.name}</h4>
                  <p className="text-xs text-[#7c3aff] font-semibold uppercase mt-0.5">{VENUE_TYPE_LABELS[venue.type]}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8888aa]" />
                <span className="text-sm text-[#8888aa]">{venue.address}</span>
              </div>
              {venue.description && <p className="text-sm text-[#f0f0ff]/80">{venue.description}</p>}
              <div className="flex flex-wrap gap-1.5">
                {venue.has_stage && <Badge variant="primary" size="sm">Scène</Badge>}
                {venue.has_sound_system && <Badge variant="primary" size="sm">Son</Badge>}
                {venue.has_lighting && <Badge variant="primary" size="sm">Lumières</Badge>}
                {venue.capacity && <Badge variant="ghost" size="sm">{venue.capacity} pers.</Badge>}
              </div>
              {(venue.accepted_genres || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(venue.accepted_genres || []).map((g: MusicGenre) => (
                    <Badge key={g} variant="ghost" size="sm">{GENRE_LABELS[g]}</Badge>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[#4a4a6a]">Aucun lieu renseigné. Clique sur Modifier pour ajouter ton lieu.</p>
          )}
        </CardBody>
      </Card>

      {/* Événements */}
      {profile?.status === 'active' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#f0f0ff]">Mes événements récents</h3>
              <Link href="/organizer/events/new">
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Créer
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {events.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-[#2a2a3a] mx-auto mb-2" />
                <p className="text-sm text-[#4a4a6a]">Aucun événement créé.</p>
                <Link href="/organizer/events/new" className="inline-block mt-3">
                  <Button size="sm">Créer mon premier événement</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {events.map((ev: any) => (
                  <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a24]">
                    <div>
                      <p className="text-sm font-semibold text-[#f0f0ff]">{ev.title}</p>
                      <p className="text-xs text-[#8888aa]">{new Date(ev.date_start).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ev.looking_for_artists && <Badge variant="neon" size="sm">Recrute</Badge>}
                      <Badge variant="ghost" size="sm">{ev.applications?.[0]?.count || 0} cand.</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
