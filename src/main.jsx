// Career Guidance Chat Flow (per chart image):
//  1) Onboarding (Profile Builder)
//  2) Profile storage (/api/users/:id/profile)
//  3) Knowledge Ingestor (/api/ingest)
//  4) Chat interaction (/api/chat)
//  5) LLM Orchestrator for recommendations
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './pages/App.jsx';
import CareerPage from './pages/CareerPage.jsx';

const router = createBrowserRouter([
	{ path: '/', element: <App /> },
	{ path: '/career', element: <CareerPage /> },
	{ path: '*', element: <App /> }, // Fallback route
]);

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);