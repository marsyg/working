import axios from 'axios';
import { getSubtitles } from 'youtube-captions-scraper';

export async function getYouTubeTranscript(videoUrl) {
  const options = {
    method: 'POST',
    url: 'https://youtube-transcript1.p.rapidapi.com/transcribe',
    headers: {
      'x-rapidapi-key': '144449351cmshd28cef1da52e7f6p169584jsne9058320eef9',
      'x-rapidapi-host': 'youtube-transcript1.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    data: {
      url: videoUrl,
      lang: 'en',
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error if you want to handle it outside the function
  }
}
export async function getYouTubeSubtitles(videoId) {
  try {
    const captions = await getSubtitles({
      videoID: videoId,
      lang: 'en',
    });
    return captions;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// getSubtitles({
//   videoID: 'XXXXX', // youtube video id
//   lang: 'fr', // default: `en`
// }).then((captions) => {
//   console.log(captions);
// });

//
