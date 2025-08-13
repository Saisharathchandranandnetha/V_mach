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

export async function fetchTechNews(tabKey = 'tech') {
	const category = TAB_TO_CATEGORY[tabKey] || 'technology';
	
	// Check if API key is loaded
	if (!API_KEY) {
		console.error('API key not found in environment variables');
		console.log('Using sample news data');
		return SAMPLE_NEWS[tabKey] || SAMPLE_NEWS.tech;
	}
	
	// Use CORS proxy for deployed sites, direct API for local development
	const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
	
	console.log(`Fetching news for ${tabKey} (category: ${category})`);
	console.log('API Key present:', !!API_KEY);
	console.log('Environment:', isLocalhost ? 'local' : 'deployed');
	
	try {
		let json;
		
		if (isLocalhost) {
			// Direct API call for local development
			const apiUrl = `${BASE_URL}/top-headlines?category=${category}&language=en&pageSize=20`;
			console.log('Using direct API:', apiUrl);
			
			const res = await fetch(apiUrl, {
				headers: {
					'X-Api-Key': API_KEY,
				},
			});
			
			console.log('Response status:', res.status);
			
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				console.error('API Error details:', errorData);
				
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
			
			json = await res.json();
		} else {
			// For deployed sites, try a simple CORS proxy first
			try {
				const apiUrl = `${BASE_URL}/top-headlines?category=${category}&language=en&pageSize=20`;
				const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
				
				console.log('Trying CORS proxy:', proxyUrl);
				
				const res = await fetch(proxyUrl, {
					headers: {
						'X-Api-Key': API_KEY,
					},
				});
				
				if (res.ok) {
					json = await res.json();
					console.log('CORS proxy successful');
				} else {
					throw new Error('CORS proxy failed');
				}
			} catch (proxyError) {
				console.warn('CORS proxy failed, using sample data:', proxyError.message);
				return SAMPLE_NEWS[tabKey] || SAMPLE_NEWS.tech;
			}
		}
		
		console.log(`Received ${json.articles?.length || 0} articles for ${tabKey}`);
		
		if (!json.articles || json.articles.length === 0) {
			console.warn('No articles returned from API, using sample data');
			return SAMPLE_NEWS[tabKey] || SAMPLE_NEWS.tech;
		}
		
		return json.articles;
	} catch (error) {
		console.error('Fetch error:', error);
		console.log('Falling back to sample news data');
		return SAMPLE_NEWS[tabKey] || SAMPLE_NEWS.tech;
	}
} 