import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckoutSuccess from '../pages/Billing/CheckoutSuccess';
import CheckoutCancel from '../pages/Billing/CheckoutCancel';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Stripe Checkout Redirect Callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CheckoutSuccess Component', () => {
    it('renders success badge, activation message, and navigates to /dashboard', () => {
      render(
        <MemoryRouter>
          <CheckoutSuccess />
        </MemoryRouter>
      );

      expect(screen.getByText('Subscription activated successfully!')).toBeInTheDocument();
      expect(screen.getByText('Payment Completed')).toBeInTheDocument();
      
      const returnButton = screen.getByRole('button', { name: /Return to Dashboard/i });
      expect(returnButton).toBeInTheDocument();

      fireEvent.click(returnButton);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('CheckoutCancel Component', () => {
    it('renders cancellation notice, return to billing button, and navigation', () => {
      render(
        <MemoryRouter>
          <CheckoutCancel />
        </MemoryRouter>
      );

      expect(screen.getByText('Payment cancelled. No charges were made.')).toBeInTheDocument();
      expect(screen.getByText('Checkout Discontinued')).toBeInTheDocument();

      const billingButton = screen.getByRole('button', { name: /Return to Billing/i });
      expect(billingButton).toBeInTheDocument();

      fireEvent.click(billingButton);
      expect(mockNavigate).toHaveBeenCalledWith('/billing');

      const dashboardButton = screen.getByRole('button', { name: /Go to Dashboard/i });
      fireEvent.click(dashboardButton);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
