'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import type { Profile, Venue, Event } from '@/lib/types'
import { VENUE_TYPE_LABELS, EVENT_TYPE_LABELS } from '@/lib/types'
import {
  Users, Building2, Calendar, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Trash2, Eye, Settings
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

type Tab = 'overview' | 'users' | 'venues' | 'events'

export default function AdminPage() {
  const { success, error: showError } = useToast()
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingOrganizers: 0,
    totalVenues: 0,
    totalEvents: 0,
    totalApplications: 0,
  })
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [events, setEvents] = useState<Event[]>([])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()

    const [
      { count: totalUsers },
      { data: pendingOrgs },
      { data: allProfiles },
      { data: allVenues },
      { data: allEvents },
      { count: totalApps },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*').eq('role', 'organizer').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('venues').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('events').select('*').order('date_start', { ascending: false }).limit(50),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
    ])

    setStats({
      totalUsers: totalUsers || 0,
      pendingOrganizers: pendingOrgs?.length || 0,
      totalVenues: allVenues?.length || 0,
      totalEvents: allEvents?.length || 0,
      totalApplications: totalApps || 0,
    })
    setPendingUsers(pendingOrgs || [])
    setAllUsers(allProfiles || [])
    setVenues(allVenues as Venue[] || [])
    setEvents(allEvents as Event[] || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const updateUserStatus = async (userId: string, status: 'active' | 'rejected') => {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId)
    if (error) {
      showError('Erreur', error.message)
    } else {
      success(status === 'active' ? 'Compte approuvé !' : 'Compte refusé', '')
      await loadData()
    }
  }

  const toggleVenueVerified = async (venueId: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('venues').update({ is_verified: !current }).eq('id', venueId)
    await loadData()
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Supprimer cet événement ?')) return
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', eventId)
    success('Événement supprimé', '')
    await loadData()
  }

  const TABS: { id: Tab; label: string; icon: typeof Users; count?: number }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Settings },
    { id: 'users', label: 'Utilisateurs', icon: Users, count: stats.pendingOrganizers || undefined },
    { id: 'venues', label: 'Lieux', icon: Building2 },
    { id: 'events', label: 'Événements', icon: Calendar },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#f0f0ff]">Dashboard Admin</h1>
          <p className="text-sm text-[#8888aa] mt-1">PartyDigger — Panneau d&apos;administration</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111118] rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              tab === t.id ? 'bg-[#7c3aff] text-white' : 'text-[#8888aa] hover:text-[#f0f0ff]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count && t.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#ff3a8c] text-white text-[10px] font-bold flex items-center justify-center">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#7c3aff]/30 border-t-[#7c3aff] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Users, label: 'Utilisateurs', val: stats.totalUsers, color: 'text-[#7c3aff]', bg: 'bg-[#7c3aff]/10' },
                  { icon: AlertCircle, label: 'Organisateurs en attente', val: stats.pendingOrganizers, color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10' },
                  { icon: Building2, label: 'Lieux', val: stats.totalVenues, color: 'text-[#00e5ff]', bg: 'bg-[#00e5ff]/10' },
                  { icon: Calendar, label: 'Événements', val: stats.totalEvents, color: 'text-[#ff3a8c]', bg: 'bg-[#ff3a8c]/10' },
                  { icon: CheckCircle, label: 'Candidatures', val: stats.totalApplications, color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10' },
                ].map(item => (
                  <div key={item.label} className="glass-card p-4">
                    <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="text-2xl font-black text-[#f0f0ff]">{item.val}</div>
                    <div className="text-xs text-[#8888aa] mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>

              {pendingUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                      <h3 className="font-bold text-[#f0f0ff]">Organisateurs à valider ({pendingUsers.length})</h3>
                    </div>
                  </CardHeader>
                  <CardBody className="flex flex-col gap-3">
                    {pendingUsers.map(u => (
                      <PendingUserRow key={u.id} user={u} onApprove={() => updateUserStatus(u.id, 'active')} onReject={() => updateUserStatus(u.id, 'rejected')} />
                    ))}
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="flex flex-col gap-3">
              {pendingUsers.length > 0 && (
                <div className="p-3 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-sm text-[#f0f0ff]">{pendingUsers.length} organisateur{pendingUsers.length > 1 ? 's' : ''} en attente de validation</span>
                </div>
              )}
              {allUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-4 rounded-xl border border-[#2a2a3a] bg-[#111118]">
                  <Avatar src={u.avatar_url} name={u.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#f0f0ff] text-sm">{u.full_name}</p>
                    <p className="text-xs text-[#8888aa]">{u.city} · {formatDate(u.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === 'artist' ? 'primary' : u.role === 'admin' ? 'neon' : 'accent'} size="sm">
                      {u.role}
                    </Badge>
                    <Badge variant={u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'error'} size="sm">
                      {u.status}
                    </Badge>
                  </div>
                  {u.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => updateUserStatus(u.id, 'active')} className="p-1.5 rounded-lg bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateUserStatus(u.id, 'rejected')} className="p-1.5 rounded-lg bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444] transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VENUES */}
          {tab === 'venues' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end mb-2">
                <Link href="/explore">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Eye className="w-4 h-4" />
                    Vue publique
                  </Button>
                </Link>
              </div>
              {venues.map(v => (
                <div key={v.id} className="flex items-center gap-3 p-4 rounded-xl border border-[#2a2a3a] bg-[#111118]">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1a24] flex items-center justify-center text-xl">
                    {v.type === 'bar' ? '🍺' : v.type === 'salle_concert' ? '🎸' : v.type === 'club' ? '🎉' : '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#f0f0ff] text-sm">{v.name}</p>
                    <p className="text-xs text-[#8888aa]">{VENUE_TYPE_LABELS[v.type]} · {v.address}</p>
                    <p className="text-xs text-[#4a4a6a]">Source: {v.source}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.is_verified ? (
                      <Badge variant="success" size="sm">Vérifié</Badge>
                    ) : (
                      <Badge variant="ghost" size="sm">Non vérifié</Badge>
                    )}
                    <button
                      onClick={() => toggleVenueVerified(v.id, v.is_verified)}
                      className={`p-1.5 rounded-lg transition-colors ${v.is_verified ? 'bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444]' : 'bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e]'}`}
                    >
                      {v.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EVENTS */}
          {tab === 'events' && (
            <div className="flex flex-col gap-3">
              {events.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-4 rounded-xl border border-[#2a2a3a] bg-[#111118]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aff] to-[#ff3a8c] flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-white leading-none">{new Date(ev.date_start).getDate()}</span>
                    <span className="text-[9px] text-white/80 uppercase">{new Date(ev.date_start).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#f0f0ff] text-sm">{ev.title}</p>
                    <p className="text-xs text-[#8888aa]">{EVENT_TYPE_LABELS[ev.type]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ev.looking_for_artists && <Badge variant="neon" size="sm">Recrute</Badge>}
                    <Badge variant={ev.status === 'published' ? 'success' : 'ghost'} size="sm">{ev.status}</Badge>
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="p-1.5 rounded-lg bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PendingUserRow({ user, onApprove, onReject }: { user: Profile; onApprove: () => void; onReject: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a24]">
      <Avatar src={user.avatar_url} name={user.full_name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#f0f0ff] text-sm">{user.full_name}</p>
        <p className="text-xs text-[#8888aa]">{user.city} · Inscrit {formatDate(user.created_at, { day: 'numeric', month: 'short' })}</p>
        {user.bio && <p className="text-xs text-[#8888aa] mt-0.5 line-clamp-1">{user.bio}</p>}
      </div>
      <div className="flex gap-1.5">
        <button onClick={onApprove} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] text-xs font-semibold transition-colors">
          <CheckCircle className="w-3.5 h-3.5" /> Approuver
        </button>
        <button onClick={onReject} className="p-1.5 rounded-lg bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444] transition-colors">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
