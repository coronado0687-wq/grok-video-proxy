const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use((req, res, next) => {
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) {
      console.error('JSON parse error:', err.message);
      return res.status(400).json({ error: 'JSON invalido: ' + err.message });
    }
    next();
  });
});

app.post('/api/videos/generations', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    console.log('Auth recibido:', auth ? auth.substring(0, 20) + '...' : 'NINGUNO');
    console.log('Body keys:', Object.keys(req.body || {}));

    if (!auth) return res.status(401).json({ error: 'Falta Authorization' });

    const body = { ...req.body };
    console.log('Enviando a xAI modelo:', body.model);

    const response = await fetch('https://api.x.ai/v1/videos/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('xAI status:', response.status);
    res.status(response.status).json(data);
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/videos/:id', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    const response = await fetch(`https://api.x.ai/v1/videos/${req.params.id}`, {
      headers: { 'Authorization': auth }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Puerto: ' + PORT));
