import axios from 'axios';
import { Product } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/Products');
    return response.data;
  },

  // Get product by ID
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/Products/${id}`);
    return response.data;
  },

  // Create new product
  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    await api.post('/Products', product);
  },

  // Update product
  update: async (id: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    await api.put(`/Products/${id}`, product);
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Products/${id}`);
  },
};