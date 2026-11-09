import { useState, useEffect } from 'react';
import axios from 'axios';
import { getBaseURL } from '../api/axiosClient';

export interface TenantBranding {
  tenantId: string;
  institutionName: string;
  customSubdomain: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColorHex: string | null;
  secondaryColorHex: string | null;
}

/**
 * Extracts the tenant subdomain from the current URL.
 * Supports:
 * - Query parameters (?subdomain=dps or ?tenant=dps) for easy local development and testing
 * - Multi-level hostnames (e.g. dps.edupulse.com, stanford.onrender.com)
 * - Local subdomains (e.g. dps.localhost)
 */
export const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. Explicit query param override
  try {
    const params = new URLSearchParams(window.location.search);
    const paramSubdomain = params.get('subdomain') || params.get('tenant');
    if (paramSubdomain && paramSubdomain.trim()) {
      return paramSubdomain.trim().toLowerCase();
    }
  } catch (e) {
    // Ignore search param errors in headless/node environments
  }

  // 2. Extract from hostname
  const hostname = window.location.hostname;
  if (!hostname) return null;

  // Skip raw IPs and standalone localhost
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  ) {
    return null;
  }

  const parts = hostname.split('.');
  if (parts.length > 2) {
    const candidate = parts[0].toLowerCase();
    // Exclude generic prefixes
    if (!['www', 'app', 'api', 'admin', 'stage'].includes(candidate)) {
      return candidate;
    }
  } else if (parts.length === 2 && parts[1] === 'localhost') {
    // e.g., "dps.localhost"
    return parts[0].toLowerCase();
  }

  return null;
};

/**
 * Converts a 6-digit hex color into HSL format compatible with Tailwind CSS variables.
 */
export const hexToHsl = (hex: string): string | null => {
  if (!hex || typeof hex !== 'string') return null;
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
};

/**
 * Dynamically injects tenant branding attributes into the DOM:
 * - Updates Tailwind's root CSS variable (--color-primary and --primary)
 * - Updates HTML <title> tag
 * - Updates HTML <link rel="icon"> favicon tag
 */
export const applyTenantTheme = (branding: TenantBranding | null) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (branding?.primaryColorHex) {
    root.style.setProperty('--color-primary', branding.primaryColorHex);
    const hsl = hexToHsl(branding.primaryColorHex);
    if (hsl) {
      root.style.setProperty('--primary', hsl);
    }
  } else {
    root.style.removeProperty('--color-primary');
    root.style.setProperty('--primary', '0 0% 9%');
  }

  if (branding?.secondaryColorHex) {
    root.style.setProperty('--color-secondary', branding.secondaryColorHex);
    const hslSec = hexToHsl(branding.secondaryColorHex);
    if (hslSec) {
      root.style.setProperty('--secondary', hslSec);
    }
  } else {
    root.style.removeProperty('--color-secondary');
  }

  // Update <title>
  if (branding?.institutionName) {
    document.title = `${branding.institutionName} | EduPulse ERP`;
  } else {
    document.title = 'EduPulse Institutional ERP & SaaS';
  }

  // Update <link rel="icon">
  if (branding?.faviconUrl) {
    const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    if (iconLinks.length > 0) {
      iconLinks.forEach((link) => {
        link.href = branding.faviconUrl!;
      });
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = branding.faviconUrl;
      document.head.appendChild(newLink);
    }
  }
};

// Global in-memory cache for loaded branding
let cachedBranding: TenantBranding | null = null;
let cachedSubdomain: string | null = null;

export const fetchTenantBranding = async (subdomain: string): Promise<TenantBranding | null> => {
  if (!subdomain) return null;
  if (cachedSubdomain === subdomain && cachedBranding) {
    return cachedBranding;
  }

  const base = getBaseURL();
  try {
    const response = await axios.get(`${base}/api/public/branding/${encodeURIComponent(subdomain)}`, {
      timeout: 6000,
    });
    const data: TenantBranding = response.data?.data || response.data;
    cachedSubdomain = subdomain;
    cachedBranding = data;
    return data;
  } catch (err) {
    return null;
  }
};

/**
 * Custom React hook for dynamic tenant theming and subdomain resolution.
 */
export function useTenantTheme() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(cachedBranding);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const detectedSubdomain = getSubdomain();
    setSubdomain(detectedSubdomain);

    if (!detectedSubdomain) {
      applyTenantTheme(null);
      setBranding(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchTenantBranding(detectedSubdomain)
      .then((data) => {
        if (!isMounted) return;
        setBranding(data);
        applyTenantTheme(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load tenant theme');
        applyTenantTheme(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { subdomain, branding, loading, error };
}

export default useTenantTheme;
