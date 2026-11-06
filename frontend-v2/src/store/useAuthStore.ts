import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  username: string;
  role: string;
  permissions: string[];
  tenantId?: string;
  tenantStatus?: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  tenantId: string | null;
  tenantStatus: string | null;
  isAuthenticated: boolean;
  login: (
    token: string,
    refreshToken: string,
    user: User,
    tenantId?: string | null,
    tenantStatus?: string | null
  ) => void;
  logout: () => void;
  setTenantStatus: (status: string | null) => void;
}

export function parseJwtClaims(token: string): Record<string, any> {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return {};
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      tenantId: null,
      tenantStatus: null,
      isAuthenticated: false,

      login: (token, refreshToken, user, explicitTenantId, explicitTenantStatus) => {
        const claims = parseJwtClaims(token);
        const tenantId =
          explicitTenantId ||
          user?.tenantId ||
          claims.tenant_id ||
          claims.tenantId ||
          null;

        const tenantStatus =
          explicitTenantStatus ||
          user?.tenantStatus ||
          claims.tenant_status ||
          claims.tenantStatus ||
          'ACTIVE';

        set({
          token,
          refreshToken,
          user: {
            ...user,
            tenantId: tenantId ?? undefined,
            tenantStatus: tenantStatus ?? undefined,
          },
          tenantId,
          tenantStatus,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          tenantId: null,
          tenantStatus: null,
          isAuthenticated: false,
        });
      },

      setTenantStatus: (status: string | null) => {
        set((state) => ({
          tenantStatus: status,
          user: state.user
            ? { ...state.user, tenantStatus: status ?? undefined }
            : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        tenantId: state.tenantId,
        tenantStatus: state.tenantStatus,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
