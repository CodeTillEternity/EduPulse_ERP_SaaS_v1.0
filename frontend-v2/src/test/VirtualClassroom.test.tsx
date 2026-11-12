import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VirtualClassroom from '../components/classroom/VirtualClassroom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { VideoProvider, useVideo } from '../context/VideoContext';
import { useAuthStore } from '../store/useAuthStore';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

// Mock @jitsi/react-sdk
vi.mock('@jitsi/react-sdk', () => {
  return {
    JitsiMeeting: vi.fn(({ domain, roomName, onReadyToClose }) => (
      <div data-testid="mocked-jitsi-meeting">
        <span>Domain: {domain}</span>
        <span>Room: {roomName}</span>
        <button onClick={onReadyToClose} data-testid="jitsi-hangup-btn">
          Hangup
        </button>
      </div>
    ))
  };
});

describe('VirtualClassroom Stage 2: Strict Classroom View', () => {
  it('renders clean utilitarian classroom header, active sessions grid, and no marketing fluff when activeSession is null', () => {
    render(
      <VideoProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoProvider>
    );

    // Consolidated header
    expect(screen.getAllByText(/Virtual Classroom/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Start New Lecture/i)).toBeInTheDocument();

    // Active Sessions Grid
    expect(screen.getByTestId('active-sessions-grid')).toBeInTheDocument();
    expect(screen.getByText('Advanced Distributed Systems')).toBeInTheDocument();
    expect(screen.getByText('Dr. Aris Thorne')).toBeInTheDocument();
    expect(screen.getByText('28 participants')).toBeInTheDocument();
    expect(screen.getAllByText(/Live/i).length).toBeGreaterThan(0);

    // Fluff purge verification
    expect(screen.queryByText(/White-labeled WebRTC video lecture hall/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Virtual Classroom Ready/i)).not.toBeInTheDocument();
  });

  it('returns empty fragment when activeSession exists to prevent UI collisions', () => {
    const ActiveSessionHarness = () => {
      const { joinSession } = useVideo();
      React.useEffect(() => {
        joinSession({
          courseCode: 'CS-302',
          title: 'Advanced Distributed Systems',
          roomName: 'EduPulse-CS302-Alpha',
          instructor: 'Dr. Thorne'
        });
      }, [joinSession]);

      return <VirtualClassroom />;
    };

    const { container } = render(
      <VideoProvider>
        <MemoryRouter>
          <ActiveSessionHarness />
        </MemoryRouter>
      </VideoProvider>
    );

    // Completely empty to prevent collisions with DashboardLayout video
    expect(container.innerHTML).toBe('');
    expect(screen.queryByTestId('active-sessions-grid')).not.toBeInTheDocument();
  });

  it('opens Start New Lecture dialog and provisions a new lecture session', async () => {
    render(
      <VideoProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoProvider>
    );

    // Click top-right primary action button
    const startNewBtn = screen.getByText(/Start New Lecture/i);
    fireEvent.click(startNewBtn);

    // Fill form in modal dialog
    const codeInput = screen.getByPlaceholderText(/e\.g\. CS-401/i);
    const titleInput = screen.getByPlaceholderText(/e\.g\. Distributed Consensus/i);
    fireEvent.change(codeInput, { target: { value: 'CS-401' } });
    fireEvent.change(titleInput, { target: { value: 'High Availability Systems' } });

    const launchBtn = screen.getByText(/Launch Lecture/i);
    fireEvent.click(launchBtn);

    // Upon launching, activeSession is created and page returns empty fragment
    await vi.waitFor(() => {
      expect(screen.queryByText(/Start New Lecture/i)).not.toBeInTheDocument();
    });
  });

  it('shows minimal quiet empty state when filter matches no live lectures', () => {
    render(
      <VideoProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoProvider>
    );

    // Select Physics filter with no matching sessions
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'PHY' } });

    // Displays minimal quiet empty state
    expect(screen.getByText(/No live lectures at the moment/i)).toBeInTheDocument();
    expect(screen.getByText(/Check back during scheduled class hours/i)).toBeInTheDocument();
    expect(screen.queryByTestId('active-sessions-grid')).not.toBeInTheDocument();
  });
});

describe('DashboardLayout Stage 1: Unified WebRTC Video Architecture', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });

    useAuthStore.setState({
      isAuthenticated: true,
      token: 'jwt-token',
      user: {
        id: '1',
        username: 'superadmin',
        role: 'SUPER_ADMIN',
        email: 'superadmin@edupulse.edu',
        permissions: ['ALL']
      }
    });
  });

  const CallActivator = () => {
    const { joinSession } = useVideo();
    return (
      <button
        onClick={() =>
          joinSession({
            roomName: 'EduPulse-CS302-Alpha',
            courseCode: 'CS-302',
            title: 'Advanced Distributed Systems',
            instructor: 'Dr. Thorne'
          })
        }
        data-testid="activate-call-btn"
      >
        Trigger Call
      </button>
    );
  };

  it('renders Jitsi to fill main content area when activeSession exists on /dashboard/classroom', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <VideoProvider>
          <MemoryRouter initialEntries={['/dashboard/classroom']}>
            <Routes>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route
                  path="classroom"
                  element={
                    <div>
                      <CallActivator />
                      <VirtualClassroom />
                    </div>
                  }
                />
              </Route>
            </Routes>
          </MemoryRouter>
        </VideoProvider>
      </QueryClientProvider>
    );

    // Initially no call active, VirtualClassroom active sessions grid is shown
    expect(screen.queryByTestId('jitsi-full-classroom')).not.toBeInTheDocument();
    expect(screen.getByTestId('active-sessions-grid')).toBeInTheDocument();

    // Trigger Join Session
    fireEvent.click(screen.getByTestId('activate-call-btn'));

    // Full-screen Jitsi container fills the main content area
    const fullClassroom = screen.getByTestId('jitsi-full-classroom');
    expect(fullClassroom).toBeInTheDocument();
    expect(fullClassroom.className).toContain('w-full h-full flex-1');
    expect(screen.getByText(/Leave Classroom/i)).toBeInTheDocument();

    // Disconnect
    fireEvent.click(screen.getByText(/Leave Classroom/i));
    expect(screen.queryByTestId('jitsi-full-classroom')).not.toBeInTheDocument();
  });

  it('renders Jitsi as floating Picture-in-Picture window on other routes like /dashboard/materials', () => {
    const Harness = () => {
      const { joinSession } = useVideo();
      React.useEffect(() => {
        joinSession({
          roomName: 'EduPulse-CS302-Alpha',
          courseCode: 'CS-302',
          title: 'Advanced Distributed Systems',
          instructor: 'Dr. Thorne'
        });
      }, [joinSession]);

      return (
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="materials" element={<div>Faculty Materials View</div>} />
          </Route>
        </Routes>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <VideoProvider>
          <MemoryRouter initialEntries={['/dashboard/materials']}>
            <Harness />
          </MemoryRouter>
        </VideoProvider>
      </QueryClientProvider>
    );

    // Floating Picture-in-Picture window renders with exact specified classes
    const pipContainer = screen.getByTestId('jitsi-persistent-container');
    expect(pipContainer).toBeInTheDocument();
    expect(pipContainer.className).toContain('fixed bottom-6 right-6 w-[480px] h-[320px] rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-800');
    expect(screen.getByText('PiP')).toBeInTheDocument();
    expect(screen.getByText(/CS-302/i)).toBeInTheDocument();
  });
});
