import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import StudentFeeLedger from '../pages/Portal/StudentFeeLedger';

describe('StudentFeeLedger In-App Razorpay Tuition Collection', () => {
  it('renders student ledger header and KPI summary cards', () => {
    render(<StudentFeeLedger />);

    expect(screen.getByText(/RBI COMPLIANT B2C PAYMENT GATEWAY/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Tuition & Fee Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Invoiced/i)).toBeInTheDocument();
    expect(screen.getByText(/Outstanding Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Settled & Paid/i)).toBeInTheDocument();
  });

  it('renders invoice table with PENDING and PAID vouchers', () => {
    render(<StudentFeeLedger />);

    expect(screen.getByText('INV-2026-FALL-0842')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-LAB-0192')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-HOSTEL-0044')).toBeInTheDocument();
  });

  it('expands fee breakdown itemization', () => {
    render(<StudentFeeLedger />);

    const breakdownButtons = screen.getAllByText(/Breakdown/i);
    expect(breakdownButtons.length).toBeGreaterThan(0);

    fireEvent.click(breakdownButtons[0]);
    expect(screen.getByText(/Institutional Fee Head Itemization:/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic Tuition Fee/i)).toBeInTheDocument();
  });

  it('opens in-app Razorpay modal on Pay Now and transitions status to PAID upon authorization', () => {
    render(<StudentFeeLedger />);

    const payBtn = screen.getByTestId('pay-now-INV-2026-FALL-0842');
    expect(payBtn).toBeInTheDocument();

    fireEvent.click(payBtn);

    // Modal opens strictly inside React DOM
    expect(screen.getByText(/Razorpay Checkout/i)).toBeInTheDocument();
    expect(screen.getByText(/Amount to Authorize:/i)).toBeInTheDocument();

    const authorizeBtn = screen.getByTestId('confirm-razorpay-payment');
    fireEvent.click(authorizeBtn);

    // Invoice status should now be PAID
    const paidBadges = screen.getAllByText('PAID');
    expect(paidBadges.length).toBeGreaterThan(1);
  });
});
