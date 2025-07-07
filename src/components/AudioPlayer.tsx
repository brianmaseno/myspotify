"use client";

import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, Shuffle, Heart } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useSession } from "next-auth/react";
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
    toggleLike
  } = useAudioPlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [youtubeCurrentTime, setYoutubeCurrentTime] = useState(0);
  const [youtubeDuration, setYoutubeDuration] = useState(0);
  const { data: session } = useSession();

  // Update liked status when track changes
  useEffect(() => {
    if (currentTrack) {
      setIsLiked(likedSongs.includes(currentTrack.id));
    }
  }, [currentTrack, likedSongs]);

  // Save play history when track changes
  useEffect(() => {
    if (currentTrack && session && currentTrack.id) {
      // Only save once when track first starts playing
      const saveHistory = async () => {
        try {
          await fetch('/api/user/history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              track: {
                id: currentTrack.id || currentTrack.youtubeId,
                title: currentTrack.title,
                artist: currentTrack.artist,
                duration: currentTrack.duration || '0:00',
                source: currentTrack.source || 'youtube',
                thumbnail: currentTrack.thumbnail,
                youtubeId: currentTrack.youtubeId || currentTrack.id
              },
              playDuration: 0,
              completed: false
            }),
          });
        } catch (error) {
          console.error('Error saving play history:', error);
        }
      };

      // Only save if we have a valid track ID
      if (currentTrack.id || currentTrack.youtubeId) {
        saveHistory();
      } else {
        console.warn('Track missing ID, not saving to history:', currentTrack);
      }
    }
  }, [currentTrack?.id, session]); // Only trigger when track ID changes

  // Reset player state when track changes
  useEffect(() => {
    if (currentTrack) {
      setCurrentTime(0);
      setDuration(0);
      setYoutubeCurrentTime(0);
      setYoutubeDuration(0);
      setPlayerReady(false);
      setPlayerError(false);
    }
  }, [currentTrack?.id]);

  // Save play history to database - remove this function since we moved it above
  // const savePlayHistory = async (track: any) => {
  //   if (!session || !track?.id) return;
  //   ...
  // };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerReady || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    // Update local state immediately for responsiveness
    setCurrentTime(newTime);
    
    // Call YouTube player's seekTo function
    if ((window as any).youtubePlayerSeekTo) {
      (window as any).youtubePlayerSeekTo(newTime);
    }
  };

  const handlePlayPause = () => {
    if (playerReady && !playerError) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = () => {
    if (currentTrack && (currentTrack.id || currentTrack.youtubeId)) {
      const trackId = currentTrack.id || currentTrack.youtubeId;
      if (trackId) {
        toggleLike(trackId);
        setIsLiked(!isLiked);
        
        // Save to database
        if (session) {
          fetch('/api/user/liked-songs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              track: {
                id: trackId,
                title: currentTrack.title,
                artist: currentTrack.artist,
                duration: currentTrack.duration || '0:00',
                source: currentTrack.source || 'youtube',
                thumbnail: currentTrack.thumbnail,
                youtubeId: currentTrack.youtubeId || currentTrack.id
              },
              liked: !isLiked
            }),
          }).catch(error => {
            console.error('Error saving liked song:', error);
          });
        }
      }
    } else {
      console.warn('Cannot like track - missing ID:', currentTrack);
    }
  };

  const handleYouTubeReady = () => {
    console.log('YouTube player ready');
    setPlayerReady(true);
    setPlayerError(false);
  };

  const handleYouTubeStateChange = (state: number) => {
    console.log('YouTube state change:', state);
    // YouTube Player States:
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
        if (!isRepeat) {
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

  const handleYouTubeError = (error: any) => {
    console.error('YouTube player error:', error);
    setPlayerError(true);
    setPlayerReady(false);
    setIsPlaying(false);
  };

  const handleYouTubeTimeUpdate = (currentTime: number, duration: number) => {
    setCurrentTime(currentTime);
    setDuration(duration);
    setYoutubeCurrentTime(currentTime);
    setYoutubeDuration(duration);
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 p-4 z-50"
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {currentTrack.thumbnail && (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
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

        {/* Controls */}
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
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={!playerReady || playerError}
              className="bg-white text-black p-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
            >
              {!playerReady ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
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
          <div className="flex items-center space-x-3 w-full max-w-md">
            <span className="text-xs text-gray-400">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 bg-gray-600 rounded-full h-1 cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="bg-white h-1 rounded-full transition-all duration-300 relative group-hover:bg-green-500"
                style={{
                  width: `${Math.max(0, Math.min(100, progress))}%`,
                }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="w-24 bg-gray-600 rounded-full h-1 cursor-pointer group">
            <div
              className="bg-white h-1 rounded-full group-hover:bg-green-500 transition-colors"
              style={{ width: `${isMuted ? 0 : volume}%` }}
            />
          </div>
        </div>
      </div>

      {/* YouTube Audio Player - Hidden */}
      {currentTrack && (currentTrack.youtubeId || currentTrack.id) && (
        <YouTubeAudioPlayer
          videoId={currentTrack.youtubeId || currentTrack.id}
          isPlaying={isPlaying}
          onReady={handleYouTubeReady}
          onStateChange={handleYouTubeStateChange}
          onError={handleYouTubeError}
          volume={isMuted ? 0 : volume}
          onTimeUpdate={handleYouTubeTimeUpdate}
          onSeekTo={() => {}} // Enable seeking functionality
        />
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-white/40 mt-2">
          Ready: {playerReady.toString()} | Error: {playerError.toString()} | 
          Time: {currentTime.toFixed(1)}/{duration.toFixed(1)} | 
          Progress: {progress.toFixed(1)}% | VideoId: {currentTrack?.youtubeId || currentTrack?.id} |
          Track: {currentTrack?.title} | YT Time: {youtubeCurrentTime.toFixed(1)}/{youtubeDuration.toFixed(1)}
        </div>
      )}
    </motion.div>
  );
}