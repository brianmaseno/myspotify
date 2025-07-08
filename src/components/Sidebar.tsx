"use client";

import { motion } from "framer-motion";
import { Home, Search, Library, TrendingUp, Music, Video, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

interface RecentArtist {
  id: string;
  name: string;
  image?: string;
  type: string;
}

const navigationItems = [
  { icon: Home, label: "Home", href: "/", active: true },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Your Library", href: "/library" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Music, label: "Music", href: "/music" },
  { icon: Video, label: "Videos", href: "/videos" },
];

const bottomNavItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [recentArtists, setRecentArtists] = useState<RecentArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentArtists();
  }, []);

  const fetchRecentArtists = async () => {
    try {
      // Try to fetch recent artists data
      const response = await fetch('/api/trending/tracks');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Sidebar API response:', data);
        
        if (data.success && data.tracks?.items) {
          // Extract unique artists from trending tracks
          const artists = data.tracks.items.slice(0, 3).map((track: {
            artists: Array<{ id?: string; name?: string }>;
            album?: { images?: Array<{ url?: string }> };
            thumbnail?: string;
          }) => ({
            id: track.artists[0]?.id || Math.random().toString(),
            name: track.artists[0]?.name || 'Unknown Artist',
            image: track.album?.images?.[0]?.url || track.thumbnail,
            type: 'Artist'
          }));
          setRecentArtists(artists);
        } else {
          console.warn('Invalid API response structure:', data);
          // Use fallback artists when API doesn't return expected data
          setRecentArtists([
            { id: '1', name: 'Trending Artist 1', type: 'Artist' },
            { id: '2', name: 'Trending Artist 2', type: 'Artist' },
            { id: '3', name: 'Trending Artist 3', type: 'Artist' }
          ]);
        }
      } else {
        console.warn('API request failed:', response.status, response.statusText);
        // Use fallback when API fails
        setRecentArtists([
          { id: '1', name: 'Popular Artist', type: 'Artist' },
          { id: '2', name: 'Top Charts', type: 'Playlist' },
          { id: '3', name: 'New Releases', type: 'Album' }
        ]);
      }
    } catch (error) {
      console.warn('Error fetching recent artists (using fallback):', error);
      // Always provide fallback data instead of leaving empty
      setRecentArtists([
        { id: '1', name: 'Discover Weekly', type: 'Playlist' },
        { id: '2', name: 'Release Radar', type: 'Playlist' },
        { id: '3', name: 'Daily Mix', type: 'Playlist' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col h-full"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            StellarSound
          </h1>
          <p className="text-sm text-gray-400">Beyond Music</p>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.label}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
            >
              <Link
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                  isActive ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Recently Played */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mb-6"
      >
        <h3 className="text-lg font-semibold mb-4">Recently Played</h3>
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
                <div>
                  <div className="h-3 bg-gray-600 rounded w-20 mb-1"></div>
                  <div className="h-2 bg-gray-700 rounded w-12"></div>
                </div>
              </div>
            ))
          ) : recentArtists.length > 0 ? (
            recentArtists.map((artist) => (
              <motion.div
                key={artist.id}
                whileHover={{ scale: 1.05, x: 10 }}
                className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
              >
                {artist.image ? (
                  <Image 
                    src={artist.image} 
                    alt={artist.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium truncate max-w-[120px]">{artist.name}</p>
                  <p className="text-xs text-gray-400">{artist.type}</p>
                </div>
              </motion.div>
            ))
          ) : (
            // Fallback when no data
            <div className="text-center text-gray-400 text-sm py-4">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent artists</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <div className="space-y-2 border-t border-white/10 pt-4">
        {bottomNavItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.label}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
            >
              <Link
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                  isActive ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
