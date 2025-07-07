"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import VideoPlayer from "@/components/VideoPlayer";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Play, Heart, Share, MoreHorizontal, Flame, Eye } from "lucide-react";
import { useState, useEffect } from "react";

interface TrendingTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  plays: string;
  change: string;
  duration: string;
  cover: string;
  rank: number;
  preview_url?: string;
  spotify_url?: string;
  popularity: number;
}

interface TrendingVideo {
  id: string;
  title: string;
  artist: string;
  views: string;
  duration: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
}

export default function TrendingPage() {
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Use global audio player
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        
        // Fetch trending tracks and videos in parallel
        const [tracksResponse, videosResponse] = await Promise.all([
          fetch('/api/trending/tracks'),
          fetch('/api/trending/videos')
        ]);

        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          setTrendingTracks(tracksData.tracks || []);
        }

        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          setTrendingVideos(videosData.videos || []);
        }
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  const handleVideoPlay = (video: TrendingVideo) => {
    setSelectedVideo({
      id: video.id,
      title: video.title,
      artist: video.artist,
      source: 'youtube' as const
    });
  };

  const handleTrackPlay = (track: TrendingTrack) => {
    const audioTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.cover,
      duration: track.duration,
      source: 'spotify' as const,
      preview_url: track.preview_url,
      album: track.album
    };
    
    playTrack(audioTrack);
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

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
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Trending Now
            </h1>
          </div>
          <p className="text-gray-400 text-lg">What's hot right now across the globe</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Plays Today</p>
                <p className="text-2xl font-bold text-white">2.4B</p>
                <p className="text-green-400 text-sm">+12% from yesterday</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-pink-600/20 to-red-600/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Trending Tracks</p>
                <p className="text-2xl font-bold text-white">{trendingTracks.length}</p>
                <p className="text-green-400 text-sm">Live from Spotify</p>
              </div>
              <Flame className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Video Views</p>
                <p className="text-2xl font-bold text-white">892M</p>
                <p className="text-green-400 text-sm">+18% this week</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Trending Tracks */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Flame className="w-6 h-6 text-red-400 mr-2" />
            Top Trending Tracks
          </h2>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            {trendingTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className="flex items-center p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                {/* Rank */}
                <div className="w-8 text-center mr-4">
                  {track.rank <= 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      track.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                      track.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                      'bg-gradient-to-r from-amber-600 to-amber-800 text-white'
                    }`}>
                      {track.rank}
                    </div>
                  ) : (
                    <span className="text-gray-400 font-bold">{track.rank}</span>
                  )}
                </div>

                {/* Track Info */}
                <img
                  src={track.cover || '/api/placeholder/300/300'}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover mr-4"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>
                
                {/* Album */}
                <div className="hidden md:block text-gray-400 text-sm mr-4 w-32 truncate">
                  {track.album}
                </div>
                
                {/* Plays */}
                <div className="hidden lg:block text-gray-400 text-sm mr-4 w-20">
                  {track.plays} plays
                </div>
                
                {/* Change */}
                <div className="text-green-400 text-sm mr-4 w-16">
                  {track.change}
                </div>
                
                {/* Duration */}
                <div className="text-gray-400 text-sm mr-4 w-12">
                  {track.duration}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleTrackPlay(track)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/20 transition-all"
                  >
                    <Heart className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trending Videos */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Eye className="w-6 h-6 text-blue-400 mr-2" />
            Trending Music Videos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingVideos.slice(0, 9).map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => handleVideoPlay(video)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </motion.button>
                  </motion.div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{video.artist}</p>
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {video.views} views
                    </span>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Share className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Video Player Modal */}
        <AnimatePresence>
          {selectedVideo && (
            <VideoPlayer
              video={selectedVideo}
              onClose={() => setSelectedVideo(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </LayoutWrapper>
  );
}
