import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
