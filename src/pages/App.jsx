import { useEffect, useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Headphones, Search, Home, BadgeHelp, Radio } from 'lucide-react';
import { useNewsStore } from '../store/newsStore.js';
import { useBookmarksStore } from '../store/bookmarksStore.js';
import { fetchTechNews } from '../services/newsApi.js';

const tabs = [
	{ key: 'tech', label: 'Tech & Science' },
	{ key: 'finance', label: 'Finance' },
	{ key: 'arts', label: 'Arts & Culture' },
];

function TopTabs({ active, onChange }) {
	return (
		<div className="sticky top-0 z-20 backdrop-blur bg-neutral-900/70">
			<div className="px-5 pt-3 pb-2">
				<h1 className="text-4xl font-semibold tracking-tight mb-3">V_Mach <span className="ml-2 text-zinc-500 text-sm font-normal">by  Mach__Infinity</span></h1>
				<div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
					{tabs.map(t => (
						<button
							key={t.key}
							onClick={() => onChange(t.key)}
							className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
								active === t.key
									? 'bg-cyan-700/40 text-cyan-300'
									: 'bg-white/5 text-zinc-300 hover:bg-white/10'
							}`}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function NewsCard({ article }) {
	const headline = article.title || 'Untitled';
	const description = article.description || '';
	const author = article.author || 'Unknown';
	const imageUrl = article.urlToImage || 'https://picsum.photos/800/450';
	const open = () => window.open(article.url, '_blank', 'noopener');
	const { toggleBookmark, isBookmarked } = useBookmarksStore();
	const bookmarked = isBookmarked(article.url);

	return (
		<article onClick={open} className="select-none cursor-pointer">
			<div className="rounded-2xl overflow-hidden bg-white/5 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
				<div className="aspect-[16/10] w-full overflow-hidden">
					<img src={imageUrl} alt={headline} className="h-full w-full object-cover" />
				</div>
				<div className="px-5 pt-4 pb-5">
					<h2 className="text-white text-3xl font-extrabold leading-tight tracking-tight drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
						{headline}
					</h2>
					<p className="text-zinc-300/80 mt-3 text-lg leading-relaxed line-clamp-2">
						{description}
					</p>
					<div className="mt-5 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}`} alt="author" className="h-7 w-7 rounded-full" />
							<span className="text-zinc-300 text-base">
								{author}
							</span>
						</div>
						<div className="flex items-center gap-3 text-white/80">
							<button
								className={`p-2 rounded-full ${bookmarked ? 'bg-cyan-600/30' : 'bg-white/10 hover:bg-white/20'}`}
								onClick={(e) => { e.stopPropagation(); toggleBookmark(article); }}
								aria-label="bookmark"
							>
								{bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
							</button>
							<button className="p-2 rounded-full bg-white/10 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); speakArticle(headline + '. ' + description); }} aria-label="listen">
								<Headphones size={20} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}

function speakArticle(text) {
	if ('speechSynthesis' in window) {
		const utter = new SpeechSynthesisUtterance(text);
		utter.rate = 1.02;
		utter.pitch = 1.0;
		utter.lang = 'en-US';
		window.speechSynthesis.speak(utter);
	}
}

export default function App() {
	const [activeTab, setActiveTab] = useState('tech');
	const { articles, loading, error, setArticles, setLoading, setError } = useNewsStore();
	const [query, setQuery] = useState('');

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				setLoading(true);
				setError('');
				const data = await fetchTechNews(activeTab);
				if (!cancelled) setArticles(data);
			} catch (e) {
				if (!cancelled) {
					console.error('News fetch error:', e);
					setError(e.message || 'Could not load news');
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => { cancelled = true; };
	}, [activeTab, setArticles, setLoading, setError]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return articles;
		return articles.filter(a =>
			(a.title || '').toLowerCase().includes(q) ||
			(a.description || '').toLowerCase().includes(q) ||
			(a.author || '').toLowerCase().includes(q)
		);
	}, [query, articles]);

	return (
		<div className="min-h-screen flex flex-col">
			<TopTabs active={activeTab} onChange={setActiveTab} />
			<main className="px-4 md:px-6 lg:px-10 pb-24 space-y-6">
				<section className="grid grid-cols-1 gap-5 max-w-3xl mx-auto">
					{loading && (
						<div className="text-center py-8">
							<div className="text-zinc-400 text-lg">Loading {activeTab === 'tech' ? 'Tech & Science' : activeTab === 'finance' ? 'Finance' : 'Arts & Culture'} news...</div>
						</div>
					)}
					{error && (
						<div className="text-center py-8">
							<div className="text-red-400 text-lg mb-2">{error}</div>
							<div className="text-zinc-500 text-sm">Try switching tabs or check your connection</div>
						</div>
					)}
					{!loading && !error && filtered.length === 0 && (
						<div className="text-center py-8">
							<div className="text-zinc-400 text-lg">No articles found</div>
						</div>
					)}
					{filtered.map((a, idx) => (
						<NewsCard key={idx} article={a} />
					))}
				</section>
			</main>
			<nav className="fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
				<div className="mx-auto max-w-3xl px-8 py-2 flex items-center justify-between">
					<button className="p-3 text-white/80 hover:text-white transition-colors"><Search size={22} />
						<input
							placeholder="Search articles"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="ml-3 hidden sm:inline bg-transparent outline-none placeholder:text-white/50"
						/>
					</button>
					<button className="p-3 text-white/80 hover:text-white transition-colors"><Home size={22} /></button>
					<button className="p-3 text-white/80 hover:text-white transition-colors"><BadgeHelp size={22} /></button>
					<button className="p-3 text-white/80 hover:text-white transition-colors"><Radio size={22} /></button>
				</div>
			</nav>
		</div>
	);
} 