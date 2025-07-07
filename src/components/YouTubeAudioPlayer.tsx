"use client";

import { useEffect, useRef, useState } from 'react';

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
  }
}

export default function YouTubeAudioPlayer({
  videoId,
  isPlaying,
  onReady,
  onStateChange,
  onError,
  volume = 50,
  onTimeUpdate,
  onSeekTo
}: YouTubeAudioPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [apiReady, setApiReady] = useState(false);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Expose seekTo function to parent component
  useEffect(() => {
    if (onSeekTo) {
      // This will be called from parent component
      const handleSeek = (time: number) => {
        if (playerRef.current && playerRef.current.seekTo) {
          try {
            playerRef.current.seekTo(time, true);
          } catch (error) {
            console.error('Error seeking in YouTube player:', error);
          }
        }
      };
      
      // Store the seek function globally so parent can access it
      (window as any).youtubePlayerSeekTo = handleSeek;
    }
  }, [onSeekTo, playerRef.current]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Load the YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up the callback for when the API is ready
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    return () => {
      // Cleanup
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!apiReady || !containerRef.current || !videoId) return;

    // Destroy existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying previous player:', error);
      }
    }

    // Add a small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            start: 0,
            mute: 0,
            origin: window.location.origin,
            widget_referrer: window.location.origin,
            // Force audio-only experience
            cc_load_policy: 0,
            color: 'red',
            loop: 0,
            playlist: videoId
          },
          events: {
            onReady: (event: any) => {
              console.log('YouTube player ready for video:', videoId);
              
              // Set volume immediately
              event.target.setVolume(volume);
              
              // Force load the video to get duration
              event.target.cueVideoById(videoId);
              
              // Try multiple approaches to get duration
              const tryGetDuration = () => {
                try {
                  const duration = event.target.getDuration();
                  console.log('Attempting to get duration:', duration);
                  
                  if (duration && duration > 0) {
                    console.log('✅ Duration found:', duration);
                    onTimeUpdate?.(0, duration);
                  } else {
                    console.log('❌ Duration not available yet, retrying...');
                    // Retry in 500ms
                    setTimeout(tryGetDuration, 500);
                  }
                } catch (error) {
                  console.warn('Error getting initial duration:', error);
                  setTimeout(tryGetDuration, 1000);
                }
              };
              
              // Start trying to get duration
              setTimeout(tryGetDuration, 500);
              
              onReady?.();
            },
            onStateChange: (event: any) => {
              console.log('YouTube player state change:', event.data, 'for video:', videoId);
              onStateChange?.(event.data);
              
              // Handle different states
              switch (event.data) {
                case -1: // unstarted
                  // Try to get duration when video is cued
                  setTimeout(() => {
                    try {
                      const duration = event.target.getDuration();
                      if (duration && duration > 0) {
                        onTimeUpdate?.(0, duration);
                      }
                    } catch (error) {
                      console.warn('Error getting duration on cue:', error);
                    }
                  }, 500);
                  break;
                case 1: // playing
                  // Start time updates when playing
                  if (timeUpdateIntervalRef.current) {
                    clearInterval(timeUpdateIntervalRef.current);
                  }
                  timeUpdateIntervalRef.current = setInterval(() => {
                    if (playerRef.current && onTimeUpdate) {
                      try {
                        const currentTime = playerRef.current.getCurrentTime();
                        const duration = playerRef.current.getDuration();
                        if (currentTime !== undefined && duration !== undefined && duration > 0) {
                          onTimeUpdate(currentTime, duration);
                        }
                      } catch (error) {
                        console.warn('Error getting player time:', error);
                      }
                    }
                  }, 1000);
                  break;
                case 0: // ended
                case 2: // paused
                  // Stop time updates when not playing
                  if (timeUpdateIntervalRef.current) {
                    clearInterval(timeUpdateIntervalRef.current);
                    timeUpdateIntervalRef.current = null;
                  }
                  break;
                case 5: // video cued
                  // Video is cued and ready, try to get duration
                  setTimeout(() => {
                    try {
                      const duration = event.target.getDuration();
                      if (duration && duration > 0) {
                        onTimeUpdate?.(0, duration);
                      }
                    } catch (error) {
                      console.warn('Error getting duration when cued:', error);
                    }
                  }, 100);
                  break;
              }
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data, 'for video:', videoId);
              onError?.(event.data);
            }
          }
        });
      } catch (error) {
        console.error('Error creating YouTube player:', error);
        onError?.(error);
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, [apiReady, videoId, volume, onReady, onStateChange, onError, onTimeUpdate]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error('Error controlling YouTube player:', error);
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Expose player controls
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo = (time: number) => {
        if (playerRef.current && playerRef.current.seekTo) {
          playerRef.current.seekTo(time, true);
        }
      };
    }
  }, [playerRef.current]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '-9999px', 
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      visibility: 'hidden'
    }}>
      <div ref={containerRef} style={{
        width: '1px',
        height: '1px',
        opacity: 0
      }} />
    </div>
  );
}
