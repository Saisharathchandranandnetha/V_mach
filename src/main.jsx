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