import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import {
  getSubdomain,
  hexToHsl,
  applyTenantTheme,
  fetchTenantBranding,
  TenantBranding,
} from '../hooks/useTenantTheme';

describe('useTenantTheme & Subdomain Theming Engine', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.restoreAllMocks();
    document.title = 'EduPulse Institutional ERP & SaaS';
    document.documentElement.style.removeProperty('--color-primary');
    document.documentElement.style.removeProperty('--primary');
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  describe('getSubdomain()', () => {
    it('extracts subdomain from search parameter ?subdomain=dps', () => {
      // @ts-expect-error mock window.location
      delete window.location;
      // @ts-expect-error mock window.location
      window.location = new URL('http://localhost:5173/login?subdomain=dps');

      expect(getSubdomain()).toBe('dps');
    });

    it('extracts subdomain from search parameter ?tenant=stanford', () => {
      // @ts-expect-error mock window.location
      delete window.location;
      // @ts-expect-error mock window.location
      window.location = new URL('http://localhost:5173/login?tenant=stanford');

      expect(getSubdomain()).toBe('stanford');
    });

    it('extracts subdomain from production hostname dps.edupulse.com', () => {
      // @ts-expect-error mock window.location
      delete window.location;
      // @ts-expect-error mock window.location
      window.location = new URL('https://dps.edupulse.com/login');

      expect(getSubdomain()).toBe('dps');
    });

    it('extracts subdomain from local development host dps.localhost', () => {
      // @ts-expect-error mock window.location
      delete window.location;
      // @ts-expect-error mock window.location
      window.location = new URL('http://dps.localhost:5173/login');

      expect(getSubdomain()).toBe('dps');
    });

    it('returns null for bare localhost or IP address', () => {
      // @ts-expect-error mock window.location
      delete window.location;
      // @ts-expect-error mock window.location
      window.location = new URL('http://localhost:5173/login');

      expect(getSubdomain()).toBeNull();
    });

    it('returns null for generic root or www domain', () => {
      // @ts-expect-error mock window.location
      delete window.location;
      // @ts-expect-error mock window.location
      window.location = new URL('https://www.edupulse.com/login');

      expect(getSubdomain()).toBeNull();
    });
  });

  describe('hexToHsl()', () => {
    it('converts hex colors to valid HSL space representation', () => {
      const hsl = hexToHsl('#8C1515');
      expect(hsl).toBeTruthy();
      expect(typeof hsl).toBe('string');
      // Primary red tones
      expect(hsl).toContain('%');
    });

    it('handles shorthand 3-digit hex strings', () => {
      const hsl = hexToHsl('#fff');
      expect(hsl).toBe('0 0% 100%');
    });

    it('returns null for invalid inputs', () => {
      expect(hexToHsl('')).toBeNull();
      expect(hexToHsl('not-a-color')).toBeNull();
    });
  });

  describe('applyTenantTheme()', () => {
    it('injects primaryColorHex into --color-primary and updates title and favicon', () => {
      const mockBranding: TenantBranding = {
        tenantId: 'tenant-oxford',
        institutionName: 'University of Oxford',
        customSubdomain: 'oxford',
        logoUrl: 'https://cdn.oxford.ac.uk/logo.png',
        faviconUrl: 'https://cdn.oxford.ac.uk/favicon.ico',
        primaryColorHex: '#002147',
        secondaryColorHex: '#005A9C',
      };

      applyTenantTheme(mockBranding);

      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#002147');
      expect(document.title).toBe('University of Oxford | EduPulse ERP');

      const faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (faviconLink) {
        expect(faviconLink.href).toBe('https://cdn.oxford.ac.uk/favicon.ico');
      }
    });

    it('resets theme to default values when null is passed', () => {
      applyTenantTheme(null);

      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('');
      expect(document.title).toBe('EduPulse Institutional ERP & SaaS');
    });
  });

  describe('fetchTenantBranding()', () => {
    it('calls public branding API and returns branding metadata', async () => {
      const mockData: TenantBranding = {
        tenantId: 'tenant-dps',
        institutionName: 'Delhi Public School',
        customSubdomain: 'dps',
        logoUrl: 'https://cdn.edupulse.com/dps-logo.png',
        faviconUrl: 'https://cdn.edupulse.com/dps-favicon.ico',
        primaryColorHex: '#006633',
        secondaryColorHex: '#FFCC00',
      };

      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockData });

      const result = await fetchTenantBranding('dps');
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/branding/dps'),
        expect.anything()
      );
    });
  });
});
