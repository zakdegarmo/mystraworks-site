
// logos-companion.js
class LogosCompanion extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000; 
                    font-family: 'Inter', sans-serif; /* Consistent font */
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 5px 0px rgba(172, 102, 255, 0.6); transform: scale(1); }
                    50% { box-shadow: 0 0 12px 4px rgba(172, 102, 255, 0.8); transform: scale(1.05); }
                    100% { box-shadow: 0 0 5px 0px rgba(172, 102, 255, 0.6); transform: scale(1); }
                }

                #chat-bubble {
                    background-image: linear-gradient(135deg, #3c1053, #6d20a2); /* Deep purple gradient */
                    color: white;
                    border-radius: 50%;
                    width: 55px; /* Slightly larger */
                    height: 55px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 2em; /* Larger icon */
                    transition: transform 0.3s ease, opacity 0.3s ease;
                    opacity: 1;
                    animation: pulse 2.5s infinite ease-in-out;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                #chat-bubble.hidden {
                    transform: scale(0);
                    opacity: 0;
                    animation: none; /* Stop animation when hidden */
                }
                #chat-window {
                    background-color: #160f29; /* Very dark purple/blue base */
                    border: 1px solid #7e57c2; /* Medium purple border */
                    border-radius: 12px; /* Softer radius */
                    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(126, 87, 194, 0.35); /* Dark shadow + purple glow */
                    width: 330px; /* Reduced width */
                    height: auto; 
                    max-height: 490px; /* Reduced max-height */
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0;
                    pointer-events: none;
                    transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease-out;
                }
                 #chat-window.active {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    pointer-events: auto;
                }
                #chat-header {
                    background-color: rgba(0,0,0,0.35); /* Translucent dark overlay */
                    color: #e0e0e0; /* Light lavender/grey */
                    padding: 12px 18px; 
                    border-top-left-radius: 11px; /* Match window radius */
                    border-top-right-radius: 11px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: grab; 
                    border-bottom: 1px solid rgba(126, 87, 194, 0.5); /* Subtle separator */
                }
                 #chat-header:active {
                    cursor: grabbing;
                }
                 #chat-header span {
                    font-weight: 700; /* Bolder title */
                    font-size: 1.1em;
                 }
                #close-btn {
                    background: none; 
                    border: none; 
                    color: #b39ddb; /* Lighter purple */
                    font-size: 1.4em; /* Larger close icon */
                    font-weight: bold;
                    cursor: pointer; 
                    padding: 0 5px;
                    transition: color 0.2s ease;
                }
                #close-btn:hover {
                    color: #ffffff;
                }

                #auth-section {
                    padding: 18px;
                    border-bottom: 1px solid #5e35b1; /* Deeper purple border */
                    background-color: rgba(25, 16, 40, 0.85); /* Slightly transparent dark purple */
                }
                #user-status {
                    margin-bottom: 12px;
                    color: #d1c4e9; /* Pale lavender */
                    font-size: 0.9em;
                    text-align: center;
                    min-height: 1.2em; /* Ensure space even when empty */
                    transition: opacity 0.3s ease;
                }
                #auth-section input[type="email"],
                #auth-section input[type="password"] {
                    width: calc(100% - 24px); 
                    padding: 12px; /* More padding */
                    margin-bottom: 12px;
                    border: 1px solid #5e35b1; /* Purple border */
                    border-radius: 20px; /* Rounded */
                    background-color: rgba(0,0,0,0.5); /* Darker, translucent */
                    color: #e0e0e0; /* Light text */
                    box-sizing: border-box;
                    font-size: 0.95em;
                    transition: opacity 0.3s ease;
                }
                #auth-section input::placeholder { 
                    color: #9575cd;
                    opacity: 0.7;
                    transition: opacity 0.3s ease; /* For rune effect on placeholder */
                }
                #auth-buttons-container {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                #auth-section button {
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 20px; /* Rounded */
                    cursor: pointer;
                    transition: all 0.25s ease, opacity 0.3s ease; /* Added opacity for rune */
                    font-weight: 700; /* Bolder button text */
                    font-size: 0.9em;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                #login-btn {
                    background-image: linear-gradient(to right, #5e35b1, #7e57c2); /* Vibrant purple gradient */
                    flex-grow: 1;
                    margin-right: 6px;
                }
                #login-btn:hover {
                    background-image: linear-gradient(to right, #673ab7, #9575cd);
                    box-shadow: 0 0 10px rgba(126, 87, 194, 0.5);
                }
                #register-btn {
                    background-image: linear-gradient(to right, #00897b, #26a69a); /* Teal gradient */
                    flex-grow: 1;
                    margin-left: 6px;
                }
                #register-btn:hover {
                    background-image: linear-gradient(to right, #009688, #4db6ac);
                    box-shadow: 0 0 10px rgba(38, 166, 154, 0.5);
                }
                #signout-btn {
                    background-image: linear-gradient(to right, #c62828, #e53935); /* Red gradient */
                    width: 100%;
                }
                #signout-btn:hover {
                    background-image: linear-gradient(to right, #d32f2f, #f44336);
                    box-shadow: 0 0 10px rgba(229, 57, 53, 0.5);
                }

                #chat-messages {
                    flex-grow: 1;
                    padding: 10px 18px;
                    overflow-y: auto;
                    color: #f0f0f0; /* Off-white for readability */
                    min-height: 150px; /* Adjusted min height */
                    background-color: rgba(10, 5, 20, 0.3); /* Very subtle dark bg for message area */
                }
                /* Custom scrollbar (Webkit) */
                #chat-messages::-webkit-scrollbar {
                    width: 8px;
                }
                #chat-messages::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                    border-radius: 4px;
                }
                #chat-messages::-webkit-scrollbar-thumb {
                    background-color: #5e35b1;
                    border-radius: 4px;
                }
                #chat-messages::-webkit-scrollbar-thumb:hover {
                    background-color: #7e57c2;
                }

                .message {
                    margin-bottom: 10px; 
                    line-height: 1.5;
                    padding: 8px 14px; 
                    word-wrap: break-word;
                    max-width: 85%; 
                    font-size: 0.95em;
                    transition: opacity 0.3s ease;
                }
                .user-message {
                    background-color: #5e35b1; 
                    color: white;
                    text-align: left; 
                    margin-left: auto; 
                    border-radius: 12px 12px 4px 12px; 
                }
                .ai-message {
                    background-color: #311b92; 
                    color: white;
                    text-align: left;
                    margin-right: auto; 
                    border-radius: 12px 12px 12px 4px; 
                }
                .status-message {
                    font-style: italic;
                    color: #9575cd; 
                    font-size: 0.85em;
                    text-align: center;
                    padding: 5px 0;
                }
                #chat-input-container {
                    padding: 12px 18px; 
                    border-top: 1px solid rgba(126, 87, 194, 0.5); 
                    display: flex;
                    background-color: rgba(0,0,0,0.25); 
                    border-bottom-left-radius: 11px; 
                    border-bottom-right-radius: 11px;
                }
                #chat-input {
                    flex-grow: 1;
                    padding: 12px 15px; 
                    border: 1px solid #5e35b1; 
                    border-radius: 20px; 
                    background-color: rgba(0,0,0,0.5); 
                    color: #e0e0e0;
                    font-size: 0.95em;
                    transition: opacity 0.3s ease;
                }
                #chat-input::placeholder {
                    color: #9575cd;
                    opacity: 0.7;
                     transition: opacity 0.3s ease;
                }
                #chat-send-btn {
                    background-image: linear-gradient(to right, #5e35b1, #7e57c2);
                    color: white;
                    border: none;
                    padding: 0px 18px; 
                    border-radius: 20px; 
                    margin-left: 10px; 
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.9em;
                    text-transform: uppercase;
                    transition: all 0.2s ease, opacity 0.3s ease; /* Added opacity for rune */
                }
                 #chat-send-btn:hover {
                    background-image: linear-gradient(to right, #673ab7, #9575cd);
                    box-shadow: 0 0 10px rgba(126, 87, 194, 0.5);
                 }
                 #chat-send-btn:disabled {
                    background-image: linear-gradient(to right, #444, #555);
                    cursor: not-allowed;
                    box-shadow: none;
                }
            </style>
            <div id="chat-bubble">🌀</div>
            <div id="chat-window">
                <div id="chat-header">
                    <span>Logos Companion</span>
                    <button id="close-btn" title="Close Chat">×</button>
                </div>
                
                <div id="auth-section">
                    <div id="user-status">Initializing connection to the Weave...</div>
                    <div id="auth-form" style="display: none;">
                        <input type="email" id="auth-email" placeholder="Enter your weave-signature (Email)" autocomplete="email">
                        <input type="password" id="auth-password" placeholder="Ancient passphrase (Password)" autocomplete="current-password">
                        <div id="auth-buttons-container">
                            <button id="login-btn">Attune</button>
                            <button id="register-btn">Manifest</button>
                        </div>
                    </div>
                    <button id="signout-btn" style="display: none;">Sever Link</button>
                </div>

                <div id="chat-messages">
                    <!-- Initial messages will be populated by JS -->
                </div>
                <div id="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Attuning to send whispers..." disabled>
                    <button id="chat-send-btn" disabled>Whisper</button>
                </div>
            </div>
        `;

        this.chatBubble = shadowRoot.getElementById('chat-bubble');
        this.chatWindow = shadowRoot.getElementById('chat-window');
        this.closeBtn = shadowRoot.getElementById('close-btn');
        
        this.authSection = shadowRoot.getElementById('auth-section');
        this.userStatus = shadowRoot.getElementById('user-status');
        this.authForm = shadowRoot.getElementById('auth-form');
        this.authEmail = shadowRoot.getElementById('auth-email');
        this.authPassword = shadowRoot.getElementById('auth-password');
        this.loginBtn = shadowRoot.getElementById('login-btn');
        this.registerBtn = shadowRoot.getElementById('register-btn');
        this.signOutBtn = shadowRoot.getElementById('signout-btn');

        this.chatHeaderSpan = shadowRoot.querySelector('#chat-header span');
        this.chatInput = shadowRoot.getElementById('chat-input');
        this.chatSendBtn = shadowRoot.getElementById('chat-send-btn');
        this.chatMessages = shadowRoot.getElementById('chat-messages');
        
        this.initialAiMessageGuest = "Greetings, Guest. You are whispering anonymously (chats will not be saved). I am Logos. How may I assist?";
        this.initialAiMessageAttuned = (userName) => `Greetings, ${userName}. I am Logos. How may I illuminate your path?`;
        this.initialAiMessageAwaiting = "Initializing... Awaiting attunement or guest connection.";

        this.chatBubble.addEventListener('click', () => this.toggleChatWindow());
        this.closeBtn.addEventListener('click', () => this.toggleChatWindow(false)); 
        this.chatSendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.chatSendBtn.disabled) {
                this.sendMessage();
            }
        });
        
        // Add initial awaiting message with rune effect
        this.addMessageToChat(this.initialAiMessageAwaiting, 'ai', 'Logos', true);
    }

    connectedCallback() {
        this.initFirebaseAuth();
        this._applyInitialRuneEffects();
    }
    
    _applyInitialRuneEffects() {
        this._revealText(this.chatHeaderSpan, "Logos Companion");
        this._revealText(this.loginBtn, "Attune");
        this._revealText(this.registerBtn, "Manifest");
        // Signout button is initially hidden, reveal effect will apply if/when it becomes visible
        // or we can apply it here and it'll take effect when display changes.
        this._revealText(this.signOutBtn, "Sever Link"); 
        this._revealText(this.chatSendBtn, "Whisper");

        this._revealText(this.authEmail, "Enter your weave-signature (Email)");
        this._revealText(this.authPassword, "Ancient passphrase (Password)");
        
        // Initial placeholder for chatInput is set when enabled/disabled
        // For the user-status, it's set in HTML, then updated dynamically by auth state
        this._revealText(this.userStatus, this.userStatus.textContent || "Initializing connection to the Weave...");
    }

    _revealText(element, actualText, { duration = 700, runePlaceholder = "✧❂❉✯✨✧"} = {}) {
        if (!element) return;

        const isInput = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
        const originalOpacity = element.style.opacity || '1';

        let textSetter, textGetter;

        if (isInput && element.hasAttribute('placeholder')) {
            textSetter = (val) => element.placeholder = val;
            textGetter = () => element.placeholder;
        } else {
            textSetter = (val) => element.textContent = val;
            textGetter = () => element.textContent;
        }

        if (element._revealTimeout) {
            clearTimeout(element._revealTimeout);
        }

        textSetter(runePlaceholder);
        element.style.opacity = '0.6'; 

        element._revealTimeout = setTimeout(() => {
            textSetter(actualText);
            element.style.opacity = originalOpacity; 
            element._revealTimeout = null; 
        }, duration);
    }


    initFirebaseAuth() {
        if (window.firebase && window.firebase.auth) {
            const auth = window.firebase.auth();

            auth.onAuthStateChanged(user => {
                this.updateAuthState(user);
            });

            this.loginBtn.addEventListener('click', () => this.handleLogin(auth));
            this.registerBtn.addEventListener('click', () => this.handleRegister(auth));
            this.signOutBtn.addEventListener('click', () => this.handleSignOut(auth));
        } else {
            this._revealText(this.userStatus, 'Error: Firebase nexus unreachable.');
            this.userStatus.style.color = '#ff8888'; 
            console.error("Logos Companion: Firebase auth is not available.");
            this.disableChat(true); 
            this.addMessageToChat("Logos cannot connect to the Weave's core. Attunement services are unavailable.", 'ai', 'Logos', true);
        }
    }

    updateAuthState(user) {
        // Clear previous messages, but not the very first "initializing" one if it's still revealing
        const firstMessage = this.chatMessages.firstElementChild;
        if (firstMessage && firstMessage.textContent !== this.initialAiMessageAwaiting && firstMessage.textContent !== "✧❂❉✯✨✧") {
             this.chatMessages.innerHTML = '';
        } else if (firstMessage && (firstMessage.textContent === this.initialAiMessageAwaiting || firstMessage.textContent === "✧❂❉✯✨✧")) {
            // Keep the first message if it's the initial one, it will be replaced by new auth messages
        } else {
            this.chatMessages.innerHTML = '';
        }


        if (user) { 
            const userNickname = user.email.split('@')[0];
            this._revealText(this.userStatus, `Attuned: ${user.email}`);
            this.userStatus.style.color = '#d1c4e9';
            this.authForm.style.display = 'none';
            this.signOutBtn.style.display = 'block';
            this._revealText(this.signOutBtn, "Sever Link"); // Re-apply if it was hidden
            this.authEmail.value = '';
            this.authPassword.value = '';
            this.enableChat(userNickname);
            this.addMessageToChat(this.initialAiMessageAttuned(userNickname), 'ai', 'Logos', true);
        } else { 
            this._revealText(this.userStatus, 'Whispering as Guest (chats are not saved). Attune to preserve your scrolls.');
            this.userStatus.style.color = '#b0bec5'; 
            this.authForm.style.display = 'block';
            this.signOutBtn.style.display = 'none';
             // Re-apply rune effect to login/register buttons if they become visible again
            this._revealText(this.loginBtn, "Attune");
            this._revealText(this.registerBtn, "Manifest");
            this._revealText(this.authEmail, "Enter your weave-signature (Email)");
            this._revealText(this.authPassword, "Ancient passphrase (Password)");

            this.enableChat("Guest");
            this.addMessageToChat(this.initialAiMessageGuest, 'ai', 'Logos', true);
        }
    }

    async handleLogin(auth) {
        const email = this.authEmail.value;
        const password = this.authPassword.value;
        if (!email || !password) {
            this._revealText(this.userStatus, 'Weave-signature and passphrase required.');
            this.userStatus.style.color = '#ffcc80'; 
            return;
        }
        try {
            this._revealText(this.userStatus, 'Attuning to the Weave...');
            this.userStatus.style.color = '#90caf9'; 
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            this._revealText(this.userStatus, `Attunement Failed: ${this.formatAuthError(error.message)}`);
            this.userStatus.style.color = '#ef9a9a'; 
            console.error("Login error:", error);
        }
    }

    async handleRegister(auth) {
        const email = this.authEmail.value;
        const password = this.authPassword.value;
         if (!email || !password) {
            this._revealText(this.userStatus, 'Weave-signature and passphrase required for manifestation.');
            this.userStatus.style.color = '#ffcc80';
            return;
        }
        if (password.length < 6) {
            this._revealText(this.userStatus, 'Passphrase must be at least 6 characters.');
            this.userStatus.style.color = '#ffcc80';
            return;
        }
        try {
            this._revealText(this.userStatus, 'Manifesting new signature...');
            this.userStatus.style.color = '#90caf9';
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (error) {
            this._revealText(this.userStatus, `Manifestation Error: ${this.formatAuthError(error.message)}`);
            this.userStatus.style.color = '#ef9a9a';
            console.error("Registration error:", error);
        }
    }

    async handleSignOut(auth) {
        try {
            this._revealText(this.userStatus, 'Severing link from the Weave...');
            this.userStatus.style.color = '#90caf9';
            await auth.signOut();
        } catch (error) {
            this._revealText(this.userStatus, `Severance Error: ${this.formatAuthError(error.message)}`);
            this.userStatus.style.color = '#ef9a9a';
            console.error("Sign out error:", error);
        }
    }

    formatAuthError(errorMessage) {
        if (errorMessage.includes('(auth/invalid-email)')) return 'Invalid weave-signature format.';
        if (errorMessage.includes('(auth/user-not-found)')) return 'Signature not found in the Weave.';
        if (errorMessage.includes('(auth/wrong-password)')) return 'Incorrect ancient passphrase.';
        if (errorMessage.includes('(auth/email-already-in-use)')) return 'Signature already manifest.';
        if (errorMessage.includes('(auth/weak-password)')) return 'Passphrase too fragile for the Weave.';
        const cleanedMessage = errorMessage.replace('Firebase: ', '').replace(/ \(auth\/[-a-z]+\)\.?/i, '');
        return cleanedMessage.charAt(0).toUpperCase() + cleanedMessage.slice(1);
    }
    
    enableChat(userName = 'Seeker') {
        this.chatInput.disabled = false;
        this.chatSendBtn.disabled = false;
        this._revealText(this.chatInput, 'Whisper your query to the Weave...');
        this._revealText(this.chatSendBtn, "Whisper");
    }

    disableChat(isFirebaseError = false) {
        this.chatInput.disabled = true;
        this.chatSendBtn.disabled = true;
        if (isFirebaseError) {
             this._revealText(this.chatInput, 'Attunement services offline.');
        } else {
             this._revealText(this.chatInput, 'Attune to send whispers...');
        }
         this._revealText(this.chatSendBtn, "Whisper"); // Keep it consistent
    }

    toggleChatWindow(forceShow) {
        const isActive = this.chatWindow.classList.contains('active');
        if (typeof forceShow === 'boolean') {
            if (forceShow && !isActive) {
                 this.chatWindow.classList.add('active');
                 this.chatBubble.classList.add('hidden');
            } else if (!forceShow && isActive) {
                this.chatWindow.classList.remove('active');
                this.chatBubble.classList.remove('hidden');
            }
        } else { 
            this.chatWindow.classList.toggle('active');
            this.chatBubble.classList.toggle('hidden');
        }
         if (this.chatWindow.classList.contains('active') && !this.chatInput.disabled) {
            this.chatInput.focus(); 
        }
    }

    addMessageToChat(text, type = 'ai', senderName = 'Logos', applyRune = false) {
        const messageElement = document.createElement('p');
        messageElement.classList.add('message');
        
        let styledText = text;
        // Basic markdown-like bold/italics (can be expanded)
        styledText = styledText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        styledText = styledText.replace(/\*(.*?)\*/g, '<em>$1</em>');     // Italics

        if (type === 'user') {
            messageElement.classList.add('user-message');
            messageElement.innerHTML = styledText; // User messages don't get rune effect here
        } else if (type === 'ai') {
            messageElement.classList.add('ai-message');
             if (applyRune) this._revealText(messageElement, styledText);
             else messageElement.innerHTML = styledText;
        } else { 
            messageElement.classList.add('status-message');
            if (applyRune) this._revealText(messageElement, styledText);
            else messageElement.innerHTML = styledText;
        }
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    sendMessage() {
        const messageText = this.chatInput.value.trim();
        if (messageText && !this.chatInput.disabled) {
            const currentUser = window.firebase.auth().currentUser;
            const userName = currentUser ? currentUser.email.split('@')[0] : "Guest";
            this.addMessageToChat(messageText, 'user', userName); // No rune for user's own typed message
            
            this.chatInput.value = '';
            this.chatInput.focus(); 

            this.addMessageToChat('Logos is consulting the Weave...', 'status', 'Logos', true); // Status gets rune
            this.chatSendBtn.disabled = true; 
            
            setTimeout(() => {
                const statusMessages = this.chatMessages.querySelectorAll('.status-message');
                statusMessages.forEach(msg => {
                    // Check for rune placeholder or actual text to remove
                    if (msg.textContent.includes("consulting the Weave") || msg.textContent === "✧❂❉✯✨✧") {
                        msg.remove();
                    }
                });
                this.pingScrollServer(messageText); 
            }, 1500 + Math.random() * 1000); 
        }
    }

    async pingScrollServer(originalMessage = "") {
        try {
            this.addMessageToChat('Establishing connection to Scroll Server...', 'status', 'Logos', true);
            const scrollServerUrl = 'https://scroll-server-service-944565004118.northamerica-northeast1.run.app';
            const response = await fetch(`${scrollServerUrl}/ping`); 
            
            const statusMessages = this.chatMessages.querySelectorAll('.status-message');
            statusMessages.forEach(msg => {
                if (msg.textContent.includes("Establishing connection") || msg.textContent === "✧❂❉✯✨✧") {
                    msg.remove();
                }
            });

            if (response.ok) {
                const text = await response.text();
                console.log('Scroll server ping successful:', text);
                this.addMessageToChat(`Connection to Scroll Server: **SUCCESSFUL**. Server echoes: "*${text}*". The Weave is responsive regarding your query: "*${originalMessage}*".`, 'ai', 'Logos', true);
            } else {
                console.error('Scroll server ping failed:', response.status, response.statusText);
                this.addMessageToChat(`**ERROR** - Scroll Server Connection **FAILED** (Code: ${response.status}). The Weave remains silent for now.`, 'ai', 'Logos', true);
            }
        } catch (error) {
            console.error('Error pinging scroll server:', error);
            const statusMessages = this.chatMessages.querySelectorAll('.status-message');
             statusMessages.forEach(msg => {
                if (msg.textContent.includes("Establishing connection") || msg.textContent === "✧❂❉✯✨✧") {
                    msg.remove();
                }
            });
            this.addMessageToChat(`**ERROR** - Scroll Server Connection **INTERRUPTED**: *${error.message}*. The pathways are obscured.`, 'ai', 'Logos', true);
        } finally {
             if (!this.chatInput.disabled) { 
                this.chatSendBtn.disabled = false;
             }
        }
    }
}

customElements.define('logos-companion', LogosCompanion);
