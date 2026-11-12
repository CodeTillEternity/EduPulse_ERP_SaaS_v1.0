import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface VideoCallContextType {
  activeRoomName: string | null;
  activeCourseCode: string;
  activeCourseName: string;
  activeInstructorName: string;
  startCall: (roomName: string, courseCode?: string, courseName?: string, instructorName?: string) => void;
  endCall: () => void;
  isCallActive: boolean;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  const [activeCourseCode, setActiveCourseCode] = useState<string>('CS-302');
  const [activeCourseName, setActiveCourseName] = useState<string>('Advanced Distributed Systems');
  const [activeInstructorName, setActiveInstructorName] = useState<string>('Dr. Aris Thorne');

  const startCall = (
    roomName: string,
    courseCode = 'CS-302',
    courseName = 'Advanced Distributed Systems',
    instructorName = 'Dr. Aris Thorne'
  ) => {
    setActiveRoomName(roomName);
    setActiveCourseCode(courseCode);
    setActiveCourseName(courseName);
    setActiveInstructorName(instructorName);
  };

  const endCall = () => {
    setActiveRoomName(null);
  };

  return (
    <VideoCallContext.Provider
      value={{
        activeRoomName,
        activeCourseCode,
        activeCourseName,
        activeInstructorName,
        startCall,
        endCall,
        isCallActive: !!activeRoomName
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = (): VideoCallContextType => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

export default VideoCallContext;
