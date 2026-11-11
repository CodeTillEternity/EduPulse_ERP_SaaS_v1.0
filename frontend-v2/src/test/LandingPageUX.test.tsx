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

describe('LandingPage Enterprise Light Architecture & UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the authoritative enterprise hero headline and supporting copy', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Hero Headline & Subcopy
    expect(screen.getByText(/One platform to run your entire institution\./i)).toBeInTheDocument();
    expect(screen.getByText(/Bring academics, student management, finance and institutional operations together in one connected platform\./i)).toBeInTheDocument();
    expect(screen.getByText(/EduPulse SaaS V1.4 • Autonomous Multi-Tenant Architecture/i)).toBeInTheDocument();
    
    // Trust Markers
    expect(screen.getByText(/Role-Based Multi-Tenancy/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Setup Fees/i)).toBeInTheDocument();
    expect(screen.getByText(/14-Day Free Evaluation/i)).toBeInTheDocument();
    expect(screen.getByText(/FERPA & Data Compliant/i)).toBeInTheDocument();
  });

  it('renders the realistic DOM-based institutional product mockup with interactive tabs', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Mockup Chrome Header & Campus Overview KPI Cards
    expect(screen.getByText(/portal\.edupulse\.io\/harvard\/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Harvard College of Sciences & Humanities/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Students/i)).toBeInTheDocument();
    expect(screen.getByText(/Average Attendance/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Fee Collection/i).length).toBeGreaterThan(0);

    // Tab buttons
    const studentsTab = screen.getByRole('button', { name: /Student SIS/i });
    expect(studentsTab).toBeInTheDocument();
    fireEvent.click(studentsTab);
    expect(await screen.findByText(/Sophia Chen/i)).toBeInTheDocument();

    const timetableTab = screen.getByRole('button', { name: /Timetable & Attendance/i });
    expect(timetableTab).toBeInTheDocument();
    fireEvent.click(timetableTab);
    expect(await screen.findByText(/CS-301 Distributed Systems/i)).toBeInTheDocument();

    const financeTab = screen.getByRole('button', { name: /Fee Collection/i });
    expect(financeTab).toBeInTheDocument();
    fireEvent.click(financeTab);
    expect(await screen.findByText(/Term 2 Tuition Fee/i)).toBeInTheDocument();
  });

  it('renders all 6 institutional capabilities and core ERP module cards', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Academics & Curriculum Planning/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Lifecycle & Admissions \(SIS\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Fee Management & Recurring Invoicing/i)).toBeInTheDocument();
    expect(screen.getByText(/Biometric & Class Attendance/i)).toBeInTheDocument();
    expect(screen.getByText(/Examinations & Grade Books/i)).toBeInTheDocument();
    expect(screen.getByText(/Staff Payroll & HR Operations/i)).toBeInTheDocument();
  });

  it('renders connected 4-step academic and administrative workflows', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Eliminate information silos between departments\./i)).toBeInTheDocument();
    expect(screen.getByText(/Admissions & Enrollment/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic Scheduling/i)).toBeInTheDocument();
    expect(screen.getByText(/Fee Generation & Invoicing/i)).toBeInTheDocument();
    expect(screen.getByText(/Examination & Certification/i)).toBeInTheDocument();
  });

  it('renders multi-tenant architecture and security specifications', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Custom Subdomain Routing/i)).toBeInTheDocument();
    expect(screen.getByText(/Dedicated Database Pools/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Automated S3 Disaster Recovery/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/PostgreSQL Row-Level Security \(RLS\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Safe Exam Browser \(SEB\) OS Lockdown/i).length).toBeGreaterThan(0);
  });

  it('navigates to self-serve onboarding when Start Free Trial CTA buttons are clicked', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const startTrialBtns = screen.getAllByRole('button', { name: /Start free trial/i });
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

  it('allows switching tenants in the interactive Attio-style RLS console', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Initial tenant is Harvard
    expect(screen.getByText(/Harvard University/i)).toBeInTheDocument();
    expect(screen.getByText(/Marcus Vance/i)).toBeInTheDocument();

    // Click tenant switcher dropdown
    const tenantSwitcherBtn = screen.getByRole('button', { name: /Harvard University/i });
    fireEvent.click(tenantSwitcherBtn);

    // Select Stanford University
    const stanfordOption = screen.getByText(/Stanford University/i);
    fireEvent.click(stanfordOption);

    // Stanford records appear
    expect(await screen.findByText(/Liam O'Connor/i)).toBeInTheDocument();
    expect(await screen.findByText(/STA-2026-019/i)).toBeInTheDocument();
  });

  it('renders and interacts with the SEB biometric proctoring hardware widget', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Initial state is LOCKED
    expect(screen.getAllByText(/Simulate Exam Lockdown/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/OS KIOSK RESTRICTED/i)).toBeInTheDocument();
    expect(screen.getAllByText(/BLOCKED/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/DISABLED/i)).toBeInTheDocument();

    // Toggle lockdown off
    const toggleBtn = screen.getByRole('switch', { name: /Simulate Exam Lockdown/i });
    fireEvent.click(toggleBtn);

    // Flips to STANDBY
    expect(screen.getByText(/STANDBY MODE/i)).toBeInTheDocument();

    // Toggle lockdown back on
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/OS KIOSK RESTRICTED/i)).toBeInTheDocument();
  });
});
