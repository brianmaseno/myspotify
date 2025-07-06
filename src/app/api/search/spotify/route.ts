import { NextRequest, NextResponse } from 'next/server';

// Spotify API requires OAuth2 token, so we need to get access token first
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
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '10';
  const type = searchParams.get('type') || 'track,artist,album';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?` +
      `q=${encodeURIComponent(query)}&` +
      `type=${type}&` +
      `limit=${limit}&` +
      `market=US`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform tracks data to match our interface
    const transformedResults = data.tracks?.items?.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.artists.map((artist: any) => artist.name).join(', '),
      thumbnail: item.album.images[1]?.url || item.album.images[0]?.url,
      duration: formatDuration(item.duration_ms),
      type: 'audio',
      source: 'spotify',
      album: item.album.name,
      preview_url: item.preview_url,
      external_url: item.external_urls.spotify,
      popularity: item.popularity
    })) || [];

    return NextResponse.json({
      results: transformedResults,
      totalResults: data.tracks?.total || 0
    });

  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: 'Failed to search Spotify' },
      { status: 500 }
    );
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
