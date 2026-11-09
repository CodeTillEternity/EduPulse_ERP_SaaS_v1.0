import axios from 'axios';

/**
 * Resolves the backend API base URL dynamically based on environment configuration:
 * 1. Uses explicit VITE_API_BASE_URL if configured.
 * 2. In local development (Vite dev mode or localhost hostname), falls back to http://localhost:8081.
 * 3. In cloud/production environments, falls back to the Render deployment URL (https://edupulse-backend.onrender.com).
 */
export const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local'));

  if (import.meta.env.DEV || isLocalhost) {
    return 'http://localhost:8081';
  }

  return 'https://edupulse-backend.onrender.com';
};

const baseURL = getBaseURL();

/**
 * Pre-configured Axios instance for multi-tenant SaaS requests.
 * Automatically injects the active tenant ID and JWT bearer token into request headers.
 */
const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config) => {
    let token = null;
    let tenantId = null;

    try {
      token = localStorage.getItem('token');
      tenantId = localStorage.getItem('tenantId');

      if (!token || !tenantId) {
        const storedAuth = localStorage.getItem('auth-storage');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (parsed?.state) {
            token = token || parsed.state.token;
            tenantId = tenantId || parsed.state.tenantId;
          }
        }
      }
    } catch (e) {
      console.warn('Unable to access auth credentials from storage:', e);
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
export { axiosClient };
