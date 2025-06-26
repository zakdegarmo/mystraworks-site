#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const templatePath = path.join(__dirname, 'componentTemplate.js');
const componentsDir = path.join(__dirname, '../../frontend/src/components');

async function createComponent() {
  rl.question('Enter component name: ', async (componentName) => {
    if (!componentName) {
      console.error('Component name cannot be empty.');
      rl.close();
      return;
    }

    const componentFileName = `${componentName}.js`;
    const componentFilePath = path.join(componentsDir, componentFileName);

    if (fs.existsSync(componentFilePath)) {
      console.error(`Component "${componentName}" already exists.`);
      rl.close();
      return;
    }

    rl.question('Include chat functionality? (yes/no): ', async (includeChat) => {
      let templateContent = fs.readFileSync(templatePath, 'utf8');

      if (includeChat.toLowerCase() === 'yes') {
        // Replace chatUtils imports placeholder
        templateContent = templateContent.replace(
          '// Placeholder for chatUtils imports',
          "import { sendMessageToGemini, saveMessageToFirestore, fetchConversationHistory } from '../../utils/chatUtils';"
        );

        // Replace state management placeholder
        templateContent = templateContent.replace(
          '// Placeholder for state management',
          `  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');`
        );

        // Replace useEffect placeholder
        templateContent = templateContent.replace(
          '// Placeholder for useEffect (fetching history)',
          `  React.useEffect(() => {
    // Replace 'my-conversation' with actual conversation ID logic
    fetchConversationHistory('my-conversation').then(history => {
      if (history) {
        setMessages(history);
      }
    });
  }, []); // Empty dependency array means this runs once on mount`
        );

        // Replace handleSend function placeholder
        templateContent = templateContent.replace(
          '// Placeholder for handleSend function',
          `  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const newUserMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInput('');

    // Replace 'my-conversation' with actual conversation ID logic
    await saveMessageToFirestore('my-conversation', newUserMessage);

    try {
      const aiResponse = await sendMessageToGemini(input);
      const newAiMessage = { text: aiResponse, sender: 'ai', timestamp: new Date() };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);
      // Replace 'my-conversation' with actual conversation ID logic
      await saveMessageToFirestore('my-conversation', newAiMessage);
    } catch (error) {
      console.error('Error sending message or saving AI response:', error);
      // Handle error appropriately in the UI
    }
  };`
        );

        // Replace chat UI elements placeholder
        templateContent = templateContent.replace(
            '{/* Placeholder for chat UI elements */}',
            `<div className="chat-container">
        <div className="message-display">
          {messages.map((msg, index) => (
            <div key={index} className={\`message \${msg.sender}\`}>
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>`
        );


      }

      // Replace ComponentName placeholders
      const finalContent = templateContent.replace(/ComponentName/g, componentName);

      fs.writeFileSync(componentFilePath, finalContent, 'utf8');

      console.log(`Component "${componentName}" created at ${componentFilePath}`);
      rl.close();
    });
  });
}

createComponent();