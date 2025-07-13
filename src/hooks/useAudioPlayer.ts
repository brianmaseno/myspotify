"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  source: 'youtube' | 'spotify';
  audioUrl?: string;
  videoUrl?: string;
  preview_url?: string;
  album?: string;
  genre?: string;
  youtubeId?: string;
  spotifyId?: string;
}

interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  volume: number;
  isMuted: boolean;
  isRepeat: boolean;
  isShuffle: boolean;
  recentlyPlayed: Track[];
  likedSongs: string[]; // Track IDs
  currentGenre: string | null;
  isAIDJ: boolean;
  playbackContext: 'history' | 'liked' | 'search' | 'trending' | 'general' | null;
  contextQueue: Track[]; // Context-specific queue
  
  // Actions
  setCurrentTrack: (track: Track) => void;
  setIsPlaying: (playing: boolean) => void;
  playTrack: (track: Track, context?: string) => void;
  playNext: () => Promise<void>;
  playPrevious: () => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[], context?: string) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  clearQueue: () => void;
  addToRecentlyPlayed: (track: Track) => void;
  toggleLike: (trackId: string) => void;
  setCurrentGenre: (genre: string | null) => void;
  setAIDJ: (isAIDJ: boolean) => void;
  getSmartNextTrack: () => Track | null;
  setPlaybackContext: (context: string, tracks: Track[]) => void;
}

