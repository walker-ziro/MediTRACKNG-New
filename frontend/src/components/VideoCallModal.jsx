import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const VideoCallModal = ({ isOpen, onClose, remoteName }) => {
  const { darkMode } = useSettings();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [stream, setStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (isOpen) {
      startCall();
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      stopCall();
      setCallDuration(0);
    }
    return () => {
      stopCall();
      clearInterval(interval);
    };
  }, [isOpen]);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      
      // For demonstration, we'll mirror the local stream to the remote view
      // In a real app, this would be the stream from the peer connection
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Could not access camera/microphone. Please ensure you have granted permissions.");
    }
  };

  const stopCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
              {remoteName ? remoteName.charAt(0) : 'U'}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{remoteName || 'Unknown User'}</h3>
              <p className="text-gray-300 text-sm">{formatTime(callDuration)}</p>
            </div>
          </div>
          <div className="bg-red-500/20 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-200 text-xs font-medium">LIVE</span>
          </div>
        </div>

        {/* Main Video Area (Remote) */}
        <div className="flex-1 bg-gray-900 relative overflow-hidden rounded-xl mx-4 mt-4 mb-24">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* Local Video (PIP) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1]" 
            />
            <div className="absolute bottom-1 left-2 text-white text-xs font-medium bg-black/50 px-1 rounded">You</div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-gray-800/80 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border border-gray-700">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
          >
            {isVideoOff ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          <button 
            onClick={onClose}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors shadow-lg transform hover:scale-110"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
