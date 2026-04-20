'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import type { Event, EventType, MusicGenre, Profile } from '@/lib/types'
import { GENRE_LABELS, EVENT_TYPE_LABELS } from '@/lib/types'
import {
  Search, Calendar, MapPin, Users, Euro,
  Mic2, Clock, SlidersHorizontal, X, Send, ChevronRight
} from 'lucide-react'
import { cn, formatDate, formatTime, daysUntil } from '@/lib/utils'

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]
const ALL_GENRES = Object.entries(GENRE_LABELS) as [MusicGenre, string][]

export default function EventsPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<EventType | ''>('')
  const [genreFilter, setGenreFilter] = useState<MusicGenre | ''>('')
  const [lookingOnly, setLookingOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)

  // Candidature modal
  const [applying, setApplying] = useState<Event | null>(null)
  const [appMessage, setAppMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setCurrentUser(data)
      }
    }
    getUser()
  }, [])

  const fetchEvents = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from('events')
      .select('*, venue:venues(name, address, city), organizer:profiles(full_name, instagram_handle)')
      .eq('status', 'published')
      .gte('date_start', new Date().toISOString())
      .order('date_start', { ascending: true })

    if (typeFilter) query = query.eq('type', typeFilter)
    if (lookingOnly) query = query.eq('looking_for_artists', true)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data } = await query.limit(50)
    setEvents((data as Event[]) || [])
    setLoading(false)
  }, [search, typeFilter, lookingOnly])

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 300)
    return () => clearTimeout(timer)
  }, [fetchEvents])

  const filtered = genreFilter
    ? events.filter(e => e.genres_wanted?.includes(genreFilter))
    : events

  const handleApply = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (currentUser.role !== 'artist') {
      showError('Accès refusé', 'Seuls les artistes peuvent postuler.')
      return
    }
    if (!applying) return

    setSubmitting(true)
    const supabase = createClient()

    const { error } = await supabase.from('applications').insert({
      event_id: applying.id,
      artist_id: currentUser.id,
      message: appMessage || null,
    })

    if (error) {
      if (error.code === '23505') {
        showError('Déjà postulé', 'Tu as déjà envoyé une candidature pour cet événement.')
      } else {
        showError('Erreur', error.message)
      }
    } else {
      success('Candidature envoyée !', "L'organisateur a été notifié. Bonne chance !")
      setApplying(null)
      setAppMessage('')
    }
    setSubmitting(false)
  }

  const activeFilters = [typeFilter, genreFilter, lookingOnly].filter(Boolean).length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#f0f0ff] mb-1">Événements</h1>
        <p className="text-[#8888aa]">Concerts, soirées et opportunités à venir à Toulouse</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
          <input
            type="text"
            placeholder="Chercher un événement..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0ff] placeholder:text-[#4a4a6a] outline-none focus:border-[#7c3aff] transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all',
            showFilters || activeFilters > 0
              ? 'border-[#7c3aff] bg-[#7c3aff]/10 text-[#9b60ff]'
              : 'border-[#2a2a3a] text-[#8888aa] hover:border-[#3a3a50]'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#7c3aff] text-white text-xs flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Pill rapide "Cherche artistes" */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        <button
          onClick={() => setLookingOnly(!lookingOnly)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0',
            lookingOnly ? 'bg-[#ff3a8c] border-[#ff3a8c] text-white' : 'border-[#2a2a3a] bg-[#1a1a24] text-[#8888aa]'
          )}
        >
          <Mic2 className="w-3.5 h-3.5" />
          Cherche des artistes
        </button>
        {EVENT_TYPES.map(([v, l]) => (
          <button key={v} onClick={() => setTypeFilter(typeFilter === v ? '' : v)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0',
              typeFilter === v ? 'bg-[#7c3aff] border-[#7c3aff] text-white' : 'border-[#2a2a3a] bg-[#1a1a24] text-[#8888aa]'
            )}>
            {l}
          </button>
        ))}
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 mb-4 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider mb-2">Genre musical recherché</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setGenreFilter('')}
                className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  genreFilter === '' ? 'bg-[#ff3a8c] border-[#ff3a8c] text-white' : 'border-[#2a2a3a] text-[#8888aa]'
                )}>
                Tous
              </button>
              {ALL_GENRES.map(([g, l]) => (
                <button key={g} onClick={() => setGenreFilter(genreFilter === g ? '' : g)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                    genreFilter === g ? 'bg-[#ff3a8c] border-[#ff3a8c] text-white' : 'border-[#2a2a3a] text-[#8888aa]'
                  )}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setTypeFilter(''); setGenreFilter(''); setLookingOnly(false) }}
              className="flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold w-fit">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[#1a1a24] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🎪</div>
          <p className="text-[#f0f0ff] font-semibold mb-1">Aucun événement trouvé</p>
          <p className="text-sm text-[#8888aa]">Essaie d&apos;autres filtres ou reviens plus tard.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[#8888aa] mb-4">{filtered.length} événement{filtered.length > 1 ? 's' : ''} à venir</p>
          <div className="flex flex-col gap-3">
            {filtered.map(event => (
              <EventCard
                key={event.id}
                event={event}
                currentUser={currentUser}
                onApply={() => setApplying(event)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal candidature */}
      <Modal
        open={!!applying}
        onClose={() => { setApplying(null); setAppMessage('') }}
        title="Envoyer une candidature"
        size="md"
      >
        {applying && (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-[#1a1a24] border border-[#2a2a3a]">
              <p className="font-bold text-[#f0f0ff] text-sm">{applying.title}</p>
              <p className="text-xs text-[#8888aa] mt-0.5">{formatDate(applying.date_start)} · {(applying.venue as any)?.name}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#f0f0ff]/80">
                Ton message à l&apos;organisateur
              </label>
              <textarea
                placeholder="Présente-toi, explique pourquoi tu es la bonne personne pour cet événement..."
                value={appMessage}
                onChange={e => setAppMessage(e.target.value)}
                rows={5}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f0ff] placeholder:text-[#4a4a6a] outline-none focus:border-[#7c3aff] focus:shadow-[0_0_0_3px_rgba(124,58,255,0.15)] resize-none transition-all"
              />
            </div>

            {!currentUser && (
              <p className="text-xs text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg p-3">
                Tu dois être connecté pour postuler.
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setApplying(null)} fullWidth>Annuler</Button>
              <Button onClick={handleApply} loading={submitting} fullWidth className="gap-2">
                <Send className="w-4 h-4" />
                Envoyer ma candidature
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function EventCard({
  event,
  currentUser,
  onApply,
}: {
  event: Event
  currentUser: Profile | null
  onApply: () => void
}) {
  const days = daysUntil(event.date_start)

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex gap-4">
        {/* Date block */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#7c3aff] to-[#ff3a8c] flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white leading-none">
            {new Date(event.date_start).getDate()}
          </span>
          <span className="text-[10px] text-white/80 uppercase font-bold">
            {new Date(event.date_start).toLocaleDateString('fr-FR', { month: 'short' })}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#f0f0ff] text-sm leading-snug">{event.title}</h3>
            <div className="flex gap-1.5 flex-shrink-0">
              {event.looking_for_artists && (
                <Badge variant="neon" size="sm">
                  <Mic2 className="w-2.5 h-2.5" /> Recrute
                </Badge>
              )}
              <Badge variant="ghost" size="sm">{EVENT_TYPE_LABELS[event.type]}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            {event.venue && (
              <span className="flex items-center gap-1 text-xs text-[#8888aa]">
                <MapPin className="w-3 h-3 text-[#7c3aff]" />
                {(event.venue as any).name}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-[#8888aa]">
              <Clock className="w-3 h-3" />
              {formatTime(event.date_start)}
            </span>
          </div>

          {event.description && (
            <p className="text-xs text-[#8888aa] line-clamp-1 mb-2">{event.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {event.genres_wanted && event.genres_wanted.slice(0, 3).map(g => (
              <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a3a] text-[#8888aa]">
                {GENRE_LABELS[g]}
              </span>
            ))}
            {event.fee_offered ? (
              <span className="flex items-center gap-0.5 text-[10px] text-[#22c55e] font-semibold">
                <Euro className="w-2.5 h-2.5" />{event.fee_offered}€
              </span>
            ) : event.is_free ? (
              <span className="text-[10px] text-[#22c55e] font-semibold">Gratuit</span>
            ) : null}
            {days <= 7 && days > 0 && (
              <span className="text-[10px] text-[#ff3a8c] font-bold">
                Dans {days} jour{days > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {event.looking_for_artists && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-3 text-xs text-[#8888aa]">
            {event.slots_available > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.slots_available} place{event.slots_available > 1 ? 's' : ''}
              </span>
            )}
            {event.application_deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Deadline : {formatDate(event.application_deadline, { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          {currentUser?.role === 'artist' ? (
            <Button size="sm" variant="accent" onClick={onApply} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              Postuler
            </Button>
          ) : !currentUser ? (
            <Button size="sm" variant="outline" onClick={onApply} className="gap-1.5">
              <ChevronRight className="w-3.5 h-3.5" />
              Voir
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}
