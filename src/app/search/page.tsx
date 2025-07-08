"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import VideoPlayer from "@/components/VideoPlayer";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { motion } from "framer-motion";
import { Search, Music, Video, Play, Heart, MoreHorizontal, Disc, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  type: 'audio' | 'video';
  source: 'youtube';
  album?: string;
  audioUrl?: string;
  canPlayAsAudio?: boolean;
  youtubeId?: string;
  views?: string;
  popularity?: number;
}

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);

  // Use global audio player
  const { playTrack, addToQueue } = useAudioPlayer();

  const searchTabs = [
    { id: "all", label: "All", icon: Search },
    { id: "tracks", label: "Music", icon: Music },
    { id: "videos", label: "Videos", icon: Video },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Only search YouTube - focusing on YouTube Music experience
      const response = await fetch(`/api/search/youtube?q=${encodeURIComponent(searchQuery + " music")}&maxResults=40`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(handleSearch, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  const filteredResults = searchResults.filter(result => {
    if (activeTab === "tracks") return result.canPlayAsAudio || result.type === "audio";
    if (activeTab === "videos") return result.type === "video";
    return true; // Show all for "all" tab
  });

  const handlePlayVideo = (result: SearchResult) => {
    if (result.type === 'video') {
      setSelectedVideo(result);
    }
  };

  const handlePlayAudio = (result: SearchResult) => {
    // Convert search result to track format for audio player
    const track = {
      id: result.id,
      youtubeId: result.id,
      title: result.title,
      artist: result.artist,
      thumbnail: result.thumbnail,
      duration: result.duration,
      source: result.source || 'youtube',
      audioUrl: result.audioUrl,
      album: result.album
    };
    
    playTrack(track);
  };

  const handlePlayClick = (result: SearchResult) => {
    if (result.type === 'video' && activeTab === 'videos') {
      handlePlayVideo(result);
    } else {
      // For YouTube videos, play as audio (YouTube Music style)
      handlePlayAudio(result);
    }
  };

  return (
    <LayoutWrapper>
      <div className="p-8">
        {/* Search Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            YouTube Music Search
          </h1>
          
          {/* Search Input */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search for artists, songs, or videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 pl-14 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Search Tabs */}
          <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-2xl p-1 border border-white/10">
            {searchTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Search Results ({filteredResults.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResults.map((result, index) => (
                <motion.div
                  key={`${result.source}-${result.id}`}
                  initial={{ y: 50, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {result.duration}
                    </div>
                    <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      YOUTUBE
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePlayClick(result)}
                        className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                      >
                        <Play className="w-8 h-8 ml-1" />
                      </motion.button>
                    </motion.div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-2">
                      {result.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {result.artist}
                    </p>
                    {result.album && (
                      <p className="text-gray-500 text-xs mb-2 flex items-center">
                        <Disc className="w-3 h-3 mr-1" />
                        {result.album}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-xs flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {result.duration}
                        </span>
                        {result.views && (
                          <span className="text-gray-500 text-xs">
                            👁 {result.views}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No results found</div>
            <div className="text-gray-500 text-sm">
              Try adjusting your search terms or check your spelling
            </div>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </LayoutWrapper>
  );
}
