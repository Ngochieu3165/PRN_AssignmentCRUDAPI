'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function AuthDebug() {
    const { user, session, loading } = useAuth();
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const checkSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        setDebugInfo({
            session: session ? {
                access_token: session.access_token?.substring(0, 20) + '...',
                refresh_token: session.refresh_token?.substring(0, 20) + '...',
                expires_at: session.expires_at,
                expires_in: session.expires_in,
                user: session.user?.email,
            } : null,
            error,
            localStorage: typeof window !== 'undefined' ? {
                'sb-ftrladtmsketknrtroqj-auth-token': localStorage.getItem('sb-ftrladtmsketknrtroqj-auth-token')?.substring(0, 50) + '...'
            } : null
        });
    };

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: '#f0f0f0',
            padding: 10,
            border: '1px solid #ccc',
            fontSize: '12px',
            maxWidth: '300px',
            zIndex: 1000
        }}>
            <h4>Auth Debug</h4>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>User: {user?.email || 'None'}</p>
            <p>Session: {session ? 'Yes' : 'No'}</p>
            <button onClick={checkSession} style={{ fontSize: '12px' }}>
                Check Session
            </button>
            {debugInfo && (
                <pre style={{ fontSize: '10px', marginTop: 10 }}>
                    {JSON.stringify(debugInfo, null, 2)}
                </pre>
            )}
        </div>
    );
}