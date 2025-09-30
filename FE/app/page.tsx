'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { productApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductForm from '@/components/ProductForm';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

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
    } catch (err) {
      setError('Unable to delete product. Please try again.');
      console.error('Error deleting product:', err);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  return (
    <div>
      <header className="header">
        <h1>Product Management</h1>
      </header>

      <div className="container">
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {showForm && (
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmitProduct}
            onCancel={handleCancelForm}
          />
        )}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="loading">No products found</div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!showForm && (
          <button className="add-product-btn" onClick={handleAddProduct}>
            +
          </button>
        )}
      </div>
    </div>
  );
}