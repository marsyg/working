'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { downloadAndTranscribeVideo } from '@/lib/assemblyAi';
import { getYouTubeTranscript } from '@/lib/transcript';
import { fetchPlaylistItems } from '@/lib/youtube';

export default function PlayerPage() {
  const fetchCaptions = async (videoId: string) => {
    const response = await fetch(`/api/getCaptions?videoId=${videoId}`);
    const data = await response.json();
    if (response.ok) {
      console.log(data.captions);
    } else {
      console.error(data.error);
    }
  };

  // Example usage

  const searchParams = useSearchParams();
  const router = useRouter();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistData, setPlaylistData] = useState<{
    videos: any[];
    currentVideoId: string;
    currentIndex: number;
  } | null>(null);
  const currentVideoId = searchParams.get('videoId');
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (currentVideoId) {
      setVideoId(currentVideoId);
    }
  }, [currentVideoId]);

  useEffect(() => {
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
            const response = await fetchPlaylistItems(
              session.accessToken,
              'PLRAV69dS1uWTvNby0b1w_boT35Onv5YWS',
            );
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
  }, [session]);

  const handleVideoSelect = (videoId: string) => {
    setVideoId(videoId);
    router.push(`/player?videoId=${videoId}`);
  };
  const handleStartQuiz = (videoId: string) => {};
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
          <div>
            <button onClick={() => fetchCaptions(videoId)}>startquiz</button>
            <VideoPlayer videoId={videoId} />
          </div>
        ) : (
          <Card className="p-6">
            <CardContent>
              No video selected. Please choose one from the playlist.
            </CardContent>
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

function NotesEditor() {
  const [notes, setNotes] = useState('');

  const handleBold = () => setNotes((prev) => prev + '**bold** ');
  const handleItalic = () => setNotes((prev) => prev + '_italic_ ');

  return (
    <Card className="shadow-md border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            onClick={handleBold}
            className="text-sm px-3 py-1.5 border border-gray-300 hover:bg-gray-100"
          >
            Bold
          </Button>
          <Button
            variant="outline"
            onClick={handleItalic}
            className="text-sm px-3 py-1.5 border border-gray-300 hover:bg-gray-100"
          >
            Italic
          </Button>
        </div>
        <Textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes here..."
        />
      </CardContent>
    </Card>
  );
}

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
        <CardTitle className="text-lg">
          {currentVideo?.snippet.title || 'Playlist'}
        </CardTitle>
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
