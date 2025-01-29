import { YouTubeTranscriptApi } from 'youtube-transcript-api';
import { SRTFormatter } from 'youtube-transcript-api/formatters';

export async function getVideoCaption(videoId) {
  try {
    const transcript = await YouTubeTranscriptApi.getTranscript(videoId);
    const formatter = new SRTFormatter();
    return formatter.format_transcript(transcript);
  } catch (error) {
    console.error('Error fetching captions:', error);
    return null;
  }
}