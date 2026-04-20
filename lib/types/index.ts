export type UserRole = 'artist' | 'organizer' | 'admin'
export type AccountStatus = 'pending' | 'active' | 'rejected' | 'suspended'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'new_message'
  | 'new_event'
  | 'account_approved'
  | 'account_rejected'

export type MusicGenre =
  | 'rap' | 'rnb' | 'pop' | 'rock' | 'electro' | 'jazz' | 'soul'
  | 'reggae' | 'afrobeat' | 'metal' | 'folk' | 'classique' | 'world'
  | 'variete' | 'autre'

export type VenueType =
  | 'bar' | 'salle_concert' | 'club' | 'festival' | 'espace_culturel'
  | 'restaurant' | 'rooftop' | 'plein_air' | 'autre'

export type EventType =
  | 'concert' | 'soiree' | 'festival' | 'showcase' | 'open_mic'
  | 'battle' | 'release_party' | 'residency' | 'autre'

export interface Profile {
  id: string
  role: UserRole
  status: AccountStatus
  full_name: string
  avatar_url?: string
  city: string
  bio?: string
  instagram_handle?: string
  facebook_url?: string
  website_url?: string
  phone?: string
  email_contact?: string
  created_at: string
  updated_at: string
}

export interface ArtistProfile {
  id: string
  stage_name: string
  genres: MusicGenre[]
  subgenres?: string
  experience_years: number
  typical_setlength_min: number
  min_fee: number
  max_fee: number
  fee_negotiable: boolean
  has_own_equipment: boolean
  equipment_details?: string
  num_members: number
  promo_text?: string
  audio_links?: string[]
  video_links?: string[]
  press_kit_url?: string
  notable_events?: string
  available: boolean
  profile?: Profile
}

export interface Venue {
  id: string
  owner_id?: string
  name: string
  type: VenueType
  description?: string
  address: string
  city: string
  postal_code?: string
  latitude?: number
  longitude?: number
  capacity?: number
  instagram_handle?: string
  facebook_url?: string
  website_url?: string
  phone?: string
  email?: string
  accepted_genres?: MusicGenre[]
  has_stage: boolean
  has_sound_system: boolean
  has_lighting: boolean
  min_fee_offered?: number
  max_fee_offered?: number
  cover_image_url?: string
  images?: string[]
  is_verified: boolean
  is_active: boolean
  source: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  venue_id?: string
  organizer_id?: string
  title: string
  type: EventType
  description?: string
  date_start: string
  date_end?: string
  status: EventStatus
  genres_wanted?: MusicGenre[]
  slots_available: number
  looking_for_artists: boolean
  application_deadline?: string
  fee_offered?: number
  fee_description?: string
  cover_image_url?: string
  ticket_url?: string
  is_free: boolean
  expected_audience?: number
  source: string
  source_url?: string
  created_at: string
  updated_at: string
  venue?: Venue
  organizer?: Profile
}

export interface Application {
  id: string
  event_id: string
  artist_id: string
  status: ApplicationStatus
  message?: string
  response_message?: string
  responded_at?: string
  created_at: string
  event?: Event
  artist?: Profile & { artist_profile?: ArtistProfile }
}

export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string
  created_at: string
  other_user?: Profile
  last_message?: Message
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body?: string
  link?: string
  read: boolean
  created_at: string
}

export const GENRE_LABELS: Record<MusicGenre, string> = {
  rap: 'Rap',
  rnb: 'R&B',
  pop: 'Pop',
  rock: 'Rock',
  electro: 'Électro',
  jazz: 'Jazz',
  soul: 'Soul',
  reggae: 'Reggae',
  afrobeat: 'Afrobeat',
  metal: 'Metal',
  folk: 'Folk',
  classique: 'Classique',
  world: 'World',
  variete: 'Variété',
  autre: 'Autre',
}

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  bar: 'Bar',
  salle_concert: 'Salle de concert',
  club: 'Club',
  festival: 'Festival',
  espace_culturel: 'Espace culturel',
  restaurant: 'Restaurant',
  rooftop: 'Rooftop',
  plein_air: 'Plein air',
  autre: 'Autre',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  concert: 'Concert',
  soiree: 'Soirée',
  festival: 'Festival',
  showcase: 'Showcase',
  open_mic: 'Open Mic',
  battle: 'Battle',
  release_party: 'Release Party',
  residency: 'Résidence',
  autre: 'Autre',
}
