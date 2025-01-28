'use server';

import { handleAsync } from '@/lib/handleAsync';
import prisma from '@/lib/prisma';

export async function createBookmark(
  userId: string,
  videoId: string,
  timestamp: number,
  note?: string,
) {
  const [bookmark, error] = await handleAsync(async () => {
    const createdBookmark = await prisma.bookmark.create({
      data: {
        userId,
        videoId,
        timestamp,
        note,
      },
    });
    return createdBookmark;
  });

  if (error) {
    console.error('Error creating bookmark:', error.message);
    return null;
  }

  return bookmark;
}

export async function getBookmarkById(bookmarkId: string) {
  const [bookmark, error] = await handleAsync(async () => {
    const fetchedBookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      include: {
        user: true, // Include user details
        video: true, // Include video details
      },
    });

    if (!fetchedBookmark) throw new Error('Bookmark not found');
    return fetchedBookmark;
  });

  if (error) {
    console.error('Error fetching bookmark:', error.message);
    return null;
  }

  return bookmark;
}

export async function getBookmarksByUser(userId: string) {
  const [bookmarks, error] = await handleAsync(async () => {
    const userBookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        video: true, // Include video details for each bookmark
      },
    });

    if (!userBookmarks.length)
      throw new Error('No bookmarks found for this user');
    return userBookmarks;
  });

  if (error) {
    console.error('Error fetching bookmarks:', error.message);
    return [];
  }

  return bookmarks;
}

export async function getBookmarksByVideo(videoId: string) {
  const [bookmarks, error] = await handleAsync(async () => {
    const videoBookmarks = await prisma.bookmark.findMany({
      where: { videoId },
      include: {
        user: true, // Include user details for each bookmark
      },
    });

    if (!videoBookmarks.length)
      throw new Error('No bookmarks found for this video');
    return videoBookmarks;
  });

  if (error) {
    console.error('Error fetching bookmarks:', error.message);
    return [];
  }

  return bookmarks;
}

export async function updateBookmark(bookmarkId: string, note?: string) {
  const [updatedBookmark, error] = await handleAsync(async () => {
    const updated = await prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        note,
      },
    });
    return updated;
  });

  if (error) {
    console.error('Error updating bookmark ::', error.message);
    return null;
  }

  return updatedBookmark;
}

export async function deleteBookmark(bookmarkId: string) {
  const [deletedBookmark, error] = await handleAsync(async () => {
    const deleted = await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
    return deleted;
  });

  if (error) {
    console.error('Error deleting bookmark:', error.message);
    return null;
  }

  return deletedBookmark;
}
