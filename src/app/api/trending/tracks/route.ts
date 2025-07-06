import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyBPo_E4UQVbENLyZXVSlJLjyCEBByTWL_o';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'c3d58ea6bfbf47e8a0705e8213cacd25';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'your_spotify_client_secret';

async function getSpotifyToken() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('Failed to get Spotify token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return null;
  }
}

export async function GET() {
  try {
    const token = await getSpotifyToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Spotify' },
        { status: 500 }
      );
    }

    // Get featured playlists to find trending tracks
    const playlistsResponse = await fetch(
      'https://api.spotify.com/v1/browse/featured-playlists?limit=5&country=US',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!playlistsResponse.ok) {
      throw new Error('Failed to fetch playlists from Spotify');
    }

    const playlistsData = await playlistsResponse.json();
    
    // Get tracks from the first featured playlist
    if (playlistsData.playlists?.items?.length > 0) {
      const playlistId = playlistsData.playlists.items[0].id;
      
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10&market=US`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!tracksResponse.ok) {
        throw new Error('Failed to fetch tracks from Spotify');
      }

      const tracksData = await tracksResponse.json();
      
      const trendingTracks = tracksData.items
        .filter((item: any) => item.track && item.track.preview_url)
        .slice(0, 10)
        .map((item: any, index: number) => {
          const track = item.track;
          const duration = Math.floor(track.duration_ms / 1000);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          
          return {
            id: track.id,
            title: track.name,
            artist: track.artists.map((artist: any) => artist.name).join(', '),
            album: track.album.name,
            plays: `${Math.floor(Math.random() * 100 + 20)}M`, // Simulated play count
            change: `+${Math.floor(Math.random() * 30 + 5)}%`, // Simulated change
            duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            cover: track.album.images[0]?.url || '',
            rank: index + 1,
            preview_url: track.preview_url,
            spotify_url: track.external_urls.spotify,
            popularity: track.popularity
          };
        });

      return NextResponse.json({ tracks: trendingTracks });
    }

    return NextResponse.json({ tracks: [] });

  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending tracks' },
      { status: 500 }
    );
  }
}
