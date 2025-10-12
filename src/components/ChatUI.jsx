import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatUI() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { from: 'user', text: input.trim() };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:3001/api/chat', { 
        userId: '1', 
        message: input.trim() 
      });
      const botMsg = { from: 'bot', text: res.data.reply || 'No response received' };
      setMsgs(m => [...m, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      let errorMsg = 'Error contacting API';
      
      if (err.response?.status === 404) {
        errorMsg = 'Server not running. Please start the backend server.';
      } else if (err.response?.status >= 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMsg = 'Network error. Please check your connection.';
      }
      
      setMsgs(m => [...m, { from: 'bot', text: errorMsg, isError: true }]);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <section style={{ padding: 20, fontFamily: 'system-ui, sans-serif', color: '#fff', background: '#0b1220', minHeight: '100vh' }}>
      <h2 style={{ color: '#fff', marginBottom: 20 }}>Chat — Career Guidance</h2>
      
      <div style={{ 
        border: '1px solid #333', 
        padding: 16, 
        height: 400, 
        overflowY: 'auto', 
        background: '#071023',
        borderRadius: 8,
        marginBottom: 16
      }}>
        {msgs.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: 20,
            fontStyle: 'italic'
          }}>
            Start a conversation about your career goals...
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ 
            marginBottom: 12, 
            padding: 12,
            borderRadius: 8,
            background: m.from === 'user' ? '#0ea5e9' : m.isError ? '#ef4444' : '#1a1f2b',
            color: '#fff'
          }}>
            <div style={{ 
              fontSize: 12, 
              opacity: 0.8, 
              marginBottom: 4,
              fontWeight: 'bold'
            }}>
              {m.from === 'user' ? 'You' : 'Career Bot'}
            </div>
            <div>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            color: '#0ea5e9', 
            padding: 12,
            fontStyle: 'italic'
          }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div style={{ 
          background: '#ef4444', 
          color: '#fff', 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          placeholder="Ask about career guidance..."
          style={{ 
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: '1px solid #333',
            background: '#1a1f2b',
            color: '#fff',
            fontSize: 16
          }}
        />
        <button 
          onClick={send} 
          disabled={loading || !input.trim()}
          style={{ 
            background: loading || !input.trim() ? '#666' : '#0ea5e9',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </section>
  );
}
