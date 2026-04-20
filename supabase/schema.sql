-- PartyDigger Database Schema
-- Execute this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create type user_role as enum ('artist', 'organizer', 'admin');
create type account_status as enum ('pending', 'active', 'rejected', 'suspended');

create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role user_role not null,
  status account_status not null default 'pending',
  full_name text not null,
  avatar_url text,
  city text default 'Toulouse',
  bio text,
  instagram_handle text,
  facebook_url text,
  website_url text,
  phone text,
  email_contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ARTIST PROFILES
-- ============================================
create type music_genre as enum (
  'rap', 'rnb', 'pop', 'rock', 'electro', 'jazz', 'soul', 'reggae',
  'afrobeat', 'metal', 'folk', 'classique', 'world', 'variete', 'autre'
);

create table artist_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  stage_name text not null,
  genres music_genre[] not null default '{}',
  subgenres text,
  experience_years int default 0,
  typical_setlength_min int default 30,
  min_fee int default 0,
  max_fee int default 0,
  fee_negotiable boolean default true,
  has_own_equipment boolean default false,
  equipment_details text,
  num_members int default 1,
  promo_text text,
  audio_links text[],
  video_links text[],
  press_kit_url text,
  notable_events text,
  available boolean default true
);

-- ============================================
-- VENUES
-- ============================================
create type venue_type as enum (
  'bar', 'salle_concert', 'club', 'festival', 'espace_culturel',
  'restaurant', 'rooftop', 'plein_air', 'autre'
);

create table venues (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete set null,
  name text not null,
  type venue_type not null,
  description text,
  address text not null,
  city text not null default 'Toulouse',
  postal_code text,
  latitude float,
  longitude float,
  capacity int,
  instagram_handle text,
  facebook_url text,
  website_url text,
  phone text,
  email text,
  accepted_genres music_genre[],
  has_stage boolean default false,
  has_sound_system boolean default false,
  has_lighting boolean default false,
  min_fee_offered int,
  max_fee_offered int,
  cover_image_url text,
  images text[],
  is_verified boolean default false,
  is_active boolean default true,
  source text default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- EVENTS
-- ============================================
create type event_status as enum ('draft', 'published', 'cancelled', 'completed');
create type event_type as enum (
  'concert', 'soiree', 'festival', 'showcase', 'open_mic',
  'battle', 'release_party', 'residency', 'autre'
);

create table events (
  id uuid default uuid_generate_v4() primary key,
  venue_id uuid references venues(id) on delete set null,
  organizer_id uuid references profiles(id) on delete set null,
  title text not null,
  type event_type not null,
  description text,
  date_start timestamptz not null,
  date_end timestamptz,
  status event_status default 'published',
  genres_wanted music_genre[],
  slots_available int default 0,
  looking_for_artists boolean default false,
  application_deadline timestamptz,
  fee_offered int,
  fee_description text,
  cover_image_url text,
  ticket_url text,
  is_free boolean default false,
  expected_audience int,
  source text default 'manual',
  source_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- APPLICATIONS (candidatures)
-- ============================================
create type application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

create table applications (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  artist_id uuid references profiles(id) on delete cascade not null,
  status application_status default 'pending',
  message text,
  response_message text,
  responded_at timestamptz,
  created_at timestamptz default now(),
  unique(event_id, artist_id)
);

-- ============================================
-- MESSAGING
-- ============================================
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_1 uuid references profiles(id) on delete cascade not null,
  participant_2 uuid references profiles(id) on delete cascade not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(participant_1, participant_2)
);

create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create type notification_type as enum (
  'application_received', 'application_accepted', 'application_rejected',
  'new_message', 'new_event', 'account_approved', 'account_rejected'
);

create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles enable row level security;
alter table artist_profiles enable row level security;
alter table venues enable row level security;
alter table events enable row level security;
alter table applications enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- Profiles: visible à tous, modifiable par soi-même
create policy "Profiles visibles par tous" on profiles for select using (true);
create policy "Profil modifiable par son propriétaire" on profiles for update using (auth.uid() = id);
create policy "Profil créable à l'inscription" on profiles for insert with check (auth.uid() = id);

-- Artist profiles
create policy "Artist profiles visibles" on artist_profiles for select using (true);
create policy "Artist profile modifiable" on artist_profiles for all using (auth.uid() = id);

-- Venues: visibles par tous
create policy "Venues visibles" on venues for select using (is_active = true);
create policy "Venue modifiable par owner" on venues for update using (auth.uid() = owner_id);
create policy "Venue créable par organisateur" on venues for insert with check (auth.uid() = owner_id);

-- Events: visibles par tous
create policy "Events visibles" on events for select using (status = 'published');
create policy "Event modifiable par organisateur" on events for update using (auth.uid() = organizer_id);
create policy "Event créable par organisateur" on events for insert with check (auth.uid() = organizer_id);

-- Applications
create policy "Application visible par artiste et organisateur" on applications for select
  using (
    auth.uid() = artist_id or
    auth.uid() in (select organizer_id from events where id = event_id)
  );
create policy "Application créable par artiste" on applications for insert with check (auth.uid() = artist_id);
create policy "Application modifiable" on applications for update
  using (
    auth.uid() = artist_id or
    auth.uid() in (select organizer_id from events where id = event_id)
  );

-- Conversations & messages
create policy "Conversation visible par participants" on conversations for select
  using (auth.uid() = participant_1 or auth.uid() = participant_2);
create policy "Conversation créable" on conversations for insert
  with check (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "Messages visibles par participants" on messages for select
  using (
    auth.uid() in (
      select participant_1 from conversations where id = conversation_id
      union
      select participant_2 from conversations where id = conversation_id
    )
  );
create policy "Message envoyable" on messages for insert with check (auth.uid() = sender_id);
create policy "Message lisible par destinataire" on messages for update
  using (
    auth.uid() in (
      select participant_1 from conversations where id = conversation_id
      union
      select participant_2 from conversations where id = conversation_id
    )
  );

-- Notifications
create policy "Notifications visibles par leur destinataire" on notifications for select
  using (auth.uid() = user_id);
create policy "Notification lue par destinataire" on notifications for update
  using (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger venues_updated_at before update on venues
  for each row execute function update_updated_at();
create trigger events_updated_at before update on events
  for each row execute function update_updated_at();

-- Trigger: créer profil à l'inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  -- Le profil est créé manuellement après l'inscription via le formulaire
  return new;
end;
$$ language plpgsql security definer;
