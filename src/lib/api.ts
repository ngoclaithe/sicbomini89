const BFF_BASE = '/api/bff';

export const api = {
  async post(endpoint: string, data: any) {
    const response = await fetch(`${BFF_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
      credentials: 'include', // Automatically sends cookies
    });

    if (!response.ok) {
      let message = 'API Error';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch { }
      throw new Error(message);
    }

    return response.json();
  },

  async get(endpoint: string) {
    const response = await fetch(`${BFF_BASE}${endpoint}`, {
      cache: 'no-store',
      credentials: 'include', // Automatically sends cookies
    });

    if (!response.ok) {
      let message = 'API Error';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch { }
      throw new Error(message);
    }

    return response.json();
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${BFF_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
      credentials: 'include', // Automatically sends cookies
    });

    if (!response.ok) {
      let message = 'API Error';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch { }
      throw new Error(message);
    }

    return response.json();
  },
};
