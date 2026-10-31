# TrocSimple — Plateforme de troc multi-utilisateurs

Plateforme simple de troc entre particuliers (0 pub, 0 frais) avec vérification communautaire.

- Les gens proposent des objets
- 5 validations d’autres utilisateurs pour publier
- 3 rejets = suppression
- Valeur approximative optionnelle
- Photos (via URL)
- Contact direct entre les personnes

## Lancer en local

```bash
npm install
npm start
```

Puis ouvre : http://localhost:3000

## Déployer sur Render (gratuit)

### 1. Mettre le code sur GitHub
1. Crée un compte sur [github.com](https://github.com)
2. Crée un nouveau dépôt (ex. `troc-simple`)
3. Upload les fichiers :
   - `package.json`
   - `server.js`
   - le dossier `public/` (avec `index.html`)
4. Commit & push

### 2. Créer le service sur Render
1. Va sur [render.com](https://render.com) et connecte-toi avec GitHub
2. **New +** → **Web Service**
3. Sélectionne ton dépôt `troc-simple`
4. Remplis :

| Champ             | Valeur          |
|-------------------|-----------------|
| Name              | troc-simple     |
| Region            | Frankfurt       |
| Branch            | main            |
| Runtime           | Node            |
| Build Command     | `npm install`   |
| Start Command     | `npm start`     |
| Instance Type     | Free            |

5. Clique sur **Create Web Service**

Au bout de 1-2 minutes tu auras une URL publique du type :  
`https://troc-simple.onrender.com`

### Notes importantes
- Sur le plan gratuit, les données (`data.json`) sont effacées à chaque redémarrage ou après ~15 min d’inactivité.
- Pour garder les annonces durablement, il faudra plus tard une base de données (PostgreSQL sur Render ou Supabase).
- Le serveur utilise déjà `process.env.PORT`, donc il fonctionne directement sur Render.

## Admin

- URL : `/admin.html`
- Mot de passe par défaut : `admin123`
- Tu peux le changer en définissant la variable d’environnement `ADMIN_PASSWORD` sur Render.

Fonctions admin :
- Voir toutes les annonces (publiées et en attente)
- Publier une annonce manuellement
- Supprimer une annonce
- Réinitialiser avec les données factices

## Données factices

Au premier lancement (ou via le bouton admin), le serveur crée automatiquement quelques annonces d’exemple.

```
troc-backend/
├── package.json
├── server.js
├── public/
│   └── index.html
└── README.md
```
