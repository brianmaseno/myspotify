"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import { motion } from "framer-motion";
import { Music, Heart, Clock, Plus, Play, MoreHorizontal, Headphones } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  thumbnail: string;
  preview_url?: string;
  audioUrl?: string;
  videoUrl?: string;
  source: 'spotify' | 'youtube';
  genre?: string;
  youtubeId?: string;
}

const musicGenres = [
  {
    id: 'christian',
    name: 'Christian',
    description: 'Inspirational and worship music',
    color: 'from-blue-600 to-purple-600',
    icon: '✝️',
    searchTerms: 'christian worship gospel hymns'
  },
  {
    id: 'hiphop',
    name: 'Hip Hop',
    description: 'Rap, beats, and urban culture',
    color: 'from-yellow-600 to-orange-600',
    icon: '🎤',
    searchTerms: 'hip hop rap beats urban'
  },
  {
    id: 'christian-hiphop',
    name: 'Christian Hip Hop',
    description: 'Faith-based rap and hip hop',
    color: 'from-purple-600 to-pink-600',
    icon: '🙏',
    searchTerms: 'christian hip hop rap gospel urban faith'
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Popular mainstream music',
    color: 'from-pink-600 to-red-600',
    icon: '⭐',
    searchTerms: 'pop music mainstream hits'
  },
  {
    id: 'rock',
    name: 'Rock',
    description: 'Rock and alternative music',
    color: 'from-gray-600 to-black',
    icon: '🎸',
    searchTerms: 'rock alternative indie metal'
  },
  {
    id: 'rnb',
    name: 'R&B',
    description: 'Rhythm and blues, soul music',
    color: 'from-indigo-600 to-blue-600',
    icon: '🎵',
    searchTerms: 'rnb rhythm blues soul'
  },
  {
    id: 'country',
    name: 'Country',
    description: 'Country and folk music',
    color: 'from-yellow-700 to-amber-600',
    icon: '🤠',
    searchTerms: 'country folk acoustic'
  },
  {
    id: 'electronic',
    name: 'Electronic',
    description: 'EDM, house, and electronic',
    color: 'from-cyan-600 to-blue-600',
    icon: '🎧',
    searchTerms: 'electronic edm house techno'
  }
];

const playlists = [
  {
    id: 1,
    name: "Liked Songs",
    description: "Your favorite tracks",
    tracks: 0,
    duration: "0h 0m",
    cover: null,
    icon: Heart,
    gradient: "from-purple-600 to-blue-600",
    isSpecial: true
  },
  {
    id: 2,
    name: "Recently Played",
    description: "Your recent listening history",
    tracks: 0,
    duration: "0h 0m",
    cover: null,
    icon: Clock,
    gradient: "from-green-600 to-teal-600",
    isSpecial: true
  }
];

export default function LibraryPage() {
  const { playTrack, setQueue, setCurrentGenre, recentlyPlayed, likedSongs } = useAudioPlayer();
  const [recentTracks, setRecentTracks] = useState<LibraryTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genreTracks, setGenreTracks] = useState<LibraryTrack[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    // Set recent tracks from the store, ensuring compatibility
    const convertedTracks: LibraryTrack[] = recentlyPlayed.slice(0, 10).map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album || 'Unknown Album',
      duration: track.duration || '0:00',
      thumbnail: track.thumbnail || '',
      source: track.source as 'spotify' | 'youtube',
      genre: track.genre,
      youtubeId: track.youtubeId
    }));
    setRecentTracks(convertedTracks);
  }, [recentlyPlayed]);

  const handleGenreClick = async (genre: {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    searchTerms: string;
  }) => {
    setIsLoading(true);
    setSelectedGenre(genre.id);
    setCurrentGenre(genre.id);
    
    try {
      const response = await fetch(`/api/music/genre?genre=${encodeURIComponent(genre.searchTerms)}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tracks) {
          setGenreTracks(data.tracks);
          setQueue(data.tracks);
          
          // Auto-play first track
          if (data.tracks.length > 0) {
            playTrack(data.tracks[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching genre tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackPlay = (track: LibraryTrack) => {
    playTrack(track);
  };

  // Update playlist stats
  const updatedPlaylists = playlists.map(playlist => {
    if (playlist.id === 1) { // Liked Songs
      return {
        ...playlist,
        tracks: likedSongs.length,
        duration: `${Math.floor(likedSongs.length * 3.5 / 60)}h ${Math.floor(likedSongs.length * 3.5 % 60)}m`
      };
    }
    if (playlist.id === 2) { // Recently Played
      return {
        ...playlist,
        tracks: recentlyPlayed.length,
        duration: `${Math.floor(recentlyPlayed.length * 3.5 / 60)}h ${Math.floor(recentlyPlayed.length * 3.5 % 60)}m`
      };
    }
    return playlist;
  });

  return (
    <LayoutWrapper>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Your Library
          </h1>
          <p className="text-gray-400 text-lg">Your music collection, genres, and playlists</p>
        </motion.div>

        {/* Music Genres Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Music className="w-6 h-6" />
            Music Genres
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {musicGenres.map((genre, index) => (
              <motion.div
                key={genre.id}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGenreClick(genre)}
                className={`group bg-gradient-to-br ${genre.color} rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 border border-white/10 relative overflow-hidden`}
              >
                {isLoading && selectedGenre === genre.id && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                <div className="text-4xl mb-3">{genre.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-yellow-200 transition-colors">
                  {genre.name}
                </h3>
                <p className="text-white/80 text-sm">{genre.description}</p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Play className="w-6 h-6 text-white ml-1" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Your Playlists */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Headphones className="w-6 h-6" />
            Your Playlists
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {updatedPlaylists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="relative mb-4">
                  <div className={`w-full h-48 bg-gradient-to-br ${playlist.gradient} rounded-xl flex items-center justify-center mb-4 relative overflow-hidden`}>
                    <playlist.icon className="w-16 h-16 text-white" />
                    {playlist.tracks > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                        {playlist.tracks} tracks
                      </div>
                    )}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{playlist.description}</p>
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <span>{playlist.tracks} tracks</span>
                    <span>{playlist.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add New Playlist */}
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer border-dashed"
            >
              <div className="w-full h-48 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center mb-4">
                <Plus className="w-16 h-16 text-white/50 group-hover:text-white transition-colors" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                  Create Playlist
                </h3>
                <p className="text-gray-400 text-sm">Add your favorite songs</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recently Played Tracks */}
        {recentTracks.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Recently Played</h2>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {recentTracks.map((track, index) => (
                <motion.div
                  key={`${track.id}-${index}`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  className="flex items-center p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleTrackPlay(track)}
                >
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  </div>
                  <div className="hidden md:block text-gray-400 text-sm mr-4">
                    {track.album || track.genre || 'Unknown'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {track.duration}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="ml-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Current Genre Tracks */}
        {genreTracks.length > 0 && selectedGenre && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {musicGenres.find(g => g.id === selectedGenre)?.name} Music
            </h2>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {genreTracks.slice(0, 20).map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * index, duration: 0.4 }}
                  whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  className="flex items-center p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleTrackPlay(track)}
                >
                  <div className="w-8 text-gray-400 text-sm mr-4">
                    {index + 1}
                  </div>
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {track.duration}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="ml-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {recentTracks.length === 0 && !session && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl text-white mb-2">Start Your Musical Journey</h3>
            <p className="text-gray-400 mb-6">Sign in to save your favorite songs and create playlists</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Sign In
            </motion.button>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
