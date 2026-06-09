import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create the base axios instance
const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow sending and receiving cookies for auth (backend sets refresh/access cookies)
  withCredentials: true,
});

// Add interceptor to include auth token and business ID if available
instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const { useAuthStore } = require('@/store/auth-store');
      const user = useAuthStore.getState().user;
      const businessId = user?.businessId || localStorage.getItem('businessId');
      if (businessId) {
        config.headers['x-business-id'] = businessId;
      }
    } catch {
      const businessId = localStorage.getItem('businessId');
      if (businessId) {
        config.headers['x-business-id'] = businessId;
      }
    }
  }
  // Debug: show which requests include auth header and business context
  if (process.env.NODE_ENV !== 'production') {
    try {
      const hasAuth = !!config.headers?.Authorization;
      const businessId = config.headers?.['x-business-id'];
      console.debug('[api-client] Request', { method: config.method, url: config.url, hasAuth, businessId });
    } catch {}
  }
  return config;
});

// Add response interceptor for error handling and 401 session expiry
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const message = error.response?.data?.message || 'Something went wrong';

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[api-client] Response error', { url: requestUrl, status, message });
    }

    // Handle 401 Unauthorized — clear auth state and redirect to login.
    // Skip redirect for auth endpoints to prevent redirect loops.
    if (status === 401 && typeof window !== 'undefined') {
      const isAuthEndpoint = /\/auth\/(login|register|oauth-callback|me)/.test(requestUrl);
      if (!isAuthEndpoint) {
        console.warn('[api-client] 401 received — clearing session and redirecting to login.');
        // Clear localStorage tokens
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        // Clear Authorization header from future requests
        delete instance.defaults.headers.common['Authorization'];
        // Clear Zustand auth store (lazy import to avoid circular deps)
        try {
          const { useAuthStore } = require('@/store/auth-store');
          useAuthStore.getState().logout();
        } catch {
          // Store may not be available during SSR/edge cases
        }
        // Redirect to login
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  results?: unknown; // Replaced any with unknown to satisfy linter
}

// More specific for results which is used in some pages
export interface ApiResultsResponse<T = unknown> extends ApiResponse<T> {
  results: T;
}

export interface ChatResponse {
  content: string;
  source: string;
}

export interface AiLog {
  id: string;
  type: string;
  prompt: string;
  response?: string | null;
  contextData?: unknown;
  createdAt: string;
  userId?: string | null;
}

export interface AiLogsMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiClient extends AxiosInstance {
  // Override axios methods to return data directly (as handled by our interceptor)
  get<T = unknown, R = ApiResponse<T>, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = unknown, R = ApiResponse<T>, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = unknown, R = ApiResponse<T>, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = unknown, R = ApiResponse<T>, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = unknown, R = ApiResponse<T>, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;

  client: AxiosInstance;
  setToken: (token: string | null) => void;
  login: <T = unknown>(data: unknown) => Promise<ApiResponse<T>>;
  register: <T = unknown>(data: unknown) => Promise<ApiResponse<T>>;
  logout: () => Promise<ApiResponse>;
  getItems: <T = unknown>(params?: unknown) => Promise<ApiResponse<T>>;
  getProduct: <T = unknown>(id: string) => Promise<ApiResponse<T>>;
  getReviews: <T = unknown>(itemId: string) => Promise<ApiResponse<T>>;
  getCategories: <T = unknown>() => Promise<ApiResponse<T>>;
  createOrder: <T = unknown>(data: unknown) => Promise<ApiResponse<T>>;
  generateAiChat: (prompt: string) => Promise<ApiResponse<ChatResponse>>;
  getCustomers: <T = unknown>(params?: unknown) => Promise<ApiResponse<T>>;
  createCustomer: <T = unknown>(data: unknown) => Promise<ApiResponse<T>>;
  collectCustomerDue: <T = unknown>(id: string, amount: number) => Promise<ApiResponse<T>>;
  getInventory: <T = unknown>(params?: unknown) => Promise<ApiResponse<T>>;
  getStockMovements: <T = unknown>() => Promise<ApiResponse<T>>;
  getWarehouseTransfers: <T = unknown>() => Promise<ApiResponse<T>>;
  getReportsData: <T = unknown>() => Promise<ApiResponse<T>>;
  getAiLogs: (params?: { page?: number; limit?: number }) => Promise<ApiResponse<AiLog[]> & { meta?: AiLogsMeta }>;
}

export const apiClient = instance as ApiClient;

// Self-reference to support apiClient.client.get() usage
apiClient.client = instance;

apiClient.setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

apiClient.login = (data: unknown) => apiClient.post('/auth/login', data);
apiClient.register = (data: unknown) => apiClient.post('/auth/register', data);
apiClient.logout = () => apiClient.post('/auth/logout');
apiClient.getItems = (params?: unknown) => apiClient.get('/products', { params });
apiClient.getProduct = (id: string) => apiClient.get(`/products/${id}`);
apiClient.getReviews = (itemId: string) => apiClient.get(`/reviews/item/${itemId}`);
apiClient.getCategories = () => apiClient.get('/categories');
apiClient.createOrder = (data: unknown) => apiClient.post('/orders', data);
apiClient.generateAiChat = (prompt: string) => apiClient.post('/ai/chat', { prompt });
apiClient.getAiLogs = (params?: { page?: number; limit?: number }) => apiClient.get('/ai/logs', { params });
apiClient.getCustomers = (params?: unknown) => apiClient.get('/customers', { params });
apiClient.createCustomer = (data: unknown) => apiClient.post('/customers', data);
apiClient.collectCustomerDue = (id: string, amount: number) => apiClient.post(`/customers/${id}/collect-due`, { amount });
apiClient.getInventory = (params?: unknown) => apiClient.get('/inventory', { params });
apiClient.getStockMovements = () => apiClient.get('/stock-movements');
apiClient.getWarehouseTransfers = () => apiClient.get('/warehouses/transfers');
apiClient.getReportsData = () => apiClient.get('/reports');
