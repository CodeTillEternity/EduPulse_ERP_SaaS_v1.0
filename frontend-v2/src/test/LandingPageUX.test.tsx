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

  it('renders the authentic system architecture and data model inspector with interactive domain tabs', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Inspector Header & Initial Academics Domain
    expect(screen.getByText(/The EduPulse Institutional System Core/i)).toBeInTheDocument();
    expect(screen.getByText(/System Architecture & Data Entity Blueprint/i)).toBeInTheDocument();
    expect(screen.getByText(/Curriculum Framework & Course Catalog/i)).toBeInTheDocument();
    expect(screen.getAllByText(/table: course/i).length).toBeGreaterThan(0);

    // Tab buttons: Student SIS
    const studentsTab = screen.getByRole('button', { name: /Student Information \(SIS\)/i });
    expect(studentsTab).toBeInTheDocument();
    fireEvent.click(studentsTab);
    expect(await screen.findByText(/Student Lifecycle, Admissions & Permanent SIS/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/table: student/i)).length).toBeGreaterThan(0);

    // Tab buttons: Fee & Ledger Engine
    const feesTab = screen.getByRole('button', { name: /Fee & Ledger Engine/i });
    expect(feesTab).toBeInTheDocument();
    fireEvent.click(feesTab);
    expect(await screen.findByText(/Institutional Invoicing, Ledgers & Online Fee Settlement/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/table: fee_structure/i)).length).toBeGreaterThan(0);

    // Tab buttons: Campus Operations
    const opsTab = screen.getByRole('button', { name: /Campus Operations/i });
    expect(opsTab).toBeInTheDocument();
    fireEvent.click(opsTab);
    expect(await screen.findByText(/Lecture Timetables, Attendance & Campus Logistics/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/table: timetable_slot/i)).length).toBeGreaterThan(0);
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

  it('renders confirmed third-party integrations with interactive showcase tabs', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Headline & Subcopy
    expect(screen.getByText(/Your institution's tools\. Working together\./i)).toBeInTheDocument();
    expect(screen.getByText(/EduPulse connects institutional workflows with the services your faculty and students already use\./i)).toBeInTheDocument();

    // Razorpay Integration is default active tab
    expect(screen.getAllByText(/Razorpay Fee Collection/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Accept institutional fee payments through an integrated online payment experience\./i)).toBeInTheDocument();
    expect(screen.getByText(/Institutional Payment Journey & Settlement Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct Bank Settlement/i)).toBeInTheDocument();

    // Switch to Google Meet Integration
    const meetTabBtn = screen.getByRole('button', { name: /Google Meet Classrooms/i });
    fireEvent.click(meetTabBtn);
    expect(await screen.findByText(/Connect institutional academic schedules with online classroom experiences\./i)).toBeInTheDocument();
    expect(await screen.findByText(/Virtual Lecture Delivery & Academic Timetable Synchronization/i)).toBeInTheDocument();
    expect(await screen.findByText(/Enrollment-Restricted Access/i)).toBeInTheDocument();

    // Switch to Notion Integration
    const notionTabBtn = screen.getByRole('button', { name: /Notion Course Notes/i });
    fireEvent.click(notionTabBtn);
    expect(await screen.findByText(/Bring academic notes and learning resources closer to the courses students study\./i)).toBeInTheDocument();
    expect(await screen.findByText(/Curriculum Repository & Notion Workspace Linking/i)).toBeInTheDocument();
    expect(await screen.findByText(/Rich Collaborative Canvas/i)).toBeInTheDocument();
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
