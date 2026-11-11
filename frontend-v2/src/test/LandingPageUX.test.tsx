import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage UX & Bento Grid Architecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders high-contrast announcement bar and hero headline', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/EduPulse SaaS V1.4 • Safe Exam Browser/i)).toBeInTheDocument();
    expect(screen.getByText(/Next-Gen Institutional ERP with/i)).toBeInTheDocument();
    expect(screen.getByText(/Kernel-Level Exam Proctoring/i)).toBeInTheDocument();
    expect(screen.getByText(/edupulse-cli • tenant-provision/i)).toBeInTheDocument();
  });

  it('renders Apple-style Bento Grid cards with SEB lockdown and RLS architecture', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Bento Hero: Safe Exam Browser
    expect(screen.getAllByText(/Safe Exam Browser OS Lockdown/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Total Kiosk Sandboxing/i)).toBeInTheDocument();
    expect(screen.getByText(/SEB_Kiosk_Process.sys \[LOCKED\]/i)).toBeInTheDocument();

    // Bento Adjacent 1: PostgreSQL RLS
    expect(screen.getByText(/Mathematical Isolation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Row-Level Security/i)[0]).toBeInTheDocument();

    // Bento Adjacent 2: Dynamic DB Routing
    expect(screen.getByText(/Dedicated DB Pools/i)).toBeInTheDocument();
    expect(screen.getByText(/EduPulseHikariCP-vip-1/i)).toBeInTheDocument();

    // Bento Adjacent 3: Automated S3 Recovery
    expect(screen.getByText(/Automated S3 Recovery/i)).toBeInTheDocument();

    // Bento Adjacent 4: Autonomous B2B Billing
    expect(screen.getByText(/Autonomous B2B Billing/i)).toBeInTheDocument();
  });

  it('navigates to self-serve onboarding when Start Trial CTA buttons are clicked', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const startTrialBtns = screen.getAllByRole('button', { name: /Start 14-Day Free Trial/i });
    expect(startTrialBtns.length).toBeGreaterThan(0);

    fireEvent.click(startTrialBtns[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/onboard');
  });

  it('renders embedded Pricing section with interactive monthly/annual toggle', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Predictable Tiers for Every Institution/i)).toBeInTheDocument();
    expect(screen.getByText(/Starter Evaluation/i)).toBeInTheDocument();
    expect(screen.getByText(/Pro Institution/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise High-Sec/i)).toBeInTheDocument();

    // Toggle Annual Invoicing
    const annualBtn = screen.getByRole('button', { name: /Annual/i });
    fireEvent.click(annualBtn);
    expect(screen.getByText(/Save 20%/i)).toBeInTheDocument();
  });
});
