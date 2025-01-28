'use server';

import { handleAsync } from '@/lib/handleAsync';
import prisma from '@/lib/prisma';

export async function createBadge(data: {
  name: string;
  description: string;
  iconUrl: string;
}) {
  const [badge, error] = await handleAsync(async () => {
    const newBadge = await prisma.badge.create({
      data,
    });
    return newBadge;
  });

  if (error) {
    console.error('Error creating badge:', error.message);
    return null;
  }

  return badge;
}

export async function getAllBadges() {
  const [badges, error] = await handleAsync(async () => {
    const allBadges = await prisma.badge.findMany();
    return allBadges;
  });

  if (error) {
    console.error('Error fetching badges:', error.message);
    return null;
  }

  return badges;
}

export async function getBadgeById(badgeId: string) {
  const [badge, error] = await handleAsync(async () => {
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });
    return badge;
  });

  if (error) {
    console.error('Error fetching badge by ID:', error.message);
    return null;
  }

  return badge;
}

export async function updateBadge(
  badgeId: string,
  data: { name?: string; description?: string; iconUrl?: string },
) {
  const [updatedBadge, error] = await handleAsync(async () => {
    const badge = await prisma.badge.update({
      where: { id: badgeId },
      data,
    });
    return badge;
  });

  if (error) {
    console.error('Error updating badge:', error.message);
    return null;
  }

  return updatedBadge;
}

export async function deleteBadge(badgeId: string) {
  const [result, error] = await handleAsync(async () => {
    await prisma.badge.delete({
      where: { id: badgeId },
    });
    return { success: true };
  });

  if (error) {
    console.error('Error deleting badge:', error.message);
    return { success: false };
  }

  return result;
}

export async function assignBadgeToUser(badgeId: string, userId: string) {
  const [result, error] = await handleAsync(async () => {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        badges: {
          connect: { id: badgeId },
        },
      },
    });
    return updatedUser;
  });

  if (error) {
    console.error('Error assigning badge to user:', error.message);
    return null;
  }

  return result;
}

export async function removeBadgeFromUser(badgeId: string, userId: string) {
  const [result, error] = await handleAsync(async () => {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        badges: {
          disconnect: { id: badgeId },
        },
      },
    });
    return updatedUser;
  });

  if (error) {
    console.error('Error removing badge from user:', error.message);
    return null;
  }

  return result;
}

export async function getUserBadges(userId: string) {
  const [badges, error] = await handleAsync(async () => {
    const userWithBadges = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        badges: true, // Get all badges assigned to the user
      },
    });

    if (!userWithBadges) {
      throw new Error('User not found');
    }

    return userWithBadges.badges;
  });

  if (error) {
    console.error('Error fetching user badges:', error.message);
    return null;
  }

  return badges;
}
