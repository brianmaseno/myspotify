"use client";

import { useState, useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import YouTubeAudioPlayer from './YouTubeAudioPlayer';

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrevious,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isRepeat,
    toggleRepeat,
    isShuffle,
    toggleShuffle,
    likedSongs,
    toggleLike,
  } = useAudioPlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [historyLogged, setHistoryLogged] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLiked = currentTrack ? likedSongs.includes(currentTrack.id) : false;

  useEffect(() => {
    const handleClick = () => {
      setUserHasInteracted(true);
      document.removeEventListener('click', handleClick);
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (currentTrack && !historyLogged) {
      setHistoryLogged(true);
    }
  }, [currentTrack, historyLogged]);

  const handlePlayPause = () => {
    if (!userHasInteracted) {
      setUserHasInteracted(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    if (currentTrack) {
      toggleLike(currentTrack.id);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerReady || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, percent * duration));
    
    // Call YouTube player's seek function
    if ((window as any).youtubePlayerSeekTo) {
      (window as any).youtubePlayerSeekTo(newTime);
    }
  };

  const handleYouTubeReady = () => {
    setPlayerReady(true);
    setPlayerError(false);
  };

  const handleYouTubeStateChange = (state: number) => {
    // YouTube player states:
    // -1 (unstarted)
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued)
    
    switch (state) {
      case 0: // ended
        setCurrentTime(0);
        setIsPlaying(false);
        if (isRepeat) {
          // Repeat current track
          setTimeout(() => {
            setIsPlaying(true);
            // Restart the track
            if ((window as any).youtubePlayerSeekTo) {
              (window as any).youtubePlayerSeekTo(0);
            }
          }, 500);
        } else {
          setTimeout(() => playNext(), 500);
        }
        break;
      case 1: // playing
        setIsPlaying(true);
        break;
      case 2: // paused
        setIsPlaying(false);
        break;
    }
  };

  const handleYouTubeError = (error: unknown) => {
    console.error('YouTube player error:', error);
    setPlayerError(true);
    setPlayerReady(false);
    setIsPlaying(false);
  };

  const handleYouTubeTimeUpdate = (currentTime: number, duration: number) => {
    setCurrentTime(currentTime);
    setDuration(duration);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-gray-800 p-4 z-50"
    >
      <YouTubeAudioPlayer
        videoId={currentTrack.youtubeId || currentTrack.id}
        isPlaying={isPlaying}
        volume={isMuted ? 0 : volume}
        onStateChange={handleYouTubeStateChange}
        onTimeUpdate={handleYouTubeTimeUpdate}
        onError={handleYouTubeError}
        onReady={() => setPlayerReady(true)}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-2">
            {/* Track Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {currentTrack.thumbnail && (
                <Image
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-medium truncate text-sm">
                  {currentTrack.title}
                </h3>
                <p className="text-gray-400 text-xs truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
            
            {/* Heart Button */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Progress Bar */}
          <div 
            className="w-full bg-gray-600 rounded-full h-1 mb-3 cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300 relative"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              
              <button
                onClick={playPrevious}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Center Play Button */}
            <button
              onClick={handlePlayPause}
              disabled={!playerReady || playerError}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 mx-4"
            >
              {!playerReady ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 text-black" />
              ) : (
                <Play className="w-6 h-6 text-black ml-0.5" />
              )}
            </button>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={playNext}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors ${
                  isRepeat ? 'text-green-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {currentTrack.thumbnail && (
              <Image
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                width={56}
                height={56}
                className="w-14 h-14 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium truncate">
                {currentTrack.title}
              </h3>
              <p className="text-gray-400 text-sm truncate">
                {currentTrack.artist}
              </p>
            </div>
            
            {/* Heart Button */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              
              <button
                onClick={playPrevious}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={handlePlayPause}
                disabled={!playerReady || playerError}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
              >
                {!playerReady ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 text-black" />
                ) : (
                  <Play className="w-6 h-6 text-black ml-0.5" />
                )}
              </button>
              
              <button
                onClick={playNext}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors ${
                  isRepeat ? 'text-green-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full max-w-md">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div 
                className="flex-1 bg-gray-600 rounded-full h-1 cursor-pointer group"
                onClick={handleSeek}
              >
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300 relative"
                  style={{
                    width: `${Math.max(0, Math.min(100, progress))}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <div className="w-24 group">
              <div 
                className="w-full bg-gray-600 rounded-full h-1 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  const newVolume = Math.max(0, Math.min(100, percent * 100));
                  setVolume(newVolume);
                }}>
                <div
                  className="bg-white h-1 rounded-full group-hover:bg-green-500 transition-colors"
                  style={{ width: `${isMuted ? 0 : volume}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-white/40 mt-2">
          Ready: {playerReady.toString()} | Error: {playerError.toString()} | 
          Playing: {isPlaying.toString()} | UserClicked: {userHasInteracted.toString()} |
          Time: {currentTime.toFixed(1)}/{duration.toFixed(1)} | 
          Progress: {progress.toFixed(1)}% | VideoId: {currentTrack?.youtubeId || currentTrack?.id} |
          Track: {currentTrack?.title} | History: {historyLogged.toString()}
        </div>
      )}
    </motion.div>
  );
}
