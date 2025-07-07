import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { LikedSong } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const likedSongs = await LikedSong.find({ userId: session.user.id })
      .sort({ likedAt: -1 });

    return NextResponse.json({ likedSongs });
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { track } = await request.json();

    await connectDB();

    // Check if already liked
    const existingLike = await LikedSong.findOne({
      userId: session.user.id,
      trackId: track.id,
    });

    if (existingLike) {
      return NextResponse.json({ message: 'Song already liked' });
    }

    const likedSong = await LikedSong.create({
      userId: session.user.id,
      trackId: track.id,
      track,
      likedAt: new Date(),
    });

    return NextResponse.json({ likedSong });
  } catch (error) {
    console.error('Error liking song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
    }

    await connectDB();

    await LikedSong.deleteOne({
      userId: session.user.id,
      trackId,
    });

    return NextResponse.json({ message: 'Song unliked' });
  } catch (error) {
    console.error('Error unliking song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
