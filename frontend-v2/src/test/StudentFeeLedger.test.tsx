import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import StudentFeeLedger from '../pages/Portal/StudentFeeLedger';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('Admin Tuition Ledger Utilitarian Refactor (Stage 4)', () => {
  it('renders student ledger header and KPI summary cards without marketing fluff', () => {
    render(
      <MemoryRouter>
        <StudentFeeLedger />
      </MemoryRouter>
    );

    // Fluff purge verification
    expect(screen.queryByText(/RBI COMPLIANT B2C PAYMENT GATEWAY/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Auto-reconciliation active/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pay Now/i)).not.toBeInTheDocument();

    // Data elevation
    expect(screen.getByText(/Student Tuition & Fee Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Invoiced/i)).toBeInTheDocument();
    expect(screen.getByText(/Outstanding Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Settled & Paid/i)).toBeInTheDocument();
  });

  it('renders invoice table with PENDING and PAID vouchers', () => {
    render(
      <MemoryRouter>
        <StudentFeeLedger />
      </MemoryRouter>
    );

    expect(screen.getByText('INV-2026-FALL-0842')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-LAB-0192')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-HOSTEL-0044')).toBeInTheDocument();
  });

  it('expands fee breakdown itemization', () => {
    render(
      <MemoryRouter>
        <StudentFeeLedger />
      </MemoryRouter>
    );

    const breakdownButtons = screen.getAllByTestId('toggle-breakdown-btn');
    expect(breakdownButtons.length).toBeGreaterThan(0);

    fireEvent.click(breakdownButtons[0]);
    expect(screen.getByText(/Institutional Fee Head Itemization:/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic Tuition Fee/i)).toBeInTheDocument();
  });

  it('provides admin actions: records manual payment and marks invoice as PAID', () => {
    render(
      <MemoryRouter>
        <StudentFeeLedger />
      </MemoryRouter>
    );

    const manualPayBtn = screen.getByTestId('manual-pay-INV-2026-FALL-0842');
    expect(manualPayBtn).toBeInTheDocument();

    const reminderBtn = screen.getByTestId('send-reminder-INV-2026-FALL-0842');
    expect(reminderBtn).toBeInTheDocument();

    // Trigger reminder
    fireEvent.click(reminderBtn);

    // Record manual payment
    fireEvent.click(manualPayBtn);

    expect(screen.getAllByText(/Record Manual Payment/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Receipt \/ Transaction Reference/i)).toBeInTheDocument();

    const confirmBtn = screen.getByTestId('confirm-manual-payment');
    fireEvent.click(confirmBtn);

    // Invoice status should now be PAID
    const paidBadges = screen.getAllByText('PAID');
    expect(paidBadges.length).toBeGreaterThan(1);
  });
});
