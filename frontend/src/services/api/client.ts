export interface ApiClient {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  patch<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
}

// Mock Api Client Adapter that simulates database latencies and returns mock responses
class MockApiClientAdapter implements ApiClient {
  async get<T>(url: string): Promise<T> {
    console.log(`[MockApiClient] GET request to ${url}`);
    return new Promise((resolve) => setTimeout(() => resolve({} as T), 100));
  }

  async post<T>(url: string, data: any): Promise<T> {
    console.log(`[MockApiClient] POST request to ${url} with data:`, data);
    return new Promise((resolve) => setTimeout(() => resolve(data as T), 100));
  }

  async put<T>(url: string, data: any): Promise<T> {
    console.log(`[MockApiClient] PUT request to ${url} with data:`, data);
    return new Promise((resolve) => setTimeout(() => resolve(data as T), 100));
  }

  async patch<T>(url: string, data: any): Promise<T> {
    console.log(`[MockApiClient] PATCH request to ${url} with data:`, data);
    return new Promise((resolve) => setTimeout(() => resolve(data as T), 100));
  }

  async delete<T>(url: string): Promise<T> {
    console.log(`[MockApiClient] DELETE request to ${url}`);
    return new Promise((resolve) => setTimeout(() => resolve({} as T), 100));
  }
}

export const apiClient: ApiClient = new MockApiClientAdapter();
export default apiClient;
