'use client';

import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(product.id!);
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
      <div className="button-group">
        <button 
          className="btn btn-primary" 
          onClick={() => onEdit(product)}
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
  );
}