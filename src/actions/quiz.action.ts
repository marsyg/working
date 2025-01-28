"use server"

import { handleAsync } from '@/lib/handleAsync';
import prisma from '@/lib/prisma';

export async function createQuiz(videoId: string, questionIds: string[]) {
  const [quiz, error] = await handleAsync(async () => {
    const createdQuiz = await prisma.quiz.create({
      data: {
        videoId,
        questions: {
          connect: questionIds.map((id) => ({ id })),
        },
      },
    });
    return createdQuiz;
  });

  if (error) {
    console.error('Error creating quiz:', error.message);
    return null;
  }

  return quiz;
}

export async function getQuizById(quizId: string) {
  const [quiz, error] = await handleAsync(async () => {
    const fetchedQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true, // Include related questions
        video: true, // Include the associated video
      },
    });

    if (!fetchedQuiz) throw new Error('Quiz not found');
    return fetchedQuiz;
  });

  if (error) {
    console.error('Error fetching quiz:', error.message);
    return null;
  }

  return quiz;
}

export async function updateQuiz(quizId: string, questionIds: string[]) {
  const [updatedQuiz, error] = await handleAsync(async () => {
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        questions: {
          set: [], // Clear existing questions first
          connect: questionIds.map((id) => ({ id })),
        },
      },
      include: {
        questions: true,
      },
    });
    return quiz;
  });

  if (error) {
    console.error('Error updating quiz:', error.message);
    return null;
  }

  return updatedQuiz;
}

export async function deleteQuiz(quizId: string) {
  const [deletedQuiz, error] = await handleAsync(async () => {
    const quiz = await prisma.quiz.delete({
      where: { id: quizId },
    });
    return quiz;
  });

  if (error) {
    console.error('Error deleting quiz:', error.message);
    return null;
  }

  return deletedQuiz;
}
