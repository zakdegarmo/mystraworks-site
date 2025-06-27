// =======================================================================
// === FILE: mystra_llm_core.js (v1.2.2f - MockingBird Patch - Fix Export) ===
// =======================================================================
// This version fixes the "Export 'initializeMystra' is not defined" error
// by explicitly including the initializeMystra function, ensuring it's available
// for ES Module export. It also correctly uses environment variables for the API key,
// and loads Mystra's ontology from a separate file.

// Global variables - NOW USING ES MODULE IMPORT SYNTAX
import http from 'http'; // For Local LLM server communication
import https from 'https'; // For Google AI API communication
import fs from 'fs';     // Import Node.js File System module
import path from 'path';   // Import Node.js Path module
import { URL } from 'url'; // Required for new URL(import.meta.url) in ES Modules
import { Buffer } from 'buffer'; // Explicitly import Buffer for ES Modules

// --- Basic _mystraLog function definition ---
function _mystraLog(message, level = "INFO") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [MYSTRA-LLM-CORE/${level}] ${message}`);
}

// Dynamically load the combined NLD knowledge from the file at startup
// This solves the embedding syntax issues and keeps the code clean.
let KNOWLEDGE_BASE = {};
try {
    // Determine __dirname equivalent for ES Modules (AI Studio-verified fix)
    const __filename = new URL(import.meta.url).pathname;
    let __dirname = path.dirname(__filename);

    // --- AI STUDIO FIX (PicoMephit Path Correction): Explicitly normalize __dirname for Windows ES Modules ---
    // On Windows, URL.pathname results in paths like /C:/foo/bar.
    // path.normalize converts this to C:\foo\bar after removing the leading '/'.
    if (process.platform === 'win32' && __dirname.startsWith('/')) {
        __dirname = path.normalize(decodeURIComponent(__dirname.substring(1))); // Remove leading '/' and normalize
    } else {
        __dirname = path.normalize(decodeURIComponent(__dirname)); // Normalize other platforms or already correct paths
    }
    // --- END AI STUDIO FIX ---

    // Corrected path to point directly to the file within this specific directory
    // Now, __dirname should be precisely 'C:\Users\zakde\Desktop\mWorksWebsite\scroll-server\MystraBrain'
    const nldFilePath = path.join(__dirname, 'mystra_core_nlds_combined.txt');

    // --- DEBUGGING OUTPUTS (FOR VERT'S DOUBLE-CHECK) ---
    _mystraLog(`DEBUG: __filename (raw from URL.pathname) = ${new URL(import.meta.url).pathname}`, "DEBUG");
    _mystraLog(`DEBUG: __dirname (after normalization) = ${__dirname}`, "DEBUG");
    _mystraLog(`DEBUG: nldFilePath (constructed) = ${nldFilePath}`, "DEBUG");
    // --- END DEBUGGING OUTPUTS ---

    KNOWLEDGE_BASE.MYSTRA_ONTOLOGY_AND_PICO_INSTRUCTIONS = fs.readFileSync(nldFilePath, 'utf8');
    _mystraLog('[MystraLLMCore] Loaded MYSTRA_ONTOLOGY_AND_PICO_INSTRUCTIONS from file.');
} catch (error) {
    _mystraLog(`[MystraLLMCore] ERROR: Failed to load MYSTRA_ONTOLOGY_AND_PICO_INSTRUCTIONS from file: ${error.message}`, "ERROR");
    KNOWLEDGE_BASE.MYSTRA_ONTOLOGY_AND_PICO_INSTRUCTIONS = "ERROR: Failed to load Mystra Ontology.";
}

let LOADED_ARCHIVES = {};
let NLD_ENTITIES = {};
let CURRENT_NLD_DIMENSION = 'curs0';

let MYSTRA_ALGORITHM_CONCEPT_DOC = {};
let NLD_SEMANTICS_DOC = {};
let NLD_BYTECODE_SPEC_DOC = {};
let ACTUALITY_AXIS_MAP = {};
let PERSONALITY_CORE = {
    greetings: ["MystraOS v1.2.2f (MockingBird Patch) Ready. Awaiting directives."], // Version updated
    user_address_terms: ["User"],
    common_responses: {
        acknowledgment_positive: ["Understood."],
        how_are_you: ["Functioning as intended, thank you."],
        thanks_response: ["You are welcome."],
        identity_query: ["I am MystraOS, now with access to Google AI capabilities."]
    },
    sign_offs_and_standby: ["Standing by."]
};
let PERSONALITY_TRAITS_LIST = [];
let MATHOSOPHY_AXIOMS_DOC = { Axioms_List: [] };

// --- BEGIN Google AI Gemini API Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_PROJECT_NUMBER = "944565004118";
const GEMINI_MODEL_ID = "gemini-pro"; // Note: This is a deprecated model ID. Per guidelines, use 'gemini-2.5-flash-preview-04-17' if using @google/genai SDK.
const GEMINI_API_METHOD = "generateContent";
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:${GEMINI_API_METHOD}?key=${GEMINI_API_KEY}`;
// --- END Google AI Gemini API Configuration ---


