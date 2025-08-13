const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for NewsAPI
app.get('/api/news/:category', async (req, res) => {
	try {
		const { category } = req.params;
		const apiKey = process.env.VITE_NEWS_API_KEY;
		
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

app.listen(PORT, () => {
	console.log(`News proxy server running on port ${PORT}`);
});
