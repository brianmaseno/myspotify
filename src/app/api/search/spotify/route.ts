import { NextRequest, NextResponse } from 'next/server';

// Spotify functionality disabled - focusing on YouTube Music experience
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Spotify search is disabled. This app focuses on YouTube Music.',
      results: [],
      totalResults: 0
    },
    { status: 200 }
  );
}

/*
// DISABLED - Spotify API code (keeping for reference)
async function getSpotifyAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Spotify auth error: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
*/
