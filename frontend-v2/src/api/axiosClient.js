import axios from 'axios';

/**
 * Resolves the backend API base URL dynamically based on environment configuration:
 * 1. Uses explicit VITE_API_BASE_URL if configured.
 * 2. In local development (Vite dev mode or localhost hostname), falls back to http://localhost:8081.
 * 3. In cloud/production environments, falls back to the Render deployment URL (https://edupulse-backend.onrender.com).
 */
export const getBaseURL = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local'));

  if (import.meta.env?.DEV || isLocalhost) {
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor for automatic HttpOnly JWT refresh rotation on 401 Unauthorized errors.
 * Silently rotates the JWT access token and replays queued requests without user interruption.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is a 401 Unauthorized on a valid config
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Prevent retry loops if original request was already retried or was an auth endpoint
    if (
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Queue subsequent failing requests while a refresh is in-flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosClient.request(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Silently call POST /api/auth/refresh with credentials to send HttpOnly cookie
      const refreshResponse = await axios.post(
        `${baseURL}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const newAccessToken =
        refreshResponse.data?.accessToken ||
        refreshResponse.data?.token ||
        refreshResponse.data?.jwt;

      if (!newAccessToken) {
        throw new Error('No access token returned from refresh endpoint');
      }

      // Update in-memory and stored JWT
      try {
        localStorage.setItem('token', newAccessToken);
        const storedAuth = localStorage.getItem('auth-storage');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (parsed?.state) {
            parsed.state.token = newAccessToken;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          }
        }
      } catch (storageError) {
        console.warn('Unable to persist refreshed token to storage:', storageError);
      }

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      processQueue(null, newAccessToken);
      return axiosClient.request(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      try {
        localStorage.removeItem('token');
        const storedAuth = localStorage.getItem('auth-storage');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (parsed?.state) {
            parsed.state.token = null;
            parsed.state.isAuthenticated = false;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          }
        }
      } catch (storageError) {
        console.warn('Unable to clear credentials on refresh failure:', storageError);
      }

      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
export { axiosClient };
