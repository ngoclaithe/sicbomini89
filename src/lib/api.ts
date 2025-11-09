const BFF_BASE = '/api/bff';
const API_PREFIX = '/api/v1';

export const api = {
  async post(endpoint: string, data: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BFF_BASE}${API_PREFIX}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      let message = 'API Error';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch {}
      throw new Error(message);
    }

    return response.json();
  },

  async get(endpoint: string, token?: string) {
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BFF_BASE}${API_PREFIX}${endpoint}`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      let message = 'API Error';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch {}
      throw new Error(message);
    }

    return response.json();
  },

  async put(endpoint: string, data: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BFF_BASE}${API_PREFIX}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      let message = 'API Error';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch {}
      throw new Error(message);
    }

    return response.json();
  },
};
