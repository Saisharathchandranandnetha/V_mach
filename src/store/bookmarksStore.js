import { create } from 'zustand';

const STORAGE_KEY = 'vmach_bookmarks_v1';

function loadInitial() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

export const useBookmarksStore = create((set, get) => ({
	bookmarks: loadInitial(),
	toggleBookmark: (article) => {
		const { bookmarks } = get();
		const exists = bookmarks.find((b) => b.url === article.url);
		let next;
		if (exists) {
			next = bookmarks.filter((b) => b.url !== article.url);
		} else {
			next = [{ title: article.title, url: article.url, urlToImage: article.urlToImage }, ...bookmarks];
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		set({ bookmarks: next });
	},
	isBookmarked: (url) => !!get().bookmarks.find((b) => b.url === url),
})); 