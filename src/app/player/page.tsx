'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronLeft, ChevronRight, Bold, Italic } from 'lucide-react';

export default function PlayerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistData, setPlaylistData] = useState<{
    videos: any[];
    currentVideoId: string;
    currentIndex: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const currentVideoId = searchParams.get('videoId');
    setVideoId(currentVideoId);

    if (session?.accessToken) {
      const loadPlaylists = async () => {
        setIsLoading(true);
        try {
          const storedPlaylist = localStorage.getItem('currentPlaylist');
          if (storedPlaylist) {
            setPlaylistData(JSON.parse(storedPlaylist));
          } else {
            // Fetch playlist items here if needed
            // Mocked for now
            const response = await fetchPlaylistItems(session.accessToken, 'PLRAV69dS1uWTvNby0b1w_boT35Onv5YWS');
            setPlaylists(response.items);
          }
        } catch (error) {
          console.error('Error fetching playlists:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadPlaylists();
    }
  }, [searchParams, session]);

  const handleVideoSelect = (videoId: string) => {
    setVideoId(videoId);
    router.push(`/player?videoId=${videoId}`);
  };

  const handleNextVideo = () => {
    if (
      playlistData &&
      playlistData.currentIndex < playlistData.videos.length - 1
    ) {
      const nextIndex = playlistData.currentIndex + 1;
      const nextVideo = playlistData.videos[nextIndex];
      const nextVideoId = nextVideo.snippet.resourceId.videoId;

      localStorage.setItem(
        'currentPlaylist',
        JSON.stringify({
          ...playlistData,
          currentVideoId: nextVideoId,
          currentIndex: nextIndex,
        }),
      );

      router.push(`/player?videoId=${nextVideoId}`);
    }
  };

  const handlePreviousVideo = () => {
    if (playlistData && playlistData.currentIndex > 0) {
      const prevIndex = playlistData.currentIndex - 1;
      const prevVideo = playlistData.videos[prevIndex];
      const prevVideoId = prevVideo.snippet.resourceId.videoId;

      localStorage.setItem(
        'currentPlaylist',
        JSON.stringify({
          ...playlistData,
          currentVideoId: prevVideoId,
          currentIndex: prevIndex,
        }),
      );

      router.push(`/player?videoId=${prevVideoId}`);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
        <h1 className="text-3xl font-bold text-primary">Sign in to Continue</h1>
        <Button variant="outline" size="lg" onClick={() => signIn('google')}>
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-background min-h-screen">
      <div className="lg:w-3/4">
        {videoId ? (
          <VideoPlayer videoId={videoId} />
        ) : (
          <Card className="p-6">
            <CardContent>No video selected. Please choose one from the playlist.</CardContent>
          </Card>
        )}
        <div className="mt-6">
          <NotesEditor />
        </div>
      </div>
      <div className="lg:w-1/4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <Playlist
            playlistData={playlistData}
            onNext={handleNextVideo}
            onPrev={handlePreviousVideo}
            onSelect={handleVideoSelect}
          />
        )}
      </div>
    </div>
  );
}

function VideoPlayer({ videoId }: { videoId: string }) {
  const videoUrl = `https://www.youtube.com/embed/${videoId}`;
  return (
    <Card className="overflow-hidden">
      <iframe
        src={videoUrl}
        className="w-full h-64 sm:h-80 lg:h-[500px] rounded-lg border-none"
        title="YouTube Video Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Card>
  );
}

// import { Button, Card, CardHeader, CardTitle, CardContent, Textarea } from 'shadcn'; // Ensure ShadCN components are imported correctly
// import { useState } from 'react';
// import { Button, Card, CardHeader, CardTitle, CardContent, Textarea } from 'shadcn';
import { Mic, Edit } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';

const NotesEditor = () => {
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);

  // Initialize speech recognition on component mount
  useEffect(() => {
    initSpeechRecognition();
  }, []);

  const initSpeechRecognition = useCallback(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech Recognition is not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setError('');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        setNotes(prev => {
          const lastChar = prev.slice(-1);
          const space = lastChar && lastChar !== ' ' ? ' ' : '';
          return prev + space + transcript;
        });
      };

      setSpeechRecognition(recognition);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleVoiceRecording = useCallback(() => {
    if (!speechRecognition) {
      initSpeechRecognition();
      return;
    }

    try {
      if (isRecording) {
        speechRecognition.stop();
      } else {
        speechRecognition.start();
      }
    } catch (err) {
      setError(`Failed to ${isRecording ? 'stop' : 'start'} recording: ${err.message}`);
    }
  }, [speechRecognition, isRecording, initSpeechRecognition]);

  const handleTextFormat = useCallback((format: 'bold' | 'italic') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    
    const formatMap = {
      bold: `**${selectedText}**`,
      italic: `_${selectedText}_`
    };

    const newText = notes.substring(0, start) + formatMap[format] + notes.substring(end);
    setNotes(newText);
  }, [notes]);

  const handleTextImprovement = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      // Simulated API call - replace with actual AI service
      const response = await fetch('your-ai-service-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notes })
      });

      if (!response.ok) {
        throw new Error('Failed to improve text');
      }

      const { improvedText } = await response.json();
      setNotes(improvedText);
    } catch (err) {
      setError(`Failed to improve text: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Smart Notes Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleTextFormat('bold')}
            className="flex items-center gap-2"
          >
            <Bold className="w-4 h-4" />
            Bold
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleTextFormat('italic')}
            className="flex items-center gap-2"
          >
            <Italic className="w-4 h-4" />
            Italic
          </Button>
          
          <Button
            variant="outline"
            onClick={handleVoiceRecording}
            className={`flex items-center gap-2 ${isRecording ? 'bg-red-100 hover:bg-red-200' : ''}`}
            disabled={isProcessing}
          >
            <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleTextImprovement}
            className="flex items-center gap-2"
            disabled={isProcessing || !notes.trim()}
          >
            <Edit className="w-4 h-4" />
            {isProcessing ? 'Improving...' : 'Improve Text'}
          </Button>
        </div>

        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write or dictate your notes here..."
          className="min-h-[200px] w-full"
        />
      </CardContent>
    </Card>
  );
};





function Playlist({
  playlistData,
  onNext,
  onPrev,
  onSelect,
}: {
  playlistData: any;
  onNext: () => void;
  onPrev: () => void;
  onSelect: (videoId: string) => void;
}) {
  if (!playlistData) {
    return <p>Loading playlist...</p>;
  }

  const currentVideo = playlistData.videos[playlistData.currentIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{currentVideo?.snippet.title || 'Playlist'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {playlistData.videos.map((video: any, index: number) => (
            <div
              key={video.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                index === playlistData.currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => onSelect(video.snippet.resourceId.videoId)}
            >
              <div className="flex items-center gap-4">
                <img
                  width={96}
                  height={54}
                  src={
                    video.snippet.thumbnails?.default?.url || '/placeholder.png'
                  }
                  alt={video.snippet.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium line-clamp-2">
                    {video.snippet.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <Button
            onClick={onPrev}
            disabled={playlistData.currentIndex === 0}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="mr-2" /> Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={
              playlistData.currentIndex === playlistData.videos.length - 1
            }
            variant="outline"
            size="sm"
          >
            Next <ChevronRight className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
