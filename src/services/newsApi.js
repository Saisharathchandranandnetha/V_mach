const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

const TAB_TO_CATEGORY = {
	tech: 'technology',
	finance: 'business',
	arts: 'general',
};

// Sample news data as fallback
const SAMPLE_NEWS = {
	tech: [
		{
			title: 'AI Breakthrough: New Language Model Shows Remarkable Capabilities',
			description: 'Researchers have developed a new artificial intelligence model that demonstrates unprecedented understanding of human language and context.',
			author: 'Tech Reporter',
			urlToImage: 'https://picsum.photos/800/450?random=1',
			url: 'https://example.com/ai-breakthrough'
		},
		{
			title: 'Quantum Computing Milestone Achieved',
			description: 'Scientists have successfully created a stable quantum computer with 1000+ qubits, marking a significant advancement in computing technology.',
			author: 'Science Daily',
			urlToImage: 'https://picsum.photos/800/450?random=2',
			url: 'https://example.com/quantum-computing'
		},
		{
			title: 'SpaceX Launches Revolutionary Satellite Constellation',
			description: 'Elon Musk\'s company successfully deployed the latest batch of Starlink satellites, expanding global internet coverage.',
			author: 'Space News',
			urlToImage: 'https://picsum.photos/800/450?random=3',
			url: 'https://example.com/spacex-launch'
		}
	],
	finance: [
		{
			title: 'Global Markets Reach New Heights',
			description: 'Major stock indices worldwide have achieved record-breaking levels, driven by strong corporate earnings and economic recovery.',
			author: 'Financial Times',
			urlToImage: 'https://picsum.photos/800/450?random=4',
			url: 'https://example.com/markets-high'
		},
		{
			title: 'Cryptocurrency Adoption Surges',
			description: 'Digital currencies are gaining mainstream acceptance as major corporations begin accepting Bitcoin and other cryptocurrencies.',
			author: 'Crypto News',
			urlToImage: 'https://picsum.photos/800/450?random=5',
			url: 'https://example.com/crypto-adoption'
		},
		{
			title: 'Green Energy Investments Soar',
			description: 'Renewable energy companies are attracting unprecedented levels of investment as the world transitions to sustainable power sources.',
			author: 'Green Finance',
			urlToImage: 'https://picsum.photos/800/450?random=6',
			url: 'https://example.com/green-energy'
		}
	],
	arts: [
		{
			title: 'Revolutionary Art Exhibition Opens',
			description: 'A groundbreaking digital art exhibition featuring AI-generated masterpieces has opened to critical acclaim in major cities worldwide.',
			author: 'Art Critic',
			urlToImage: 'https://picsum.photos/800/450?random=7',
			url: 'https://example.com/art-exhibition'
		},
		{
			title: 'Cultural Festival Celebrates Diversity',
			description: 'The annual international cultural festival brings together artists, musicians, and performers from over 50 countries.',
			author: 'Culture Weekly',
			urlToImage: 'https://picsum.photos/800/450?random=8',
			url: 'https://example.com/cultural-festival'
		},
		{
			title: 'Virtual Reality Transforms Entertainment',
			description: 'VR technology is revolutionizing how we experience movies, games, and live performances, creating immersive new forms of entertainment.',
			author: 'Entertainment News',
			urlToImage: 'https://picsum.photos/800/450?random=9',
			url: 'https://example.com/vr-entertainment'
		}
	]
};

export async function fetchTechNews(tabKey = 'tech', options = {}) {
	const { signal } = options || {};
	const category = TAB_TO_CATEGORY[tabKey] || 'technology';
	
	// Check if API key is loaded
	if (!API_KEY) {
		console.error('API key not found in environment variables');
		return SAMPLE_NEWS[tabKey] || SAMPLE_NEWS.tech;
	}
	
	// Build URL with apiKey as query param (works with proxies too)
	const apiUrl = `${BASE_URL}/top-headlines?category=${category}&language=en&pageSize=20&apiKey=${API_KEY}`;
	const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

	try {
		let res;
		if (isLocalhost) {
			res = await fetch(apiUrl, { signal, cache: 'no-store' });
		} else {
			const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
			res = await fetch(proxyUrl, { signal, cache: 'no-store' });
		}
		
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			if (res.status === 429) {
				throw new Error('Rate limit exceeded. Please try again later.');
			} else if (res.status === 401) {
				throw new Error('Invalid API key. Please check your configuration.');
			} else if (res.status === 403) {
				throw new Error('Access forbidden. Your API key may not have permission for this endpoint.');
			} else {
				throw new Error(errorData.message || `HTTP ${res.status}: Failed to fetch news`);
			}
		}
		
		const json = await res.json();
		if (!json.articles || json.articles.length === 0) {
			return SAMPLE_NEWS[tabKey] || SAMPLE_NEWS.tech;
		}
		return json.articles;
	} catch (error) {
		if (error?.name === 'AbortError') {
			return [];
		}
		console.error('Fetch error:', error);
		return SAMPLE_NEWS[tabKey] || SAMPLE_NEWS.tech;
	}
}