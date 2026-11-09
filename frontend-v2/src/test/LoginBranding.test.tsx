import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as useTenantThemeModule from '../hooks/useTenantTheme';

describe('White-Labeled Login Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders default EduPulse SaaS branding when no subdomain is present', () => {
    vi.spyOn(useTenantThemeModule, 'useTenantTheme').mockReturnValue({
      subdomain: null,
      branding: null,
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('EduPulse ERP')).toBeInTheDocument();
    expect(screen.getByText('Unified Institutional Management Platform')).toBeInTheDocument();
    
    const logoImg = screen.getByAltText('EduPulse Logo') as HTMLImageElement;
    expect(logoImg).toBeInTheDocument();
    expect(logoImg.src).toContain('/logo.jpg');
    expect(screen.queryByText(/edupulse\.com/i)).not.toBeInTheDocument();
  });

  it('renders custom institutional white-label branding when subdomain and branding are active', () => {
    vi.spyOn(useTenantThemeModule, 'useTenantTheme').mockReturnValue({
      subdomain: 'stanford',
      branding: {
        tenantId: 'tenant-stanford',
        institutionName: 'Stanford University',
        customSubdomain: 'stanford',
        logoUrl: 'https://cdn.stanford.edu/stanford-tree.png',
        faviconUrl: 'https://cdn.stanford.edu/favicon.ico',
        primaryColorHex: '#8C1515',
        secondaryColorHex: '#B1040E',
      },
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Custom Institution Name
    expect(screen.getByText('Stanford University')).toBeInTheDocument();
    expect(screen.getByText('Stanford University Institutional Portal')).toBeInTheDocument();

    // Custom Logo
    const logoImg = screen.getByAltText('Stanford University Logo') as HTMLImageElement;
    expect(logoImg).toBeInTheDocument();
    expect(logoImg.src).toBe('https://cdn.stanford.edu/stanford-tree.png');

    // Subdomain badge
    expect(screen.getByText('stanford.edupulse.com')).toBeInTheDocument();

    // Custom Primary Color on Sign In button
    const submitBtn = screen.getByRole('button', { name: /sign in as admin/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveStyle({ backgroundColor: '#8C1515' });
  });
});
