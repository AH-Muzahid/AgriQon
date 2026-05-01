import axios, { AxiosInstance } from 'axios';
import { createClient } from './supabase';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // Auth endpoints
  register(data: { email: string; password: string; name: string; role: 'USER' | 'SELLER' }) {
    return this.client.post('/auth/register', data);
  }

  login(data: { email: string; password: string }) {
    return this.client.post('/auth/login', data);
  }

  logout() {
    return this.client.post('/auth/logout');
  }

  // Items endpoints
  getItems(params?: { category?: string; page?: number }) {
    return this.client.get('/items', { params });
  }

  getItem(id: string) {
    return this.client.get(`/items/${id}`);
  }

  createItem(data: any) {
    return this.client.post('/items', data);
  }

  updateItem(id: string, data: any) {
    return this.client.put(`/items/${id}`, data);
  }

  deleteItem(id: string) {
    return this.client.delete(`/items/${id}`);
  }

  // Orders endpoints
  getOrders() {
    return this.client.get('/orders');
  }

  getOrder(id: string) {
    return this.client.get(`/orders/${id}`);
  }

  createOrder(data: any) {
    return this.client.post('/orders', data);
  }

  // Reviews endpoints
  getReviews(itemId: string) {
    return this.client.get('/reviews', { params: { itemId } });
  }

  createReview(data: any) {
    return this.client.post('/reviews', data);
  }

  // AI endpoints
  askAI(question: string) {
    return this.client.post('/ai/ask', { question });
  }
}

export const apiClient = new ApiClient();
