import axios from 'axios';
import { Product } from '@/types/product';
import { supabase } from './supabaseClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers = config.headers ?? {};
      (config.headers as any)['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Error getting session:', error);
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });

    if (error.response?.status === 401) {
      console.log('401 Unauthorized - checking session...');
      // Token might be expired, try to refresh
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'exists' : 'null');
      
      if (!session) {
        // No valid session, redirect to login
        console.log('No session found, redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        console.log('Session exists but got 401, token might be invalid');
      }
    }
    return Promise.reject(error);
  }
);

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

export type Cart = {
  id?: string;
  userId?: string;
  items: { productId: string; name: string; price: number; image?: string; quantity: number }[];
  updatedAt?: string;
};

export const cartApi = {
  get: async (): Promise<Cart> => {
    const res = await api.get('/Cart');
    return res.data;
  },
  addOrUpdate: async (productId: string, quantity: number): Promise<Cart> => {
    const res = await api.post('/Cart/items', { productId, quantity });
    return res.data;
  },
  remove: async (productId: string): Promise<Cart> => {
    const res = await api.delete(`/Cart/items/${productId}`);
    return res.data;
  },
  clear: async (): Promise<void> => {
    await api.delete('/Cart');
  }
};

export type Order = {
  id?: string;
  userId?: string;
  items: Cart['items'];
  totalAmount: number;
  status: string;
  createdAt?: string;
};

export const ordersApi = {
  create: async (): Promise<Order> => {
    const res = await api.post('/Orders');
    return res.data;
  },
  list: async (): Promise<Order[]> => {
    const res = await api.get('/Orders');
    return res.data;
  },
  get: async (id: string): Promise<Order> => {
    const res = await api.get(`/Orders/${id}`);
    return res.data;
  }
};

export const paymentsApi = {
  checkout: async (orderId: string): Promise<{ url: string }> => {
    const res = await api.post('/Payments/checkout-session', { orderId });
    return res.data;
  }
};