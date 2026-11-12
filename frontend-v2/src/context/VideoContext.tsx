import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface VideoSession {
  id?: string | number;
  courseCode: string;
  title?: string;
  courseName?: string;
  instructor?: string;
  instructorName?: string;
  roomName: string;
  startedAt?: string;
  participants?: number;
}

export interface VideoContextType {
  activeSession: VideoSession | null;
  joinSession: (session: VideoSession) => void;
  leaveSession: () => void;
  // Compatibility helpers
  activeRoomName: string | null;
  activeCourseCode: string;
  activeCourseName: string;
  activeInstructorName: string;
  startCall: (roomName: string, courseCode?: string, courseName?: string, instructorName?: string) => void;
  endCall: () => void;
  isCallActive: boolean;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<VideoSession | null>(null);

  const joinSession = useCallback((session: VideoSession) => {
    setActiveSession(session);
  }, []);

  const leaveSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  const startCall = useCallback((
    roomName: string,
    courseCode = 'CS-302',
    courseName = 'Live Lecture',
    instructorName = 'Faculty User'
  ) => {
    setActiveSession({
      roomName,
      courseCode,
      title: courseName,
      courseName,
      instructor: instructorName,
      instructorName
    });
  }, []);

  const endCall = useCallback(() => {
    setActiveSession(null);
  }, []);

  return (
    <VideoContext.Provider
      value={{
        activeSession,
        joinSession,
        leaveSession,
        activeRoomName: activeSession?.roomName || null,
        activeCourseCode: activeSession?.courseCode || '',
        activeCourseName: activeSession?.title || activeSession?.courseName || '',
        activeInstructorName: activeSession?.instructor || activeSession?.instructorName || '',
        startCall,
        endCall,
        isCallActive: activeSession !== null
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

// Aliases for VideoCallContext compatibility
export const VideoCallProvider = VideoProvider;
export const useVideoCall = useVideo;
export default VideoContext;
