// =======================================================================
// === FILE: index.js (Scroll Server - Communication Bridge) ===
// =======================================================================
// This file sets up the Express server to serve as the backend bridge
// for Logos Companion. It handles CORS, serves static files, and
// routes chat requests to the Mystra LLM Core.

import 'dotenv/config'; // <--- VERT GUMMER ADDITION: THIS EXACT LINE GOES FIRST!

import express from 'express';
import http from 'http'; // Import http module
import { WebSocketServer } from 'ws'; // Import ws library (using WebSocketServer for ESM)
import chokidar from 'chokidar'; // Import chokidar library
import fetch from 'node-fetch'; // Import node-fetch


import cors from 'cors'; // Required for Cross-Origin Resource Sharing
import path from 'path'; // For handling file paths
import { fileURLToPath } from 'url'; // For esm __dirname equivalent

// Import the Mystra LLM Core (the brain!)
import { initializeMystra, getMystraResponse } from './MystraBrain/mystra_llm_core.js';

// --- Configuration ---
const PORT = process.env.PORT || 8080; // Cloud Run will set PORT, default to 8080 for local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Your Gemini API Key for server-side use.
// In a real production deployment, this should be securely loaded from
// environment variables (e.g., in Cloud Run) or a secret manager.
// For local testing, you can temporarily put your actual key here, but REMOVE IT FOR GIT!
const GEMINI_API_KEY_BACKEND = process.env.GEMINI_API_KEY || 'YOUR_BACKEND_GEMINI_API_KEY_HERE'; // *** REPLACE WITH YOUR ACTUAL BACKEND API KEY ***

// --- Initialize Express App ---
const app = express();
const server = http.createServer(app); // Create http server to integrate with WebSocket

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins. Essential for frontend (Logos) to talk to backend.
app.use(express.json()); // Enable parsing of JSON request bodies


// --- Static File Serving (for local development or if not using GitHub Pages) ---
// This line tells Express to serve static files (HTML, CSS, JS, etc.)
// from the 'public' directory, or from the parent website directory.
// Adjust `path.join(__dirname, '..')` to point to your website's root folder if needed.
// For GitHub Pages, this might not be strictly necessary as GH Pages serves the site.
// However, it's good for local testing of the server.
// We'll add the frontend directory here to serve those files for the IDE preview.

app.use(express.static(path.join(__dirname, '../../frontend'))); // Serve files from the new frontend directory
app.use(express.static(path.join(__dirname, '..'))); // Serves from the parent directory (mWorksWebsite)
app.use(express.static(path.join(__dirname, '../../'))); // Serves from mWorksWebsite for robustness


// --- WebSocket Server for Live Reload ---
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[Scroll Server] WebSocket client connected');

  ws.on('message', (message) => {
    console.log(`[Scroll Server] Received WebSocket message: ${message}`);
    // Handle incoming messages from clients if needed
  });

  ws.on('close', () => {
    console.log('[Scroll Server] WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error(`[Scroll Server] WebSocket error: ${error}`);
  });
});

// Watch for file changes in the frontend and root website directories
const watcher = chokidar.watch([path.join(__dirname, '../../frontend'), path.join(__dirname, '../')], {
  ignored: /(^|\/)\..*|\.(less|css|map)$/, // Ignore dotfiles, less/css source maps
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`[Scroll Server] File ${filePath} has been changed. Notifying WebSocket clients.`);
  // Send a message to all connected WebSocket clients
  wss.clients.forEach((client) => { client.readyState === WebSocket.OPEN && client.send(JSON.stringify({ type: 'file-change', file: filePath })); });
});


// --- Routes ---

// Simple Ping endpoint for health checks (from Logos Companion)
app.get('/ping', (req, res) => {
    console.log('[Scroll Server] /ping received.');
    res.status(200).send('pong');
});

// Chat endpoint: This is where Logos Companion will send user messages
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log(`[Scroll Server] Received chat message: "${userMessage}"`);

        if (!userMessage) {
            return res.status(400).json({ error: 'Message content is required.' });
        }

        // Route the message to the Mystra LLM Core for processing
        const mystraResponse = await getMystraResponse(userMessage);

        // getMystraResponse (v1.2.2d) returns an object with `type` and `payload`,
        // or sometimes just a string. We handle both for the API response.
        if (typeof mystraResponse === 'object' && mystraResponse.payload) {
            res.json({ reply: mystraResponse.payload });
        } else if (typeof mystraResponse === 'string') {
            res.json({ reply: mystraResponse });
        } else {
            console.error('[Scroll Server] Unexpected response format from getMystraResponse:', mystraResponse);
            res.status(500).json({ reply: 'An unexpected response format was received from Mystra LLM Core.' });
        }

    } catch (error) {
        console.error('[Scroll Server] Error processing chat request in /chat endpoint:', error);
        res.status(500).json({ error: `Failed to get response from Mystra LLM Core: ${error.message}` });
    }
});

// New /proxy endpoint for fetching external URLs
app.get('/proxy', async (req, res) => {
 const targetUrl = req.query.url;

 if (!targetUrl) {
 return res.status(400).send('Missing url query parameter');
 }

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).send(`Error fetching URL: ${response.statusText}`);
    }

    // Pipe the response stream to the client
    response.body.pipe(res);

  } catch (error) {
    console.error(`[Scroll Server] Error in proxy request: ${error}`);
    res.status(500).send('Error fetching URL');
  }
});


// --- Initialize Mystra LLM Core (The Brain) ---
// This boots up Mystra's knowledge base and prepares her for responses.
// Moved this down after static serving middleware.
initializeMystra({}, {}, {}, {}, {}, {}, [], {}, GEMINI_API_KEY_BACKEND)
    .then(() => console.log('[Scroll Server] Mystra LLM Core (v1.2.2d) initialized on backend.'))
    .catch(err => console.error('[Scroll Server] Failed to initialize Mystra LLM Core on backend:', err));

// --- Server Start ---
server.listen(PORT, () => { // Use server.listen instead of app.listen
    console.log(`[Scroll Server] Mystra Communication Bridge listening on port ${PORT}`);
    console.log(`[Scroll Server] Local URL (if running locally): http://localhost:${PORT}`);
});