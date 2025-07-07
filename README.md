# 🎵 MySpotify - Your Musical Journey

A modern music streaming application with AI-powered features and seamless user experience. Built with Next.js 15, TypeScript, MongoDB, and Azure OpenAI to create a personalized music discovery platform.

## ✨ Features

### 🤖 **AI-Powered Experience**
- **AI DJ X**: Personal AI DJ powered by Azure OpenAI
- **Smart Recommendations**: AI suggests songs based on your listening history
- **Personalized Greetings**: AI DJ greets you personally and curates playlists
- **Genre-Aware Playback**: Automatically plays similar genre music when a song ends

### 👤 **User Authentication & Profiles**
- **Persistent Authentication**: Sign up/Sign in with sessions that don't require re-login
- **User Profiles**: Personal profiles with listening statistics
- **Secure Login**: bcrypt password hashing and NextAuth.js sessions

### 🎵 **Music Features**
- **YouTube Integration**: Full music playback from YouTube (no 30-second previews!)
- **Genre-Based Discovery**: Browse Christian, Hip Hop, Christian Hip Hop, Pop, Rock, R&B, Country, Electronic
- **Smart Audio Player**: Supports both audio and video playback with seamless controls
- **Like/Unlike Songs**: Save favorites with database storage
- **Recently Played**: Track and display your complete listening history
- **Queue Management**: Add songs to queue, shuffle, repeat, and smart next track suggestions

### 📊 **Database Integration**
- **MongoDB Integration**: All user data, play history, and liked songs stored in database
### 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or Atlas)
- YouTube API Key
- Azure OpenAI Account

### Environment Variables
Create a `.env.local` file with:

```bash
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
AZURE_OPENAI_API_VERSION=2024-04-01-preview
``` controls are available
- **Audio-Only Mode**: Extract audio from YouTube videos for music-focused listening
- **Smart Navigation**: Next/Previous with intelligent suggestions
- **Volume Control**: Full volume control with mute functionality and visual feedback

### 🎨 **Stunning UI/UX**
- **Animated Gradients**: Dynamic background animations
- **Framer Motion**: Smooth, professional animations throughout
- **Glassmorphism**: Modern glass-like UI components
- **Floating Orbs**: Ambient animated background elements
- **Hover Effects**: Interactive elements with delightful micro-interactions

### 🔧 **Technical Excellence**
- **Next.js 14**: Latest App Router with server-side rendering
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS**: Utility-first styling with custom animations
- **Radix UI**: Accessible, unstyled components
- **MongoDB**: Scalable database for user data and playlists

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- API keys for YouTube and Spotify (provided in `.env.local`)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the magnificent interface!

## 🎵 **How to Use**

### 🏠 **Home Page**
- Discover featured playlists
- View trending music
- Access recently played tracks
- Browse curated collections

### 🔍 **Search Page** (`/search`)
- Search across YouTube and Spotify
- Filter by music tracks or videos
- Play videos in full-screen modal
- Add tracks to favorites and playlists

### 🎛️ **Music Player**
- Full audio controls (play, pause, skip, repeat, shuffle)
- Volume control with visual feedback
- Progress bar with seeking capability
- Track information display
- Like/favorite functionality

## 🛠️ **Technology Stack**

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### **Backend & APIs**
- **Next.js API Routes** - Server-side functionality
- **YouTube Data API v3** - Video search and metadata
- **Spotify Web API** - Music search and metadata
- **MongoDB** - Database for user data and playlists

