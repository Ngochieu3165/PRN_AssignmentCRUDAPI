'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { productApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductForm from '@/components/ProductForm';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err) {
      setError('Unable to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSubmitProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      if (editingProduct) {
        await productApi.update(editingProduct.id!, productData);

        // Broadcast product update event
        window.dispatchEvent(new CustomEvent('productChanged', {
          detail: { action: 'update', productId: editingProduct.id }
        }));
      } else {
        await productApi.create(productData);
      }
      setShowForm(false);
      setEditingProduct(undefined);
      await loadProducts();
    } catch (err) {
      setError('Unable to save product. Please try again.');
      console.error('Error saving product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setError(null);
      await productApi.delete(id);
      await loadProducts();

      // Broadcast product deletion event
      window.dispatchEvent(new CustomEvent('productChanged', {
        detail: { action: 'delete', productId: id }
      }));
    } catch (err) {
      setError('Unable to delete product. Please try again.');
      console.error('Error deleting product:', err);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const normalized = query.trim().toLowerCase();
  const filtered = products.filter(p => {
    const inText = !normalized || p.name.toLowerCase().includes(normalized) || p.description.toLowerCase().includes(normalized);
    const minOk = !minPrice || p.price >= parseFloat(minPrice);
    const maxOk = !maxPrice || p.price <= parseFloat(maxPrice);
    return inText && minOk && maxOk;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return (
    <div>
      <NavBar />
      <header className="header">
        <h1>AanimeTV</h1>
      </header>

      <div className="container">
        <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input placeholder="Search products..." value={query} onChange={e => { setPage(1); setQuery(e.target.value); }} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
          <input placeholder="Min price" type="number" value={minPrice} onChange={e => { setPage(1); setMinPrice(e.target.value); }} style={{ width: 120, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
          <input placeholder="Max price" type="number" value={maxPrice} onChange={e => { setPage(1); setMaxPrice(e.target.value); }} style={{ width: 120, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
          <button className="btn" onClick={() => { setQuery(''); setMinPrice(''); setMaxPrice(''); setPage(1); }}>Clear</button>
        </div>
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {showForm && (
          <div className="modal-backdrop" onClick={handleCancelForm}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <ProductForm
                product={editingProduct}
                onSubmit={handleSubmitProduct}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="loading">No products found</div>
            ) : (
              <div className="product-grid">
                {visible.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
              <span>Page {currentPage} / {totalPages}</span>
              <button className="btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </>
        )}

        {!showForm && user && (
          <button className="add-product-btn" onClick={handleAddProduct}>
            +
          </button>
        )}
      </div>

    </div>
  );
}