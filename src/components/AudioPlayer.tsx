"use client";

import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, Shuffle, Heart } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  track: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    thumbnail: string;
    preview_url?: string;
    duration: string;
  };
  onTrackEnd?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function AudioPlayer({ track, onTrackEnd, onNext, onPrevious }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (track.preview_url) {
        audioRef.current.src = track.preview_url;
        audioRef.current.load();
      }
    }
  }, [track.preview_url, volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (isRepeat) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      onTrackEnd?.();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseInt(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-xl border-t border-white/20 p-4 z-40">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center space-x-4 flex-1 min-w-0"
          >
            <motion.div
              animate={{ 
                rotate: isPlaying ? 360 : 0,
                scale: isPlaying ? 1.05 : 1
              }}
              transition={{ 
                rotate: { duration: 10, repeat: isPlaying ? Infinity : 0, ease: "linear" },
                scale: { duration: 0.3 }
              }}
              className="relative"
            >
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-14 h-14 rounded-xl object-cover shadow-lg"
              />
              {isPlaying && (
                <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse" />
              )}
            </motion.div>
            
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white truncate">{track.title}</h4>
              <p className="text-gray-300 text-sm truncate">{track.artist}</p>
              {track.album && (
                <p className="text-gray-400 text-xs truncate">{track.album}</p>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
          </motion.div>

          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-full transition-colors ${
                  isShuffle ? 'text-green-400 bg-green-400/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPrevious}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full transition-colors ${
                  isRepeat ? 'text-green-400 bg-green-400/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </motion.button>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full">
              <span className="text-xs text-gray-400 min-w-[35px]">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-100"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400 min-w-[35px]">
                {track.preview_url ? formatTime(duration) : track.duration}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center space-x-2 flex-1 justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </motion.button>
            
            <div className="w-24 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  style={{ width: `${isMuted ? 0 : volume}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 6px rgba(168, 85, 247, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 6px rgba(168, 85, 247, 0.3);
        }
      `}</style>
    </div>
  );
}
