import React, { useState } from 'react';
import axios from 'axios';

export default function ChatUI() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState([]);

  const send = async () => {
    if (!input) return;
    const userMsg = { from: 'user', text: input };
    setMsgs(m => [...m, userMsg]);
    try {
      const res = await axios.post('http://localhost:4000/api/chat', { userId: '1', message: input });
      const botMsg = { from: 'bot', text: res.data.reply || 'no reply' };
      setMsgs(m => [...m, botMsg]);
    } catch (err) {
      setMsgs(m => [...m, { from: 'bot', text: 'Error contacting API' }]);
    }
    setInput('');
  };

  return (
    <section>
      <h2>Chat — Career Guidance</h2>
      <div style={{ border: '1px solid #333', padding: 12, height: 240, overflowY: 'auto', background: '#071023' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.from}:</strong> <span>{m.text}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{ width: '70%' }} />
        <button onClick={send} style={{ marginLeft: 8 }}>Send</button>
      </div>
    </section>
  );
}
