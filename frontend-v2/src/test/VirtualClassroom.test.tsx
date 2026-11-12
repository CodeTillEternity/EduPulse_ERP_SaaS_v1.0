import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

describe('VirtualClassroom Jitsi Meet WebRTC Component', () => {
  it('renders clean utilitarian classroom view and instructor details', () => {
    render(
      <VideoCallProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoCallProvider>
    );

    expect(screen.getAllByText(/Virtual Classroom/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CS-302: Advanced Distributed Systems/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dr. Aris Thorne/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Virtual Classroom Ready/i)).toBeInTheDocument();
    // Verifies no fake marketing badges are present
    expect(screen.queryByText(/Bypassed External Iframe Restrictions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Node Alpha/i)).not.toBeInTheDocument();
  });

  it('creates and starts a new unique Jitsi room on form submit', async () => {
    render(
      <VideoCallProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoCallProvider>
    );

    const input = screen.getByPlaceholderText(/Course code/i);
    fireEvent.change(input, { target: { value: 'CS-401' } });

    const createBtn = screen.getByText(/Create Room/i);
    fireEvent.click(createBtn);

    const createdElements = await screen.findAllByText(/CS-401/i);
    expect(createdElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/End Session/i)).toBeInTheDocument();
  });

  it('toggles call active state when user starts and ends session', () => {
    render(
      <VideoCallProvider>
        <MemoryRouter>
          <VirtualClassroom />
        </MemoryRouter>
      </VideoCallProvider>
    );

    // Initial state: Start Session button is visible
    const startBtn = screen.getByText(/Start Session/i);
    expect(startBtn).toBeInTheDocument();

    // Click Start Session
    fireEvent.click(startBtn);

    // Call is now active: shows LIVE NOW and End Session
    expect(screen.getByText(/LIVE NOW/i)).toBeInTheDocument();
    expect(screen.getByText(/End Session/i)).toBeInTheDocument();

    // Click End Session
    const endBtn = screen.getByText(/End Session/i);
    fireEvent.click(endBtn);

    // Returns to ready state
    expect(screen.getByText(/Start Session/i)).toBeInTheDocument();
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
