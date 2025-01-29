import { useState } from 'react';

export default function Home() {
  const [videoId, setVideoId] = useState('');
  const [quiz, setQuiz] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz.');
      }

      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error(error);
      // Handle error (e.g., display an error message)
    }
  };

  return (
    <div>
      <h1>YouTube Quiz Generator</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter YouTube video ID"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        />
        <button type="submit">Generate Quiz</button>
      </form>

      {quiz && (
        <div>
          <h2>Quiz Questions:</h2>
          {/* Render quiz questions (similar to the previous example) */}
        </div>
      )}
    </div>
  );
}