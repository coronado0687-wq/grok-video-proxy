const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '50mb' }));

app.post('/api/videos/generations', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Authorization header requerido' });

    const response = await fetch('https://api.x.ai/v1/videos/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': auth },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/videos/:requestId', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Authorization header requerido' });

    const response = await fetch(`https://api.x.ai/v1/videos/${req.params.requestId}`, {
      headers: { 'Authorization': auth }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(POR
