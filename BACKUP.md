# Backup — Session OpenCode
**Date :** 3 Juin 2026
**User :** ucfzem (Youssef Zemmouri)

---

## Table des matières

1. [Tanger d'Antan → Migration is-a.dev](#1-tanger-dantan--migration-is-a-dev)
2. [NanoGen — Projet Complet](#2-nanogen--projet-complet)

---

## 1. Tanger d'Antan → Migration is-a.dev

### Objectif
Migrer le site `ucfzem.github.io/tanger` vers `tangerdantan.is-a.dev` via le service is-a.dev (Cloudflare Workers).

### Choix
- **Sous-domaine :** `tangerdantan.is-a.dev`
- **Fallback :** `tangerzaman.is-a.dev`
- **Cible :** Cloudflare Workers (`tanger.ucfzem.workers.dev`)

### Fichier is-a.dev Registration
**Path :** `domains/tangerdantan.json`
```json
{
  "owner": { "username": "ucfzem" },
  "record": { "CNAME": "tanger.ucfzem.workers.dev" }
}
```
**PR soumis :** https://github.com/is-a-dev/register/pull/39937

### Fichiers modifiés dans `ucfzem/tanger`

#### 1. `index.html`
- OG tags : `og:url`, `og:image` → `https://tangerdantan.is-a.dev/...`
- Share URL (Facebook) → `https://tangerdantan.is-a.dev/`
- Ajout : `<link rel="canonical" href="https://tangerdantan.is-a.dev/">`

#### 2. `sitemap.xml`
- Toutes les URLs : `https://ucfzem.github.io/tanger/...` → `https://tangerdantan.is-a.dev/...`

#### 3. `AGENTS.md`
- Ajout de la ligne : `Custom domain: https://tangerdantan.is-a.dev/ (via Cloudflare Workers CNAME)`

### Token GitHub
- Deux tokens utilisés (repo uniquement, puis repo+workflow)
- Tokens retirés du backup pour sécurité

---

## 2. NanoGen — Projet Complet

### Description
Application React (Vite) de génération d'images IA gratuite via Pollinations.ai. Multilingue (FR/EN/ES/AR), avec galerie, communauté, email gate et déploiement GitHub Pages.

### Structure
```
nanogen/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── .github/workflows/deploy.yml
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── i18n.js
│   ├── supabase.js
│   └── components/
│       ├── Header.jsx
│       ├── LanguageSelector.jsx
│       ├── Generator.jsx
│       ├── Gallery.jsx
│       ├── Community.jsx
│       ├── Profile.jsx
│       └── EmailGate.jsx
```

### Fonctionnalités
| Fonctionnalité | API/Service |
|---|---|
| Génération d'images | Pollinations.ai (gratuit, sans clé) |
| 9 styles (anime, réaliste, portrait, concept art, fantasy, sci-fi, huile, aquarelle, 3D) | Intégré |
| 4 formats (1:1, 16:9, 9:16, 4:3) | Intégré |
| Prompt Enhancer | Simulation locale |
| Prompt négatif | Intégré |
| 4 langues (FR, EN, ES, AR avec RTL) | i18n personnalisé |
| Email Gate (5 générations gratuites) | localStorage + Supabase ready |
| Galerie personnelle | localStorage |
| Communauté (posts, likes) | localStorage + Supabase ready |
| Profil utilisateur | localStorage |
| Téléchargement d'images | fetch + blob |
| Partage social (Web Share API) | Natif navigateur |
| API de génération (remplace Pollinations.ai) | Replicate (FLUX Schnell, clé gratuite) |

### Déploiement
- **Repo GitHub :** https://github.com/ucfzem/nanogen
- **URL :** https://ucfzem.github.io/nanogen/
- **Build :** GitHub Actions (workflow deploy.yml)
- **Alternative Netlify :** glisser `/tmp/nanogen/` sur https://app.netlify.com/drop

### Fichiers clés

#### `vite.config.js`
```js
export default defineConfig({
  plugins: [react()],
  base: '/nanogen/',
  server: { host: true, port: 3000 }
})
```

#### Supabase (optionnel)
- URL : `VITE_SUPABASE_URL` (dans `.env`)
- Clé : `VITE_SUPABASE_ANON_KEY` (dans `.env`)
- SQL de setup dans `src/supabase.js` (variable `SETUP_SQL`)
- Tables : `posts`, `comments`, `emails`

### Liens utiles
- PR is-a.dev : https://github.com/is-a-dev/register/pull/39937
- Repo Tanger : https://github.com/ucfzem/tanger
- Repo NanoGen : https://github.com/ucfzem/nanogen
- NanoGen en ligne : https://ucfzem.github.io/nanogen/
- Tanger (via GitHub Pages, legacy) : https://ucfzem.github.io/tanger/
- Tanger (nouveau domaine, en attente) : https://tangerdantan.is-a.dev/
