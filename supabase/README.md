# PartyDigger — Setup Supabase

## Étapes d'installation

### 1. Créer un projet Supabase
1. Va sur [supabase.com](https://supabase.com) et crée un compte
2. Crée un nouveau projet → choisis la région **EU West** (Paris)
3. Note ton **Project URL** et ta **anon key** (Settings → API)

### 2. Configurer les variables d'environnement
1. Copie `.env.local.example` en `.env.local`
2. Remplis `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Créer le schéma
1. Dans Supabase → **SQL Editor** → **New query**
2. Copie-colle le contenu de `schema.sql`
3. Clique **Run**

### 4. Injecter les données Toulouse
1. Dans Supabase → **SQL Editor** → **New query**
2. Copie-colle le contenu de `seed_toulouse.sql`
3. Clique **Run**
→ 20 lieux toulousains + 6 événements exemples seront créés

### 5. Créer le compte admin
1. Dans Supabase → **Authentication** → **Users** → **Invite user**
2. Entre ton email
3. Dans **SQL Editor** :
```sql
update profiles set role = 'admin', status = 'active' where email_contact = 'TON_EMAIL';
```

### 6. Configurer l'auth email
- Supabase → Authentication → Providers → Email → activé par défaut
- Optionnel : désactiver "Confirm email" pour les tests

---

## Déploiement Vercel

1. `npm run build` (test local)
2. Push sur GitHub
3. [vercel.com](https://vercel.com) → Import project → GitHub
4. Ajouter les variables d'env dans Vercel (Settings → Environment Variables)
5. Deploy → ton lien de partage est prêt !

## Partage aux testeurs
Une fois déployé sur Vercel :
- Envoie l'URL Vercel à tes testeurs
- Sur mobile : ouvrir dans Safari/Chrome → "Ajouter à l'écran d'accueil"
- L'app s'installe comme une vraie app native
