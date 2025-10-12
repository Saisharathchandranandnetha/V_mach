import { useState, useMemo } from 'react';
import { Search, ArrowRight, MessageCircle, Briefcase, TrendingUp, Users, BookOpen } from 'lucide-react';
import axios from 'axios';

const careerNews = [
	{
		id: 1,
		title: "AI Skills in High Demand for 2024",
		description: "Companies are increasingly seeking professionals with AI and machine learning expertise.",
		category: "Latest Career News",
		date: "2024-01-15"
	},
	{
		id: 2,
		title: "Remote Work Trends Continue to Rise",
		description: "Hybrid work models are becoming the new standard across industries.",
		category: "Latest Career News",
		date: "2024-01-14"
	},
	{
		id: 3,
		title: "Software Engineering Internship at TechCorp",
		description: "Join our dynamic team and work on cutting-edge projects.",
		category: "Jobs & Internships",
		company: "TechCorp",
		location: "San Francisco, CA"
	},
	{
		id: 4,
		title: "Data Science Fellowship Program",
		description: "12-month intensive program for recent graduates.",
		category: "Jobs & Internships",
		company: "DataFlow Inc",
		location: "Remote"
	},
	{
		id: 5,
		title: "How to Build a Strong Professional Network",
		description: "Essential tips for networking in the digital age.",
		category: "Tips & Mentorship",
		author: "Sarah Johnson"
	},
	{
		id: 6,
		title: "Resume Writing for Tech Professionals",
		description: "Stand out with these proven resume strategies.",
		category: "Tips & Mentorship",
		author: "Mike Chen"
	}
];

