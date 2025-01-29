from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import SRTFormatter
from google.cloud import language_v1

def get_video_caption(video_id):
    try:
        # Fetch the transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Format the transcript to SRT
        formatter = SRTFormatter()
        srt_caption = formatter.format_transcript(transcript)
        
        return srt_caption

    except Exception as e:
        return f"Error fetching captions: {e}"

def create_quiz(captions, num_questions=20):
    """
    Creates a quiz from the given captions using the Gemini API.

    Args:
        captions: The SRT formatted captions.
        num_questions: The desired number of questions.

    Returns:
        A list of dictionaries, where each dictionary represents a quiz question 
        with the following keys:
            - question: The quiz question.
            - options: A list of four answer options.
            - correct_answer: The index of the correct answer in the options list.
    """

    # 1. Split captions into sentences
    sentences = captions.split('\n\n') 

    # 2. Filter out empty sentences
    sentences = [s for s in sentences if s.strip()]

    # 3. Extract keywords from each sentence using Google Cloud Natural Language API
    client = language_v1.LanguageServiceClient()
    questions = []
    for sentence in sentences:
        document = language_v1.Document(
            content=sentence,
            type_=language_v1.Document.Type.PLAIN_TEXT,
        )
        response = client.analyze_syntax(request={"document": document})
        tokens = response.tokens
        keywords = [token.text.content for token in tokens if token.part_of_speech.tag == 'NOUN'] 
        if keywords:
            questions.append((sentence, keywords))

    # 4. Generate quiz questions using Gemini API
    quiz_questions = []
    for sentence, keywords in questions[:num_questions]:
        # Example Gemini API prompt:
        prompt = f"Create a multiple-choice quiz question based on the following sentence: '{sentence}'. " \
                 f"Include the following keywords in the question or answer options: {', '.join(keywords)}. " \
                 f"Provide four answer options, one of which is the correct answer. " \
                 f"Format the output as follows: {{'question': 'Your question here', 'options': ['Option 1', 'Option 2', 'Option 3', 'Option 4'], 'correct_answer': 0}}" 

        # **Note:** You'll need to implement the actual Gemini API call here. 
        # This will vary depending on your specific Gemini API integration.

        # Example placeholder for Gemini API response
        quiz_question = {
            'question': f"Question based on: '{sentence}'", 
            'options': ['Option 1', 'Option 2', 'Option 3', 'Option 4'], 
            'correct_answer': 0 
        } 

        quiz_questions.append(quiz_question)

    return quiz_questions

if __name__ == "__main__":
    video_id = input("Enter the YouTube video ID: ")
    captions = get_video_caption(video_id)

    if captions:
        quiz = create_quiz(captions)
        if quiz:
            print("\nQuiz Questions:\n")
            for i, question in enumerate(quiz):
                print(f"Question {i+1}:")
                print(f"  {question['question']}")
                for j, option in enumerate(question['options']):
                    print(f"  {chr(ord('A')+j)}) {option}")
                print(f"  Correct Answer: {chr(ord('A')+question['correct_answer'])}\n")
        else:
            print("No quiz questions could be generated.")
    else:
        print("No captions available.")