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

describe('LandingPage Authentic Enterprise UX & Architecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the authoritative enterprise hero headline and verified proof points', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Hero Headline & Subcopy
    expect(screen.getByText(/One platform to run your entire institution\./i)).toBeInTheDocument();
    expect(screen.getByText(/Bring academics, student management, finance and institutional operations together in one connected platform\./i)).toBeInTheDocument();
    expect(screen.getByText(/EduPulse SaaS V1.4 • Institutional ERP Platform/i)).toBeInTheDocument();
    
    // Verifiable Trust Proof Points
    expect(screen.getByText(/Role-Based Multi-Tenancy/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PostgreSQL Row-Level Security/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/14-Day Free Evaluation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Zero Setup Fees/i).length).toBeGreaterThan(0);
  });

  it('renders the authentic DOM-based institutional product mockup with interactive tabs', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Mockup Chrome Header & Campus Overview KPI Cards
    expect(screen.getByText(/app\.edupulse\.io\/admin\/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/EduPulse Institutional Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/Enrolled Students/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic Programs/i)).toBeInTheDocument();
    expect(screen.getByText(/Term Courses Active/i)).toBeInTheDocument();

    // Tab buttons
    const studentsTab = screen.getByRole('button', { name: /Student SIS/i });
    expect(studentsTab).toBeInTheDocument();
    fireEvent.click(studentsTab);
    expect(await screen.findByText(/Alex Morgan/i)).toBeInTheDocument();

    const coursesTab = screen.getByRole('button', { name: /Course Catalog/i });
    expect(coursesTab).toBeInTheDocument();
    fireEvent.click(coursesTab);
    expect(await screen.findByText(/Data Structures & Algorithms/i)).toBeInTheDocument();

    const feesTab = screen.getByRole('button', { name: /Fee Structure/i });
    expect(feesTab).toBeInTheDocument();
    fireEvent.click(feesTab);
    expect(await screen.findByText(/Semester Tuition Fee/i)).toBeInTheDocument();
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

  it('renders connected 5-step academic and administrative workflows', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/How data connects across institutional departments\./i)).toBeInTheDocument();
    expect(screen.getByText(/Admissions & Inquiry/i)).toBeInTheDocument();
    expect(screen.getByText(/Enrollment Registry/i)).toBeInTheDocument();
    expect(screen.getByText(/Course & Timetable/i)).toBeInTheDocument();
    expect(screen.getByText(/Fee Voucher Issuance/i)).toBeInTheDocument();
    expect(screen.getByText(/Exams & Transcripts/i)).toBeInTheDocument();
  });

  it('renders campus operations coverage for library, transport, and SaaS admin', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Library Resource Circulation/i)).toBeInTheDocument();
    expect(screen.getByText(/Campus Transport & Routes/i)).toBeInTheDocument();
    expect(screen.getByText(/SaaS Multi-Tenant Control Plane/i)).toBeInTheDocument();
  });

  it('renders verifiable multi-tenant architecture explorer with interactive layers', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/How EduPulse Enforces Tenant Data Isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Tenant Data Isolation & Security Architecture/i)).toBeInTheDocument();

    // Layer 1: Identity Resolution
    const layer1Btn = screen.getByRole('button', { name: /1\. Identity Resolution/i });
    fireEvent.click(layer1Btn);
    expect(await screen.findByText(/com\.erp\.multitenancy\.TenantFilter\.java/i)).toBeInTheDocument();

    // Layer 2: Thread Confinement
    const layer2Btn = screen.getByRole('button', { name: /2\. Thread Confinement/i });
    fireEvent.click(layer2Btn);
    expect(await screen.findByText(/com\.erp\.multitenancy\.TenantContextFilter\.java/i)).toBeInTheDocument();

    // Layer 3: PostgreSQL RLS
    const layer3Btn = screen.getByRole('button', { name: /3\. PostgreSQL RLS/i });
    fireEvent.click(layer3Btn);
    expect(await screen.findByText(/V15__enable_postgres_rls_tenant_tables\.sql/i)).toBeInTheDocument();

    // Layer 4: Dynamic Routing
    const layer4Btn = screen.getByRole('button', { name: /4\. Dynamic Routing/i });
    fireEvent.click(layer4Btn);
    expect(await screen.findByText(/TenantRoutingDataSource\.java/i)).toBeInTheDocument();
  });

  it('renders authentic examination security and open-source Safe Exam Browser explanation', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Exam Security with Safe Exam Browser \(SEB\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Safe Exam Browser \(SEB\) & Assessment Security/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessment Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/SEB Profile Generation/i)).toBeInTheDocument();
    expect(screen.getByText(/Browser Exam Key Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Grading & Transcript Recording/i)).toBeInTheDocument();
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
});
