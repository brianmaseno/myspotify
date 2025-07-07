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
  
  // Actions
  setCurrentTrack: (track: Track) => void;
  setIsPlaying: (playing: boolean) => void;
  playTrack: (track: Track) => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
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

      setCurrentTrack: (track) => set({ currentTrack: track }),
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      playTrack: (track) => {
        const { queue, addToRecentlyPlayed } = get();
        const trackIndex = queue.findIndex(t => t.id === track.id);
        
        // Add to recently played
        addToRecentlyPlayed(track);
        
        if (trackIndex >= 0) {
          set({ 
            currentTrack: track, 
            currentIndex: trackIndex,
            isPlaying: true 
          });
        } else {
          // Add to queue if not present
          set({ 
            currentTrack: track,
            queue: [...queue, track],
            currentIndex: queue.length,
            isPlaying: true 
          });
        }
      },
      
      playNext: () => {
        const { queue, currentIndex, isShuffle, getSmartNextTrack } = get();
        if (queue.length === 0) return;
        
        // Try smart next track first
        const smartNext = getSmartNextTrack();
        if (smartNext) {
          get().playTrack(smartNext);
          return;
        }
        
        let nextIndex;
        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          nextIndex = (currentIndex + 1) % queue.length;
        }
        
        const nextTrack = queue[nextIndex];
        if (nextTrack) {
          set({
            currentTrack: nextTrack,
            currentIndex: nextIndex,
            isPlaying: true
          });
          get().addToRecentlyPlayed(nextTrack);
        }
      },
      
      playPrevious: () => {
        const { queue, currentIndex } = get();
        if (queue.length === 0) return;
        
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
        const prevTrack = queue[prevIndex];
        if (prevTrack) {
          set({
            currentTrack: prevTrack,
            currentIndex: prevIndex,
            isPlaying: true
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
      
      setQueue: (tracks) => set({ queue: tracks, currentIndex: 0 }),
      
      setVolume: (volume) => set({ volume }),
      
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
      
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      
      clearQueue: () => set({ 
        queue: [], 
        currentTrack: null, 
        currentIndex: 0, 
        isPlaying: false 
      }),

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
        const { currentTrack, queue, currentGenre } = get();
        
        if (!currentTrack) return null;
        
        // If we have a current genre preference, try to find a track from the same genre
        if (currentGenre) {
          const genreTracks = queue.filter(track => 
            track.genre === currentGenre && track.id !== currentTrack.id
          );
          if (genreTracks.length > 0) {
            return genreTracks[Math.floor(Math.random() * genreTracks.length)];
          }
        }
        
        // Try to find tracks by the same artist
        const sameArtistTracks = queue.filter(track => 
          track.artist === currentTrack.artist && track.id !== currentTrack.id
        );
        if (sameArtistTracks.length > 0) {
          return sameArtistTracks[Math.floor(Math.random() * sameArtistTracks.length)];
        }
        
        return null;
      }
    }),
    {
      name: 'audio-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        isRepeat: state.isRepeat,
        isShuffle: state.isShuffle,
        recentlyPlayed: state.recentlyPlayed,
        likedSongs: state.likedSongs,
      }),
    }
  )
);
