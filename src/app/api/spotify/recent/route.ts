import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: 'Spotify credentials not configured' },
        { status: 500 }
      );
    }

    // Get access token
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store'
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get Spotify access token' },
        { status: 500 }
      );
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Since we can't get actual user's recent tracks without user auth,
    // we'll return popular tracks as a fallback
    const response = await fetch(
      'https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=20',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch tracks from Spotify' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the data to match our expected format
    const transformedData = {
      items: data.items.map((item: { track: unknown }) => ({
        track: item.track
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Spotify API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
