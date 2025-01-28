'use server';

import { handleAsync } from '@/lib/handleAsync';
import prisma from '@/lib/prisma';

export async function createPlaylist(formData: FormData, userId: string) {
  const [playlist, error] = await handleAsync(async () => {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublic = (formData.get('isPublic') === 'true' || true) as boolean;
    const newPlayList = await prisma.playlist.create({
      data: {
        title,
        description,
        isPublic,
        ownerId: userId,
      },
    });
    return newPlayList;
  });

  if (error) {
    console.error('Create a playlist error ::', error.message);
    return null;
  }

  return playlist;
}

export async function getPlaylistById(id: string) {
  const [playlist, error] = await handleAsync(async () => {
    const fetchedPlaylist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        owner: true,
        videos: true,
      },
    });
    return fetchedPlaylist;
  });

  if (error) {
    console.error('Get playlist by ID error ::', error.message);
    return null;
  }

  return playlist;
}

export async function updatePlaylist(
  id: string,
  userId: string,
  formData: FormData,
) {
  const [playlist, error] = await handleAsync(async () => {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublic = (formData.get('isPublic') === 'true' || true) as boolean;
    const updatePlaylist = await prisma.playlist.update({
      where: {
        id,
        ownerId: userId,
      },
      data: {
        title,
        description,
        isPublic,
      },
    });

    return updatePlaylist;
  });

  if (error) {
    console.error('Update playlist error ::', error.message);
  }
  return playlist;
}

export async function deletePlaylist(id: string, userId: string) {
  const [result, error] = await handleAsync(async () => {
    const isPresent = await prisma.playlist.findUnique({
      where: {
        id,
      },
    });

    if (!isPresent) return { success: true };

    const deletePlaylist = await prisma.playlist.delete({
      where: {
        id,
        ownerId: userId,
      },
    });

    return { success: true };
  });

  if (error) {
    console.error('Delete playlist error ::', error.message);
    return { success: false };
  }

  return result;
}

export async function addVideoToPlaylist(
  videoId: string,
  playlistId: string,
  userId: string,
) {
  const [updatePlaylist, error] = await handleAsync(async () => {
    const video = await prisma.video.findUnique({
      where: {
        videoId,
      },
    });
    if (!video) {
      throw new Error('Video not found');
    }

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) throw new Error('Playlist not found');
    if (playlist.ownerId != userId) throw new Error('Unauthorized access');

    const updatedVideo = await prisma.video.update({
      where: {
        videoId,
      },
      data: {
        playlists: {
          connect: { id: playlistId },
        },
      },
    });
    return { success: true };
  });

  if (error) {
    console.error('Error adding video to the playlist ::', error.message);
    return { success: false };
  }

  return updatePlaylist;
}

export async function removeVideoFromPlaylist(
  videoId: string,
  playlistId: string,
  userId: string,
) {
  const [updatePlaylist, error] = await handleAsync(async () => {
    // Find the video by its videoId
    const video = await prisma.video.findUnique({
      where: {
        videoId,
      },
    });

    // If video is not found, throw an error
    if (!video) {
      throw new Error('Video not found');
    }

    // Find the playlist by its playlistId
    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    // If playlist is not found, throw an error
    if (!playlist) throw new Error('Playlist not found');

    // Ensure the user is the owner of the playlist
    if (playlist.ownerId !== userId) throw new Error('Unauthorized access');

    // Disconnect the video from the playlist (remove from playlist)
    await prisma.video.update({
      where: {
        videoId,
      },
      data: {
        playlists: {
          disconnect: { id: playlistId },
        },
      },
    });

    return { success: true };
  });

  if (error) {
    console.error('Error removing video from the playlist ::', error.message);
    return { success: false, error: error.message }; // Return error message
  }

  return updatePlaylist; // Return success if no error
}