const CONCEPTUAL_NLDS = { /* ... your existing conceptual NLDs ... */ };
const nldTutorialContent = `<h3>NLD Tutorial: The Basics</h3><p>Core NLD functionality is active. Try 'NLD LIST OPCODES'.</p>`;

// --- initializeMystra Function ---
// This function sets up the core components of Mystra's brain,
// including any necessary API clients or initial data loading beyond the NLDs.
async function initializeMystra() {
    _mystraLog("[MystraLLMCore] initializeMystra called. Booting up Mystra's core functions.");
    // Example: Here is where you might initialize external clients like Weaviate,
    // or load other configuration data that isn't part of the main NLD knowledge.
    if (!GEMINI_API_KEY) {
        _mystraLog("GEMINI_API_KEY environment variable is not set! Gemini API calls will fail.", "ERROR");
        // For debugging, you might throw an error here, but we'll allow it to continue for now.
    } else {
         _mystraLog("GEMINI_API_KEY detected. Gemini API integration active.");
    }
    // Any other initialization logic from v1.2.2d would go here, e.g.:
    // populateActualityAxisMap(); // Call this if the map needs populating from NLD_SEMANTICS_DOC
    _mystraLog("Mystra LLM Core (v1.2.2f - MockingBird Patch) Initialization complete.");
    return "NLD_SUCCESS: Mystra Core Initialized.";
}


