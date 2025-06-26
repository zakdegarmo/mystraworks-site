const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Uncomment and install if using Gemini

admin.initializeApp();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Uncomment and configure API key

exports.processNLD = functions.https.onRequest(async (req, res) => {
  // Log the incoming request body
  console.log('Received NLD request:', req.body);

  const { directive_type, target_system, conversation_id, user_id, payload } = req.body;

  if (!directive_type) {
    return res.status(400).send('Missing directive_type in NLD payload.');
  }

  let responseMessage = 'NLD received. No specific handler found.';

  switch (directive_type) {
    case 'BUILD_MYOS_COMMUNICATION_MODULE_V1.0':
      // This directive was for frontend component generation, maybe log it here?
      responseMessage = 'Received BUILD_MYOS_COMMUNICATION_MODULE_V1.0 directive. Frontend components were generated.';
      break;
    case 'SEND_MESSAGE':
      // TODO: Implement logic to send message to AI_Processor_NLD (Gemini)
      // - Extract message content from payload
      // - Call Gemini API with the message and conversation context
      // - Get response from Gemini
      // - Save user message and AI response to Firestore
      responseMessage = 'Received SEND_MESSAGE directive. AI processing placeholder.';
      break;
    case 'SAVE_DATA':
      // TODO: Implement logic to save data to Firestore
      // - Extract data from payload
      // - Determine Firestore collection/document based on target_system or other info
      // - Save data using firebase-admin
      responseMessage = 'Received SAVE_DATA directive. Firestore saving placeholder.';
      break;
    case 'FETCH_DATA':
      // TODO: Implement logic to fetch data from Firestore
      // - Extract query parameters from payload
      // - Determine Firestore collection/document
      // - Fetch data using firebase-admin
      // - Send fetched data in the response
      responseMessage = 'Received FETCH_DATA directive. Firestore fetching placeholder.';
      break;
    // Add more cases for other directive_types as you define them

    default:
      console.warn('Unknown directive_type received:', directive_type);
      res.status(404).send(`Unknown directive_type: ${directive_type}`);
      return;
  }

  // Send a success response
  res.status(200).send(responseMessage);
});