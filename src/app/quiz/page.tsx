'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Smile } from 'lucide-react';

export default function QuizParticipant() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const quizData = [
    {
      question: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin', 'Madrid'],
      answer: 'Paris',
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
      answer: 'Mars',
    },
  ];

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const progressPercentage = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <div className="flex flex-col gap-8 p-6 min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-4xl font-extrabold text-primary mb-6 tracking-wide">AI-Powered Quiz</h1>
      <Progress value={progressPercentage} className="w-full max-w-2xl mb-6 h-4 bg-gray-700" />
      {!showResult ? (
        <Card className="w-full max-w-2xl shadow-xl border border-gray-700 rounded-2xl bg-gray-900 p-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary text-center">
              Question {currentQuestion + 1} of {quizData.length}
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <p className="text-lg font-medium mb-6 text-center text-gray-300">
              {quizData[currentQuestion].question}
            </p>
            <div className="grid gap-4">
              {quizData[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedOption === option ? 'default' : 'outline'}
                  size="lg"
                  className={`w-full text-left p-4 flex justify-between items-center rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border-2 text-white ${
                    selectedOption === option && option === quizData[currentQuestion].answer
                      ? 'bg-green-700 border-green-500'
                      : selectedOption === option
                        ? 'bg-red-700 border-red-500'
                        : 'hover:bg-gray-700'
                  }`}
                  onClick={() => handleOptionClick(option)}
                  disabled={!!selectedOption}
                >
                  {option}
                  {selectedOption && (
                    option === quizData[currentQuestion].answer ? (
                      <CheckCircle className="text-green-400" />
                    ) : selectedOption === option ? (
                      <XCircle className="text-red-400" />
                    ) : null
                  )}
                </Button>
              ))}
            </div>
            {selectedOption && (
              <div className="mt-4 text-center text-sm text-gray-400">
                {selectedOption === quizData[currentQuestion].answer
                  ? 'Great choice! You got it right! ✅'
                  : 'Oops! Better luck with the next question. ❌'}
              </div>
            )}
            {selectedOption && (
              <Button
                className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleNextQuestion}
              >
                {currentQuestion === quizData.length - 1 ? 'View Results' : 'Next Question'}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-2xl shadow-xl border border-gray-700 rounded-2xl text-center bg-gray-900 p-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              Quiz Completed 🎉
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <p className="text-lg font-medium mb-4 text-gray-300">
              Congratulations! You have completed the quiz.
            </p>
            <p className="text-base mb-6 text-gray-400">
              You answered {quizData.filter((q) => q.answer === selectedOption).length} out of {quizData.length} questions correctly.
            </p>
            <Smile className="text-blue-400 mx-auto mb-6" size={48} />
            <Button className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              Retry Quiz
            </Button>
          </CardContent>
        </Card>
      )}
      <footer className="text-sm text-gray-400 mt-8">
        🚀 Powered by AI • Making learning fun and interactive
      </footer>
    </div>
  );
}
