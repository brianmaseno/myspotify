"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface YouTubeAudioPlayerProps {
  videoId: string;
  isPlaying: boolean;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onError?: (error: any) => void;
  volume?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onSeekTo?: (time: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    youtubeAPICallbacks: (() => void)[];
    youtubePlayerInstance: any;
    youtubePlayerSeekTo: (time: number) => void;
    youtubePlayerDirectPlay: () => Promise<void>;
  }
}

export default function YouTubeAudioPlayer({
  videoId,
  isPlaying,
  onReady,
  onStateChange,
  onError,
  volume = 75, // Default to 75% volume
  onTimeUpdate,
  onSeekTo
}: YouTubeAudioPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [apiReady, setApiReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentVideoIdRef = useRef<string>('');
  const isInitializingRef = useRef(false);

  // Stable API ready handler
  const handleAPIReady = useCallback(() => {
    console.log('🎵 YouTube API is ready');
    setApiReady(true);
  }, []);

  // Load YouTube API once
  useEffect(() => {
    // Check if API is already available
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      // Script exists, wait for it to load
      const checkAPI = () => {
        if (window.YT && window.YT.Player) {
          setApiReady(true);
        } else {
          setTimeout(checkAPI, 100);
        }
      };
      checkAPI();
      return;
    }

    console.log('🎵 Loading YouTube API...');
    
    // Create script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    
    // Set up global callback
    window.onYouTubeIframeAPIReady = handleAPIReady;
    
    document.head.appendChild(script);
  }, [handleAPIReady]);

  // Create and manage single player instance
  useEffect(() => {
    if (!apiReady || !containerRef.current || isInitializingRef.current) {
      return;
    }

    // Reuse existing player for same video
    if (playerRef.current && currentVideoIdRef.current === videoId) {
      console.log('🎵 Reusing existing player for video:', videoId);
      return;
    }

    console.log('🎵 Initializing player for video:', videoId);
    isInitializingRef.current = true;

    // Clean up existing player if video changed
    if (playerRef.current && currentVideoIdRef.current !== videoId) {
      console.log('🎵 Cleaning up previous player');
      try {
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = null;
        }
        playerRef.current.destroy();
      } catch (e) {
        console.warn('🎵 Error destroying previous player:', e);
      }
      playerRef.current = null;
      setPlayerReady(false);
    }

    const createPlayer = () => {
      try {
        const playerId = `yt-player-${Date.now()}`;
        containerRef.current!.innerHTML = `<div id="${playerId}"></div>`;

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
            mute: 0
          },
          events: {
            onReady: (event: any) => {
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
                setPlayerReady(true);
                isInitializingRef.current = false;
                onReady?.();
                
                // Get initial duration
                setTimeout(() => {
                  try {
                    const duration = event.target.getDuration();
                    if (duration > 0) {
                      onTimeUpdate?.(0, duration);
                    }
                  } catch (e) {
                    console.warn('🎵 Could not get initial duration');
                  }
                }, 1000);
                
              } catch (error) {
                console.error('🎵 Error in onReady:', error);
                isInitializingRef.current = false;
                onError?.(error);
              }
            },
            
            onStateChange: (event: any) => {
              const states = { '-1': 'unstarted', '0': 'ended', '1': 'playing', '2': 'paused', '3': 'buffering', '5': 'cued' };
              console.log(`🎵 State: ${states[event.data as keyof typeof states]} (${event.data})`);
              
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
                      if (typeof currentTime === 'number' && typeof duration === 'number') {
                        onTimeUpdate(currentTime, duration);
                      }
                    } catch (e) {
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
              
              onStateChange?.(event.data);
            },
            
            onError: (event: any) => {
              console.error('🎵 ❌ Player error:', event.data);
              isInitializingRef.current = false;
              setPlayerReady(false);
              onError?.(event.data);
            }
          }
        });
        
      } catch (error) {
        console.error('🎵 ❌ Failed to create player:', error);
        isInitializingRef.current = false;
        onError?.(error);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(createPlayer, 100);

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, [apiReady, videoId, volume, onReady, onStateChange, onError, onTimeUpdate]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current || !playerReady) {
      return;
    }

    try {
      if (isPlaying) {
        console.log('🎵 ▶️ Playing');
        const playPromise = playerRef.current.playVideo();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((error: any) => {
            console.log('🎵 Autoplay prevented - requires user interaction');
          });
        }
      } else {
        console.log('🎵 ⏸️ Pausing');
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error('🎵 ❌ Playback control error:', error);
    }
  }, [isPlaying, playerReady]);

  // Handle volume changes
  useEffect(() => {
    if (!playerRef.current || !playerReady) {
      return;
    }

    try {
      const targetVolume = Math.max(1, Math.min(100, volume));
      playerRef.current.setVolume(targetVolume);
      
      if (targetVolume > 0) {
        playerRef.current.unMute();
      }
      
      console.log('🎵 🔊 Volume set to:', targetVolume);
    } catch (error) {
      console.warn('🎵 Volume control error:', error);
    }
  }, [volume, playerReady]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '-1000px', 
      left: '-1000px',
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none'
    }}>
      <div ref={containerRef} />
    </div>
  );
}
