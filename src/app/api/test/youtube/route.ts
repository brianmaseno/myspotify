import { NextResponse } from 'next/server';

export async function GET() {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ 
      error: 'YouTube API key not configured',
      hasKey: false
    });
  }

  try {
    // Simple test to check quota and permissions
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=music&maxResults=1&key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      hasKey: true,
      quotaExceeded: response.status === 403,
      error: data.error || null,
      success: response.ok,
      message: response.ok ? 'YouTube API is working' : `Error: ${response.status}`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Network error',
      hasKey: true,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
