'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: 520, maxWidth: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 18, height: 18, background: '#3b82f6', borderRadius: 4 }} />
          <span style={{ fontWeight: 700 }}>AanimeTV</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>Welcome back</h1>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>Sign in to your account</p>

        <button style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'not-allowed', color: '#111827' }} disabled>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
          <div style={{ height: 1, background: '#e5e7eb', flex: 1 }} />
          <span style={{ color: '#9ca3af', fontSize: 12 }}>or</span>
          <div style={{ height: 1, background: '#e5e7eb', flex: 1 }} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Login</h2>
        <p style={{ color: '#6b7280', marginTop: 0, marginBottom: 16 }}>Enter your email below to login to your account</p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>
            {error}
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
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
              placeholder="m@example.com"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Password</label>
              <a href="/forgot-password" style={{ fontSize: 12 }}>Forgot your password?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, color: '#6b7280' }}>
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
}


