const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Proxy endpoint for NewsAPI
app.get('/api/news/:category', async (req, res) => {
	try {
		const { category } = req.params;
		const apiKey = process.env.VITE_NEWS_API_KEY || process.env.NEWS_API_KEY;
		
		if (!apiKey) {
			return res.status(500).json({ error: 'API key not configured' });
		}
		
		const url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=20`;
		
		const response = await fetch(url, {
			headers: {
				'X-Api-Key': apiKey,
			},
		});
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return res.status(response.status).json(errorData);
		}
		
		const data = await response.json();
		res.json(data);
	} catch (error) {
		console.error('Proxy error:', error);
		res.status(500).json({ error: 'Failed to fetch news' });
	}
});

let profiles = {}; // in-memory store

app.post('/api/users/:id/profile', (req, res) => {
  const id = req.params.id;
  profiles[id] = req.body;
  return res.json({ ok: true, id, profile: profiles[id] });
});

app.post('/api/ingest', (req, res) => {
  // stub: accept ingest requests and respond accepted
  return res.json({ ok: true, message: 'ingest job accepted', received: req.body });
});

app.post('/api/chat', (req, res) => {
  const { userId, message } = req.body || {};
  // very small canned "RAG" style response using profile if available
  const profile = (userId && profiles[userId]) ? profiles[userId] : null;
  const reply = profile
    ? `Hello ${profile.name || 'user'}. Based on your skills (${profile.skills || 'none'}), I suggest focusing on: JavaScript fundamentals, system design, and a portfolio project. (got: "${message}")`
    : `Hello. To provide career guidance I need your profile. Try submitting it on the Onboard tab. (got: "${message}")`;
  return res.json({ ok: true, reply });
});

app.listen(PORT, () => {
	console.log(`News proxy server running on port ${PORT}`);
});
