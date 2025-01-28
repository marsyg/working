'use server';

import { handleAsync } from '@/lib/handleAsync';
import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function syncUser() {
  const [user, error] = await handleAsync(async () => {
    const { userId } = await auth(); // Get Clerk user ID
    const currentUserData = await currentUser(); // Get Clerk user data

    if (!userId || !currentUserData) return null; // Check if the user data is available

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId, // Check if user already exists in DB
      },
    });

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: {
          clerkId: userId,
        },
        data: {
          avatarUrl: currentUserData.imageUrl,
        },
      });
      console.log('Exisiting  user');
      return updatedUser;
    } // If user exists, return them

    // If user doesn't exist, create a new user in DB
    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: currentUserData.emailAddresses[0].emailAddress, // User's email from Clerk
        username:
          currentUserData.username ??
          currentUserData.emailAddresses[0].emailAddress.split('@')[0], // Default username from email
        avatarUrl: currentUserData.imageUrl, // Avatar URL from Clerk
      },
    });

    return dbUser; // Return newly created user
  });

  if (error) {
    console.error('Sync user error ::', error.message);
    return null;
  }

  console.log('syn user result ::', user);
  return user; // Return the synced user (either from DB or new)
}

export async function getUserByClerkId(clerkId: string) {
  const [user, error] = await handleAsync(async () => {
    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId,
      },
      include: {
        _count: {
          select: {
            playlists: true,
            bookmarks: true,
            badges: true,
          },
        },
      },
    });
    return dbUser;
  });

  if (error) {
    console.error('Get user by clerkId error ::', error.message);
    return null; // Optional: you can return null or a default value
  }

  console.log('clerk id user ::', user);
  return user;
}

export async function getDbUserId() {
  const [id, error] = await handleAsync(async () => {
    const { userId: clerkId } = await auth(); // Get the userId from Clerk authentication
    if (!clerkId) return null; // If no clerkId, return null

    const user = await getUserByClerkId(clerkId); // Fetch user data using Clerk ID

    if (!user) throw new Error('User not found'); // If no user found, throw error
    return user.id; // Return the user ID from the database
  });

  if (error) {
    console.error('Get db user id error ::', error.message);
    return null; // Return null in case of error
  }
  console.log("db user id ::,",id);
  return id; // Return the database user ID if successful
}

export async function updateProfile(formData: FormData) {
  const [result, error] = await handleAsync(async () => {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error('Unauthorized');

    const username = formData.get('username') as string;
    const email = formData.get('email') as string;

    // Update user in the database
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        username: username,
        email: email,
      },
    });
    return user;
  });

  if (error) {
    console.error('Error updating profile:', error.message);
    return null;
  }

  return result;
}

export async function updateToken(userId: string, amount: number) {
  const [updatedUser, error] = await handleAsync(async () => {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        tokens: { increment: amount },
      },
    });
  });

  if (error) {
    console.error('Update tokens error ::', error.message);
    return null;
  }

  return updatedUser;
}

export async function resetStreak(userId: string) {
  const [user, error] = await handleAsync(async () => {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        streak: 0,
      },
    });
  });

  if (error) {
    console.error('Reset streak error ::', error.message);
    return null;
  }

  return user;
}

export async function incrementStreak(userId: string) {
  const [user, error] = await handleAsync(async () => {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        streak: {
          increment: 1,
        },
      },
    });
  });

  if (error) {
    console.error('Increment streak error ::', error.message);
  }

  return user;
}

export async function getUserPlaylists(userId: string) {
  const [playlists, error] = await handleAsync(async () => {
    return prisma.playlist.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        videos: true,
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  if (error) {
    console.error('Get user playlist error ::', error.message);
    return [];
  }

  return playlists;
}

export async function getLeaderboardDataByTokens(limit: number = 10) {
  const [users, error] = await handleAsync(async () => {
    return prisma.user.findMany({
      orderBy: { tokens: 'desc' },
      take: limit,
      select: {
        username: true,
        tokens: true,
        streak: true,
        avatarUrl: true,
      },
    });
  });

  if (error) {
    console.error('Get leaderboard data by tokens error ::', error.message);
    return [];
  }
  console.log("getleaderboardBy token ::", users);
  return users;
}

export async function getLeaderboardDataByStreak(limit: number = 10) {
  const [users, error] = await handleAsync(async () => {
    return prisma.user.findMany({
      orderBy: { streak: 'desc' },
      take: limit,
      select: {
        username: true,
        tokens: true,
        streak: true,
        avatarUrl: true,
      },
    });
  });

  if (error) {
    console.error('Get leaderboard data by streak error ::', error.message);
    return [];
  }
  console.log("Get leaderboar by streak ::", users);
  return users;
}


export async function getUserNotes(userId: string) {
  const [notes, error] = await handleAsync(async () => {
    return prisma.note.findMany({
      where: {
        userId: userId, // Fetch notes for the specific user
      },
      include: {
        video: true, // Include the associated video data
      },
      orderBy: {
        video: {
          title: 'asc', // Sort notes by the video title or any field you prefer
        },
      },
    });
  });

  if (error) {
    console.error('Get user notes error ::', error.message);
    return [];
  }

  return notes;
}
