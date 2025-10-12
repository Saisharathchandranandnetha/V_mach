import React, { useState } from 'react';
import axios from 'axios';

export default function ProfileBuilder() {
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !skills.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await axios.post('http://localhost:3001/api/users/1/profile', { 
        name: name.trim(), 
        skills: skills.trim() 
      });
      setMessage('Profile saved successfully!');
      setName('');
      setSkills('');
    } catch (err) {
      console.error('Profile save error:', err);
      if (err.response?.status === 404) {
        setError('Server not running. Please start the backend server.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to save profile. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: 20, fontFamily: 'system-ui, sans-serif', color: '#fff', background: '#0b1220', minHeight: '100vh' }}>
      <h2 style={{ color: '#fff', marginBottom: 20 }}>Onboard — Profile Builder</h2>
      <form onSubmit={submit} style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#fff' }}>Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)}
            style={{ 
              width: '100%', 
              padding: 12, 
              borderRadius: 8, 
              border: '1px solid #333', 
              background: '#1a1f2b', 
              color: '#fff',
              fontSize: 16
            }}
            disabled={loading}
            placeholder="Enter your name"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#fff' }}>Skills (comma separated)</label>
          <textarea 
            value={skills} 
            onChange={e => setSkills(e.target.value)} 
            rows="4" 
            style={{ 
              width: '100%', 
              padding: 12, 
              borderRadius: 8, 
              border: '1px solid #333', 
              background: '#1a1f2b', 
              color: '#fff',
              fontSize: 16,
              resize: 'vertical'
            }}
            disabled={loading}
            placeholder="e.g., JavaScript, React, Python, Machine Learning"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: loading ? '#666' : '#0ea5e9', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: 8, 
              border: 'none', 
              fontSize: 16, 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
      {message && (
        <div style={{ 
          background: '#10b981', 
          color: '#fff', 
          padding: 12, 
          borderRadius: 8, 
          marginTop: 16 
        }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ 
          background: '#ef4444', 
          color: '#fff', 
          padding: 12, 
          borderRadius: 8, 
          marginTop: 16 
        }}>
          {error}
        </div>
      )}
    </section>
  );
}
