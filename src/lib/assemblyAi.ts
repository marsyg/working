'use server';
import YTDlpWrap from 'yt-dlp-wrap';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { AssemblyAI } from 'assemblyai';

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: 'YOUR_ASSEMBLYAI_API_KEY',
});

// Initialize yt-dlp
const ytdlp = new YTDlpWrap();
const audioDir = './audio';

// Ensure audio directory exists
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

// Set FFmpeg binary path
ffmpeg.setFfmpegPath(ffmpegPath as string);

/**
 * Function to download and transcribe a YouTube video.
 * @param {string} videoId - The YouTube video ID (e.g., 'dQw4w9WgXcQ').
 */
export async function downloadAndTranscribeVideo(videoId: string) {
  console.log(`Downloading and transcribing video ID: ${videoId}...`);

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const tempAudioPath = path.join(audioDir, `temp_${videoId}.m4a`);
    const finalMp3Path = path.join(audioDir, `audio_${videoId}.mp3`);

    console.log(`Downloading audio for video ID: ${videoId}...`);

    // Download audio in original format (M4A or other)
    await ytdlp.exec([
      videoUrl,
      '-x', // Extract audio only
      '--audio-format',
      'm4a', // Get best audio format
      '-o',
      tempAudioPath, // Temporary output file
    ]);

    console.log(`Audio downloaded as ${tempAudioPath}. Converting to MP3...`);

    // Convert M4A to MP3 using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempAudioPath)
        .toFormat('mp3')
        .audioBitrate(192)
        .on('end', () => {
          console.log(`Conversion successful! MP3 saved at: ${finalMp3Path}`);
          fs.unlinkSync(tempAudioPath); // Remove temp file
          resolve(true);
        })
        .on('error', (err) => {
          console.error('FFmpeg conversion error:', err);
          reject(err);
        })
        .save(finalMp3Path);
    });

    // Start transcription process
    await transcribeAudio(finalMp3Path);

    return {
      success: true,
      filePath: finalMp3Path,
    };
  } catch (error) {
    console.error('Error downloading/converting audio:', error);
    throw new Error(`Failed to process audio: ${error.message}`);
  }
}
