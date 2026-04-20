'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Conversation, Message, Profile } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { Send, MessageSquare, ArrowLeft, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setCurrentUser(p)

      const { data: convs } = await supabase
        .from('conversations')
        .select('*, participant_1_profile:profiles!participant_1(*), participant_2_profile:profiles!participant_2(*)')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (convs) {
        const enriched = convs.map((c: any) => ({
          ...c,
          other_user: c.participant_1 === user.id ? c.participant_2_profile : c.participant_1_profile,
        }))
        setConversations(enriched)
      }
      setLoading(false)
    }
    load()
  }, [])

  const loadMessages = useCallback(async (conv: Conversation) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })

    setMessages((data as Message[]) || [])

    // Mark as read
    await supabase.from('messages')
      .update({ read: true })
      .eq('conversation_id', conv.id)
      .neq('sender_id', user.id)
  }, [])

  const openConversation = (conv: Conversation) => {
    setActiveConv(conv)
    loadMessages(conv)

    // Subscribe to new messages
    const supabase = createClient()
    const channel = supabase
      .channel(`conv-${conv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conv.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv || !currentUser || sending) return

    setSending(true)
    const supabase = createClient()

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: currentUser.id,
      content: newMessage.trim(),
    })

    await supabase.from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', activeConv.id)

    setNewMessage('')
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7c3aff]/30 border-t-[#7c3aff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Sidebar conversations */}
      <div className={cn(
        'w-full sm:w-72 border-r border-[#2a2a3a] flex flex-col bg-[#0a0a0f]',
        activeConv && 'hidden sm:flex'
      )}>
        <div className="p-4 border-b border-[#2a2a3a]">
          <h2 className="font-black text-[#f0f0ff] mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
            <input
              type="text"
              placeholder="Chercher..."
              className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl pl-9 pr-3 py-2 text-sm text-[#f0f0ff] placeholder:text-[#4a4a6a] outline-none focus:border-[#7c3aff] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-8 h-8 text-[#2a2a3a] mx-auto mb-2" />
              <p className="text-sm text-[#4a4a6a]">Aucun message pour l&apos;instant.</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-[#2a2a3a]/50',
                  activeConv?.id === conv.id ? 'bg-[#7c3aff]/10' : 'hover:bg-[#1a1a24]'
                )}
              >
                <Avatar
                  src={(conv.other_user as any)?.avatar_url}
                  name={(conv.other_user as any)?.full_name || '?'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#f0f0ff] truncate">
                    {(conv.other_user as any)?.full_name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-[#8888aa] truncate capitalize">
                    {(conv.other_user as any)?.role}
                  </p>
                </div>
                <span className="text-[10px] text-[#4a4a6a] flex-shrink-0">
                  {formatTime(conv.last_message_at)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Zone de conversation */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-[#0a0a0f]">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[#2a2a3a] bg-[#111118]">
            <button
              onClick={() => setActiveConv(null)}
              className="sm:hidden p-1.5 rounded-lg hover:bg-[#1a1a24] text-[#8888aa]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar
              src={(activeConv.other_user as any)?.avatar_url}
              name={(activeConv.other_user as any)?.full_name || '?'}
              size="md"
            />
            <div>
              <p className="font-bold text-[#f0f0ff]">{(activeConv.other_user as any)?.full_name}</p>
              <p className="text-xs text-[#8888aa] capitalize">{(activeConv.other_user as any)?.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-8 h-8 text-[#2a2a3a] mx-auto mb-2" />
                <p className="text-sm text-[#4a4a6a]">Commence la conversation !</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_id === currentUser?.id
                return (
                  <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                      isMe
                        ? 'bg-[#7c3aff] text-white rounded-br-sm'
                        : 'bg-[#1a1a24] text-[#f0f0ff] border border-[#2a2a3a] rounded-bl-sm'
                    )}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={cn('text-[10px] mt-1', isMe ? 'text-white/60' : 'text-[#8888aa]')}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#2a2a3a] bg-[#111118]">
            <div className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écris ton message..."
                rows={1}
                className="flex-1 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-[#f0f0ff] placeholder:text-[#4a4a6a] outline-none focus:border-[#7c3aff] transition-colors resize-none"
              />
              <Button
                onClick={sendMessage}
                loading={sending}
                disabled={!newMessage.trim()}
                className="px-4 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-[#4a4a6a] mt-1.5">Entrée pour envoyer · Maj+Entrée pour nouvelle ligne</p>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center bg-[#0a0a0f]">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-[#2a2a3a] mx-auto mb-3" />
            <p className="text-[#f0f0ff] font-semibold mb-1">Sélectionne une conversation</p>
            <p className="text-sm text-[#8888aa]">Ou démarre-en une depuis le profil d&apos;un artiste.</p>
          </div>
        </div>
      )}
    </div>
  )
}
