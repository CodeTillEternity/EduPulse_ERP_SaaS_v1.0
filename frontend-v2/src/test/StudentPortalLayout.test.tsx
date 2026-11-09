import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentPortalLayout from '../layouts/StudentPortalLayout';
import { useAuthStore } from '../store/useAuthStore';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('StudentPortalLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      token: 'mock-jwt-token',
      isAuthenticated: true,
      user: {
        username: 'rohan_verma',
        role: 'STUDENT',
        permissions: ['STUDENT_PROFILE_READ', 'STUDENT_FEES_READ'],
        tenantId: 'tenant-default',
      },
    });
  });

  it('renders student portal branding and navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/portal']}>
        <StudentPortalLayout />
      </MemoryRouter>
    );

    expect(screen.getByText('EduPulse')).toBeInTheDocument();
    expect(screen.getByText('Student Portal')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Schedule')).toBeInTheDocument();
    expect(screen.getByText('Academics / Grades')).toBeInTheDocument();
    expect(screen.getByText('Fee Center')).toBeInTheDocument();
    expect(screen.getByText('rohan_verma')).toBeInTheDocument();
  });

  it('handles logout action correctly', () => {
    render(
      <MemoryRouter initialEntries={['/portal']}>
        <StudentPortalLayout />
      </MemoryRouter>
    );

    const logoutButtons = screen.getAllByRole('button', { name: /logout/i });
    expect(logoutButtons.length).toBeGreaterThan(0);
    fireEvent.click(logoutButtons[0]);

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
