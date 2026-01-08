const BFF_BASE = '/api/bff';

export const api = {
  async post(endpoint: string, data: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BFF_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
      credentials: 'include',
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

    const response = await fetch(`${BFF_BASE}${endpoint}`, {
      headers,
      cache: 'no-store',
      credentials: 'include',
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

    const response = await fetch(`${BFF_BASE}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
      credentials: 'include',
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
