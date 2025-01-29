import { LanguageServiceClient } from '@google-cloud/language';
import { generate_quiz_question } from './api'; // Import your Gemini API call function

const languageClient = new LanguageServiceClient();

export async function createQuiz(captions) {
  const sentences = captions.split('\n\n').filter(Boolean);

  const quizQuestions = [];
  for (const sentence of sentences) {
    try {
      const document = {
        content: sentence,
        type_: 'PLAIN_TEXT',
      };
      const [result] = await languageClient.analyzeSyntax({ document });
      const tokens = result.tokens;
      const keywords = tokens
        .filter(
          (token) => token.partOfSpeech.tag === 'NOUN' 
        )
        .map((token) => token.text.content);

      if (keywords.length > 0) {
        const prompt = `Create a multiple-choice quiz question based on the following sentence: '${sentence}'. Include the following keywords in the question or answer options: ${keywords.join(
          ', '
        )}. Provide four answer options, one of which is the correct answer. Format the output as follows: {{'question': 'Your question here', 'options': ['Option 1', 'Option 2', 'Option 3', 'Option 4'], 'correct_answer': 0}}`;

        const response = await generate_quiz_question(prompt); 
        quizQuestions.push(response); 
      }
    } catch (error) {
      console.error('Error processing sentence:', error);
    }
  }

  return quizQuestions;
}