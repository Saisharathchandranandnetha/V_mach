import { create } from 'zustand';

export const useNewsStore = create((set) => ({
	articles: [],
	loading: false,
	error: '',
	setArticles: (articles) => set({ articles, loading: false, error: '' }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error, loading: false }),
})); 