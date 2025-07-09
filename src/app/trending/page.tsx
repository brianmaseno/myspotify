"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import VideoPlayer from "@/components/VideoPlayer";
import MusicImage from "@/components/MusicImage";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Play, Heart, Flame, Eye } from "lucide-react";
import { useState, useEffect } from "react";

interface TrendingTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  preview_url?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: string;
  plays?: string;
  change?: string;
  rank?: number;
  thumbnail?: string;
  title?: string;
  artist?: string;
  youtubeId?: string;
  source: 'youtube' | 'spotify';
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
  source: 'youtube' | 'spotify';
}

interface ApiTrendingVideo {
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
  const [selectedVideo, setSelectedVideo] = useState<TrendingVideo | null>(null);

  // Use global audio player
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        
        const [tracksResponse, videosResponse] = await Promise.all([
          fetch('/api/trending/tracks'),
          fetch('/api/trending/videos')
        ]);

        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          console.log('Tracks API Response:', tracksData);
          
          // Handle both API response formats
          let tracks = [];
          if (tracksData.success && tracksData.tracks?.items) {
            tracks = tracksData.tracks.items;
          } else if (tracksData.tracks) {
            tracks = Array.isArray(tracksData.tracks) ? tracksData.tracks : [];
          }
          
          // Transform tracks to consistent format
          const formattedTracks = tracks.map((track: any, index: number) => ({
            id: track.id || track.youtubeId || `track-${index}`,
            name: track.name || track.title,
            title: track.title || track.name,
            artist: track.artists?.[0]?.name || track.artist || 'Unknown Artist',
            artists: track.artists || [{ name: track.artist || 'Unknown Artist', id: 'unknown' }],
            album: track.album || { name: '', images: [{ url: track.thumbnail }] },
            thumbnail: track.thumbnail || track.album?.images?.[0]?.url,
            duration: track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}` : track.duration || '3:00',
            preview_url: track.preview_url,
            audioUrl: track.audioUrl,
            videoUrl: track.videoUrl,
            youtubeId: track.youtubeId || track.id,
            source: track.source || 'youtube',
            plays: track.plays || track.popularity?.toString() || 'N/A',
            rank: index + 1
          }));
          
          setTrendingTracks(formattedTracks);
        }

        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          const videosWithSource = (videosData.videos || []).map((video: ApiTrendingVideo): TrendingVideo => ({
            ...video,
            source: 'youtube' as const
          }));
          setTrendingVideos(videosWithSource);
        }
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  const handleTrackPlay = (track: TrendingTrack) => {
    console.log('Playing track:', track);
    
    // Create a consistent track format for the audio player
    const audioTrack = {
      id: track.youtubeId || track.id,
      title: track.name || track.title || 'Unknown Title',
      artist: track.artists?.[0]?.name || track.artist || 'Unknown Artist',
      thumbnail: track.thumbnail || track.album?.images?.[0]?.url || '/placeholder-music.svg',
      duration: track.duration || '3:00',
      source: track.source,
      audioUrl: track.audioUrl,
      videoUrl: track.videoUrl,
      youtubeId: track.youtubeId || track.id,
      preview_url: track.preview_url,
      album: track.album?.name || 'Unknown Album'
    };
    
    playTrack(audioTrack);
  };

  const handleVideoPlay = (video: TrendingVideo) => {
    setSelectedVideo({
      id: video.id,
      title: video.title,
      artist: video.artist,
      views: video.views,
      duration: video.duration,
      thumbnail: video.thumbnail,
      publishedAt: video.publishedAt,
      description: video.description,
      source: 'youtube' as const
    });
  };

  return (
    <LayoutWrapper>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trending Now
            </h1>
            <Flame className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />
          </div>
          <p className="text-gray-400 text-lg md:text-xl">Discover what&apos;s hot right now</p>
        </motion.div>

        {loading ? (
          <div className="space-y-8">
            {/* Loading for tracks */}
            <div>
              <div className="h-8 bg-gray-600 rounded mb-6 w-48"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-pulse">
                    <div className="w-8 h-8 bg-gray-600 rounded mr-4"></div>
                    <div className="w-12 h-12 bg-gray-600 rounded-lg mr-4"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-600 rounded"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                    <div className="w-16 h-4 bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading for videos */}
            <div>
              <div className="h-8 bg-gray-600 rounded mb-6 w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 animate-pulse">
                    <div className="w-full h-48 bg-gray-600"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-600 rounded"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top Tracks Section */}
            <motion.section
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center space-x-3">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Top Tracks
                </span>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              </h2>
              
              <div className="space-y-2">
                {trendingTracks.slice(0, 10).map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.6 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                    className="flex items-center p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleTrackPlay(track)}
                  >
                    {/* Rank */}
                    <div className="w-6 md:w-8 text-center mr-3 md:mr-4">
                      {index < 3 ? (
                        <div className="relative">
                          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                            'bg-gradient-to-r from-orange-400 to-orange-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-bold text-sm md:text-base">{track.rank || index + 1}</span>
                      )}
                    </div>

                    {/* Track Info */}
                    <MusicImage
                      src={track.thumbnail || track.album?.images?.[0]?.url || '/placeholder-music.svg'}
                      alt={track.name || track.title || 'Track'}
                      width={48}
                      height={48}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover mr-3 md:mr-4"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors text-sm md:text-base">
                        {track.name || track.title || 'Unknown Title'}
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm truncate">
                        {track.artists?.[0]?.name || track.artist || 'Unknown Artist'}
                      </p>
                    </div>
                    
                    <div className="hidden lg:block text-gray-400 text-sm mr-6">
                      {track.album?.name || 'Unknown Album'}
                    </div>
                    
                    <div className="text-right mr-2 md:mr-4">
                      <p className="text-white font-semibold text-sm md:text-base">{track.plays || 'N/A'}</p>
                      <p className={`text-xs ${(track.change || '+0%').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {track.change || '+0%'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-6 h-6 md:w-8 md:h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Play className="w-3 h-3 md:w-4 md:h-4 text-white ml-0.5" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-6 h-6 md:w-8 md:h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Heart className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Trending Videos Section */}
            <motion.section
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center space-x-3">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Trending Videos
                </span>
                <Eye className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {trendingVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.6, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                    onClick={() => handleVideoPlay(video)}
                  >
                    <div className="relative">
                      <MusicImage
                        src={video.thumbnail}
                        alt={video.title}
                        width={300}
                        height={192}
                        className="w-full h-36 md:h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" />
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors text-sm md:text-base">
                        {video.title}
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm mb-2">{video.artist}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{video.views} views</span>
                        <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </>
        )}

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
