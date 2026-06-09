import { apiClient as realApiClient } from '@/lib/api-client';

export interface ApiClient {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  patch<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
  client: any;
}

export const apiClient: ApiClient = {
  get: async <T>(url: string, config?: any): Promise<T> => {
    const res = await realApiClient.get<T>(url, config);
    return res.data;
  },
  post: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const res = await realApiClient.post<T>(url, data, config);
    return res.data;
  },
  put: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const res = await realApiClient.put<T>(url, data, config);
    return res.data;
  },
  patch: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const res = await realApiClient.patch<T>(url, data, config);
    return res.data;
  },
  delete: async <T>(url: string, config?: any): Promise<T> => {
    const res = await realApiClient.delete<T>(url, config);
    return res.data;
  },
  client: realApiClient.client,
};

export default apiClient;
