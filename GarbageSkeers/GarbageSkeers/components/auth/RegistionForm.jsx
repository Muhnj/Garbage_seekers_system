'use client';

import { useState } from 'react';
import { SignUpWithEmail } from '@/utils/authService';

const roles = ['admin', 'trainer', 'client'];
const genders = ['male', 'female', 'other'];

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client',
    gender: 'male',
    dateOfBirth: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await SignUpWithEmail(form);
      alert('Signup successful!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold">Register</h2>

      <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" className="w-full p-2 border rounded" />
      <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Email" className="w-full p-2 border rounded" />
      <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Password" className="w-full p-2 border rounded" />
      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone (e.g., +256...)" className="w-full p-2 border rounded" />

      <select name="role" value={form.role} onChange={handleChange} className="w-full p-2 border rounded">
        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
      </select>

      <select name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 border rounded">
        {genders.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>

      <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required className="w-full p-2 border rounded" />

      {error && <div className="text-red-600">{error}</div>}

      <button type="submit" disabled={loading} className="bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700">
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
