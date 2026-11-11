import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
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
        setLocalVideo: vi.fn()
      }))
    }
  };
});

describe('VirtualClassroom Native In-App WebRTC Component', () => {
  it('renders native classroom HUD, instructor details, and glassmorphic container', () => {
    render(<VirtualClassroom />);

    expect(screen.getByText(/LIVE WEBRTC CLASSROOM/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CS-302: Advanced Distributed Systems/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dr. Aris Thorne/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bypassed External Iframe Restrictions/i)).toBeInTheDocument();
  });

  it('renders video container ref mounted into DOM', () => {
    render(<VirtualClassroom />);
    const videoContainer = screen.getByTestId('daily-video-container');
    expect(videoContainer).toBeInTheDocument();
  });

  it('toggles microphone and camera media state', () => {
    render(<VirtualClassroom />);
    const muteBtn = screen.getByTitle(/Mute Microphone/i);
    expect(muteBtn).toBeInTheDocument();

    fireEvent.click(muteBtn);
    expect(screen.getByTitle(/Unmute Microphone/i)).toBeInTheDocument();

    const camBtn = screen.getByTitle(/Stop Camera/i);
    fireEvent.click(camBtn);
    expect(screen.getByTitle(/Start Camera/i)).toBeInTheDocument();
  });

  it('opens lecture chat drawer and displays discussion thread', () => {
    render(<VirtualClassroom />);
    const chatBtn = screen.getByTitle(/Toggle Lecture Chat/i);
    fireEvent.click(chatBtn);

    expect(screen.getByText(/Lecture Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/Raft log persistence/i)).toBeInTheDocument();
  });
});
