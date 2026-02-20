/**
 * Utility functions for API calls
 */

/**
 * Safely parse JSON response from fetch
 * Handles cases where response might be HTML (error pages)
 */
export async function safeParseJSON<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type');

  // Check if the response is actually JSON
  if (!contentType?.includes('application/json')) {
    // Silently log non-JSON responses (likely error pages)
    if (contentType?.includes('text/html')) {
      console.warn('伺服器返回 HTML，可能係內部錯誤');
    } else {
      console.warn('預期 JSON 但收到:', contentType);
    }
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Build error message from response
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    
    // Try to parse JSON error
    if (contentType?.includes('application/json')) {
      const data = await response.json() as { error?: string };
      if (data?.error) {
        return data.error;
      }
    }

    // Fallback to status code message
    const statusMessages: Record<number, string> = {
      400: '請求無效',
      404: '資源未搵著',
      500: '伺服器錯誤，請稍後重試',
      503: '服務暫時不可用',
    };

    return statusMessages[response.status] || `操作失敗 (HTTP ${response.status})`;
  } catch {
    return `操作失敗 (HTTP ${response.status})`;
  }
}
