"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import VideoPlayer from "@/components/VideoPlayer";
import AudioPlayer from "@/components/AudioPlayer";
import { motion } from "framer-motion";
import { Search, Music, Video, Play, Heart, MoreHorizontal, User, Disc, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  type: 'audio' | 'video';
  source: 'spotify' | 'youtube';
  album?: string;
  preview_url?: string;
  external_url?: string;
  popularity?: number;
}

interface Artist {
  id: string;
  name: string;
  image?: string;
  genres: string[];
  followers: number;
  popularity: number;
  external_url: string;
  albums: any[];
  topTracks: any[];
}

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SearchResult | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showArtistModal, setShowArtistModal] = useState(false);

  const searchTabs = [
    { id: "all", label: "All", icon: Search },
    { id: "tracks", label: "Tracks", icon: Music },
    { id: "videos", label: "Videos", icon: Video },
    { id: "artists", label: "Artists", icon: User },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const promises = [];
      
      if (activeTab === "all" || activeTab === "tracks") {
        promises.push(
          fetch(`/api/search/spotify?q=${encodeURIComponent(searchQuery)}&limit=20`)
            .then(res => res.json())
            .then(data => data.results || [])
        );
      }
      
      if (activeTab === "all" || activeTab === "videos") {
        promises.push(
          fetch(`/api/search/youtube?q=${encodeURIComponent(searchQuery + " music")}&maxResults=20`)
            .then(res => res.json())
            .then(data => data.results || [])
        );
      }

      if (activeTab === "artists") {
        promises.push(
          fetch(`/api/search/spotify?q=${encodeURIComponent(searchQuery)}&type=artist&limit=20`)
            .then(res => res.json())
            .then(data => data.results || [])
        );
      }

      const results = await Promise.all(promises);
      const combinedResults = results.flat();
      setSearchResults(combinedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = async (artistName: string) => {
    try {
      // First search for the artist to get their ID
      const searchResponse = await fetch(`/api/search/spotify?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
      const searchData = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        const artistId = searchData.results[0].id;
        
        // Get detailed artist information
        const artistResponse = await fetch(`/api/artist?id=${artistId}`);
        const artistData = await artistResponse.json();
        
        setSelectedArtist(artistData);
        setShowArtistModal(true);
      }
    } catch (error) {
      console.error('Error fetching artist data:', error);
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
    if (activeTab === "tracks") return result.type === "audio";
    if (activeTab === "videos") return result.type === "video";
    return true;
  });

  const handlePlayVideo = (result: SearchResult) => {
    if (result.type === 'video') {
      setSelectedVideo(result);
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
            Search Music & Videos
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
                      {result.source.toUpperCase()}
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (result.type === 'video') {
                            setSelectedVideo(result);
                          } else {
                            setCurrentTrack(result);
                          }
                        }}
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
                    <p 
                      className="text-gray-400 text-sm mb-2 cursor-pointer hover:text-purple-300 transition-colors"
                      onClick={() => handleArtistClick(result.artist)}
                    >
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
                        {result.popularity && (
                          <span className="text-gray-500 text-xs">
                            ★ {result.popularity}
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

      {/* Audio Player */}
      {currentTrack && (
        <AudioPlayer
          track={currentTrack}
          onTrackEnd={() => setCurrentTrack(null)}
        />
      )}

      {/* Artist Modal */}
      {showArtistModal && selectedArtist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowArtistModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-6 mb-8">
              {selectedArtist.image && (
                <img
                  src={selectedArtist.image}
                  alt={selectedArtist.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedArtist.name}</h2>
                <p className="text-gray-300 mb-2">{selectedArtist.followers.toLocaleString()} followers</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedArtist.genres.map((genre, index) => (
                    <span key={index} className="px-3 py-1 bg-white/20 rounded-full text-sm text-gray-300">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Tracks */}
            {selectedArtist.topTracks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Popular Tracks</h3>
                <div className="space-y-3">
                  {selectedArtist.topTracks.slice(0, 5).map((track, index) => (
                    <div key={track.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-gray-400 w-4">{index + 1}</span>
                      {track.album.image && (
                        <img src={track.album.image} alt={track.album.name} className="w-12 h-12 rounded" />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium">{track.name}</p>
                        <p className="text-gray-400 text-sm">{track.album.name}</p>
                      </div>
                      <span className="text-gray-400 text-sm">{track.duration}</span>
                      {track.preview_url && (
                        <button
                          onClick={() => setCurrentTrack({
                            id: track.id,
                            title: track.name,
                            artist: selectedArtist.name,
                            thumbnail: track.album.image,
                            duration: track.duration,
                            type: 'audio',
                            source: 'spotify',
                            preview_url: track.preview_url,
                            album: track.album.name
                          })}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Albums */}
            {selectedArtist.albums.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Albums</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedArtist.albums.slice(0, 8).map((album) => (
                    <div key={album.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">
                      {album.image && (
                        <img src={album.image} alt={album.name} className="w-full aspect-square rounded mb-2" />
                      )}
                      <p className="text-white font-medium text-sm mb-1 line-clamp-2">{album.name}</p>
                      <p className="text-gray-400 text-xs">{album.release_date?.split('-')[0]} • {album.total_tracks} tracks</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </LayoutWrapper>
  );
}
