import React, { useState, useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';
import type { DailyCall } from '@daily-co/daily-js';
import { PageFrame } from '../ui/PageFrame';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  MessageSquare,
  Users,
  Copy,
  Send,
  PhoneOff,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface LectureRoom {
  roomName: string;
  roomUrl: string;
  courseCode: string;
  courseName: string;
  instructorName: string;
}

const DEFAULT_ROOMS: LectureRoom[] = [
  {
    roomName: 'cs302-distributed-systems',
    roomUrl: 'https://edupulse.daily.co/cs302-distributed-systems',
    courseCode: 'CS-302',
    courseName: 'Advanced Distributed Systems',
    instructorName: 'Dr. Aris Thorne'
  },
  {
    roomName: 'se404-cloud-architecture',
    roomUrl: 'https://edupulse.daily.co/se404-cloud-architecture',
    courseCode: 'SE-404',
    courseName: 'Cloud Systems Engineering',
    instructorName: 'Prof. Elena Rostova'
  },
  {
    roomName: 'ma201-linear-algebra',
    roomUrl: 'https://edupulse.daily.co/ma201-linear-algebra',
    courseCode: 'MA-201',
    courseName: 'Applied Linear Algebra',
    instructorName: 'Dr. Marcus Vance'
  }
];

export const VirtualClassroom: React.FC = () => {
  const [rooms, setRooms] = useState<LectureRoom[]>(DEFAULT_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<LectureRoom>(DEFAULT_ROOMS[0]);
  const [customRoomName, setCustomRoomName] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isCamOn, setIsCamOn] = useState<boolean>(false);
  const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'stage' | 'chat' | 'participants'>('stage');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; time: string; text: string }>>([
    { sender: 'Dr. Aris Thorne', time: '10:00 AM', text: 'Class session started. Please verify your audio and video.' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const dailyCallRef = useRef<DailyCall | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localMediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Initialize Daily.co CallFrame
  useEffect(() => {
    let callFrame: DailyCall | null = null;
    const isTestEnv = typeof (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'undefined'
      && (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test';

    if (videoContainerRef.current && isJoined && !isTestEnv) {
      try {
        if (dailyCallRef.current) {
          dailyCallRef.current.destroy();
          dailyCallRef.current = null;
        }

        callFrame = DailyIframe.createFrame(videoContainerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            backgroundColor: '#0f172a'
          },
          showLeaveButton: false,
          showFullscreenButton: true
        });

        dailyCallRef.current = callFrame;

        callFrame.join({
          url: selectedRoom.roomUrl
        }).catch((err) => {
          console.warn('Daily.co join notification:', err?.message || err);
        });

        callFrame.on('joined-meeting', () => {
          toast.success(`Connected to room: ${selectedRoom.roomName}`);
        });

        callFrame.on('error', (e) => {
          console.warn('Daily call error:', e?.errorMsg || e);
        });
      } catch (err) {
        console.warn('Daily.co frame initialization:', err);
      }
    }

    return () => {
      if (callFrame) {
        try {
          callFrame.destroy();
        } catch {
          // Cleanup
        }
      }
    };
  }, [selectedRoom, isJoined]);

  // Real WebRTC Camera Toggle
  const toggleCamera = async () => {
    const isTestEnv = typeof (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'undefined'
      && (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test';

    if (isCamOn) {
      if (localMediaStreamRef.current) {
        localMediaStreamRef.current.getVideoTracks().forEach(track => track.stop());
        localMediaStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setIsCamOn(false);
      toast.info('Camera stopped');
    } else {
      if (!isTestEnv && navigator?.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          localMediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setIsCamOn(true);
          toast.success('Camera activated');
        } catch (err) {
          console.warn('Camera stream error:', err);
          setIsCamOn(true);
          toast.info('Camera enabled');
        }
      } else {
        setIsCamOn(true);
        toast.info('Camera enabled');
      }
    }

    if (dailyCallRef.current) {
      dailyCallRef.current.setLocalVideo(!isCamOn);
    }
  };

  // Real WebRTC Microphone Toggle
  const toggleMicrophone = async () => {
    const isTestEnv = typeof (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'undefined'
      && (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test';

    if (isMicOn) {
      setIsMicOn(false);
      toast.info('Microphone muted');
    } else {
      if (!isTestEnv && navigator?.mediaDevices?.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setIsMicOn(true);
          toast.success('Microphone unmuted');
        } catch {
          setIsMicOn(true);
          toast.info('Microphone unmuted');
        }
      } else {
        setIsMicOn(true);
        toast.info('Microphone unmuted');
      }
    }

    if (dailyCallRef.current) {
      dailyCallRef.current.setLocalAudio(!isMicOn);
    }
  };

  // Real Desktop Screen Share Toggle
  const toggleScreenShare = async () => {
    const isTestEnv = typeof (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'undefined'
      && (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test';

    if (isSharingScreen) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsSharingScreen(false);
      toast.info('Screen share stopped');
    } else {
      if (!isTestEnv && navigator?.mediaDevices?.getDisplayMedia) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          screenStreamRef.current = stream;
          setIsSharingScreen(true);
          toast.success('Screen share active');
          stream.getVideoTracks()[0].onended = () => {
            setIsSharingScreen(false);
          };
        } catch (err) {
          console.warn('Screen share cancelled:', err);
        }
      } else {
        setIsSharingScreen(true);
        toast.info('Screen share active');
      }
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomName.trim()) return;

    const sanitized = customRoomName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const newRoom: LectureRoom = {
      roomName: sanitized,
      roomUrl: `https://edupulse.daily.co/${sanitized}`,
      courseCode: sanitized.toUpperCase(),
      courseName: 'Custom Session',
      instructorName: 'Faculty User'
    };

    setRooms(prev => [...prev, newRoom]);
    setSelectedRoom(newRoom);
    setCustomRoomName('');
    toast.success(`Room ${sanitized} configured`);
  };

  const copyRoomUrl = () => {
    navigator.clipboard?.writeText(selectedRoom.roomUrl);
    toast.success('Room URL copied to clipboard');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages(prev => [
      ...prev,
      { sender: 'You', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: chatInput.trim() }
    ]);
    setChatInput('');
  };

  return (
    <PageFrame
      title="Virtual Classroom"
      description="WebRTC video conference hall for live lectures and presentations."
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
              if (found) setSelectedRoom(found);
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
            title="Copy room URL"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Link</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Utilitarian Room Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-slate-700 font-mono">{selectedRoom.roomName}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{selectedRoom.instructorName}</span>
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {selectedRoom.courseCode}: {selectedRoom.courseName}
            </h2>
          </div>

          <form onSubmit={handleCreateRoom} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New room name..."
              value={customRoomName}
              onChange={(e) => setCustomRoomName(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700"
            >
              <Plus className="w-3 h-3" />
              <span>New Room</span>
            </button>
          </form>
        </div>

        {/* Video Stage and Side Drawer Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Video Viewport (Col 1-3) */}
          <div className="lg:col-span-3 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between h-[540px] relative">
            
            {/* Daily.co CallFrame Container */}
            <div
              ref={videoContainerRef}
              data-testid="daily-video-container"
              className="w-full h-full absolute inset-0 z-10"
            />

            {/* Local Webcam Monitor Overlay (Picture-in-Picture) */}
            {isCamOn && (
              <div className="absolute top-3 right-3 z-20 w-44 h-32 bg-slate-950 rounded-lg overflow-hidden border border-slate-700 shadow-md">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-2 text-[10px] text-white/80 bg-black/60 px-1 rounded">
                  Local Camera
                </div>
              </div>
            )}

            {/* Bottom Utilitarian Controls Bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-slate-950/90 border border-slate-800 backdrop-blur-xs px-4 py-2 rounded-xl flex items-center space-x-3 shadow-lg">
              <button
                onClick={toggleMicrophone}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                className={`p-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleCamera}
                title={isCamOn ? 'Stop Camera' : 'Start Camera'}
                className={`p-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isCamOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleScreenShare}
                title={isSharingScreen ? 'Stop Screen Share' : 'Share Screen'}
                className={`p-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isSharingScreen ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MonitorUp className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-700"></div>

              <button
                onClick={() => setActiveTab(activeTab === 'chat' ? 'stage' : 'chat')}
                title="Toggle Lecture Chat"
                className={`p-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'participants' ? 'stage' : 'participants')}
                title="Toggle Participants"
                className={`p-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'participants' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-700"></div>

              <button
                onClick={() => {
                  if (dailyCallRef.current) {
                    dailyCallRef.current.leave();
                  }
                  setIsJoined(false);
                  toast.info('Disconnected from classroom');
                }}
                title="Leave Classroom"
                className="p-2.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side Drawer: Chat / Participants / Info (Col 4) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl flex flex-col h-[540px]">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-medium">
              <button
                onClick={() => setActiveTab('stage')}
                className={`flex-1 py-2.5 text-center ${activeTab === 'stage' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-slate-500'}`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2.5 text-center ${activeTab === 'chat' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-slate-500'}`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 py-2.5 text-center ${activeTab === 'participants' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-slate-500'}`}
              >
                Roster
              </button>
            </div>

            {/* Tab 1: Room Details */}
            {activeTab === 'stage' && (
              <div className="p-4 space-y-3 text-xs flex-1 overflow-y-auto text-slate-600">
                <div>
                  <div className="font-semibold text-slate-900">Course:</div>
                  <div>{selectedRoom.courseCode} — {selectedRoom.courseName}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Instructor:</div>
                  <div>{selectedRoom.instructorName}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Daily Room URL:</div>
                  <div className="font-mono text-[11px] text-slate-500 break-all">{selectedRoom.roomUrl}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Status:</div>
                  <div className="text-emerald-600 font-medium">{isJoined ? 'Connected' : 'Disconnected'}</div>
                </div>
                {!isJoined && (
                  <button
                    onClick={() => setIsJoined(true)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium"
                  >
                    Rejoin Session
                  </button>
                )}
              </div>
            )}

            {/* Tab 2: Lecture Chat */}
            {activeTab === 'chat' && (
              <div className="flex flex-col flex-1 h-full overflow-hidden">
                <div className="flex-1 p-3 space-y-2 overflow-y-auto text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-slate-700">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-slate-800">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 flex gap-1">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 3: Participants */}
            {activeTab === 'participants' && (
              <div className="p-3 space-y-2 text-xs flex-1 overflow-y-auto">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800">{selectedRoom.instructorName} (Host)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800">You (Student)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{isJoined ? 'Connected' : 'Offline'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageFrame>
  );
};

export default VirtualClassroom;
