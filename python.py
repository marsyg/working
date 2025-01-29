import sys
from pytube import YouTube

def get_youtube_captions(video_id):
    try:
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        yt = YouTube(video_url)
        captions = yt.captions
        if captions:
            caption_track = captions['a.en']
            if caption_track:
                captions_text = caption_track.generate_srt_captions()
                return captions_text
            else:
                return "No English captions available."
        else:
            return "No captions available for this video."
    except Exception as e:
        return f"An error occurred: {e}"

if __name__ == "__main__":
    video_id = sys.argv[1]
    captions = get_youtube_captions(video_id)
    print(captions)