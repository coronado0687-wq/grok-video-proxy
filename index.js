const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '50mb' }));

// Generar imagen con Grok
app.post('/api/images/generations', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch(e) {
      res.status(response.status).json({ error: text });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generar video
app.post('/api/videos/generations', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    const body = { ...req.body };

    if (body.image && body.image.startsWith('data:')) {
      const base64 = body.image.split(',')[1];
      const formData = new URLSearchParams();
      formData.append('image', base64);
      formData.append('key', '1fbb9b3803819bf22cecd6642ca82810');

      const imgRes = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      });
      const imgData = await imgRes.json();
      if (imgData.success) {
        body.image = { url: imgData.data.url };
        console.log('Imagen subida:', imgData.data.url);
      } else {
        return res.status(500).json({ error: 'Error subiendo imagen' });
      }
    }

    const response = await fetch('https://api.x.ai/v1/videos/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    console.log('xAI response:', text.substring(0, 200));

    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch(e) {
      res.status(response.status).json({ error: text });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Consultar estado del video
app.get('/api/videos/:id', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
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
