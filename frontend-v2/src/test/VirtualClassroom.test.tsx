import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VirtualClassroom from '../components/classroom/VirtualClassroom';
import Layout from '../components/Layout';
import { VideoCallProvider, useVideoCall } from '../context/VideoCallContext';
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

describe('VirtualClassroom Active Classes Dashboard', () => {
  it('renders clean utilitarian classroom header, active sessions grid, and no marketing fluff', () => {
    render(
      <VideoCallProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoCallProvider>
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

  it('joins a session when Join Session is clicked and displays active call HUD', () => {
    render(
      <VideoCallProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoCallProvider>
    );

    const joinBtns = screen.getAllByText(/Join Session/i);
    expect(joinBtns.length).toBeGreaterThan(0);

    // Join first session (CS-302)
    fireEvent.click(joinBtns[0]);

    // Active call HUD is displayed
    expect(screen.getByText(/Active Classroom Call/i)).toBeInTheDocument();
    const leaveBtns = screen.getAllByText(/Leave Session/i);
    expect(leaveBtns.length).toBeGreaterThan(0);

    // Disconnect
    fireEvent.click(leaveBtns[0]);

    expect(screen.queryByText(/Active Classroom Call/i)).not.toBeInTheDocument();
  });

  it('opens Start New Lecture dialog and provisions a new lecture session', async () => {
    render(
      <VideoCallProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoCallProvider>
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

    // Session added to grid and active call HUD is triggered
    expect(await screen.findByText('High Availability Systems')).toBeInTheDocument();
    expect(screen.getByText(/Active Classroom Call/i)).toBeInTheDocument();
  });

  it('shows minimal quiet empty state when filter matches no live lectures', () => {
    render(
      <VideoCallProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoCallProvider>
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

describe('Persistent PiP Video Layout (Commit 203)', () => {
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
    const { startCall } = useVideoCall();
    return (
      <button
        onClick={() => startCall('EduPulse-CS302-Alpha', 'CS-302', 'Advanced Distributed Systems', 'Dr. Thorne')}
        data-testid="activate-call-btn"
      >
        Trigger Call
      </button>
    );
  };

  it('renders persistent Jitsi container full-size inside /dashboard/classroom', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <VideoCallProvider>
          <MemoryRouter initialEntries={['/dashboard/classroom']}>
            <Routes>
              <Route path="/dashboard" element={<Layout />}>
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
        </VideoCallProvider>
      </QueryClientProvider>
    );

    // Initially no call active
    expect(screen.queryByTestId('jitsi-persistent-container')).not.toBeInTheDocument();

    // Activate call
    fireEvent.click(screen.getByTestId('activate-call-btn'));

    // Persistent container is mounted
    const container = screen.getByTestId('jitsi-persistent-container');
    expect(container).toBeInTheDocument();
    // Standard full-size layout on classroom route
    expect(container.className).toContain('w-full max-w-[1600px]');
    expect(container.className).not.toContain('fixed bottom-4 right-4');
  });

  it('renders persistent Jitsi container in floating PiP mode on other routes like /dashboard/materials', () => {
    const Harness = () => {
      const { startCall } = useVideoCall();
      React.useEffect(() => {
        startCall('EduPulse-CS302-Alpha', 'CS-302', 'Advanced Distributed Systems', 'Dr. Thorne');
      }, [startCall]);

      return (
        <Routes>
          <Route path="/dashboard" element={<Layout />}>
            <Route path="materials" element={<div>Faculty Materials View</div>} />
          </Route>
        </Routes>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <VideoCallProvider>
          <MemoryRouter initialEntries={['/dashboard/materials']}>
            <Harness />
          </MemoryRouter>
        </VideoCallProvider>
      </QueryClientProvider>
    );

    // Persistent container is mounted in PiP mode
    const container = screen.getByTestId('jitsi-persistent-container');
    expect(container).toBeInTheDocument();
    expect(container.className).toContain('fixed bottom-4 right-4 z-50 w-[400px] h-[300px]');
    // Displays PiP badge in header bar
    expect(screen.getByText('PiP')).toBeInTheDocument();
    expect(screen.getByText('CS-302')).toBeInTheDocument();
  });
});
