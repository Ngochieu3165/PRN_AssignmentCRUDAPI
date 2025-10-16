'use client';

import { Product } from '@/types/product';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { cartApi } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data.user);
      
      // Load cart quantity for this product
      if (data.user) {
        try {
          const cart = await cartApi.get();
          const item = cart.items.find((i: any) => i.productId === product.id);
          setCartQuantity(item ? item.quantity : 0);
        } catch (e) {
          setCartQuantity(0);
        }
      }
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { sub.subscription.unsubscribe(); };
  }, [product.id]);
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(product.id!);
      
      // Broadcast product deletion event
      window.dispatchEvent(new CustomEvent('productChanged', {
        detail: { action: 'delete', productId: product.id }
      }));
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>No image</span>
        )}
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <div className="product-price">${product.price.toFixed(2)}</div>
      {isLoggedIn && (
        <div className="button-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              aria-label="Add to cart"
              title="Add to cart"
              className="btn"
              onClick={async () => {
                try {
                  const updated = await cartApi.addOrUpdate(product.id!, 1);
                  
                  // Update local cart quantity
                  const item = updated.items.find((i: any) => i.productId === product.id);
                  setCartQuantity(item ? item.quantity : 0);
                  
                  // Broadcast cart update event
                  window.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { action: 'add', productId: product.id, cart: updated } 
                  }));
                  // fly-to-cart animation
                  const img = document.createElement('div');
                  img.textContent = '🛒';
                  img.style.position = 'fixed';
                  img.style.left = `${(window.innerWidth/2)}px`;
                  img.style.top = `${(window.innerHeight/2)}px`;
                  img.style.transition = 'transform .9s ease, opacity .9s ease';
                  img.style.transform = 'scale(1.8)';
                  img.style.opacity = '1';
                  img.style.zIndex = '9999';
                  document.body.appendChild(img);
                  const target = document.getElementById('navbar-cart-icon');
                  if (target) {
                    const rect = target.getBoundingClientRect();
                    const dx = rect.left - window.innerWidth/2;
                    const dy = rect.top - window.innerHeight/2;
                    requestAnimationFrame(() => {
                      img.style.transform = `translate(${dx}px, ${dy}px) scale(.6)`;
                      img.style.opacity = '0';
                    });
                    setTimeout(() => document.body.removeChild(img), 950);
                  }
                } catch (e) {
                  alert('Please login to add to cart');
                }
              }}
            >
              🛒
            </button>
          <div>
            <button 
              className="btn btn-primary" 
              onClick={() => onEdit(product)}
              style={{ marginRight: 8 }}
            >
              Edit
            </button>
            <button 
              className="btn btn-danger" 
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}