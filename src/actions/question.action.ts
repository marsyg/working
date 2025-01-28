'use server';

import { handleAsync } from '@/lib/handleAsync';
import prisma from '@/lib/prisma';

export async function createQuestion(formData: FormData) {
  const [question, error] = await handleAsync(async () => {
    const quizId = formData.get('quizId') as string;
    const text = formData.get('text') as string;
    const options = formData.getAll('options[]') as string[]; // Assuming options are submitted as an array with key 'options[]'
    const correctAnswer = parseInt(formData.get('correctAnswer') as string, 10);
    const explanation = formData.get('explanation')
      ? (formData.get('explanation') as string)
      : undefined;

    const createdQuestion = await prisma.question.create({
      data: {
        quizId,
        text,
        options,
        correctAnswer,
        explanation,
      },
    });

    return createdQuestion;
  });

  if (error) {
    console.error('Error creating question:', error.message);
    return null;
  }

  return question;
}

export async function getQuestionById(questionId: string) {
  const [question, error] = await handleAsync(async () => {
    const fetchedQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: true, // Include quiz details for each question
      },
    });

    if (!fetchedQuestion) throw new Error('Question not found');
    return fetchedQuestion;
  });

  if (error) {
    console.error('Error fetching question:', error.message);
    return null;
  }

  return question;
}

export async function getQuestionsByQuiz(quizId: string) {
  const [questions, error] = await handleAsync(async () => {
    const quizQuestions = await prisma.question.findMany({
      where: { quizId },
    });

    if (!quizQuestions.length)
      throw new Error('No questions found for this quiz');
    return quizQuestions;
  });

  if (error) {
    console.error('Error fetching questions:', error.message);
    return [];
  }

  return questions;
}

export async function updateQuestion(
  questionId: string,
  text?: string,
  options?: string[],
  correctAnswer?: number,
  explanation?: string,
) {
  const [updatedQuestion, error] = await handleAsync(async () => {
    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        options,
        correctAnswer,
        explanation,
      },
    });
    return updated;
  });

  if (error) {
    console.error('Error updating question:', error.message);
    return null;
  }

  return updatedQuestion;
}

export async function deleteQuestion(questionId: string) {
  const [deletedQuestion, error] = await handleAsync(async () => {
    const deleted = await prisma.question.delete({
      where: { id: questionId },
    });
    return deleted;
  });

  if (error) {
    console.error('Error deleting question:', error.message);
    return null;
  }

  return deletedQuestion;
}
