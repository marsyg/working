import { NextApiRequest, NextApiResponse } from 'next';
import { getVideoCaption } from './utils/captions';
import { createQuiz } from './utils/quiz';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { videoId } = req.body;

  try {
    const captions = await getVideoCaption(videoId);
    if (!captions) {
      return res.status(400).json({ error: 'No captions found.' });
    }

    const quiz = await createQuiz(captions);
    res.status(200).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
}