-- ============================================================
-- SEED TOULOUSE — Lieux et données initiales
-- PartyDigger · À exécuter après schema.sql dans Supabase SQL editor
-- ============================================================

-- ── BARS ──────────────────────────────────────────────────

insert into venues (name, type, description, address, city, postal_code, latitude, longitude, capacity, instagram_handle, website_url, phone, email, accepted_genres, has_stage, has_sound_system, has_lighting, is_verified, is_active, source) values
(
  'Le Rex',
  'club',
  'Club incontournable du centre de Toulouse, programmation électro et rap.',
  '5 Rue de Valenciennes, Toulouse',
  'Toulouse', '31000', 43.6087, 1.4442, 800,
  'lerex_toulouse', 'https://lerextoulouse.com', '05 61 23 10 07', 'contact@lerextoulouse.com',
  ARRAY['electro', 'rap', 'rnb']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'Connexion Live',
  'salle_concert',
  'Salle de concerts emblématique de Toulouse, 300 à 700 personnes. Programmation rock, pop, électro.',
  '8 Rue Gabriel Péri, Toulouse',
  'Toulouse', '31000', 43.6041, 1.4432, 700,
  'connexionlive', 'https://connexionlive.com', '05 61 42 15 38', 'booking@connexionlive.com',
  ARRAY['rock', 'pop', 'electro', 'metal', 'folk']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'Le Bikini',
  'salle_concert',
  'Le Bikini est une salle de concerts de référence dans l''agglomération toulousaine. 700 à 1500 places.',
  'Route de Lacroix-Falgarde, Ramonville-Saint-Agne',
  'Toulouse', '31520', 43.5489, 1.4764, 1500,
  'lebikini', 'https://lebikini.com', '05 61 55 00 29', 'billetterie@lebikini.com',
  ARRAY['rock', 'pop', 'electro', 'rap', 'metal']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'Metronum',
  'salle_concert',
  'Salle de musiques actuelles à Toulouse, capacité 800 personnes. Programmation éclectique.',
  '2 Rond-Point Madame de Mondonville, Toulouse',
  'Toulouse', '31200', 43.6432, 1.4320, 800,
  'metronomtoulouse', 'https://metronum.fr', '05 34 31 18 18', 'contact@metronum.fr',
  ARRAY['rock', 'rap', 'electro', 'world', 'jazz']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'L''Astrada',
  'salle_concert',
  'Salle de concerts à Marciac, réputée pour le jazz en été.',
  '1 Rue du Temple, Marciac',
  'Toulouse', '32230', 43.5276, 0.1769, 400,
  'lastradademarciac', 'https://astrada.fr', NULL, 'contact@astrada.fr',
  ARRAY['jazz', 'soul', 'classique']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'Le Saint des Seins',
  'bar',
  'Bar rock-metal bien connu de Toulouse avec concerts réguliers. Ambiance underground.',
  '5 Place Saint-Pierre, Toulouse',
  'Toulouse', '31000', 43.6048, 1.4366, 150,
  'saintsdesseins', NULL, NULL, NULL,
  ARRAY['rock', 'metal', 'folk']::music_genre[], true, false, false, true, true, 'manual'
),
(
  'Aux Touche-Touche',
  'bar',
  'Bar concert intime dans le quartier Arnaud Bernard. Open mic et concerts de proximité.',
  '2 Place Arnaud Bernard, Toulouse',
  'Toulouse', '31000', 43.6112, 1.4395, 80,
  NULL, NULL, NULL, NULL,
  ARRAY['folk', 'jazz', 'soul', 'variete']::music_genre[], true, true, false, false, true, 'manual'
),
(
  'Le Purple',
  'bar',
  'Bar lounge avec concerts jazz et soul le week-end. Ambiance cosy.',
  '19 Rue Castellane, Toulouse',
  'Toulouse', '31000', 43.6020, 1.4460, 100,
  NULL, NULL, NULL, NULL,
  ARRAY['jazz', 'soul', 'rnb']::music_genre[], false, true, true, false, true, 'manual'
),
(
  'La Mêlée',
  'bar',
  'Bar culturel associatif avec programmation de concerts et expos.',
  '22 Rue de la Tannerie, Toulouse',
  'Toulouse', '31000', 43.6066, 1.4470, 120,
  NULL, NULL, NULL, 'contact@lamelee.org',
  ARRAY['rock', 'folk', 'world', 'electro']::music_genre[], true, true, false, false, true, 'manual'
),
(
  'Le Café Populaire',
  'bar',
  'Café-concert dans le quartier Compans-Caffarelli. Scène ouverte chaque semaine.',
  '9 Rue du Taur, Toulouse',
  'Toulouse', '31000', 43.6099, 1.4406, 100,
  NULL, NULL, NULL, NULL,
  ARRAY['folk', 'variete', 'jazz', 'soul']::music_genre[], true, true, false, false, true, 'manual'
),
(
  'La Dynamo de Banlieues Bleues',
  'salle_concert',
  'Scène de musiques actuelles à Pantin, programmation jazz et musiques improvisées.',
  '9 Rue Gabrielle Josserand, Pantin',
  'Toulouse', '31000', 43.6043, 1.4451, 350,
  'banlieuesbleues', 'https://banlieues-bleues.com', NULL, 'contact@banlieues-bleues.com',
  ARRAY['jazz', 'world', 'electro']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'Espace Bonnefoy',
  'espace_culturel',
  'Espace culturel de la mairie de Toulouse. Accueille concerts, spectacles et événements locaux.',
  '2 Allée Gabriel Biénès, Toulouse',
  'Toulouse', '31000', 43.6178, 1.4519, 300,
  NULL, 'https://toulouse.fr', NULL, NULL,
  ARRAY['classique', 'jazz', 'world', 'variete']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'La Sirène',
  'salle_concert',
  'La Sirène à La Rochelle est une référence nationale. À Toulouse, sa salle-jumelle accueille 700 spectateurs.',
  '28 Rue Roquelaine, Toulouse',
  'Toulouse', '31000', 43.6076, 1.4502, 700,
  'lasirenetoulouse', NULL, NULL, NULL,
  ARRAY['rock', 'pop', 'electro', 'rap']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'Le Boogaloo',
  'bar',
  'Bar live music dans Saint-Cyprien. Soul, funk et jazz en vedette.',
  '12 Rue Réclusane, Toulouse',
  'Toulouse', '31300', 43.5990, 1.4312, 90,
  NULL, NULL, NULL, NULL,
  ARRAY['soul', 'jazz', 'rnb']::music_genre[], true, true, false, false, true, 'manual'
),
(
  'La Cave Poésie',
  'espace_culturel',
  'Espace culturel historique de Toulouse dédié à la poésie, la chanson et les performances.',
  '71 Rue du Taur, Toulouse',
  'Toulouse', '31000', 43.6092, 1.4411, 80,
  'cavepoesie', 'https://cave-poesie.com', '05 61 23 62 00', NULL,
  ARRAY['variete', 'folk', 'jazz']::music_genre[], true, true, false, true, true, 'manual'
),
(
  'Toulouse Zénith',
  'salle_concert',
  'Grande salle de spectacles de Toulouse. Accueille les plus grandes tournées nationales et internationales.',
  'Boulevard Eisenhower, Toulouse',
  'Toulouse', '31100', 43.6152, 1.4785, 9000,
  'zenith_toulouse', 'https://zenith-toulouse.com', '05 62 74 49 49', NULL,
  ARRAY['pop', 'rap', 'rock', 'electro']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'La Mandragore',
  'bar',
  'Bar à ambiance celtique et folk, sessions acoustiques régulières.',
  '23 Place de la Daurade, Toulouse',
  'Toulouse', '31000', 43.6014, 1.4401, 70,
  NULL, NULL, NULL, NULL,
  ARRAY['folk', 'world', 'classique']::music_genre[], false, true, false, false, true, 'manual'
),
(
  'L''Ubu',
  'club',
  'Club électronique de référence à Toulouse, soirées techno et house. Grande piste de danse.',
  '16 Rue Saint-Rome, Toulouse',
  'Toulouse', '31000', 43.6039, 1.4441, 500,
  'ubu_toulouse', NULL, NULL, NULL,
  ARRAY['electro']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'Le Florida',
  'club',
  'Club historique de Toulouse. Rap, RnB et afrobeats au programme.',
  '12 Esplanade Compans-Caffarelli, Toulouse',
  'Toulouse', '31000', 43.6135, 1.4353, 600,
  'le_florida_tlse', NULL, NULL, NULL,
  ARRAY['rap', 'rnb', 'afrobeat']::music_genre[], true, true, true, true, true, 'manual'
),
(
  'La Fabrique Culturelle',
  'espace_culturel',
  'Espace dédié à la création artistique et musicale. Résidences, répétitions et concerts.',
  '45 Boulevard de la Marquette, Toulouse',
  'Toulouse', '31000', 43.6118, 1.4467, 200,
  NULL, NULL, NULL, 'contact@fabrique-culturelle.org',
  ARRAY['rap', 'electro', 'world', 'jazz']::music_genre[], true, true, true, false, true, 'manual'
);

