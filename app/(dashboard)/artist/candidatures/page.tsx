'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import type { Application, ApplicationStatus } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Calendar, MapPin, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  withdrawn: 'Retirée',
}

const STATUS_VARIANTS: Record<ApplicationStatus, 'warning' | 'success' | 'error' | 'ghost'> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
  withdrawn: 'ghost',
}

export default function CandidaturesPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('applications')
        .select('*, event:events(*, venue:venues(name, city, type))')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

      setApplications((data as Application[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-black text-[#f0f0ff] mb-1">Mes candidatures</h1>
      <p className="text-sm text-[#8888aa] mb-6">Suis l&apos;état de toutes tes candidatures</p>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === s
                ? 'bg-[#7c3aff] text-white'
                : 'bg-[#1a1a24] text-[#8888aa] border border-[#2a2a3a] hover:border-[#7c3aff]/40'
            }`}
          >
            {s === 'all' ? 'Toutes' : STATUS_LABELS[s]}
            <span className="ml-1.5 opacity-70">
              {s === 'all' ? applications.length : applications.filter(a => a.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#7c3aff]/30 border-t-[#7c3aff] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🎤</div>
          <p className="text-[#f0f0ff] font-semibold mb-1">Aucune candidature</p>
          <p className="text-sm text-[#8888aa]">
            {filter === 'all' ? 'Postule à des événements pour les voir ici.' : `Aucune candidature ${STATUS_LABELS[filter].toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(app => (
            <Card key={app.id} className="overflow-hidden">
              <CardBody>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#f0f0ff] text-sm">{(app.event as any)?.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-[#8888aa]" />
                      <span className="text-xs text-[#8888aa]">
                        {(app.event as any)?.venue?.name || 'Lieu à confirmer'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANTS[app.status]}>
                    {STATUS_LABELS[app.status]}
                  </Badge>
                </div>

                {(app.event as any)?.date_start && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Calendar className="w-3.5 h-3.5 text-[#7c3aff]" />
                    <span className="text-xs text-[#8888aa]">
                      {formatDate((app.event as any).date_start)}
                    </span>
                  </div>
                )}

                {app.message && (
                  <div className="bg-[#1a1a24] rounded-lg p-3 mb-3">
                    <p className="text-xs text-[#8888aa] mb-1">Ton message</p>
                    <p className="text-sm text-[#f0f0ff]/80">{app.message}</p>
                  </div>
                )}

                {app.response_message && (
                  <div className={`rounded-lg p-3 ${app.status === 'accepted' ? 'bg-[#22c55e]/10 border border-[#22c55e]/20' : 'bg-[#ef4444]/10 border border-[#ef4444]/20'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {app.status === 'accepted'
                        ? <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" />
                        : <XCircle className="w-3.5 h-3.5 text-[#ef4444]" />
                      }
                      <p className="text-xs font-semibold text-[#f0f0ff]">Réponse de l&apos;organisateur</p>
                    </div>
                    <p className="text-sm text-[#f0f0ff]/80">{app.response_message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2a3a]">
                  <div className="flex items-center gap-1.5 text-[#8888aa]">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{formatDate(app.created_at)}</span>
                  </div>
                  {app.status === 'accepted' && (
                    <a href={`/messages`} className="flex items-center gap-1.5 text-xs text-[#9b60ff] font-semibold hover:text-[#7c3aff] transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Contacter
                    </a>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
