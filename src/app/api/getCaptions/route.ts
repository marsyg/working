import { exec } from 'child_process';

// Handler for GET requests
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Video ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Path to your Python script
  const pythonScriptPath = 'python.py';

  // Execute the Python script
  return new Promise((resolve, reject) => {
    exec(`python ${pythonScriptPath} ${videoId}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        resolve(
          new Response(
            JSON.stringify({ error: 'Failed to extract captions' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        resolve(
          new Response(
            JSON.stringify({ error: 'Failed to extract captions' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }
      // Send the captions back as a response
      resolve(
        new Response(JSON.stringify({ captions: stdout }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });
}

// Handler for POST requests (example)
export async function POST(req) {
  const { videoId, customData } = await req.json();

  if (!videoId || !customData) {
    return new Response(
      JSON.stringify({ error: 'Video ID and custom data are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // Example: Process the data and return a response
  return new Response(
    JSON.stringify({ message: 'POST request received', videoId, customData }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
