"use client";

import { useEffect, useRef, useState } from 'react';

interface YouTubeAudioPlayerProps {
  videoId: string;
  isPlaying: boolean;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onError?: (error: unknown) => void;
  volume?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onSeekTo?: () => void;
}

export default function YouTubeAudioPlayer({
  videoId,
  isPlaying,
  onReady,
  onStateChange,
  onError,
  volume = 50,
  onTimeUpdate,
}: YouTubeAudioPlayerProps) {
  const [apiReady, setApiReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayer | null>(null);
  const isInitializingRef = useRef(false);
  const currentVideoIdRef = useRef<string>('');
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize YouTube API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        console.log('🎵 YouTube API already loaded');
        setApiReady(true);
        return;
      }

      // Check if script already exists
      if (document.getElementById('youtube-api-script')) {
        console.log('🎵 YouTube API script already exists, waiting...');
        return;
      }

      console.log('🎵 Loading YouTube API...');
      
      // Create the script tag
      const script = document.createElement('script');
      script.id = 'youtube-api-script';
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      
      // Set up the callback
      (window as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady = () => {
        console.log('🎵 ✅ YouTube API loaded successfully');
        setApiReady(true);
      };
      
      document.body.appendChild(script);
    };

    initializeYouTubeAPI();
    
    return () => {
      // Cleanup interval on unmount
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  // Create and manage YouTube player
  useEffect(() => {
    if (!apiReady || !containerRef.current || isInitializingRef.current) {
      return;
    }

    // Reuse existing player for same video
    if (playerRef.current && currentVideoIdRef.current === videoId) {
      console.log('🎵 Reusing existing player for same video');
      return;
    }

    // Clean up previous player
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      console.log('🎵 Destroying previous player');
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('🎵 Error destroying player:', error);
      }
      playerRef.current = null;
    }

    // Clear any existing interval
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }

    const createPlayer = () => {
      if (!containerRef.current || isInitializingRef.current) return;
      
      isInitializingRef.current = true;
      console.log('🎵 Creating YouTube player for video:', videoId);

      const playerId = `youtube-player-${Date.now()}`;
      const playerDiv = document.createElement('div');
      playerDiv.id = playerId;
      playerDiv.style.position = 'absolute';
      playerDiv.style.top = '-9999px';
      playerDiv.style.left = '-9999px';
      playerDiv.style.width = '1px';
      playerDiv.style.height = '1px';
      
      containerRef.current.appendChild(playerDiv);

      try {
        console.log('🎵 Creating YouTube player...');
        
        playerRef.current = new window.YT.Player(playerId, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            origin: window.location.origin,
            widget_referrer: window.location.href,
            mute: 0,
            start: 0,
            end: 0,
            loop: 0,
            playlist: videoId // This helps with audio reliability
          },
          events: {
            onReady: (event: { target: YoutubePlayer }) => {
              console.log('🎵 ✅ Player ready');
              
              try {
                // Set volume and unmute
                event.target.setVolume(volume);
                event.target.unMute();
                
                // Store global reference
                window.youtubePlayerInstance = event.target;
                
                // Setup global functions
                window.youtubePlayerSeekTo = (time: number) => {
                  if (event.target && typeof event.target.seekTo === 'function') {
                    event.target.seekTo(time, true);
                  }
                };
                
                window.youtubePlayerDirectPlay = async () => {
                  if (event.target && typeof event.target.playVideo === 'function') {
                    return event.target.playVideo();
                  }
                  throw new Error('Player not available');
                };
                
                currentVideoIdRef.current = videoId;
                isInitializingRef.current = false;
                onReady?.();
                
                // Get initial duration with retry logic
                const getDurationWithRetry = (attempts = 0) => {
                  if (attempts >= 5) return; // Max 5 attempts
                  
                  try {
                    const duration = event.target.getDuration();
                    if (duration > 0) {
                      onTimeUpdate?.(0, duration);
                    } else if (attempts < 4) {
                      // Retry after a longer delay if duration is not ready
                      setTimeout(() => getDurationWithRetry(attempts + 1), 2000);
                    }
                  } catch {
                    console.warn('🎵 Could not get duration, retrying...');
                    if (attempts < 4) {
                      setTimeout(() => getDurationWithRetry(attempts + 1), 2000);
                    }
                  }
                };
                
                setTimeout(() => getDurationWithRetry(), 1000);
                
              } catch (error) {
                console.error('🎵 Error in onReady:', error);
                isInitializingRef.current = false;
                onError?.(error);
              }
            },
            
            onStateChange: (event: { data: number; target: YoutubePlayer }) => {
              const states: Record<string, string> = { 
                '-1': 'unstarted', 
                '0': 'ended', 
                '1': 'playing', 
                '2': 'paused', 
                '3': 'buffering', 
                '5': 'cued' 
              };
              console.log(`🎵 State: ${states[event.data.toString()]} (${event.data})`);
              
              // Handle time updates for playing state
              if (event.data === 1) { // playing
                if (timeUpdateIntervalRef.current) {
                  clearInterval(timeUpdateIntervalRef.current);
                }
                
                timeUpdateIntervalRef.current = setInterval(() => {
                  if (event.target && onTimeUpdate) {
                    try {
                      const currentTime = event.target.getCurrentTime();
                      const duration = event.target.getDuration();
                      if (typeof currentTime === 'number' && typeof duration === 'number' && duration > 0) {
                        onTimeUpdate(currentTime, duration);
                      }
                    } catch {
                      // Ignore time update errors
                    }
                  }
                }, 500);
              } else {
                // Clear interval for non-playing states
                if (timeUpdateIntervalRef.current) {
                  clearInterval(timeUpdateIntervalRef.current);
                  timeUpdateIntervalRef.current = null;
                }
              }
              
              // Handle ended state - provide final time update
              if (event.data === 0 && onTimeUpdate) { // ended
                try {
                  const duration = event.target.getDuration();
                  if (typeof duration === 'number' && duration > 0) {
                    onTimeUpdate(duration, duration);
                  }
                } catch {
                  // Ignore errors
                }
              }
              
              onStateChange?.(event.data);
            },
            
            onError: (event: { data: number }) => {
              console.error('🎵 ❌ Player error:', event.data);
              isInitializingRef.current = false;
              onError?.(event.data);
            }
          }
        }) as YoutubePlayer;

      } catch (error) {
        console.error('🎵 Failed to create player:', error);
        isInitializingRef.current = false;
        onError?.(error);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(createPlayer, 100);
    
  }, [apiReady, videoId, volume, onReady, onStateChange, onError, onTimeUpdate]);

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(volume);
        console.log('🎵 Volume set to:', volume);
      } catch (error) {
        console.warn('🎵 Failed to set volume:', error);
      }
    }
  }, [volume]);

  // Handle play state changes
  useEffect(() => {
    if (!playerRef.current) return;

    const handlePlayState = async () => {
      try {
        if (isPlaying) {
          console.log('🎵 Attempting to play...');
          if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
            playerRef.current.playVideo();
          } else {
            console.warn('🎵 playVideo function not available on player');
            // Try to force reload player if function is missing
            setTimeout(() => {
              if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                playerRef.current.playVideo();
              }
            }, 1000);
          }
        } else {
          console.log('🎵 Pausing...');
          if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
            playerRef.current.pauseVideo();
          }
        }
      } catch (error) {
        console.log('🎵 Play/pause error (may be expected):', error);
        onError?.(error);
      }
    };

    handlePlayState();
  }, [isPlaying, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🎵 Cleaning up YouTube player...');
      
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
      
      if (playerRef.current) {
        try {
          // Stop playback before destroying
          if (typeof playerRef.current.pauseVideo === 'function') {
            playerRef.current.pauseVideo();
          }
          
          // Clean up global references
          if (window.youtubePlayerInstance === playerRef.current) {
            window.youtubePlayerInstance = null;
            window.youtubePlayerSeekTo = undefined;
            window.youtubePlayerDirectPlay = undefined;
          }
          
          // Destroy the player
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
        } catch (error) {
          console.warn('🎵 Error during cleanup:', error);
        } finally {
          playerRef.current = null;
        }
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        visibility: 'hidden'
      }}
      aria-hidden="true"
    />
  );
}
