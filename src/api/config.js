// API Configuration
export const API_BASE_URL = 'http://localhost:8080';
export const PROJECT_ID = 'b.1eea4119-3553-4167-b93d-3a3d5d07d33d';

/**
 * Generic API request handler
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response data
 */
export async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}
