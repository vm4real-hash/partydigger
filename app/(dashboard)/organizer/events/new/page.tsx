'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import type { MusicGenre, EventType } from '@/lib/types'
import { GENRE_LABELS, EVENT_TYPE_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar, ArrowLeft, Users, Euro } from 'lucide-react'
import Link from 'next/link'

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const ALL_GENRES = Object.entries(GENRE_LABELS) as [MusicGenre, string][]

export default function NewEventPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    type: 'concert' as EventType,
    description: '',
    date_start: '',
    date_end: '',
    looking_for_artists: false,
    slots_available: 1,
    genres_wanted: [] as MusicGenre[],
    application_deadline: '',
    fee_offered: 0,
    fee_description: '',
    ticket_url: '',
    is_free: false,
    expected_audience: 0,
  })

  const toggleGenre = (g: MusicGenre) => {
    setForm(prev => ({
      ...prev,
      genres_wanted: prev.genres_wanted.includes(g)
        ? prev.genres_wanted.filter(x => x !== g)
        : [...prev.genres_wanted, g],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.date_start) {
      showError('Champs manquants', 'Le titre et la date sont obligatoires.')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get organizer's venue
    const { data: venue } = await supabase
      .from('venues')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    const { error } = await supabase.from('events').insert({
      organizer_id: user.id,
      venue_id: venue?.id || null,
      title: form.title,
      type: form.type,
      description: form.description || null,
      date_start: form.date_start,
      date_end: form.date_end || null,
      status: 'published',
      looking_for_artists: form.looking_for_artists,
      slots_available: form.looking_for_artists ? form.slots_available : 0,
      genres_wanted: form.looking_for_artists ? form.genres_wanted : [],
      application_deadline: form.application_deadline || null,
      fee_offered: form.fee_offered || null,
      fee_description: form.fee_description || null,
      ticket_url: form.ticket_url || null,
      is_free: form.is_free,
      expected_audience: form.expected_audience || null,
    })

    if (error) {
      showError('Erreur', error.message)
    } else {
      success('Événement créé !', "Ton événement est maintenant visible sur PartyDigger.")
      router.push('/organizer/profile')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <Link href="/organizer/profile" className="flex items-center gap-2 text-sm text-[#8888aa] hover:text-[#f0f0ff] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au profil
      </Link>

      <h1 className="text-2xl font-black text-[#f0f0ff] mb-1">Créer un événement</h1>
      <p className="text-sm text-[#8888aa] mb-8">Publie ton événement et trouve des artistes</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Infos de base */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-[#2a2a3a] bg-[#111118]">
          <h2 className="font-bold text-[#f0f0ff] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#7c3aff]" />
            Informations générales
          </h2>
          <Input label="Titre de l'événement *" placeholder="Nom de la soirée, du concert..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          <Select label="Type d'événement" options={EVENT_TYPE_OPTIONS} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as EventType }))} />
          <Textarea label="Description" placeholder="Ambiance, programme, line-up prévu..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date & heure de début *" type="datetime-local" value={form.date_start} onChange={e => setForm(p => ({ ...p, date_start: e.target.value }))} required />
            <Input label="Date & heure de fin" type="datetime-local" value={form.date_end} onChange={e => setForm(p => ({ ...p, date_end: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(p => ({ ...p, is_free: !p.is_free }))}
              className={cn('flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all',
                form.is_free ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]' : 'border-[#2a2a3a] text-[#8888aa]'
              )}>
              {form.is_free ? '✓ Entrée gratuite' : 'Entrée gratuite ?'}
            </button>
            <Input placeholder="URL billetterie" value={form.ticket_url} onChange={e => setForm(p => ({ ...p, ticket_url: e.target.value }))} />
          </div>
          <Input label="Audience attendue" type="number" min={0} placeholder="100" value={form.expected_audience || ''} onChange={e => setForm(p => ({ ...p, expected_audience: +e.target.value }))} icon={<Users className="w-4 h-4" />} />
        </div>

        {/* Recherche d'artistes */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-[#2a2a3a] bg-[#111118]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#f0f0ff]">🎤 Recherche d&apos;artistes</h2>
            <button type="button" onClick={() => setForm(p => ({ ...p, looking_for_artists: !p.looking_for_artists }))}
              className={cn('px-4 py-1.5 rounded-full text-xs font-semibold transition-all border',
                form.looking_for_artists ? 'border-[#7c3aff] bg-[#7c3aff] text-white' : 'border-[#2a2a3a] text-[#8888aa]'
              )}>
              {form.looking_for_artists ? '✓ Activée' : 'Activer'}
            </button>
          </div>

          {form.looking_for_artists && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Places disponibles" type="number" min={1} value={form.slots_available} onChange={e => setForm(p => ({ ...p, slots_available: +e.target.value }))} />
                <Input label="Date limite candidature" type="date" value={form.application_deadline} onChange={e => setForm(p => ({ ...p, application_deadline: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#f0f0ff]/80 mb-2 block">Genres recherchés</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map(([g, label]) => (
                    <button key={g} type="button" onClick={() => toggleGenre(g)}
                      className={cn('px-2.5 py-1 rounded-full text-xs font-semibold transition-all border',
                        form.genres_wanted.includes(g) ? 'bg-[#7c3aff] border-[#7c3aff] text-white' : 'border-[#2a2a3a] text-[#8888aa] hover:border-[#7c3aff]/40'
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Cachet proposé (€)" type="number" min={0} value={form.fee_offered || ''} onChange={e => setForm(p => ({ ...p, fee_offered: +e.target.value }))} icon={<Euro className="w-4 h-4" />} />
                <Input label="Détails rémunération" placeholder="+ défraiement, boissons..." value={form.fee_description} onChange={e => setForm(p => ({ ...p, fee_description: e.target.value }))} />
              </div>
            </>
          )}
        </div>

        <Button type="submit" size="lg" loading={saving} fullWidth>
          Publier l&apos;événement
        </Button>
      </form>
    </div>
  )
}
