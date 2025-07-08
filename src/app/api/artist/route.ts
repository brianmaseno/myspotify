import { NextRequest, NextResponse } from 'next/server';

// Get Spotify access token
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('id');

  if (!artistId) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    
    // Get artist info
    const artistResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!artistResponse.ok) {
      throw new Error(`Spotify API error: ${artistResponse.status}`);
    }

    const artistData = await artistResponse.json();
    
    // Get artist's albums
    const albumsResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const albumsData = albumsResponse.ok ? await albumsResponse.json() : { items: [] };
    
    // Get artist's top tracks
    const topTracksResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const topTracksData = topTracksResponse.ok ? await topTracksResponse.json() : { tracks: [] };

    // Transform the data
    const artist = {
      id: artistData.id,
      name: artistData.name,
      image: artistData.images[0]?.url,
      genres: artistData.genres,
      followers: artistData.followers.total,
      popularity: artistData.popularity,
      external_url: artistData.external_urls.spotify,
      albums: albumsData.items?.map((album: { id: string; name: string; images: { url: string }[]; release_date: string; total_tracks: number; album_type: string; external_urls: { spotify: string } }) => ({
        id: album.id,
        name: album.name,
        image: album.images[0]?.url,
        release_date: album.release_date,
        total_tracks: album.total_tracks,
        type: album.album_type,
        external_url: album.external_urls.spotify
      })) || [],
      topTracks: topTracksData.tracks?.map((track: { id: string; name: string; duration_ms: number; preview_url: string; popularity: number; external_urls: { spotify: string }; album: { name: string; images: { url: string }[] } }) => ({
        id: track.id,
        name: track.name,
        duration: formatDuration(track.duration_ms),
        preview_url: track.preview_url,
        popularity: track.popularity,
        external_url: track.external_urls.spotify,
        album: {
          name: track.album.name,
          image: track.album.images[0]?.url
        }
      })) || []
    };

    return NextResponse.json(artist);

  } catch (error) {
    console.error('Spotify artist API error:', error);
    return NextResponse.json(
      { error: 'Failed to get artist information' },
      { status: 500 }
    );
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
