import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Music2, MapPin, Calendar, MessageSquare,
  ArrowRight, Mic2, Building2, Zap,
  Star, ChevronRight
} from 'lucide-react'

const GENRES = ['Rap', 'R&B', 'Pop', 'Rock', 'Électro', 'Jazz', 'Soul', 'Reggae', 'Afrobeat']

const FEATURES = [
  {
    icon: Building2,
    title: 'Tous les lieux réunis',
    desc: 'Bars, salles de concert, clubs, festivals — une seule plateforme pour trouver où jouer à Toulouse et en France.',
    color: 'text-[#7c3aff]',
    bg: 'bg-[#7c3aff]/10',
  },
  {
    icon: Calendar,
    title: 'Événements en temps réel',
    desc: 'Découvre les événements en préparation et ceux qui cherchent activement des artistes pour compléter leur line-up.',
    color: 'text-[#ff3a8c]',
    bg: 'bg-[#ff3a8c]/10',
  },
  {
    icon: MessageSquare,
    title: 'Contact direct',
    desc: "Envoie ta candidature, accède aux contacts (Instagram, email, téléphone) et discute directement avec les organisateurs.",
    color: 'text-[#00e5ff]',
    bg: 'bg-[#00e5ff]/10',
  },
  {
    icon: Zap,
    title: 'Profil artiste vendeur',
    desc: "Crée un profil complet avec tes genres, tes liens, tes extraits et ton kit de presse. Sois repéré avant même de postuler.",
    color: 'text-[#f59e0b]',
    bg: 'bg-[#f59e0b]/10',
  },
]

const STATS = [
  { value: '50+', label: 'Lieux à Toulouse' },
  { value: '100+', label: 'Événements référencés' },
  { value: '0€', label: 'Gratuit pour tous' },
]

const STEPS_ARTIST = [
  { num: '01', title: 'Crée ton profil', desc: 'Renseigne ton nom de scène, tes genres, tes liens et ton kit de presse.' },
  { num: '02', title: 'Explore les opportunités', desc: 'Parcours les événements et lieux qui correspondent à ton style.' },
  { num: '03', title: 'Postule en un clic', desc: 'Envoie une candidature avec un message personnalisé aux organisateurs.' },
  { num: '04', title: 'Monte sur scène', desc: 'Confirme la date, prépare ton set et fais le show.' },
]

const VENUES = [
  { emoji: '🍺', label: 'Bars', count: '20+' },
  { emoji: '🎸', label: 'Salles de concert', count: '8+' },
  { emoji: '🎉', label: 'Clubs', count: '12+' },
  { emoji: '🎪', label: 'Festivals', count: '5+' },
  { emoji: '🏛️', label: 'Espaces culturels', count: '6+' },
  { emoji: '🌿', label: 'Plein air', count: '4+' },
  { emoji: '🍽️', label: 'Restaurants', count: '8+' },
  { emoji: '🏙️', label: 'Rooftops', count: '3+' },
]

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-4 animated-gradient overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#7c3aff]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#ff3a8c]/15 rounded-full blur-[80px] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'linear-gradient(rgba(42,42,58,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,58,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#7c3aff]/30 bg-[#7c3aff]/10 text-sm text-[#9b60ff] font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-[#7c3aff] animate-pulse" />
            Toulouse — Bientôt partout en France
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-[#f0f0ff]">Trouve ta</span>
            <br />
            <span className="gradient-text">prochaine scène</span>
          </h1>

          <p className="text-lg md:text-xl text-[#8888aa] max-w-2xl mx-auto mb-8 leading-relaxed">
            La plateforme qui connecte les artistes avec les bars, salles de concert, clubs et organisateurs.
            Postule. Rencontre. Monte sur scène.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {GENRES.map(g => (
              <span key={g} className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1a1a24] border border-[#2a2a3a] text-[#8888aa]">
                {g}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register?role=artist">
              <Button size="lg" className="gap-2">
                <Mic2 className="w-5 h-5" />
                Je suis artiste
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register?role=organizer">
              <Button variant="outline" size="lg" className="gap-2">
                <Building2 className="w-5 h-5" />
                Je suis organisateur
              </Button>
            </Link>
          </div>

          <p className="text-xs text-[#4a4a6a] mt-6">
            100% gratuit · Aucune commission · Toulouse en premier
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#4a4a6a]">
          <span className="text-xs">Découvrir</span>
          <div className="w-5 h-8 border border-[#2a2a3a] rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-[#7c3aff] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#2a2a3a] bg-[#111118]">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black gradient-text mb-1">{s.value}</div>
              <div className="text-xs md:text-sm text-[#8888aa] font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="primary" className="mb-4">Fonctionnalités</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-[#f0f0ff] mb-4">
              Tout ce qu&apos;il te faut pour<br />
              <span className="gradient-text">décrocher des dates</span>
            </h2>
            <p className="text-[#8888aa] max-w-xl mx-auto">
              PartyDigger centralise toutes les infos dont tu as besoin pour démarcher intelligemment.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card p-6">
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-[#f0f0ff] mb-2">{f.title}</h3>
                <p className="text-sm text-[#8888aa] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-[#111118]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Comment ça marche</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-[#f0f0ff]">
              4 étapes pour monter<br />
              <span className="gradient-text">sur scène</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {STEPS_ARTIST.map((step, i) => (
              <div key={step.num} className="relative flex gap-4 p-5 rounded-xl border border-[#2a2a3a] hover:border-[#7c3aff]/30 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aff] to-[#ff3a8c] flex items-center justify-center text-xs font-black text-white">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-[#f0f0ff] mb-1">{step.title}</h3>
                  <p className="text-sm text-[#8888aa]">{step.desc}</p>
                </div>
                {i < STEPS_ARTIST.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2a2a3a] hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VENUE TYPES */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="neon" className="mb-4">Lieux référencés</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-[#f0f0ff]">
              Tous types de scènes<br />
              <span className="gradient-text-neon">à portée de clic</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VENUES.map(v => (
              <div key={v.label} className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">{v.emoji}</div>
                <div className="text-sm font-semibold text-[#f0f0ff]">{v.label}</div>
                <div className="text-xs text-[#7c3aff] font-bold mt-1">{v.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#7c3aff]/25 rounded-full blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#ff3a8c]/20 rounded-full blur-[80px]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-4">🎤</div>
          <h2 className="text-3xl md:text-5xl font-black text-[#f0f0ff] mb-4">
            Prêt à creuser ta<br />
            <span className="gradient-text">prochaine opportunité ?</span>
          </h2>
          <p className="text-[#8888aa] mb-8 text-lg">
            Rejoins PartyDigger gratuitement et commence à explorer les scènes de Toulouse.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register?role=artist">
              <Button size="lg" className="gap-2">
                <Star className="w-5 h-5" />
                Créer mon profil artiste
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg" className="gap-2">
                <MapPin className="w-4 h-4" />
                Explorer les lieux
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2a2a3a] bg-[#111118] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aff] to-[#ff3a8c] flex items-center justify-center">
              <Music2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black gradient-text">PartyDigger</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#4a4a6a]">
            <Link href="/explore" className="hover:text-[#8888aa] transition-colors">Explorer</Link>
            <Link href="/register" className="hover:text-[#8888aa] transition-colors">S&apos;inscrire</Link>
            <Link href="/login" className="hover:text-[#8888aa] transition-colors">Connexion</Link>
          </div>
          <p className="text-xs text-[#4a4a6a]">© 2025 PartyDigger · Toulouse, France</p>
        </div>
      </footer>
    </div>
  )
}
