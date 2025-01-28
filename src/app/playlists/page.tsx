'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Youtube, LogOut } from 'lucide-react';
import ModeToggle from '@/components/ModeToggle';
import { fetchPlaylistItems } from '@/lib/youtube';
import { Button } from '@/components/ui/button';

interface PlaylistItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium?: { url: string };
      default?: { url: string };
    };
    resourceId: {
      videoId: string;
    };
  };
}

// Individual video card component
const VideoCard = ({ 
  video, 
  onPlay 
}: { 
  video: PlaylistItem; 
  onPlay: (videoId: string, video: PlaylistItem) => void;
}) => (
  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className="relative">
      <img
        className="w-full h-48 object-cover"
        src={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || '/placeholder.png'}
        alt={video.snippet.title}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
        <Button
          onClick={() => onPlay(video.snippet.resourceId.videoId, video)}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
          variant="secondary"
        >
          <Play className="w-4 h-4 mr-2" />
          Watch Now
        </Button>
      </div>
    </div>
    <CardContent className="p-4">
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
        {video.snippet.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {video.snippet.description || 'No description available'}
      </p>
    </CardContent>
  </Card>
);

export default function Home() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (session?.accessToken) {
      const loadPlaylists = async () => {
        try {
          const response = await fetchPlaylistItems(
            session.accessToken,
            'PLRAV69dS1uWTvNby0b1w_boT35Onv5YWS'
          );
          setPlaylists(response.items);
        } catch (error) {
          console.error('Error loading playlists:', error);
        }
      };
      loadPlaylists();
    }
  }, [session]);

  const handleNavigate = (videoId: string, video: PlaylistItem) => {
    localStorage.setItem(
      'currentPlaylist',
      JSON.stringify({
        videos: playlists,
        currentVideoId: videoId,
        currentIndex: playlists.findIndex(
          (item) => item.snippet.resourceId.videoId === videoId
        ),
      })
    );
    router.push(`/player?videoId=${videoId}`);
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Course Library</h1>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {session && (
            <Button
              onClick={() => signOut()}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>

      {!session ? (
        <Card className="max-w-md mx-auto mt-20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Youtube className="w-6 h-6 text-red-500" />
              Sign in to Access Videos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button
              onClick={() => signIn('google')}
              className="flex items-center gap-2"
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Play className="w-6 h-6 text-blue-500" />
              Available Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {playlists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading videos...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={handleNavigate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}