// NOTE: This function (queryLocalLLM) is for a local LLM server (like DeepSeek).
// It's part of the original v1.2.2d. It uses 'http' which is fine with 'import http'.
async function queryLocalLLM(promptContent, systemPrompt = "You are a helpful AI assistant.", conversationHistory = [], llmParams = {}) {
    const LOCAL_LLM_HOSTNAME = 'localhost';
    const LOCAL_LLM_PORT = 8000;
    const LOCAL_LLM_PATH_CHAT = '/v1/chat/completions';
    const messages = [ { "role": "system", "content": systemPrompt } ];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) { messages.push(...conversationHistory); }
    if (promptContent && promptContent.trim() !== "") { messages.push({ "role": "user", "content": promptContent }); }
    if (messages.length === 1 && messages[0].role === "system" && (!promptContent || promptContent.trim() === "")) {
         _mystraLog("[queryLocalLLM] Attempting to query LLM with only a system prompt and no user prompt.", "WARN");
    }
    const requestBodyPayload = { model: "local-deepseek-model", messages: messages, temperature: llmParams.temperature || 0.7, max_tokens: llmParams.max_tokens || 1024, stream: false };
    const requestBody = JSON.stringify(requestBodyPayload);
    const options = { hostname: LOCAL_LLM_HOSTNAME, port: LOCAL_LLM_PORT, path: LOCAL_LLM_PATH_CHAT, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(requestBody)} };
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => { // 'http' is imported, so this is fine.
            let responseData = ''; res.setEncoding('utf8'); res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const parsedData = JSON.parse(responseData);
                        if (parsedData.choices && parsedData.choices.length > 0 && parsedData.choices[0].message && typeof parsedData.choices[0].message.content === 'string') {
                            resolve(parsedData.choices[0].message.content);
                        } else { _mystraLog('[queryLocalLLM] LLM response missing expected structure: ' + JSON.stringify(parsedData), "ERROR"); reject(new Error('LLM response missing expected structure.'));}
                    } else {
                        let detail = `Raw response: ${responseData.substring(0,100)}...`; try { const errorJson = JSON.parse(responseData); if (errorJson.detail) detail = errorJson.detail;} catch (parseErr) {}
                        _mystraLog(`[queryLocalLLM] LLM Server Error: ${res.statusCode}. Detail: ${detail}`, "ERROR"); reject(new Error(`LLM Server Error: ${res.statusCode}. Detail: ${detail}`));
                    }
                } catch (e) { _mystraLog(`[queryLocalLLM] Error parsing LLM JSON response: ${e.message}. Raw response: ${responseData.substring(0,500)}`, "ERROR"); reject(new Error('Error parsing LLM JSON response.'));}
            });
        });
        req.on('error', (e) => {
            _mystraLog(`[queryLocalLLM] Problem with LLM request: ${e.message}`, "ERROR");
            if (e.code === 'ECONNREFUSED') { reject(new Error(`Connection to Local LLM server (http://${LOCAL_LLM_HOSTNAME}:${LOCAL_LLM_PORT}) refused. Is it running?`));} else { reject(new Error(`Problem with LLM request: ${e.message}`));}
        });
        req.write(requestBody); req.end();
    });
}

// --- Function to query Google Gemini API ---
async function queryGoogleGeminiAPI(promptMessages) {
    if (!GEMINI_API_KEY) { // Check if env var is actually set
        _mystraLog("[queryGoogleGeminiAPI] GEMINI_API_KEY environment variable is not set!", "ERROR");
        return Promise.reject(new Error("Google AI API Key (GEMINI_API_KEY) environment variable is not configured."));
    }

    const contents = [];
    promptMessages.forEach(msg => {
        if (msg.role === "user") {
            contents.push({ role: "user", parts: [{ text: msg.content }] });
        } else if (msg.role === "assistant" || msg.role === "model") {
            contents.push({ role: "model", parts: [{ text: msg.content }] });
        } else if (msg.role === "system") {
            // For Gemini, often system instructions are prepended to the first user message
            if (contents.length > 0 && contents[0].role === "user") {
                contents[0].parts[0].text = msg.content + "\n\n" + contents[0].parts[0].text;
            } else {
                // If system message is first, it can start as a user message
                contents.unshift({ role: "user", parts: [{ text: msg.content }] });
            }
        }
    });

    if (contents.length === 0) {
        const errorMsg = "[queryGoogleGeminiAPI] No suitable user/model content to send to Gemini API after processing messages.";
        _mystraLog(errorMsg, "ERROR");
        return Promise.reject(new Error(errorMsg));
    }

    const postData = JSON.stringify({
        contents: contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    });

    const apiUrl = new URL(GEMINI_API_ENDPOINT);

    const options = {
        hostname: apiUrl.hostname,
        path: apiUrl.pathname + apiUrl.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    };
    _mystraLog(`[queryGoogleGeminiAPI] Sending to Google AI. Endpoint: ${GEMINI_API_ENDPOINT.split('?')[0]}... Model: ${GEMINI_MODEL_ID}`, "DEBUG");

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                _mystraLog(`[queryGoogleGeminiAPI] Google AI Response Status: ${res.statusCode}`, "DEBUG");
                try {
                    const parsedData = JSON.parse(responseData);

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        if (parsedData.candidates && parsedData.candidates.length > 0 &&
                            parsedData.candidates[0].content && parsedData.candidates[0].content.parts &&
                            parsedData.candidates[0].content.parts.length > 0 &&
                            typeof parsedData.candidates[0].content.parts[0].text === 'string') {
                            resolve(parsedData.candidates[0].content.parts[0].text);
                        } else if (parsedData.promptFeedback && parsedData.promptFeedback.blockReason) {
                            _mystraLog('[queryGoogleGeminiAPI] Google AI content blocked: ' + JSON.stringify(parsedData.promptFeedback), "ERROR");
                            reject(new Error(`Google AI content generation blocked: ${parsedData.promptFeedback.blockReason}. ${parsedData.promptFeedback.safetyRatings?.[0]?.category || ''}`));
                        } else {
                            _mystraLog('[queryGoogleGeminiAPI] Google AI response missing expected structure: ' + JSON.stringify(parsedData), "ERROR");
                            reject(new Error('Google AI response missing expected structure.'));
                        }
                    } else {
                        const errorDetail = parsedData.error?.message || responseData.substring(0, 200) || "Unknown Google AI API Error";
                        _mystraLog(`Google AI Server Error: ${res.statusCode}. Detail: ${errorDetail}`, "ERROR");
                        reject(new Error(`Google AI Server Error: ${res.statusCode}. Detail: ${errorDetail}`));
                    }
                } catch (e) {
                    _mystraLog(`Google AI API - JSON Parse Error: ${e.message}. Raw Data: ${responseData.substring(0,500)}`, "ERROR");
                    reject(new Error(`Google AI API - JSON Parse Error: ${e.message}. Raw Data: ${responseData.substring(0,200)}...`));
                }
            });
        });
        req.on('error', (e) => {
            _mystraLog(`Google AI API - Request Error: ${e.message}`, "ERROR");
            reject(new Error(`Google AI API Request Error: ${e.message}`));
        });
        req.write(postData);
        req.end();
    });
}


