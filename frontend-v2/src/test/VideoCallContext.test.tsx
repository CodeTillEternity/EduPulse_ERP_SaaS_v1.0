import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { VideoCallProvider, useVideoCall } from '../context/VideoCallContext';

describe('VideoCallContext Global Call State Management', () => {
  it('initializes with null activeRoomName and inactive call state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <VideoCallProvider>{children}</VideoCallProvider>
    );

    const { result } = renderHook(() => useVideoCall(), { wrapper });

    expect(result.current.activeRoomName).toBeNull();
    expect(result.current.isCallActive).toBe(false);
  });

  it('updates global state when starting a call and clears on endCall', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <VideoCallProvider>{children}</VideoCallProvider>
    );

    const { result } = renderHook(() => useVideoCall(), { wrapper });

    act(() => {
      result.current.startCall('EduPulse-CS302-Alpha', 'CS-302', 'Advanced Distributed Systems', 'Dr. Thorne');
    });

    expect(result.current.activeRoomName).toBe('EduPulse-CS302-Alpha');
    expect(result.current.activeCourseCode).toBe('CS-302');
    expect(result.current.isCallActive).toBe(true);

    act(() => {
      result.current.endCall();
    });

    expect(result.current.activeRoomName).toBeNull();
    expect(result.current.isCallActive).toBe(false);
  });
});

