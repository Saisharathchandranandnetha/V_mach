import React, { useState } from 'react';
import ProfileBuilder from './components/ProfileBuilder.jsx';
import ChatUI from './components/ChatUI.jsx';

export default function App() {
  const [view, setView] = useState('chat'); // 'onboard' or 'chat'

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', color: '#fff', background: '#0b1220', minHeight: '100vh' }}>
      <header style={{ marginBottom: 20 }}>
        <h1>V_Mach — Career Guidance (local stub)</h1>
        <nav style={{ marginTop: 8 }}>
          <button onClick={() => setView('onboard')} style={{ marginRight: 8 }}>Onboard</button>
          <button onClick={() => setView('chat')}>Chat</button>
        </nav>
      </header>

      <main>
        {view === 'onboard' ? <ProfileBuilder /> : <ChatUI />}
      </main>
    </div>
  );
}