const categories = [
	{ key: 'all', label: 'All', icon: TrendingUp },
	{ key: 'news', label: 'Latest Career News', icon: BookOpen },
	{ key: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
	{ key: 'tips', label: 'Tips & Mentorship', icon: Users }
];

function CareerCard({ item }) {
	const getCategoryColor = (category) => {
		switch (category) {
			case 'Latest Career News': return 'bg-blue-600/20 text-blue-300 border-blue-600/30';
			case 'Jobs & Internships': return 'bg-green-600/20 text-green-300 border-green-600/30';
			case 'Tips & Mentorship': return 'bg-purple-600/20 text-purple-300 border-purple-600/30';
			default: return 'bg-gray-600/20 text-gray-300 border-gray-600/30';
		}
	};

	return (
		<div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
			<div className="flex items-start justify-between mb-4">
				<span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
					{item.category}
				</span>
				{item.date && (
					<span className="text-zinc-400 text-sm">{item.date}</span>
				)}
			</div>
			
			<h3 className="text-xl font-bold text-white mb-3 leading-tight">
				{item.title}
			</h3>
			
			<p className="text-zinc-300 mb-4 leading-relaxed">
				{item.description}
			</p>
			
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-zinc-400 text-sm">
					{item.company && (
						<>
							<Briefcase size={16} />
							<span>{item.company}</span>
						</>
					)}
					{item.location && (
						<span className="ml-2">• {item.location}</span>
					)}
					{item.author && (
						<>
							<Users size={16} />
							<span>{item.author}</span>
						</>
					)}
				</div>
				
				<button className="text-cyan-400 hover:text-cyan-300 transition-colors">
					<ArrowRight size={20} />
				</button>
			</div>
		</div>
	);
}

export default function CareerPage() {
	console.log('CareerPage component rendered'); // Debug log
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState('all');
	const [input, setInput] = useState('');
	const [chatLog, setChatLog] = useState([]);
	// New state to control chat box visibility
	const [showChat, setShowChat] = useState(false);

	const filteredItems = useMemo(() => {
		let filtered = careerNews;
		
		// Filter by category
		if (activeCategory !== 'all') {
			const categoryMap = {
				'news': 'Latest Career News',
				'jobs': 'Jobs & Internships',
				'tips': 'Tips & Mentorship'
			};
			filtered = filtered.filter(item => item.category === categoryMap[activeCategory]);
		}
		
		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(item =>
				item.title.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query) ||
				(item.company && item.company.toLowerCase().includes(query)) ||
				(item.author && item.author.toLowerCase().includes(query))
			);
		}
		
		return filtered;
	}, [searchQuery, activeCategory]);

	// Handles sending the user message to the API endpoint
	const handleSend = async () => {
		if (!input) return;
		setChatLog([...chatLog, { from: 'user', text: input }]);
		try {
			const res = await axios.post('http://localhost:3001/api/chat', {
				userId: '1', // Assume user 1 for demonstration
				message: input
			});
			setChatLog(prev => [...prev, { from: 'bot', text: res.data.reply }]);
		} catch (error) {
			setChatLog(prev => [...prev, { from: 'bot', text: 'Error processing request' }]);
		}
		setInput('');
	};

	return (
		<div className="min-h-screen bg-neutral-900 text-white">
			{/* Debug info */}
			<div className="fixed top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs z-50">
				CareerPage Active - Path: {window.location.pathname}
			</div>
			{/* Header */}
			<div className="sticky top-0 z-20 backdrop-blur bg-neutral-900/70 border-b border-white/10">
				<div className="px-5 pt-3 pb-4">
					<div className="mb-4 flex items-center justify-between">
						<h1 className="text-3xl font-bold tracking-tight">Career Guidance</h1>
						<div className="flex gap-2">
							{/* Updated Ask Mentor button */}
							<button
								onClick={() => setShowChat(true)}
								className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
							>
								<MessageCircle size={16} />
								Ask Mentor
							</button>
							<button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
								<Briefcase size={16} />
								Explore Jobs
							</button>
						</div>
					</div>
					
					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
						<input
							type="text"
							placeholder="Search careers, jobs, or mentors..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
						/>
					</div>
				</div>
			</div>

			{/* Category Tabs */}
			<div className="px-5 py-4">
				<div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
					{categories.map(category => {
						const Icon = category.icon;
						return (
							<button
								key={category.key}
								onClick={() => setActiveCategory(category.key)}
								className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
									activeCategory === category.key
										? 'bg-cyan-700/40 text-cyan-300'
										: 'bg-white/5 text-zinc-300 hover:bg-white/10'
								}`}
							>
								<Icon size={16} />
								{category.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Content */}
			<main className="px-5 pb-24 space-y-6">
				{filteredItems.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-zinc-400 text-lg mb-2">No results found</div>
						<div className="text-zinc-500 text-sm">Try adjusting your search or category filter</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
						{filteredItems.map(item => (
							<CareerCard key={item.id} item={item} />
						))}
					</div>
				)}
				
				{/* Conditionally render Chat Interface */}
				{showChat && (
					<div className="mt-12 max-w-3xl mx-auto bg-white/5 p-6 rounded-2xl border border-white/10">
						<h2 className="text-2xl font-bold mb-4">Career Guidance Chat</h2>
						<p className="text-zinc-400 text-sm mb-4">
							This module implements the career guidance flow: Onboarding → Profile storage → Knowledge ingestion → Chat interaction → LLM orchestration for recommendations.
						</p>
						<div className="border-t border-white/10 pt-4">
							<div className="h-60 overflow-y-auto mb-4">
								{chatLog.map((msg, index) => (
									<div key={index} className={`mb-2 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
										<span className={`block text-sm ${msg.from === 'user' ? 'text-cyan-400' : 'text-white'}`}>
											{msg.from === 'user' ? 'You' : 'Bot'}:
										</span>
										<span className={`block text-lg ${msg.from === 'user' ? 'text-white' : 'text-zinc-300'}`}>
											{msg.text}
										</span>
									</div>
								))}
							</div>
							
							<div className="flex">
								<input
									type="text"
									value={input}
									onChange={e => setInput(e.target.value)}
									placeholder="Ask your career-related question"
									className="flex-1 bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500/50 transition-colors mr-2"
								/>
								<button
									onClick={handleSend}
									className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
								>
									Send
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
