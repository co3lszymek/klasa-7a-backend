const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'tajnehaslo';

const readPosts = () => JSON.parse(fs.readFileSync('posts.json', 'utf8'));
const writePosts = (data) => fs.writeFileSync('posts.json', JSON.stringify(data, null, 2));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Błędne dane' });
  }
});

app.get('/posts', (req, res) => {
  const posts = readPosts();
  if (req.query.category) {
    return res.json(posts.filter(p => p.category === req.query.category));
  }
  res.json(posts);
});

app.post('/posts', auth, (req, res) => {
  const posts = readPosts();
  const post = {
    id: Date.now().toString(),
    ...req.body
  };
  posts.push(post);
  writePosts(posts);
  res.json(post);
});

app.delete('/posts/:id', auth, (req, res) => {
  const posts = readPosts().filter(p => p.id !== req.params.id);
  writePosts(posts);
  res.json({ ok: true });
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Brak autoryzacji' });
  }
}

app.listen(3000, () => console.log("API działa na porcie 3000"));
