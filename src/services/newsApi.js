const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

// Multiple CORS proxy options for reliability
const CORS_PROXIES = [
	'https://api.allorigins.win/raw?url=',
	'https://corsproxy.io/?',
	'https://thingproxy.freeboard.io/fetch/'
];

const TAB_TO_CATEGORY = {
	tech: 'technology',
	finance: 'business',
	arts: 'general',
};

async function tryFetchWithProxy(url, proxyIndex = 0) {
	if (proxyIndex >= CORS_PROXIES.length) {
		throw new Error('All CORS proxies failed');
	}
	
	const proxy = CORS_PROXIES[proxyIndex];
	const proxyUrl = proxy + encodeURIComponent(url);
	
	console.log(`Trying proxy ${proxyIndex + 1}: ${proxyUrl}`);
	
	try {
		const res = await fetch(proxyUrl, {
			headers: {
				'X-Api-Key': API_KEY,
			},
		});
		
		if (!res.ok) {
			throw new Error(`Proxy ${proxyIndex + 1} failed: ${res.status}`);
		}
		
		const json = await res.json();
		return json;
	} catch (error) {
		console.warn(`Proxy ${proxyIndex + 1} failed:`, error.message);
		return tryFetchWithProxy(url, proxyIndex + 1);
	}
}

export async function fetchTechNews(tabKey = 'tech') {
	const category = TAB_TO_CATEGORY[tabKey] || 'technology';
	
	// Check if API key is loaded
	if (!API_KEY) {
		console.error('API key not found in environment variables');
		throw new Error('API key not configured');
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
			// Try local proxy server first, then fallback to CORS proxies
			try {
				console.log('Trying local proxy server...');
				const proxyUrl = `${window.location.origin}/api/news/${category}`;
				const res = await fetch(proxyUrl);
				
				if (res.ok) {
					json = await res.json();
					console.log('Local proxy server successful');
				} else {
					throw new Error('Local proxy failed');
				}
			} catch (proxyError) {
				console.warn('Local proxy failed, trying CORS proxies:', proxyError.message);
				const apiUrl = `${BASE_URL}/top-headlines?category=${category}&language=en&pageSize=20`;
				json = await tryFetchWithProxy(apiUrl);
			}
		}
		
		console.log(`Received ${json.articles?.length || 0} articles for ${tabKey}`);
		console.log('API Response structure:', Object.keys(json));
		
		if (!json.articles || json.articles.length === 0) {
			console.warn('No articles returned from API');
			// Return some fallback articles if API fails
			return [
				{
					title: 'Sample Tech News',
					description: 'This is a sample article when the API is not available.',
					author: 'V_Mach',
					urlToImage: 'https://picsum.photos/800/450',
					url: '#'
				}
			];
		}
		
		return json.articles;
	} catch (error) {
		console.error('Fetch error:', error);
		if (error.name === 'TypeError' && error.message.includes('fetch')) {
			throw new Error('Network error. Please check your internet connection.');
		}
		throw error;
	}
} 