### **Styling & Animation**
- **Glassmorphism** - Modern glass-like UI effects
- **CSS Grid & Flexbox** - Responsive layouts
- **Custom Animations** - Floating orbs and gradients
- **Hover Effects** - Interactive element feedback

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   └── search/        # Search endpoints
│   ├── search/            # Search page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── AudioPlayer.tsx   # Audio player component
│   ├── VideoPlayer.tsx   # Video player modal
│   ├── LayoutWrapper.tsx # Main layout wrapper
│   └── Sidebar.tsx       # Navigation sidebar
├── lib/                  # Utility functions
│   └── utils.ts          # Helper functions
└── .env.local           # Environment variables
```

## 🌟 **Key Components**

### **LayoutWrapper**
- Manages the overall app layout
- Includes animated background effects
- Handles global header and navigation

### **AudioPlayer**
- Full-featured music player
- Spotify integration for preview tracks
- Advanced controls and visualization

### **VideoPlayer**
- Modal-based video player
- YouTube video integration
- Custom controls overlay

### **Search Interface**
- Unified search across platforms
- Real-time results with animations
- Filter tabs for content types

## 🎨 **Design Philosophy**

### **Visual Excellence**
- **Purple-to-Pink Gradients**: Signature color scheme
- **Glassmorphism**: Translucent, layered UI elements
- **Smooth Animations**: Every interaction feels fluid
- **Professional Typography**: Clear, readable font hierarchy

### **User Experience**
- **Intuitive Navigation**: Easy-to-use sidebar and header
- **Responsive Design**: Perfect on mobile, tablet, and desktop
- **Loading States**: Beautiful loading animations
- **Error Handling**: Graceful error states and feedback

## 🔑 **Environment Variables**

The project uses the following environment variables (already configured):

```env
# YouTube API
YOUTUBE_API_KEY=AIzaSyBPo_E4UQVbENLyZXVSlJLjyCEBByTWL_o

# Spotify API
SPOTIFY_CLIENT_ID=c3d58ea6bfbf47e8a0705e8213cacd25
SPOTIFY_CLIENT_SECRET=606cd285214445bf86c4cf71b7b7b4eb

# MongoDB
MONGODB_URI=mongodb+srv://brianmayoga:vpm8M1ChOI2s73ai@ngoma.g7prcva.mongodb.net/?retryWrites=true&w=majority&appName=ngoma

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 **Deployment**

### **Production Build**
```bash
npm run build
npm start
```

### **Recommended Platforms**
- **Vercel** (optimal for Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway**

## 🎯 **Features That Impress**

### **Why This Beats Spotify:**
1. **Unified Platform**: Search both YouTube videos AND Spotify tracks
2. **Superior Design**: Modern glassmorphism beats Spotify's flat design
3. **Video Integration**: Watch music videos, not just audio
4. **Smooth Animations**: Every interaction is delightful
5. **Better Search**: Cross-platform search with instant results
6. **Modern Tech Stack**: Built with latest technologies

### **Performance Optimizations**
- Server-side rendering with Next.js 14
- Image optimization and lazy loading
- Efficient API calls with debouncing
- Optimized animations with Framer Motion
- Minimal bundle size with tree shaking

## 📱 **Responsive Design**

The application is fully responsive and works beautifully on:
- 📱 **Mobile devices** (320px+)
- 📱 **Tablets** (768px+)
- 💻 **Laptops** (1024px+)
- 🖥️ **Desktops** (1440px+)
- 🖥️ **Ultra-wide screens** (1920px+)

## 🎵 **Audio/Video Support**

### **Supported Formats**
- **Audio**: MP3, WAV, OGG, AAC
- **Video**: MP4, WebM, OGV
- **Streaming**: YouTube videos, Spotify previews

### **Player Features**
- Play/Pause controls
- Volume adjustment
- Seek/scrubbing
- Repeat modes (none, one, all)
- Shuffle functionality
- Fullscreen video mode

## 🔮 **Future Enhancements**

### **Planned Features**
- User authentication with NextAuth
- Custom playlist creation
- Social sharing functionality
- Music recommendations AI
- Offline playback capability
- Lyrics integration
- Artist profiles and biographies
- Concert tickets integration

### **Technical Improvements**
- Progressive Web App (PWA) support
- WebGL audio visualizations
- Real-time collaborative playlists
- Advanced search filters
- Machine learning recommendations

## 👨‍💻 **Developer**

**Brian Mayoga**
- Passionate full-stack developer
- Expert in modern web technologies
- Committed to creating exceptional user experiences

## 📄 **License**

This project is created as a demonstration of modern web development capabilities.

---

## 🎉 **Experience StellarSound**

This isn't just another music app - it's a complete reimagining of how music streaming should work. With its stunning visual design, smooth animations, and unified search across platforms, StellarSound represents the future of music discovery and playback.

**Ready to be impressed? Start the development server and experience the magic! 🚀**
