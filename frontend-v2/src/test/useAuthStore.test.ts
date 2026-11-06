import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, parseJwtClaims } from '../store/useAuthStore';

// Helper to create a fake base64url encoded JWT
function createFakeJwt(claims: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${payload}.signature`;
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should parse claims from JWT token correctly', () => {
    const token = createFakeJwt({
      sub: 'admin@apex.edu',
      role: 'INSTITUTION_ADMIN',
      tenant_id: 'apex-university-987',
      tenant_status: 'TRIAL_ACTIVE',
    });

    const claims = parseJwtClaims(token);
    expect(claims.tenant_id).toBe('apex-university-987');
    expect(claims.tenant_status).toBe('TRIAL_ACTIVE');
  });

  it('should store tenantId and tenantStatus from JWT on login', () => {
    const token = createFakeJwt({
      sub: 'admin@apex.edu',
      role: 'INSTITUTION_ADMIN',
      tenant_id: 'apex-univ-01',
      tenant_status: 'TRIAL_ACTIVE',
    });

    useAuthStore.getState().login(token, 'refresh-tok-123', {
      username: 'admin@apex.edu',
      role: 'INSTITUTION_ADMIN',
      permissions: ['ALL'],
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.tenantId).toBe('apex-univ-01');
    expect(state.tenantStatus).toBe('TRIAL_ACTIVE');
    expect(state.user?.tenantId).toBe('apex-univ-01');
    expect(state.user?.tenantStatus).toBe('TRIAL_ACTIVE');
  });

  it('should update tenantStatus via setTenantStatus', () => {
    const token = createFakeJwt({
      sub: 'admin@apex.edu',
      tenant_id: 'apex-univ-02',
      tenant_status: 'TRIAL_ACTIVE',
    });

    useAuthStore.getState().login(token, 'refresh', {
      username: 'admin@apex.edu',
      role: 'INSTITUTION_ADMIN',
      permissions: [],
    });

    expect(useAuthStore.getState().tenantStatus).toBe('TRIAL_ACTIVE');

    useAuthStore.getState().setTenantStatus('READ_ONLY_GRACE');
    expect(useAuthStore.getState().tenantStatus).toBe('READ_ONLY_GRACE');
    expect(useAuthStore.getState().user?.tenantStatus).toBe('READ_ONLY_GRACE');

    useAuthStore.getState().setTenantStatus('SUSPENDED');
    expect(useAuthStore.getState().tenantStatus).toBe('SUSPENDED');
  });

  it('should clear tenant context on logout', () => {
    const token = createFakeJwt({
      sub: 'admin@apex.edu',
      tenant_id: 'apex-univ-03',
      tenant_status: 'ACTIVE',
    });

    useAuthStore.getState().login(token, 'refresh', {
      username: 'admin@apex.edu',
      role: 'INSTITUTION_ADMIN',
      permissions: [],
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.tenantId).toBeNull();
    expect(state.tenantStatus).toBeNull();
  });
});
