import axios, { AxiosInstance } from 'axios';

// Type definitions for API payloads
interface ItemData {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface OrderData {
  itemId: string;
  quantity: number;
  totalPrice: number;
}

interface ReviewData {
  itemId: string;
  rating: number;
  comment: string;
}

class ApiClient {
  public client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    this.client = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Read CSRF token from cookie and inject into header
    this.client.interceptors.request.use(
      (config) => {
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
          config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
        config.withCredentials = true;
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private getCSRFToken(): string | null {
    const match = document.cookie.match(/_csrf=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);

    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content');

    return null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  register(data: { email: string; password: string; name: string; role: 'USER' | 'SELLER' }) {
    return this.client.post('/auth/register', data);
  }

  login(data: { email: string; password: string }) {
    return this.client.post('/auth/login', data);
  }

  logout() {
    return this.client.post('/auth/logout');
  }

  getItems(params?: { category?: string; page?: number }) {
    return this.client.get('/items', { params });
  }

  getItem(id: string) {
    return this.client.get(`/items/${id}`);
  }

  createItem(data: ItemData) {
    return this.client.post('/items', data);
  }

  updateItem(id: string, data: Partial<ItemData>) {
    return this.client.put(`/items/${id}`, data);
  }

  deleteItem(id: string) {
    return this.client.delete(`/items/${id}`);
  }

  getOrders() {
    return this.client.get('/orders');
  }

  getOrder(id: string) {
    return this.client.get(`/orders/${id}`);
  }

  createOrder(data: OrderData) {
    return this.client.post('/orders', data);
  }

  getReviews(itemId: string) {
    return this.client.get('/reviews', { params: { itemId } });
  }

  createReview(data: ReviewData) {
    return this.client.post('/reviews', data);
  }

  askAI(question: string) {
    return this.client.post('/ai/ask', { question });
  }
}

export const apiClient = new ApiClient();
