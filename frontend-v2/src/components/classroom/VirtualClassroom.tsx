import React, { useState, useEffect } from 'react';
import { PageFrame } from '../ui/PageFrame';
import {
  Video,
  Copy,
  Plus,
  Play,
  PhoneOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useVideoCall } from '../../context/VideoCallContext';

interface LectureRoom {
  roomName: string;
  roomUrl: string;
  courseCode: string;
  courseName: string;
  instructorName: string;
}

const DEFAULT_ROOMS: LectureRoom[] = [
  {
    roomName: 'EduPulse-CS302-DistributedSystems',
    roomUrl: 'https://meet.jit.si/EduPulse-CS302-DistributedSystems',
    courseCode: 'CS-302',
    courseName: 'Advanced Distributed Systems',
    instructorName: 'Dr. Aris Thorne'
  },
  {
    roomName: 'EduPulse-SE404-CloudArchitecture',
    roomUrl: 'https://meet.jit.si/EduPulse-SE404-CloudArchitecture',
    courseCode: 'SE-404',
    courseName: 'Cloud Systems Engineering',
    instructorName: 'Prof. Elena Rostova'
  },
  {
    roomName: 'EduPulse-MA201-LinearAlgebra',
    roomUrl: 'https://meet.jit.si/EduPulse-MA201-LinearAlgebra',
    courseCode: 'MA-201',
    courseName: 'Applied Linear Algebra',
    instructorName: 'Dr. Marcus Vance'
  }
];

export const VirtualClassroom: React.FC = () => {
  const [rooms, setRooms] = useState<LectureRoom[]>(DEFAULT_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<LectureRoom>(DEFAULT_ROOMS[0]);
  const [newRoomCourse, setNewRoomCourse] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const {
    activeRoomName,
    startCall,
    endCall,
    isCallActive
  } = useVideoCall();

  const isCurrentRoomActive = activeRoomName === selectedRoom.roomName;

  // Fetch active lecture rooms from backend on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/v1/classrooms/active', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setRooms(data);
            if (activeRoomName) {
              const matching = data.find(r => r.roomName === activeRoomName);
              if (matching) setSelectedRoom(matching);
            } else {
              setSelectedRoom(data[0]);
            }
          }
        }
      } catch {
        // Fall back to default seeded rooms
      }
    };
    fetchRooms();
  }, [activeRoomName]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomCourse.trim()) return;

    setIsCreating(true);
    const courseCode = newRoomCourse.trim().toUpperCase();
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const roomName = `EduPulse-${courseCode.replace(/[^A-Z0-9]/g, '')}-${uniqueSuffix}`;

    try {
      const response = await fetch('/api/v1/classrooms/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          courseCode,
          courseName: `${courseCode} Live Lecture`,
          roomName,
          instructorName: 'Faculty User',
          durationMinutes: 60
        })
      });

      if (response.ok) {
        const data = await response.json();
        const created: LectureRoom = {
          roomName: data.roomName || roomName,
          roomUrl: data.roomUrl || `https://meet.jit.si/${data.roomName || roomName}`,
          courseCode: data.courseCode || courseCode,
          courseName: data.courseName || `${courseCode} Live Lecture`,
          instructorName: data.instructorName || 'Faculty User'
        };
        setRooms(prev => [...prev, created]);
        setSelectedRoom(created);
        startCall(created.roomName, created.courseCode, created.courseName, created.instructorName);
        setNewRoomCourse('');
        toast.success(`Classroom provisioned: ${created.roomName}`);
      } else {
        const fallback: LectureRoom = {
          roomName,
          roomUrl: `https://meet.jit.si/${roomName}`,
          courseCode,
          courseName: `${courseCode} Live Lecture`,
          instructorName: 'Faculty User'
        };
        setRooms(prev => [...prev, fallback]);
        setSelectedRoom(fallback);
        startCall(fallback.roomName, fallback.courseCode, fallback.courseName, fallback.instructorName);
        setNewRoomCourse('');
        toast.success(`Classroom session configured: ${roomName}`);
      }
    } catch {
      const fallback: LectureRoom = {
        roomName,
        roomUrl: `https://meet.jit.si/${roomName}`,
        courseCode,
        courseName: `${courseCode} Live Lecture`,
        instructorName: 'Faculty User'
      };
      setRooms(prev => [...prev, fallback]);
      setSelectedRoom(fallback);
      startCall(fallback.roomName, fallback.courseCode, fallback.courseName, fallback.instructorName);
      setNewRoomCourse('');
      toast.success(`Classroom session configured: ${roomName}`);
    } finally {
      setIsCreating(false);
    }
  };

  const copyRoomUrl = () => {
    navigator.clipboard?.writeText(selectedRoom.roomUrl);
    toast.success('Meeting link copied to clipboard');
  };

  return (
    <PageFrame
      title="Virtual Classroom"
      description="White-labeled WebRTC video lecture hall with persistent Picture-in-Picture navigation."
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Academics', href: '/dashboard/academics' },
        { label: 'Virtual Classroom' }
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedRoom.roomName}
            onChange={(e) => {
              const found = rooms.find(r => r.roomName === e.target.value);
              if (found) {
                setSelectedRoom(found);
              }
            }}
            className="bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            {rooms.map(r => (
              <option key={r.roomName} value={r.roomName}>
                {r.courseCode}: {r.courseName}
              </option>
            ))}
          </select>

          <button
            onClick={copyRoomUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300"
            title="Copy meeting link"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Link</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Utilitarian Room Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isCurrentRoomActive ? 'bg-emerald-500 animate-pulse' : isCallActive ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
              <span className="text-xs font-semibold text-slate-700 font-mono">{selectedRoom.roomName}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{selectedRoom.instructorName}</span>
              {isCurrentRoomActive && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  LIVE NOW
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {selectedRoom.courseCode}: {selectedRoom.courseName}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isCurrentRoomActive ? (
              <button
                onClick={() => {
                  endCall();
                  toast.info('Disconnected from lecture room');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Session</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  startCall(selectedRoom.roomName, selectedRoom.courseCode, selectedRoom.courseName, selectedRoom.instructorName);
                  toast.success(`Connected to ${selectedRoom.roomName}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isCallActive ? 'Switch to this Room' : 'Start Session'}</span>
              </button>
            )}

            <form onSubmit={handleCreateRoom} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Course code (e.g. CS-401)..."
                value={newRoomCourse}
                onChange={(e) => setNewRoomCourse(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Create Room</span>
              </button>
            </form>
          </div>
        </div>

        {/* Blank Slate View when no call is active */}
        {!isCallActive && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Video className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-slate-900">Virtual Classroom Ready</h3>
              <p className="text-xs text-slate-500">
                Launch a live WebRTC session for {selectedRoom.courseCode} ({selectedRoom.courseName}).
                Your session stays active in Picture-in-Picture mode even when navigating between student profiles, Notion notes, and fee ledgers.
              </p>
            </div>
            <button
              onClick={() => {
                startCall(selectedRoom.roomName, selectedRoom.courseCode, selectedRoom.courseName, selectedRoom.instructorName);
                toast.success(`Connected to ${selectedRoom.roomName}`);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Lecture ({selectedRoom.courseCode})</span>
            </button>
          </div>
        )}
      </div>
    </PageFrame>
  );
};

export default VirtualClassroom;
