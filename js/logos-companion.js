// js/logos-companion.js
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from "firebase/auth";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDr-NIzZaz8vXZ8umXk_45MlNp6HoBXwkQ", // YOUR ACTUAL KEY
  authDomain: "mystraos.firebaseapp.com",
  projectId: "mystraos",
  storageBucket: "mystraos.firebasestorage.app",
  messagingSenderId: "912155809484",
  appId: "1:912155809484:web:deb84563d00da8fed7d469",
  measurementId: "G-4CZ7450X8J"
};

class LogosCompanion extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                }
                .hidden { display: none !important; }
                .auth-container {
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background-color: rgba(23, 29, 45, 0.9); /* glass-card like, slightly more opaque */
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 1000;
                    color: #E2E8F0;
                    width: 320px; /* Increased width for chat */
                    max-height: calc(100vh - 80px); /* Max height with some padding */
                    display: flex;
                    flex-direction: column;
                }
                .auth-container h3, .auth-container h4 {
                    color: #A5B4FC; /* Light indigo for titles */
                    margin-top: 0;
                    margin-bottom: 10px;
                    text-align: center;
                }
                .auth-container input, .auth-container button, .auth-container textarea {
                    width: calc(100% - 22px); /* Account for padding */
                    padding: 10px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                    border: 1px solid #4A5568; /* slate-600 */
                    background-color: #2D3748; /* slate-800 */
                    color: #E2E8F0;
                    font-size: 0.95em;
                }
                .auth-container input:focus, .auth-container textarea:focus {
                    outline: none;
                    border-color: #4F46E5; /* indigo-500 */
                    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.5);
                }
                .auth-container button {
                    background-color: #4F46E5; /* primary-btn like */
                    cursor: pointer;
                    font-weight: 500;
                }
                .auth-container button:hover {
                    background-color: #4338CA;
                }
                #auth-status {
                    font-size: 0.9em;
                    margin-bottom: 10px;
                    min-height: 20px;
                    text-align: center;
                }
                #auth-toggle {
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background-color: #4F46E5;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 999; /* Below auth container when open */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Chat UI Styles */
                #chat-section {
                    margin-top: 15px;
                    border-top: 1px solid #4A5568;
                    padding-top: 15px;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1; /* Allows chat section to fill available space */
                    min-height: 200px; /* Minimum height for chat area */
                }
                .chat-output-area {
                    flex-grow: 1;
                    overflow-y: auto;
                    border: 1px solid #4A5568;
                    background-color: #1A202C; /* slate-900 like */
                    padding: 8px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                    min-height: 100px; /* Ensure it has some height */
                    max-height: 200px; /* Max height before scrolling */
                }
                .chat-output-area p {
                    margin-bottom: 8px;
                    font-size: 0.9em;
                    word-wrap: break-word;
                }
                .chat-output-area strong {
                    color: #818CF8; /* indigo-400 for sender */
                }
                #chat-input {
                    height: 50px;
                    resize: none; /* Or vertical */
                }
            </style>
            <button id="auth-toggle">👤</button>
            <div id="auth-container" class="auth-container hidden">
                <h3>MystraAuth</h3>
                <div id="auth-status">Initializing...</div>
                <input type="email" id="auth-email" placeholder="Email">
                <input type="password" id="auth-password" placeholder="Password">
                <button id="auth-login-btn">Log In</button>
                <button id="auth-register-btn">Sign Up</button>
                <button id="auth-logout-btn" class="hidden">Logout</button>

                <!-- Chat UI -->
                <div id="chat-section" class="hidden">
                    <h4>Chat with Mystra</h4>
                    <div id="chat-output" class="chat-output-area"></div>
                    <textarea id="chat-input" placeholder="Type your message..."></textarea>
                    <button id="chat-send-btn">Send</button>
                </div>
            </div>
        `;

        this.authToggleBtn = shadowRoot.getElementById('auth-toggle');
        this.authContainer = shadowRoot.getElementById('auth-container');
        this.authStatusDiv = shadowRoot.getElementById('auth-status');
        this.authEmailInput = shadowRoot.getElementById('auth-email');
        this.authPasswordInput = shadowRoot.getElementById('auth-password');
        this.authLoginBtn = shadowRoot.getElementById('auth-login-btn');
        this.authRegisterBtn = shadowRoot.getElementById('auth-register-btn');
        this.authLogoutBtn = shadowRoot.getElementById('auth-logout-btn');
        
        this.chatSection = shadowRoot.getElementById('chat-section');
        this.chatOutput = shadowRoot.getElementById('chat-output');
        this.chatInput = shadowRoot.getElementById('chat-input');
        this.chatSendBtn = shadowRoot.getElementById('chat-send-btn');

        this.currentUserToken = null;

        try {
            this.firebaseApp = initializeApp(firebaseConfig); 
            this.firebaseAuth = getAuth(this.firebaseApp); 
            this.initAuthentication(); 
        } catch (error) {
            console.error("Error initializing Firebase in LogosCompanion:", error);
            if (this.authStatusDiv) {
                this.authStatusDiv.textContent = "Firebase init failed. Check console.";
            }
        }

        this.authLoginBtn.addEventListener('click', () => this.handleAuth('login'));
        this.authRegisterBtn.addEventListener('click', () => this.handleAuth('register'));
        this.authLogoutBtn.addEventListener('click', () => this.handleAuth('logout'));
        this.authToggleBtn.addEventListener('click', () => this.toggleAuthWindow());

        this.chatSendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggleAuthWindow() {
        this.authContainer.classList.toggle('hidden');
        this.authToggleBtn.classList.toggle('hidden', !this.authContainer.classList.contains('hidden'));
    }

    async initAuthentication() {
        if (this.firebaseApp && this.firebaseAuth) {
            this.authStatusDiv.textContent = "Firebase SDK initialized.";
            this.listenForAuthChanges(); 
        } else {
            this.authStatusDiv.textContent = "Firebase SDK failed to initialize. Check console.";
            console.error("Firebase app or auth not found after initialization.");
        }
    }

    listenForAuthChanges() {
        onAuthStateChanged(this.firebaseAuth, user => {
            if (user) {
                const userDisplayName = user.email ? user.email.split('@')[0] : 'User';
                this.authStatusDiv.textContent = `Logged in as: ${userDisplayName}`;
                this.authEmailInput.value = user.email || '';
                this.authLoginBtn.classList.add('hidden');
                this.authRegisterBtn.classList.add('hidden');
                this.authLogoutBtn.classList.remove('hidden');
                this.authPasswordInput.classList.add('hidden');
                this.authEmailInput.readOnly = true;
                this.chatSection.classList.remove('hidden'); // Show chat section
                
                user.getIdToken().then(idToken => {
                    this.currentUserToken = idToken;
                    console.log(`User logged in: ${user.uid}. ID Token acquired.`);
                }).catch(error => {
                    console.error("Error getting ID token:", error);
                    this.currentUserToken = null;
                     this.displayMessage('System', `Error getting ID token: ${error.message}`);
                });

            } else {
                this.authStatusDiv.textContent = "Logged out.";
                this.authLoginBtn.classList.remove('hidden');
                this.authRegisterBtn.classList.remove('hidden');
                this.authLogoutBtn.classList.add('hidden');
                this.authPasswordInput.classList.remove('hidden');
                this.authEmailInput.readOnly = false;
                this.authEmailInput.value = '';
                this.authPasswordInput.value = '';
                this.currentUserToken = null;
                this.chatSection.classList.add('hidden'); // Hide chat section
                this.chatOutput.innerHTML = ''; // Clear chat on logout
            }
        });
    }

    async handleAuth(type) {
        const email = this.authEmailInput.value;
        const password = this.authPasswordInput.value;

        if (type !== 'logout' && (!email || !password)) {
            this.authStatusDiv.textContent = "Please enter email and password.";
            return;
        }

        this.authStatusDiv.textContent = "Processing...";
        try {
            if (type === 'login') {
                await signInWithEmailAndPassword(this.firebaseAuth, email, password);
            } else if (type === 'register') {
                await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
            } else if (type === 'logout') {
                await signOut(this.firebaseAuth);
            }
        } catch (error) {
            console.error("Authentication error:", error);
            this.authStatusDiv.textContent = `Auth Error: ${error.code} - ${error.message}`;
        }
    }

    displayMessage(sender, messageText) {
        const messageElement = document.createElement('p');
        const senderStrong = document.createElement('strong');
        senderStrong.textContent = sender + ": ";
        messageElement.appendChild(senderStrong);
        messageElement.appendChild(document.createTextNode(messageText));
        this.chatOutput.appendChild(messageElement);
        this.chatOutput.scrollTop = this.chatOutput.scrollHeight; // Auto-scroll
    }

    async sendMessage() {
        const messageText = this.chatInput.value.trim();
        if (!messageText) return;

        const userDisplayName = (this.firebaseAuth.currentUser && this.firebaseAuth.currentUser.email) 
                               ? this.firebaseAuth.currentUser.email.split('@')[0] 
                               : 'You';
        this.displayMessage(userDisplayName, messageText);
        this.chatInput.value = '';
        this.chatInput.focus();

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (this.currentUserToken) {
                headers['Authorization'] = `Bearer ${this.currentUserToken}`;
            }

            // Assuming scroll-server is running on localhost:8080 or accessible via relative path
            // If served from the same origin, '/chat' is fine. Otherwise, use full URL.
            const response = await fetch('/chat', { 
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ message: messageText })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ reply: `Server error: ${response.status}` }));
                throw new Error(errorData.reply || `HTTP error ${response.status}`);
            }

            const data = await response.json();
            this.displayMessage('Mystra', data.reply);

        } catch (error) {
            console.error('Error sending message:', error);
            this.displayMessage('System', `Error: ${error.message}`);
        }
    }
}
customElements.define('logos-companion', LogosCompanion);
