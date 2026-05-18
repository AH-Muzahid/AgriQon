import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create the base axios instance
const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token if available
instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
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
