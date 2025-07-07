"use client";

import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import LayoutWrapper from "../components/LayoutWrapper";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  duration_ms: number;
  popularity: number;
}

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: { url: string };
    };
  };
}

export default function HomePage() {
  const { playTrack } = useAudioPlayer();
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch trending tracks from the correct API endpoint
      const spotifyResponse = await fetch('/api/trending/tracks');
      
      if (!spotifyResponse.ok) {
        throw new Error(`HTTP error! status: ${spotifyResponse.status}`);
      }
      
      const spotifyData = await spotifyResponse.json();
      console.log('API Response:', spotifyData);
      
      if (spotifyData.success && spotifyData.tracks?.items) {
        const formattedTracks = spotifyData.tracks.items.map((track: SpotifyTrack, index: number) => ({
          id: track.id,
          title: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          album: track.album.name,
          thumbnail: track.album.images[0]?.url || '',
          preview_url: track.preview_url,
          duration: formatDuration(track.duration_ms),
          source: 'spotify',
          plays: formatPlays(track.popularity),
          rank: index + 1
        }));
        
        console.log('Formatted tracks:', formattedTracks);
        setTrendingTracks(formattedTracks);
      } else {
        console.error('API response error:', spotifyData);
        setTrendingTracks([]);
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
      // Fallback to empty array if API fails
      setTrendingTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatPlays = (popularity: number) => {
    // Convert Spotify popularity (0-100) to play count format
    const plays = Math.floor((popularity / 100) * 5000000); // Max 5M plays
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`;
    } else if (plays >= 1000) {
      return `${(plays / 1000).toFixed(0)}K`;
    }
    return plays.toString();
  };

  const handleTrackPlay = (track: any) => {
    console.log('Playing track:', track);
    playTrack(track);
  };

  return (
    <LayoutWrapper>
      <div className="p-6">
        {/* Hero Section */}
        <motion.section
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative h-80 bg-gradient-to-r from-purple-600/40 to-pink-600/40 rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative z-10 h-full flex items-end p-8">
              <div>
                <motion.h2
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-5xl font-bold mb-4"
                >
                  Discover Your Sound
                </motion.h2>
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-xl text-gray-200 mb-6"
                >
                  Experience music and videos like never before
                </motion.p>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-purple-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300"
                >
                  Start Listening
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured Playlists */}
        <motion.section
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold mb-6">Featured Playlists</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Today's Top Hits", subtitle: "The biggest songs right now", color: "from-green-400 to-blue-500" },
              { title: "Chill Vibes", subtitle: "Relax and unwind", color: "from-purple-400 to-pink-500" },
              { title: "Workout Mix", subtitle: "High energy tracks", color: "from-orange-400 to-red-500" },
              { title: "Indie Favorites", subtitle: "Underground gems", color: "from-yellow-400 to-orange-500" },
            ].map((playlist, index) => (
              <motion.div
                key={playlist.title}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 cursor-pointer group"
              >
                <div className={`w-full h-32 bg-gradient-to-br ${playlist.color} rounded-xl mb-4 relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <Play className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                <h4 className="font-semibold text-lg mb-2">{playlist.title}</h4>
                <p className="text-gray-400 text-sm">{playlist.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Trending Now */}
        <motion.section
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold mb-6">Trending Now</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 animate-pulse">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingTracks.map((track, index) => (
                <motion.div
                  key={track.id || index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                  onClick={() => handleTrackPlay(track)}
                >
                  <div className="relative">
                    {track.thumbnail ? (
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {track.rank}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{track.title}</h4>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">{track.plays} plays</p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center mt-1"
                    >
                      <Play className="w-3 h-3 text-white ml-0.5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </LayoutWrapper>
  );
}

