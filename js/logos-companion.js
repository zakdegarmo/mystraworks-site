// logos-companion.js
class LogosCompanion extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        // Basic HTML structure for the chat bubble and expanded UI
        shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000; /* Ensure it's above other content */
                    font-family: sans-serif;
                }
                #chat-bubble {
                    background-color: #007bff; /* Blue for Logos! */
                    color: white;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    font-size: 1.5em;
                    transition: all 0.3s ease;
                }
                #chat-bubble.hidden {
                    transform: scale(0);
                }
                #chat-window {
                    background-color: #2c2c2c; /* Dark theme */
                    border: 1px solid #444;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    width: 300px;
                    height: 400px; /* Initial height */
                    display: none; /* Hidden by default */
                    flex-direction: column;
                    position: absolute;
                    bottom: 0; /* Align to bottom of host */
                    right: 0; /* Align to right of host */
                    transform: translateY(100%); /* Start off-screen */
                    transition: transform 0.3s ease;
                }
                 #chat-window.active {
                    display: flex;
                    transform: translateY(0); /* Slide into view */
                }
                #chat-header {
                    background-color: #1a1a1a;
                    color: white;
                    padding: 10px;
                    border-top-left-radius: 9px;
                    border-top-right-radius: 9px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                #chat-messages {
                    flex-grow: 1;
                    padding: 10px;
                    overflow-y: auto;
                    color: #f0f0f0;
                }
                #chat-input-container {
                    padding: 10px;
                    border-top: 1px solid #444;
                    display: flex;
                }
                #chat-input {
                    flex-grow: 1;
                    padding: 8px;
                    border: 1px solid #555;
                    border-radius: 5px;
                    background-color: #333;
                    color: white;
                }
                #chat-send-btn {
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 5px;
                    margin-left: 5px;
                    cursor: pointer;
                }
            </style>
            <div id="chat-bubble">V</div> <!-- 'V' for Vert Gummer, or a placeholder for Logos symbol -->
            <div id="chat-window">
                <div id="chat-header">
                    <span>Logos Companion</span>
                    <button id="close-btn" style="background: none; border: none; color: white; font-size: 1.2em; cursor: pointer;">X</button>
                </div>
                <div id="chat-messages">
                    <p>Hello, I am Logos. How can I assist?</p>
                </div>
                <div id="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Ask me anything...">
                    <button id="chat-send-btn">Send</button>
                </div>
            </div>
        `;

        this.chatBubble = shadowRoot.getElementById('chat-bubble');
        this.chatWindow = shadowRoot.getElementById('chat-window');
        this.closeBtn = shadowRoot.getElementById('close-btn');
        this.chatInput = shadowRoot.getElementById('chat-input');
        this.chatSendBtn = shadowRoot.getElementById('chat-send-btn');
        this.chatMessages = shadowRoot.getElementById('chat-messages');

        this.chatBubble.addEventListener('click', () => this.toggleChatWindow());
        this.closeBtn.addEventListener('click', () => this.toggleChatWindow());
        this.chatSendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChatWindow() {
        this.chatWindow.classList.toggle('active');
        this.chatBubble.classList.toggle('hidden'); // Hide bubble when window is open
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (message) {
            // Display user message
            const userMessage = document.createElement('p');
            userMessage.textContent = `You: ${message}`;
            this.chatMessages.appendChild(userMessage);

            // Simulate AI response (will connect to scroll-server later)
            const aiResponse = document.createElement('p');
            aiResponse.textContent = `Logos: Processing "${message}"...`; // Placeholder response
            this.chatMessages.appendChild(aiResponse);

            this.chatInput.value = '';
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight; // Scroll to bottom
            this.pingScrollServer(); // Ping the server!
        }
    }

    // Basic connection to scroll-server-service (Ping)
    async pingScrollServer() {
        try {
            const scrollServerUrl = 'https://scroll-server-service-944565004118.northamerica-northeast1.run.app'; // <<< REPLACE WITH YOUR CLOUD RUN SERVICE URL
            const response = await fetch(`${scrollServerUrl}/ping`);
            if (response.ok) {
                const text = await response.text();
                console.log('Scroll server ping successful:', text);
                // Add a message to chat indicating successful connection
                const statusMessage = document.createElement('p');
                statusMessage.style.color = '#88ff88'; // Green text
                statusMessage.textContent = 'Logos: Scroll server connection: OK.';
                this.chatMessages.appendChild(statusMessage);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            } else {
                console.error('Scroll server ping failed:', response.status, response.statusText);
                const statusMessage = document.createElement('p');
                statusMessage.style.color = '#ff8888'; // Red text
                statusMessage.textContent = 'Logos: ERROR - Scroll server connection: FAILED.';
                this.chatMessages.appendChild(statusMessage);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
        } catch (error) {
            console.error('Error pinging scroll server:', error);
            const statusMessage = document.createElement('p');
            statusMessage.style.color = '#ff8888';
            statusMessage.textContent = `Logos: ERROR - Scroll server connection: ${error.message}.`;
            this.chatMessages.appendChild(statusMessage);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }