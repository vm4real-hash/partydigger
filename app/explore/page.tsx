'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Venue, VenueType, MusicGenre } from '@/lib/types'
import { GENRE_LABELS, VENUE_TYPE_LABELS } from '@/lib/types'
import { Search, MapPin, Users, Mic2, CheckCircle, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const VENUE_TYPES = Object.entries(VENUE_TYPE_LABELS) as [VenueType, string][]
const ALL_GENRES = Object.entries(GENRE_LABELS) as [MusicGenre, string][]

const TYPE_EMOJIS: Record<VenueType, string> = {
  bar: '🍺', salle_concert: '🎸', club: '🎉', festival: '🎪',
  espace_culturel: '🏛️', restaurant: '🍽️', rooftop: '🏙️', plein_air: '🌿', autre: '📍'
}

export default function ExplorePage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<VenueType | ''>('')
  const [genreFilter, setGenreFilter] = useState<MusicGenre | ''>('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchVenues = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('is_verified', { ascending: false })
      .order('created_at', { ascending: false })

    if (typeFilter) query = query.eq('type', typeFilter)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data } = await query.limit(50)
    setVenues((data as Venue[]) || [])
    setLoading(false)
  }, [search, typeFilter])

  useEffect(() => {
    const timer = setTimeout(fetchVenues, 300)
    return () => clearTimeout(timer)
  }, [fetchVenues])

  const filtered = genreFilter
    ? venues.filter(v => v.accepted_genres?.includes(genreFilter))
    : venues

  const activeFilters = [typeFilter, genreFilter].filter(Boolean).length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#f0f0ff] mb-1">Explorer les lieux</h1>
        <p className="text-[#8888aa]">Bars, salles, clubs et festivals à Toulouse</p>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
          <input
            type="text"
            placeholder="Chercher un lieu..."
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
          Filtres
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#7c3aff] text-white text-xs flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
        <Link href="/explore/events">
          <Button variant="outline" size="md">Événements →</Button>
        </Link>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 mb-4 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider mb-2">Type de lieu</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTypeFilter('')}
                className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  typeFilter === '' ? 'bg-[#7c3aff] border-[#7c3aff] text-white' : 'border-[#2a2a3a] text-[#8888aa]'
                )}>
                Tous
              </button>
              {VENUE_TYPES.map(([v, l]) => (
                <button key={v} onClick={() => setTypeFilter(typeFilter === v ? '' : v)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1',
                    typeFilter === v ? 'bg-[#7c3aff] border-[#7c3aff] text-white' : 'border-[#2a2a3a] text-[#8888aa]'
                  )}>
                  {TYPE_EMOJIS[v]} {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider mb-2">Genre musical</p>
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
            <button onClick={() => { setTypeFilter(''); setGenreFilter('') }}
              className="flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold w-fit">
              <X className="w-3.5 h-3.5" /> Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Type pills rapides */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-4 px-4">
        {[{ v: '' as VenueType | '', l: 'Tous', e: '🗺️' }, ...VENUE_TYPES.map(([v, l]) => ({ v, l, e: TYPE_EMOJIS[v] }))].map(item => (
          <button key={item.v} onClick={() => setTypeFilter(item.v)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0',
              typeFilter === item.v ? 'bg-[#7c3aff] border-[#7c3aff] text-white' : 'border-[#2a2a3a] bg-[#1a1a24] text-[#8888aa]'
            )}>
            <span>{item.e}</span> {item.l}
          </button>
        ))}
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-[#1a1a24] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-[#f0f0ff] font-semibold mb-1">Aucun lieu trouvé</p>
          <p className="text-sm text-[#8888aa]">Essaie d&apos;autres filtres ou une autre recherche.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[#8888aa] mb-4">{filtered.length} lieu{filtered.length > 1 ? 'x' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map(venue => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <div className="glass-card overflow-hidden group cursor-pointer">
      {/* Cover */}
      <div className="h-28 bg-gradient-to-br from-[#1a1a24] to-[#111118] relative flex items-center justify-center">
        {venue.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={venue.cover_image_url} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{TYPE_EMOJIS[venue.type]}</span>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5">
          {venue.is_verified && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] text-[10px] font-bold">
              <CheckCircle className="w-3 h-3" /> Vérifié
            </span>
          )}
          <Badge variant="ghost" size="sm">{VENUE_TYPE_LABELS[venue.type]}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-[#f0f0ff] text-base mb-1 group-hover:text-[#9b60ff] transition-colors">
          {venue.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-3.5 h-3.5 text-[#8888aa] flex-shrink-0" />
          <p className="text-xs text-[#8888aa] truncate">{venue.address}</p>
        </div>

        {venue.description && (
          <p className="text-xs text-[#8888aa] mb-3 line-clamp-2">{venue.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {venue.has_stage && <Badge variant="primary" size="sm">Scène</Badge>}
          {venue.has_sound_system && <Badge variant="primary" size="sm">Son</Badge>}
          {venue.capacity && (
            <Badge variant="ghost" size="sm">
              <Users className="w-2.5 h-2.5" /> {venue.capacity}
            </Badge>
          )}
        </div>

        {venue.accepted_genres && venue.accepted_genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {venue.accepted_genres.slice(0, 3).map(g => (
              <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a3a] text-[#8888aa]">
                {GENRE_LABELS[g]}
              </span>
            ))}
            {venue.accepted_genres.length > 3 && (
              <span className="text-[10px] text-[#8888aa]">+{venue.accepted_genres.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#2a2a3a]">
          <div className="flex gap-2">
            {venue.instagram_handle && (
              <a href={`https://instagram.com/${venue.instagram_handle}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#ff3a8c] hover:text-[#ff6aaa] transition-colors font-semibold">
                AtSign
              </a>
            )}
            {venue.website_url && (
              <a href={venue.website_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#00e5ff] hover:text-white transition-colors font-semibold">
                Site
              </a>
            )}
          </div>
          {venue.email && (
            <a href={`mailto:${venue.email}`} className="flex items-center gap-1.5 text-xs text-[#7c3aff] hover:text-[#9b60ff] transition-colors font-semibold">
              <Mic2 className="w-3.5 h-3.5" />
              Contacter
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
