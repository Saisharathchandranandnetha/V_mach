import React, { useState } from 'react';
import axios from 'axios';

export default function ProfileBuilder() {
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/users/1/profile', { name, skills });
      setMessage('Profile saved.');
    } catch (err) {
      setMessage('Error saving profile.');
    }
  };

  return (
    <section>
      <h2>Onboard — Profile Builder</h2>
      <form onSubmit={submit}>
        <div>
          <label>Name</label><br />
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Skills (comma separated)</label><br />
          <textarea value={skills} onChange={e => setSkills(e.target.value)} rows="4" cols="40" />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Save Profile</button>
        </div>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}
