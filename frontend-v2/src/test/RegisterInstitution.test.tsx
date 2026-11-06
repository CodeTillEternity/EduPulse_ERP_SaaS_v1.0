import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterInstitution from '../pages/RegisterInstitution';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('RegisterInstitution Component', () => {
  it('renders all registration form input fields and labels', () => {
    render(<RegisterInstitution />, { wrapper: createWrapper() });

    expect(screen.getByText(/Register New Institution/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Institution Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Administrator Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Administrator Official Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Initial Admin Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete Registration/i })).toBeInTheDocument();
  });

  it('displays validation errors when required fields are submitted blank', async () => {
    render(<RegisterInstitution />, { wrapper: createWrapper() });

    const submitBtn = screen.getByRole('button', { name: /Complete Registration/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Institution name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Administrator name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Official email is required/i)).toBeInTheDocument();
    });
  });

  it('invokes onSubmit callback with form data upon valid entry', async () => {
    const handleSubmit = vi.fn();
    render(<RegisterInstitution onSubmit={handleSubmit} />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByLabelText(/Institution Name/i), {
      target: { value: 'Apex Global University' },
    });
    fireEvent.change(screen.getByLabelText(/Administrator Full Name/i), {
      target: { value: 'Dr. Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Administrator Official Email/i), {
      target: { value: 'admin@apex.edu' },
    });

    const submitBtn = screen.getByRole('button', { name: /Complete Registration/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          institutionName: 'Apex Global University',
          adminName: 'Dr. Jane Doe',
          adminEmail: 'admin@apex.edu',
        })
      );
    });
  });
});
