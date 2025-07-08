"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import { motion } from "framer-motion";
import { Music, Play, Heart, Plus, Filter, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import Image from "next/image";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  thumbnail: string;
  preview_url?: string;
  source: 'spotify' | 'youtube';
}

export default function MusicPage() {
  const { playTrack } = useAudioPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = ["All", "Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Classical"];

  const fetchMusicTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch trending tracks for music page
      const response = await fetch('/api/trending/tracks');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tracks?.items) {
          const formattedTracks = data.tracks.items.map((track: {
            id: string;
            name: string;
            artists: Array<{ name: string }>;
            album: { name: string; images: Array<{ url: string }> };
            duration_ms: number;
            preview_url?: string;
          }) => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map((a: { name: string }) => a.name).join(', '),
            album: track.album.name,
            duration: formatDuration(track.duration_ms),
            thumbnail: track.album.images[0]?.url || '',
            preview_url: track.preview_url,
            source: 'spotify' as const
          }));
          setTracks(formattedTracks);
        }
      }
    } catch (error) {
      console.error('Error fetching music tracks:', error);
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMusicTracks();
  }, [fetchMusicTracks]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTrackPlay = (track: Track) => {
    playTrack(track);
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
            Music Library
          </h1>
          <p className="text-gray-400 text-lg">Discover and enjoy your favorite tracks</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-colors"
            >
              {genres.map(genre => (
                <option key={genre} value={genre} className="bg-gray-900">
                  {genre}
                </option>
              ))}
            </select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
          >
            <Play className="w-5 h-5" />
            <span>Play All</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add to Playlist</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
          >
            <Heart className="w-5 h-5" />
            <span>Like All</span>
          </motion.button>
        </motion.div>

        {/* Music Tracks */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">All Tracks ({filteredTracks.length})</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-pulse">
                  <div className="w-16 h-16 bg-gray-600 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                  <div className="w-12 h-4 bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredTracks.length > 0 ? (
            <div className="space-y-2">
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * index, duration: 0.6 }}
                  whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleTrackPlay(track)}
                >
                  <div className="relative mr-4">
                    <Image
                      src={track.thumbnail}
                      alt={track.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Play className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                    <p className="text-gray-500 text-xs truncate">{track.album}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-sm">{track.duration}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle like functionality
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No tracks found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </LayoutWrapper>
  );
}
