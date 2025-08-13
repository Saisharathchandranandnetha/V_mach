const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

const TAB_TO_CATEGORY = {
	tech: 'technology',
	finance: 'business',
	arts: 'entertainment',
};

export async function fetchTechNews(tabKey = 'tech') {
	const category = TAB_TO_CATEGORY[tabKey] || 'technology';
	const url = `${BASE_URL}/top-headlines?category=${category}&language=en&pageSize=20`;
	const res = await fetch(url, {
		headers: {
			'X-Api-Key': API_KEY,
		},
	});
	if (!res.ok) throw new Error('Failed to fetch news');
	const json = await res.json();
	return json.articles || [];
} 