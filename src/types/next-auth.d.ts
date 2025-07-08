import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      profileImage?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    profileImage?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    profileImage?: string;
  }
}

// YouTube Player API type definitions
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: {
        height: string;
        width: string;
        videoId: string;
        playerVars: Record<string, unknown>;
        events: {
          onReady: (event: { target: YoutubePlayer }) => void;
          onStateChange: (event: { data: number; target: YoutubePlayer }) => void;
          onError: (event: { data: number }) => void;
        };
      }) => YoutubePlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    youtubePlayerInstance: YoutubePlayer | null;
    youtubePlayerSeekTo: (time: number) => void;
    youtubePlayerDirectPlay: () => Promise<void>;
  }

  interface YoutubePlayer {
    playVideo: () => Promise<void>;
    pauseVideo: () => void;
    stopVideo: () => void;
    seekTo: (time: number, allowSeekAhead?: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getVolume: () => number;
    setVolume: (volume: number) => void;
    mute: () => void;
    unMute: () => void;
    isMuted: () => boolean;
    getPlayerState: () => number;
    destroy: () => void;
  }
}
