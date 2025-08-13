const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

// Use a more reliable CORS proxy
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const TAB_TO_CATEGORY = {
	tech: 'technology',
	finance: 'business',
	arts: 'general',
};

export async function fetchTechNews(tabKey = 'tech') {
	const category = TAB_TO_CATEGORY[tabKey] || 'technology';
	
	// Check if API key is loaded
	if (!API_KEY) {
		console.error('API key not found in environment variables');
		throw new Error('API key not configured');
	}
	
	// Use CORS proxy for deployed sites, direct API for local development
	const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
	
	let url;
	if (isLocalhost) {
		url = `${BASE_URL}/top-headlines?category=${category}&language=en&pageSize=20`;
	} else {
		// Encode the full URL for the CORS proxy
		const apiUrl = `${BASE_URL}/top-headlines?category=${category}&language=en&pageSize=20`;
		url = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;
	}
	
	console.log(`Fetching news for ${tabKey} using URL:`, url);
	console.log('API Key present:', !!API_KEY);
	console.log('Using CORS proxy:', !isLocalhost);
	
	try {
		const headers = isLocalhost ? {
			'X-Api-Key': API_KEY,
		} : {
			'X-Api-Key': API_KEY,
		};
		
		const res = await fetch(url, { headers });
		
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
		
		const json = await res.json();
		console.log(`Received ${json.articles?.length || 0} articles for ${tabKey}`);
		
		if (!json.articles || json.articles.length === 0) {
			console.warn('No articles returned from API');
		}
		
		return json.articles || [];
	} catch (error) {
		console.error('Fetch error:', error);
		if (error.name === 'TypeError' && error.message.includes('fetch')) {
			throw new Error('Network error. Please check your internet connection.');
		}
		throw error;
	}
} 