"use client";

import Sidebar from "./Sidebar";
import AudioPlayer from "./AudioPlayer";
import AIDJ from "./AIDJ";
import { motion } from "framer-motion";
import { Search, Heart, Bot, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAIDJOpen, setIsAIDJOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Animated Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse" />
      
      {/* Floating Orbs Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="p-6 bg-black/20 backdrop-blur-xl border-b border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-lg">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for songs, artists, albums..."
                      className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full focus:border-purple-400 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </form>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* AI DJ Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAIDJOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <Bot className="w-5 h-5" />
                  <span className="text-sm font-medium">DJ X</span>
                </motion.button>

                {/* Liked Songs Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/library')}
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
                  >
                    {session?.user?.profileImage ? (
                      <img 
                        src={session.user.profileImage} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </motion.button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-12 right-0 w-48 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      {session ? (
                        <>
                          <div className="p-4 border-b border-white/10">
                            <p className="font-medium text-white">{session.user?.name}</p>
                            <p className="text-sm text-gray-400">{session.user?.email}</p>
                          </div>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <div className="p-2">
                          <button
                            onClick={() => router.push('/auth/signin')}
                            className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => router.push('/auth/signup')}
                            className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                          >
                            Sign Up
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto pb-24">
            {children}
          </main>
        </div>
      </div>
      
      {/* Global Audio Player */}
      <AudioPlayer />
      
      {/* AI DJ Modal */}
      <AIDJ isOpen={isAIDJOpen} onClose={() => setIsAIDJOpen(false)} />
    </div>
  );
}
