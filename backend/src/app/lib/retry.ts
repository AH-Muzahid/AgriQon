/**
 * Retries an async function with exponential backoff.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (error: any, attempt: number) => void;
  } = {}
): Promise<T> {
  const { 
    retries = 3, 
    baseDelay = 1000, 
    maxDelay = 10000,
    onRetry 
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on 401/403 (Auth errors)
      if (error?.status === 401 || error?.status === 403 || error?.response?.status === 401) {
        throw error;
      }

      if (attempt <= retries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        if (onRetry) onRetry(error, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
