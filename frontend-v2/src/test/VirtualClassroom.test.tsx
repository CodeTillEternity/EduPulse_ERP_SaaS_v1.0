import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import VirtualClassroom from '../components/classroom/VirtualClassroom';

// Mock @jitsi/react-sdk
vi.mock('@jitsi/react-sdk', () => {
  return {
    JitsiMeeting: vi.fn(({ domain, roomName }) => (
      <div data-testid="mocked-jitsi-meeting">
        <span>Domain: {domain}</span>
        <span>Room: {roomName}</span>
      </div>
    ))
  };
});

describe('VirtualClassroom Jitsi Meet WebRTC Component', () => {
  it('renders clean utilitarian classroom view and instructor details', () => {
    render(
      <MemoryRouter>
        <VirtualClassroom />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Virtual Classroom/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CS-302: Advanced Distributed Systems/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dr. Aris Thorne/i).length).toBeGreaterThan(0);
    // Verifies no fake marketing badges are present
    expect(screen.queryByText(/Bypassed External Iframe Restrictions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Node Alpha/i)).not.toBeInTheDocument();
  });

  it('renders Jitsi video portal container mounted into DOM', () => {
    render(
      <MemoryRouter>
        <VirtualClassroom />
      </MemoryRouter>
    );
    const videoContainer = screen.getByTestId('jitsi-meeting-container');
    expect(videoContainer).toBeInTheDocument();
  });

  it('creates and switches to a new unique Jitsi room on form submit', async () => {
    render(
      <MemoryRouter>
        <VirtualClassroom />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Course code/i);
    fireEvent.change(input, { target: { value: 'CS-401' } });

    const createBtn = screen.getByText(/Create Room/i);
    fireEvent.click(createBtn);

    const createdElements = await screen.findAllByText(/CS-401/i);
    expect(createdElements.length).toBeGreaterThan(0);
  });
});
