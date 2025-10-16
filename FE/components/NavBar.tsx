'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { cartApi } from '@/lib/api';

export default function NavBar() {
  const { user, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (user) {
          const cart = await cartApi.get();
          if (!active) return;
          const total = cart.items.reduce((s, i) => s + i.quantity, 0);
          setCartCount(total);
        } else {
          setCartCount(0);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { active = false; };
  }, [user]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      const { cart } = event.detail;
      if (cart) {
        const total = cart.items.reduce((s: any, i: any) => s + i.quantity, 0);
        setCartCount(total);
      }
    };

    const handleProductChange = (event: CustomEvent) => {
      const { action, productId } = event.detail;
      if (action === 'delete') {
        // Refresh cart when product is deleted
        if (user) {
          cartApi.get().then(cart => {
            const total = cart.items.reduce((s, i) => s + i.quantity, 0);
            setCartCount(total);
          }).catch(() => {});
        }
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    window.addEventListener('productChanged', handleProductChange as EventListener);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
      window.removeEventListener('productChanged', handleProductChange as EventListener);
    };
  }, [user]);

  if (loading) {
    return (
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
        <Link href="/">Home</Link>
        <div style={{ marginLeft: 'auto' }}>Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="nav">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" className="brand">
          <span className="brand-square" />
          AanimeTV
        </Link>
        <div className="menu-left">
          <Link href="/" className="menu-link">Home</Link>
        </div>
      </div>
      <div className="nav-right" style={{ position: 'relative' }}>
        {user ? (
          <>
            {/* Icons for Cart and Orders */}
            <Link href="/cart" aria-label="Cart" title="Cart" className="cart-icon-wrap">
              <span id="navbar-cart-icon">🛒</span>
              {cartCount > 0 && <span className="cart-badge" id="navbar-cart-badge">{cartCount}</span>}
            </Link>
            <Link href="/orders" aria-label="Orders" title="Orders" className="orders-icon-wrap">
              📦
            </Link>
            {/* Avatar circle with dropdown (Sign out) */}
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#111827',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="User menu"
            >
              {(user.email || '?').charAt(0).toUpperCase()}
            </button>
            {open && (
              <div
                style={{
                  position: 'absolute',
                  top: 48,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                }}
              >
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  style={{ padding: '10px 14px', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Sign out
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Link href="/login" className="link-plain">Login</Link>
            <Link href="/register" className="btn-primary-hero">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}