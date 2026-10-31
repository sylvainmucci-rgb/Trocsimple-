const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {}
  return seedData();
}

function seedData() {
  const now = Date.now();
  const data = {
    live: [
      {
        id: 'demo1',
        title: 'Jean Levi’s 501 – taille 32',
        category: 'Vêtements',
        description: 'Porté quelques fois, excellent état. Coupe classique.',
        photo: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
        want: 'Veste outdoor ou équivalent',
        valueOffer: 25,
        valueWant: 30,
        city: 'Lyon',
        contact: 'exemple@email.com',
        author: 'Léa',
        created: now - 86400000 * 2,
        published: now - 86400000,
        votes: ['Marc', 'Sophie', 'Julien', 'Camille', 'Paul'],
        rejects: []
      },
      {
        id: 'demo2',
        title: 'Cordes guitare acoustique (jeu complet)',
        category: 'Musique',
        description: 'Neuf, calibre .012, marque D’Addario.',
        photo: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',
        want: 'J’étudie toutes propositions de valeur similaire',
        valueOffer: 12,
        valueWant: 12,
        city: 'Eauze',
        contact: 'sylvain@exemple.fr',
        mondialRelay: true,
        author: 'Bfreeze',
        created: now - 3600000,
        published: now - 1800000,
        votes: ['Léa', 'Marc', 'Sophie', 'Julien', 'Camille'],
        rejects: []
      }
    ],
    pending: [
      {
        id: 'demo3',
        title: 'Sneakers Nike Air Force 1 – taille 42',
        category: 'Vêtements',
        description: 'Quasi neuves, boîte d’origine.',
        photo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
        want: 'Sac à dos de randonnée',
        valueOffer: 45,
        valueWant: 40,
        city: 'Marseille',
        contact: 'Signal: sneakers.troc',
        author: 'Julien',
        created: now - 7200000,
        votes: ['Léa', 'Marc'],
        rejects: []
      },
      {
        id: 'demo4',
        title: 'Livre « Le Petit Prince » édition illustrée',
        category: 'Livres & Médias',
        description: 'Comme neuf.',
        photo: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
        want: 'Autre livre jeunesse ou BD',
        valueOffer: 8,
        valueWant: 10,
        city: 'Bordeaux',
        contact: 'contact@exemple.fr',
        author: 'Camille',
        created: now - 1800000,
        votes: [],
        rejects: []
      }
    ]
  };
  saveData(data);
  return data;
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function checkAdmin(req, res, next) {
  const pwd = req.headers['x-admin-password'] || req.query.password;
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe admin incorrect' });
  }
  next();
}

// API publique
app.get('/api/listings', (req, res) => {
  const data = loadData();
  res.json({ live: data.live || [], pending: data.pending || [] });
});

app.post('/api/propose', (req, res) => {
  const data = loadData();
  const item = {
    id: 'id' + Date.now() + Math.random().toString(36).slice(2, 7),
    ...req.body,
    created: Date.now(),
    votes: [],
    rejects: []
  };
  if (!item.title || !item.want || !item.city || !item.contact || !item.category) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }
  data.pending = data.pending || [];
  data.pending.unshift(item);
  saveData(data);
  res.json({ ok: true, item });
});

app.post('/api/vote', (req, res) => {
  const { id, nick, approve } = req.body;
  if (!id || !nick) return res.status(400).json({ error: 'id et nick requis' });

  const data = loadData();
  const item = (data.pending || []).find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Annonce introuvable' });

  item.votes = item.votes || [];
  item.rejects = item.rejects || [];
  if (item.votes.includes(nick) || item.rejects.includes(nick)) {
    return res.json({ ok: true, already: true });
  }

  if (approve) {
    item.votes.push(nick);
    if (item.votes.length >= 5) {
      data.live = data.live || [];
      data.live.unshift({ ...item, published: Date.now() });
      data.pending = data.pending.filter(i => i.id !== id);
    }
  } else {
    item.rejects.push(nick);
    if (item.rejects.length >= 3) {
      data.pending = data.pending.filter(i => i.id !== id);
    }
  }
  saveData(data);
  res.json({ ok: true });
});

app.post('/api/delete', (req, res) => {
  const { id, nick } = req.body;
  if (!id || !nick) return res.status(400).json({ error: 'id et nick requis' });

  const data = loadData();
  let found = false;

  // Chercher dans pending
  const pendIndex = (data.pending || []).findIndex(i => i.id === id);
  if (pendIndex !== -1) {
    if (data.pending[pendIndex].author !== nick) {
      return res.status(403).json({ error: 'Tu ne peux supprimer que tes propres annonces' });
    }
    data.pending.splice(pendIndex, 1);
    found = true;
  }

  // Chercher dans live
  const liveIndex = (data.live || []).findIndex(i => i.id === id);
  if (liveIndex !== -1) {
    if (data.live[liveIndex].author !== nick) {
      return res.status(403).json({ error: 'Tu ne peux supprimer que tes propres annonces' });
    }
    data.live.splice(liveIndex, 1);
    found = true;
  }

  if (!found) return res.status(404).json({ error: 'Annonce introuvable' });

  saveData(data);
  res.json({ ok: true });
});

// Admin
app.get('/api/admin/listings', checkAdmin, (req, res) => {
  const data = loadData();
  res.json({ live: data.live || [], pending: data.pending || [] });
});

app.post('/api/admin/delete', checkAdmin, (req, res) => {
  const { id, type } = req.body; // type: 'live' or 'pending'
  const data = loadData();
  if (type === 'live') {
    data.live = (data.live || []).filter(i => i.id !== id);
  } else {
    data.pending = (data.pending || []).filter(i => i.id !== id);
  }
  saveData(data);
  res.json({ ok: true });
});

app.post('/api/admin/publish', checkAdmin, (req, res) => {
  const { id } = req.body;
  const data = loadData();
  const item = (data.pending || []).find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Introuvable' });
  data.live = data.live || [];
  data.live.unshift({ ...item, published: Date.now() });
  data.pending = data.pending.filter(i => i.id !== id);
  saveData(data);
  res.json({ ok: true });
});

app.post('/api/admin/reset', checkAdmin, (req, res) => {
  const data = seedData();
  res.json({ ok: true, data });
});

app.listen(PORT, () => {
  console.log(`TrocSimple backend démarré sur le port ${PORT}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
});