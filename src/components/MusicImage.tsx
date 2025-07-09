"use client";

import Image from "next/image";
import { useState } from "react";
import { Music } from "lucide-react";

interface MusicImageProps {
  src: string | undefined | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
}

export default function MusicImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = "",
  fallbackSrc = "/placeholder-music.svg"
}: MusicImageProps) {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    } else {
      // If even the fallback fails, show gradient placeholder
      setHasError(true);
    }
  };

  if (hasError && imageSrc === fallbackSrc) {
    // Show gradient placeholder with music icon
    return (
      <div 
        className={`bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <Music className="w-1/2 h-1/2 text-white opacity-60" />
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      unoptimized={imageSrc === fallbackSrc}
    />
  );
}
