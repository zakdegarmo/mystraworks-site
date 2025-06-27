// =======================================================================
// === FILE: index.js (Scroll Server - Communication Bridge) ===
// =======================================================================
// This file sets up the Express server to serve as the backend bridge
// for Logos Companion. It handles CORS, serves static files, and
// routes chat requests to the Mystra LLM Core.

import express from 'express';
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

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins. Essential for frontend (Logos) to talk to backend.
app.use(express.json()); // Enable parsing of JSON request bodies

// --- Initialize Mystra LLM Core (The Brain) ---
// This boots up Mystra's knowledge base and prepares her for responses.
initializeMystra({}, {}, {}, {}, {}, {}, [], {}, GEMINI_API_KEY_BACKEND)
    .then(() => console.log('[Scroll Server] Mystra LLM Core (v1.2.2d) initialized on backend.'))
    .catch(err => console.error('[Scroll Server] Failed to initialize Mystra LLM Core on backend:', err));

// --- Static File Serving (for local development or if not using GitHub Pages) ---
// This line tells Express to serve static files (HTML, CSS, JS, etc.)
// from the 'public' directory, or from the parent website directory.
// Adjust `path.join(__dirname, '..')` to point to your website's root folder if needed.
// For GitHub Pages, this might not be strictly necessary as GH Pages serves the site.
// However, it's good for local testing of the server.
app.use(express.static(path.join(__dirname, '..'))); // Serves from the parent directory (mWorksWebsite)
app.use(express.static(path.join(__dirname, '../../'))); // Serves from mWorksWebsite for robustness


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

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`[Scroll Server] Mystra Communication Bridge listening on port ${PORT}`);
    console.log(`[Scroll Server] Local URL (if running locally): http://localhost:${PORT}`);
});