-- ── ÉVÉNEMENTS D''EXEMPLE ────────────────────────────────

-- (Ces événements utilisent des venue_id fictifs — à adapter ou laisser null en prod)

insert into events (
  title, type, description, date_start, date_end, status,
  genres_wanted, slots_available, looking_for_artists,
  fee_offered, fee_description, is_free, expected_audience, source
) values
(
  'Open Mic Night — La Cave Poésie',
  'open_mic',
  'Soirée open mic mensuelle. Tous styles bienvenus, 10 min par artiste. Inscription sur place dès 19h.',
  NOW() + interval '7 days' + interval '20 hours',
  NOW() + interval '7 days' + interval '23 hours',
  'published',
  ARRAY['folk', 'variete', 'jazz', 'rap']::music_genre[],
  8, true, 0, 'Entrée libre + boisson offerte pour les artistes', true, 60,
  'manual'
),
(
  'Soirée Rap & RnB — Club Night',
  'soiree',
  'Nuit rap & RnB. Recherche artistes locaux pour les premières parties. Set de 20 min.',
  NOW() + interval '14 days' + interval '22 hours',
  NOW() + interval '15 days' + interval '3 hours',
  'published',
  ARRAY['rap', 'rnb']::music_genre[],
  2, true, 150, '150€ par artiste + défraiement', false, 300,
  'manual'
),
(
  'Festival Toulouse Électro Sessions',
  'festival',
  'Festival urbain sur 2 jours. Scène principale + scène émergents. Recherche artistes électro/club.',
  NOW() + interval '30 days',
  NOW() + interval '32 days',
  'published',
  ARRAY['electro', 'rap', 'afrobeat']::music_genre[],
  5, true, 300, '200 à 400€ selon notoriété', false, 2000,
  'manual'
),
(
  'Concert Jazz & Soul — Boogaloo',
  'concert',
  'Concert jazz et soul en formule quartet. Bar Boogaloo Saint-Cyprien.',
  NOW() + interval '5 days' + interval '21 hours',
  NOW() + interval '5 days' + interval '23 hours 30 minutes',
  'published',
  ARRAY['jazz', 'soul']::music_genre[],
  1, true, 80, '100€ + part sur la recette billet', false, 90,
  'manual'
),
(
  'Release Party Collective',
  'release_party',
  'Sortie d''album d''un collectif rap toulousain. Soirée au club, ambiance feu.',
  NOW() + interval '21 days' + interval '21 hours',
  NOW() + interval '22 days' + interval '2 hours',
  'published',
  ARRAY['rap', 'rnb']::music_genre[],
  3, true, 100, 'Défraiement + visibilité', false, 400,
  'manual'
),
(
  'Showcase Folk Acoustique',
  'showcase',
  'Showcase acoustique en format intime. 3 artistes. Ambiance cozy.',
  NOW() + interval '10 days' + interval '19 hours',
  NULL,
  'published',
  ARRAY['folk', 'variete']::music_genre[],
  2, true, 50, '60€ par artiste', false, 70,
  'manual'
),
(
  'Nuit Afrobeats — Le Florida',
  'soiree',
  'Soirée afrobeats, amapiano et dancehall. Recherche DJ set ou artiste live.',
  NOW() + interval '18 days' + interval '23 hours',
  NOW() + interval '19 days' + interval '4 hours',
  'published',
  ARRAY['afrobeat', 'rnb']::music_genre[],
  1, true, 200, '180€ + boissons', false, 500,
  'manual'
);

-- Message de confirmation
select 'Seed Toulouse injecté avec succès !' as status,
  (select count(*) from venues where city = 'Toulouse') as venues_count,
  (select count(*) from events) as events_count;
