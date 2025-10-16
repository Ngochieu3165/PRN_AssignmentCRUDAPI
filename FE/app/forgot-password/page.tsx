'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/update-password` : undefined,
    });
    if (error) setError(error.message); else setMessage('If the email exists, a reset link has been sent.');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: 520, maxWidth: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0' }}>Forgot Password</h1>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>Enter your email to receive a password reset link</p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>
            {message}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 600 }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </div>
  );
}


