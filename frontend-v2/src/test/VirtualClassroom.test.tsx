import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import VirtualClassroom from '../components/classroom/VirtualClassroom';

// Mock DailyIframe to avoid network / iframe errors in JSDOM
vi.mock('@daily-co/daily-js', () => {
  return {
    default: {
      createFrame: vi.fn(() => ({
        join: vi.fn().mockResolvedValue({}),
        destroy: vi.fn(),
        on: vi.fn(),
        setLocalAudio: vi.fn(),
        setLocalVideo: vi.fn(),
        leave: vi.fn()
      }))
    }
  };
});

describe('VirtualClassroom WebRTC Component', () => {
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

  it('renders video container ref mounted into DOM', () => {
    render(
      <MemoryRouter>
        <VirtualClassroom />
      </MemoryRouter>
    );
    const videoContainer = screen.getByTestId('daily-video-container');
    expect(videoContainer).toBeInTheDocument();
  });

  it('toggles microphone and camera media state', () => {
    render(
      <MemoryRouter>
        <VirtualClassroom />
      </MemoryRouter>
    );
    const muteBtn = screen.getByTitle(/Unmute Microphone/i);
    expect(muteBtn).toBeInTheDocument();

    fireEvent.click(muteBtn);
    expect(screen.getByTitle(/Mute Microphone/i)).toBeInTheDocument();

    const camBtn = screen.getByTitle(/Start Camera/i);
    fireEvent.click(camBtn);
    expect(screen.getByTitle(/Stop Camera/i)).toBeInTheDocument();
  });

  it('opens lecture chat drawer and displays discussion thread', () => {
    render(
      <MemoryRouter>
        <VirtualClassroom />
      </MemoryRouter>
    );
    const chatBtn = screen.getByTitle(/Toggle Lecture Chat/i);
    fireEvent.click(chatBtn);

    expect(screen.getByText(/Class session started/i)).toBeInTheDocument();
  });
});
