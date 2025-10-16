'use client';

import { useEffect, useState } from 'react';
import { cartApi, ordersApi } from '@/lib/api';
import NavBar from '@/components/NavBar';

export default function CartPage() {
  const [cart, setCart] = useState<{ items: any[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showOrderModal, setShowOrderModal] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const c = await cartApi.get();
      setCart(c);
    } catch (e) {
      setError('Please login to view your cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Listen for product changes
  useEffect(() => {
    const handleProductChange = (event: CustomEvent) => {
      const { action, productId } = event.detail;
      
      if (action === 'delete') {
        // Remove deleted product from cart immediately
        setCart(prevCart => ({
          ...prevCart,
          items: prevCart.items.filter(item => item.productId !== productId)
        }));
        
        // Also remove from selected items
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else if (action === 'update') {
        // Refresh cart to get updated product info
        setTimeout(load, 100);
      }
    };

    window.addEventListener('productChanged', handleProductChange as EventListener);
    
    return () => {
      window.removeEventListener('productChanged', handleProductChange as EventListener);
    };
  }, []);

  const selectedCartItems = cart.items.filter(item => selectedItems.has(item.productId));
  const total = selectedCartItems.reduce((sum, i: any) => sum + i.price * i.quantity, 0);

  const handleSelectItem = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cart.items.map(item => item.productId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    try {
      const updatedCart = await cartApi.addOrUpdate(productId, newQuantity - cart.items.find(i => i.productId === productId)?.quantity || 0);
      setCart(updatedCart);
      
      // Broadcast cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { action: 'update', productId, cart: updatedCart } 
      }));
    } catch (e) {
      alert('Failed to update quantity');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!window.confirm('Are you sure you want to remove this item from cart?')) {
      return;
    }

    try {
      // Use the correct remove method
      const updatedCart = await cartApi.remove(productId);
      setCart(updatedCart);
      
      // Also remove from selected items
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      
      // Broadcast cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { action: 'remove', productId, cart: updatedCart } 
      }));
      
      showNotification('Item removed from cart', 'success');
    } catch (e) {
      console.error('Error removing item from cart:', e);
      alert('Failed to remove item from cart');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  return (
    <div>
      <NavBar />
      <div className="container">
        <div className="header" style={{ marginBottom: 16 }}>
          <h2>Cart</h2>
        </div>
        {error && <div className="error">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {cart.items.length === 0 ? (
              <div>No items in cart.</div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.size === cart.items.length && cart.items.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    Select All ({selectedItems.size}/{cart.items.length})
                  </label>
                </div>
                <div className="product-grid">
                  {cart.items.map((i: any) => (
                    <div 
                      className="product-card" 
                      key={i.productId} 
                      style={{ 
                        border: selectedItems.has(i.productId) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        opacity: selectedItems.has(i.productId) ? 1 : 0.7,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSelectItem(i.productId, !selectedItems.has(i.productId))}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(i.productId)}
                          onChange={(e) => handleSelectItem(i.productId, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span style={{ fontWeight: 'bold' }}>Select</span>
                      </div>
                      <div className="product-image">
                        {i.image ? (
                          <img src={i.image} alt={i.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>No image</span>
                        )}
                      </div>
                      <h3 className="product-name">{i.name}</h3>
                      <p className="product-description">{i.description}</p>
                      <div className="product-price">${i.price.toFixed(2)} each</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                        <span>Quantity:</span>
                        <button 
                          className="btn" 
                          style={{ padding: '4px 8px', fontSize: '14px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(i.productId, i.quantity - 1);
                          }}
                          disabled={i.quantity <= 1}
                        >
                          -
                        </button>
                        <span style={{ 
                          padding: '4px 12px', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px',
                          minWidth: '40px',
                          textAlign: 'center'
                        }}>
                          {i.quantity}
                        </span>
                        <button 
                          className="btn" 
                          style={{ padding: '4px 8px', fontSize: '14px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(i.productId, i.quantity + 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                      
                      <div style={{ 
                        marginTop: 12, 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#e74c3c' 
                      }}>
                        Total: ${(i.price * i.quantity).toFixed(2)}
                      </div>
                      
                      {/* Delete button */}
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <button 
                          className="btn btn-danger" 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '14px',
                            width: '100%'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(i.productId);
                          }}
                        >
                          🗑️ Remove from Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 20, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    Selected Total: ${total.toFixed(2)} ({selectedItems.size} items)
                  </div>
                  <button 
                    className="btn btn-primary" 
                    disabled={selectedItems.size === 0}
                    style={{ 
                      opacity: selectedItems.size === 0 ? 0.5 : 1,
                      cursor: selectedItems.size === 0 ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => {
                      if (selectedItems.size === 0) {
                        alert('Please select at least one item to proceed.');
                        return;
                      }
                      setShowOrderModal(true);
                    }}
                  >
                    Proceed to Payment
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal-backdrop" onClick={() => setShowOrderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>Order Summary</h2>
              <button 
                onClick={() => setShowOrderModal(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  padding: '0 8px'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 20 }}>
              {selectedCartItems.map((item: any) => (
                <div key={item.productId} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px 0',
              borderTop: '2px solid #3b82f6',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              <span>Total Amount:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="btn" 
                onClick={() => setShowOrderModal(false)}
                style={{ background: '#6b7280', color: 'white' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={async () => {
                  try {
                    // Create actual order
                    const order = await ordersApi.create();
                    
                    // Clear the cart after successful order creation
                    await cartApi.clear();
                    
                    alert(`Order created successfully!\n\nOrder ID: ${order.id}\nItems: ${selectedItems.size}\nTotal: $${total.toFixed(2)}\n\nOrder has been saved to your history.`);
                    setShowOrderModal(false);
                    
                    // Clear selected items and redirect to orders page
                    setSelectedItems(new Set());
                    
                    // Redirect to orders page
                    window.location.href = '/orders';
                    
                  } catch (e) {
                    console.error('Error creating order:', e);
                    alert('Failed to create order. Please try again.');
                  }
                }}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}