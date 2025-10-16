'use client';

import { useEffect, useState } from 'react';
import { ordersApi, Order } from '@/lib/api';
import NavBar from '@/components/NavBar';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersApi.list();
      setOrders(res);
    } catch (e) {
      setError('Please login to view orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Auto refresh when page becomes visible (useful when redirected from cart)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        load();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div>
      <NavBar />
      <div className="container">
        <div className="header" style={{ marginBottom: 16 }}>
          <h2>Orders</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#666' }}>
            {orders.length > 0 ? `${orders.length} order${orders.length > 1 ? 's' : ''} found` : ''}
          </span>
          <button 
            className="btn btn-primary" 
            onClick={load}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {error && <div className="error">{error}</div>}
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            background: 'white', 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ marginBottom: '8px', color: '#666' }}>No orders yet</h3>
            <p style={{ color: '#999' }}>Your order history will appear here</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(o => (
              <div key={o.id} className="order-card" style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>Order #{o.id}</h3>
                    <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                      {new Date(o.createdAt || '').toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      color: '#e74c3c',
                      marginBottom: '4px'
                    }}>
                      ${o.totalAmount.toFixed(2)}
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: o.status === 'completed' ? '#d4edda' : 
                                 o.status === 'pending' ? '#fff3cd' : '#f8d7da',
                      color: o.status === 'completed' ? '#155724' : 
                             o.status === 'pending' ? '#856404' : '#721c24'
                    }}>
                      {o.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Order items */}
                {o.items && o.items.length > 0 && (
                  <div style={{ 
                    borderTop: '1px solid #eee', 
                    paddingTop: '12px',
                    fontSize: '14px'
                  }}>
                    <strong style={{ color: '#666', marginBottom: '8px', display: 'block' }}>
                      Items ({o.items.length}):
                    </strong>
                    {o.items.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        color: '#666'
                      }}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


