"use client";

import Sidebar from "./Sidebar";
import AudioPlayer from "./AudioPlayer";
import AIDJ from "./AIDJ";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Bot, User, LogOut, Menu, X, Home, Library, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAIDJOpen, setIsAIDJOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const mobileNavItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Library, label: "Library", href: "/library" },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
  ];

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
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-20 left-0 right-0 lg:hidden z-40">
          <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-2">
            <div className="flex items-center justify-around">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="p-4 lg:p-6 bg-black/20 backdrop-blur-xl border-b border-white/10"
          >
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex-1 max-w-lg mx-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for songs, artists, albums..."
                      className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full focus:border-purple-400 focus:outline-none transition-all duration-300 text-sm lg:text-base"
                    />
                  </div>
                </form>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* AI DJ Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAIDJOpen(true)}
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <Bot className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-xs lg:text-sm font-medium hidden sm:inline">DJ X</span>
                </motion.button>

                {/* Liked Songs Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/liked-songs')}
                  className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
                </motion.button>

                {/* User Menu */}
                <div className="relative user-menu-container">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center overflow-hidden"
                  >
                    {session?.user?.profileImage ? (
                      <Image 
                        src={session.user.profileImage} 
                        alt="Profile" 
                        width={40}
                        height={40}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 lg:w-5 lg:h-5" />
                    )}
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-12 right-0 w-48 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                      >
                        {session ? (
                          <>
                            <div className="p-4 border-b border-white/10">
                              <p className="font-medium text-white text-sm">{session.user?.name}</p>
                              <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                            </div>
                            <div className="p-2">
                              <button
                                onClick={() => {
                                  router.push('/history');
                                  setShowUserMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg text-sm"
                              >
                                <Library className="w-4 h-4" />
                                Play History
                              </button>
                              <button
                                onClick={() => {
                                  router.push('/liked-songs');
                                  setShowUserMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg text-sm"
                              >
                                <Heart className="w-4 h-4" />
                                Liked Songs
                              </button>
                              <hr className="border-white/10 my-2" />
                              <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg text-sm"
                              >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-2">
                            <button
                              onClick={() => {
                                router.push('/auth/signin');
                                setShowUserMenu(false);
                              }}
                              className="w-full px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg text-sm"
                            >
                              Sign In
                            </button>
                            <button
                              onClick={() => {
                                router.push('/auth/signup');
                                setShowUserMenu(false);
                              }}
                              className="w-full px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg text-sm"
                            >
                              Sign Up
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Mobile Navigation Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 lg:hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      StellarSound
                    </h1>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <nav className="space-y-2">
                    {mobileNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto pb-32 lg:pb-24">
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
