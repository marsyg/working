'use server';
import { google } from 'googleapis';

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface Thumbnails {
  default: Thumbnail;
  medium?: Thumbnail;
  high?: Thumbnail;
}

interface PlaylistItemSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: {
    kind: string;
    videoId: string; // This is the video ID
  };
}

interface PlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: PlaylistItemSnippet;
}

interface PlaylistItemsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: PlaylistItem[];
}

export const fetchPlaylistItems = async (
  accessToken: string,
  playlistId: string, // Add playlistId as a parameter
): Promise<PlaylistItemsResponse> => {
  try {
    if (!playlistId) {
      throw new Error('playlistId is required to fetch playlist items.');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    let allItems: PlaylistItem[] = [];
    let nextPageToken = '';

    do {
      const response = await youtube.playlistItems.list({
        part: 'snippet,contentDetails', // Include both snippet and contentDetails
        playlistId, // Use playlistId here
        maxResults: 50, // Adjust as needed
        pageToken: nextPageToken,
      });

      if (response.data.items) {
        allItems = allItems.concat(response.data.items);
      }
      nextPageToken = response.data.nextPageToken || '';
    } while (nextPageToken);

    return {
      kind: 'youtube#playlistItemListResponse',
      etag: 'etag',
      nextPageToken: undefined,
      prevPageToken: undefined,
      pageInfo: {
        totalResults: allItems.length,
        resultsPerPage: 50, // Adjust as needed
      },
      items: allItems,
    };
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    throw error;
  }
};