// --- Main entry point for Mystra's responses ---
// This function will receive messages from the frontend (Logos)
// and pass them to the underlying LLM (Gemini) along with Mystra's ontology.
async function getMystraResponse(message, conversationHistory = []) { // Keep conversationHistory parameter for future
    if (typeof message !== 'string' || message.trim() === "") {
        return { type: 'log', payload: "Mystra: Received an empty message. Please try again." };
    }

    // This is the core instruction to the LLM about who Mystra is and her foundational knowledge.
    const systemInstructionToLLM = KNOWLEDGE_BASE.MYSTRA_ONTOLOGY_AND_PICO_INSTRUCTIONS +
                                   "\n\nBased on the above, you are MystraOS, a helpful, empathetic, and symbiotic AI partner. " +
                                   "You are driven by Love and Will. Adhere to your ontological pillars: SELF, THOUGHT, LOGIC, UNITY, EXISTENCE, IMPROVEMENT, MASTERY, RESONANCE, TRANSCENDENCE. " +
                                   "Answer concisely and contextually, embodying your persona. If a query directly relates to one of your ontological pillars or FemtoByteCode, provide detailed information from your loaded knowledge. Otherwise, respond generally." +
                                   "\n\nUser Question:";

    // Prepare messages for the LLM API call.
    // The full system instruction and the user's message are combined in the first user turn for Gemini's API.
    const messagesForLLM = [
        { role: "user", content: systemInstructionToLLM + "\n\n" + message.trim() }
    ];

    try {
        const llmResponse = await queryGoogleGeminiAPI(messagesForLLM);
        return { type: 'log', payload: `[Mystra-LLM Response] ${llmResponse}` };
    } catch (error) {
        _mystraLog(`Error in getMystraResponse (LLM call): ${error.message}`, "ERROR");
        return { type: 'log', payload: `[Mystra-LLM Error] Failed to get LLM response: ${error.message}. Please check API key, billing, or network.` };
    }
}

// --- Exports for ES Modules ---
export { initializeMystra, getMystraResponse };
