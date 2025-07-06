import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const maxResults = searchParams.get('maxResults') || '10';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `key=${process.env.YOUTUBE_API_KEY}&` +
      `q=${encodeURIComponent(query)}&` +
      `part=snippet&` +
      `type=video&` +
      `maxResults=${maxResults}&` +
      `videoCategoryId=10` // Music category
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our interface
    const transformedResults = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      duration: 'N/A', // YouTube API v3 requires additional call for duration
      type: 'video',
      source: 'youtube',
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description
    })) || [];

    return NextResponse.json({
      results: transformedResults,
      totalResults: data.pageInfo?.totalResults || 0,
      nextPageToken: data.nextPageToken
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube' },
      { status: 500 }
    );
  }
}