export const useAudioPlayer = create<AudioPlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      currentIndex: 0,
      volume: 75,
      isMuted: false,
      isRepeat: false,
      isShuffle: false,
      recentlyPlayed: [],
      likedSongs: [],
      currentGenre: null,
      isAIDJ: false,
      playbackContext: null,
      contextQueue: [],

      setCurrentTrack: (track) => set({ currentTrack: track }),
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      playTrack: (track, context) => {
        const { queue, addToRecentlyPlayed, contextQueue, playbackContext } = get();
        
        // Add to recently played
        addToRecentlyPlayed(track);
        
        // Determine which queue to use based on context
        let activeQueue = queue;
        if (context && playbackContext === context && contextQueue.length > 0) {
          activeQueue = contextQueue;
        }
        
        const trackIndex = activeQueue.findIndex(t => t.id === track.id);
        
        if (trackIndex >= 0) {
          set({ 
            currentTrack: track, 
            currentIndex: trackIndex,
            isPlaying: true,
            queue: activeQueue
          });
        } else {
          // Add to queue if not present
          const newQueue = [...activeQueue, track];
          set({ 
            queue: newQueue, 
            currentTrack: track, 
            currentIndex: newQueue.length - 1,
            isPlaying: true
          });
        }
      },

      playNext: async () => {
        const { queue, currentIndex, isShuffle, playbackContext, contextQueue, isRepeat, currentTrack } = get();
        
        // Handle repeat single track
        if (isRepeat && currentTrack) {
          set({ isPlaying: true });
          return;
        }
        
        // Use context queue if available
        let activeQueue = queue;
        if (playbackContext && contextQueue.length > 0) {
          activeQueue = contextQueue;
        }
        
        if (activeQueue.length === 0) return;
        
        // Check if we have more tracks in the queue
        const hasNextInQueue = currentIndex < activeQueue.length - 1;
        
        if (hasNextInQueue) {
          // Play next track in queue
          let nextIndex;
          if (isShuffle) {
            nextIndex = Math.floor(Math.random() * activeQueue.length);
          } else {
            nextIndex = currentIndex + 1;
          }
          
          const nextTrack = activeQueue[nextIndex];
          if (nextTrack) {
            set({
              currentTrack: nextTrack,
              currentIndex: nextIndex,
              isPlaying: true,
              queue: activeQueue
            });
            get().addToRecentlyPlayed(nextTrack);
          }
        } else if (currentTrack && (playbackContext === 'search' || playbackContext === 'trending' || playbackContext === 'general')) {
          // Auto-find related songs when queue is exhausted (except for history/liked contexts)
          try {
            // Search for related songs by the same artist
            const artistQuery = `${currentTrack.artist} popular songs`;
            const response = await fetch(`/api/search/youtube?q=${encodeURIComponent(artistQuery)}&maxResults=5`);
            
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                // Filter out the current track and add to queue
                const relatedTracks = data.results
                  .filter((track: any) => track.id !== currentTrack.id)
                  .map((track: any) => ({
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    thumbnail: track.thumbnail,
                    duration: track.duration,
                    source: 'youtube' as const,
                    audioUrl: track.audioUrl,
                    videoUrl: track.videoUrl,
                    youtubeId: track.youtubeId,
                  }));
                
                if (relatedTracks.length > 0) {
                  // Add related tracks to queue and play the first one
                  const updatedQueue = [...activeQueue, ...relatedTracks];
                  const nextTrack = relatedTracks[0];
                  
                  set({ 
                    queue: updatedQueue,
                    currentTrack: nextTrack,
                    currentIndex: updatedQueue.length - relatedTracks.length,
                    isPlaying: true
                  });
                  
                  get().addToRecentlyPlayed(nextTrack);
                  return;
                }
              }
            }
            
            // If artist search fails, try genre-based search
            const genreQuery = `${currentTrack.artist} similar artists songs`;
            const genreResponse = await fetch(`/api/search/youtube?q=${encodeURIComponent(genreQuery)}&maxResults=3`);
            
            if (genreResponse.ok) {
              const genreData = await genreResponse.json();
              if (genreData.results && genreData.results.length > 0) {
                const similarTracks = genreData.results
                  .filter((track: any) => track.id !== currentTrack.id)
                  .map((track: any) => ({
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    thumbnail: track.thumbnail,
                    duration: track.duration,
                    source: 'youtube' as const,
                    audioUrl: track.audioUrl,
                    videoUrl: track.videoUrl,
                    youtubeId: track.youtubeId,
                  }));
                
                if (similarTracks.length > 0) {
                  const updatedQueue = [...activeQueue, ...similarTracks];
                  const nextTrack = similarTracks[0];
                  
                  set({ 
                    queue: updatedQueue,
                    currentTrack: nextTrack,
                    currentIndex: updatedQueue.length - similarTracks.length,
                    isPlaying: true
                  });
                  
                  get().addToRecentlyPlayed(nextTrack);
                  return;
                }
              }
            }
          } catch (error) {
            console.error('Error finding related tracks:', error);
          }
          
          // If auto-search fails, loop back to start of queue
          if (activeQueue.length > 0) {
            const firstTrack = activeQueue[0];
            set({
              currentTrack: firstTrack,
              currentIndex: 0,
              isPlaying: true,
              queue: activeQueue
            });
            get().addToRecentlyPlayed(firstTrack);
          }
        } else {
          // For history/liked contexts, just loop back to start
          if (activeQueue.length > 0) {
            const nextIndex = isShuffle ? Math.floor(Math.random() * activeQueue.length) : 0;
            const nextTrack = activeQueue[nextIndex];
            
            set({
              currentTrack: nextTrack,
              currentIndex: nextIndex,
              isPlaying: true,
              queue: activeQueue
            });
            get().addToRecentlyPlayed(nextTrack);
          }
        }
      },
      
      playPrevious: () => {
        const { queue, currentIndex, contextQueue, playbackContext } = get();
        
        // Use context queue if available
        let activeQueue = queue;
        if (playbackContext && contextQueue.length > 0) {
          activeQueue = contextQueue;
        }
        
        if (activeQueue.length === 0) return;
        
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : activeQueue.length - 1;
        const prevTrack = activeQueue[prevIndex];
        
        if (prevTrack) {
          set({
            currentTrack: prevTrack,
            currentIndex: prevIndex,
            isPlaying: true,
            queue: activeQueue
          });
          get().addToRecentlyPlayed(prevTrack);
        }
      },
      
      addToQueue: (track) => {
        const { queue } = get();
        if (!queue.find(t => t.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      },
      
      setQueue: (tracks, context) => {
        if (context) {
          set({ 
            contextQueue: tracks, 
            playbackContext: context as any,
            queue: tracks,
            currentIndex: 0 
          });
        } else {
          set({ queue: tracks, currentIndex: 0 });
        }
      },
      
      setVolume: (volume) => set({ volume }),
      
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
      
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      
      clearQueue: () => set({ queue: [], currentIndex: 0 }),

      addToRecentlyPlayed: (track) => {
        set((state) => {
          const filtered = state.recentlyPlayed.filter(t => t.id !== track.id);
          return {
            recentlyPlayed: [track, ...filtered].slice(0, 50) // Keep last 50 tracks
          };
        });
      },

      toggleLike: (trackId) => {
        set((state) => {
          const isLiked = state.likedSongs.includes(trackId);
          return {
            likedSongs: isLiked 
              ? state.likedSongs.filter(id => id !== trackId)
              : [...state.likedSongs, trackId]
          };
        });
      },

      setCurrentGenre: (genre) => set({ currentGenre: genre }),

      setAIDJ: (isAIDJ) => set({ isAIDJ }),

      getSmartNextTrack: () => {
        const { currentTrack, queue, currentGenre, playbackContext, contextQueue } = get();
        
        if (!currentTrack) return null;
        
        // Use context queue if available
        let activeQueue = queue;
        if (playbackContext && contextQueue.length > 0) {
          activeQueue = contextQueue;
        }
        
        // If in history context, find next track from history
        if (playbackContext === 'history') {
          const currentIndex = activeQueue.findIndex(t => t.id === currentTrack.id);
          if (currentIndex >= 0 && currentIndex < activeQueue.length - 1) {
            return activeQueue[currentIndex + 1];
          }
        }
        
        // If in liked context, find next liked song
        if (playbackContext === 'liked') {
          const currentIndex = activeQueue.findIndex(t => t.id === currentTrack.id);
          if (currentIndex >= 0 && currentIndex < activeQueue.length - 1) {
            return activeQueue[currentIndex + 1];
          }
        }
        
        // For other contexts, try to find similar tracks
        // If we have a current genre preference, try to find a track from the same genre
        if (currentGenre) {
          const genreTracks = activeQueue.filter(track => 
            track.genre === currentGenre && track.id !== currentTrack.id
          );
          if (genreTracks.length > 0) {
            return genreTracks[Math.floor(Math.random() * genreTracks.length)];
          }
        }
        
        // Try to find tracks by the same artist
        const sameArtistTracks = activeQueue.filter(track => 
          track.artist === currentTrack.artist && track.id !== currentTrack.id
        );
        if (sameArtistTracks.length > 0) {
          return sameArtistTracks[Math.floor(Math.random() * sameArtistTracks.length)];
        }
        
        return null;
      },

      setPlaybackContext: (context, tracks) => {
        set({
          playbackContext: context as any,
          contextQueue: tracks,
          queue: tracks,
          currentIndex: 0
        });
      }
    }),
    {
      name: 'audio-player-storage',
      partialize: (state) => ({
        currentTrack: state.currentTrack, // Persist current track
        currentIndex: state.currentIndex, // Persist current index
        queue: state.queue, // Persist queue
        contextQueue: state.contextQueue, // Persist context queue
        playbackContext: state.playbackContext, // Persist playback context
        volume: state.volume,
        isMuted: state.isMuted,
        isRepeat: state.isRepeat,
        isShuffle: state.isShuffle,
        recentlyPlayed: state.recentlyPlayed,
        likedSongs: state.likedSongs,
        isPlaying: false, // Don't auto-resume playback on page load
      }),
    }
  )
);
