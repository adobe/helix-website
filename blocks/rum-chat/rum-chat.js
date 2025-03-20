let messageHistory = [];

async function callAnthropicAPI(message, onChunk = null) {
  messageHistory.push({ role: 'user', content: message });

  try {
    const requestBody = {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      messages: messageHistory,
    };

    const apiKey = localStorage.getItem('anthropicApiKey') || '';

    if (!apiKey) {
      throw new Error('API key not found');
    }
    
    const response = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed (${response.status})`);
    }

    // Process the response as standard JSON
    const data = await response.json();
    
    if (!data?.content?.[0]?.text) {
      throw new Error('Unexpected API response format');
    }
    
    const assistantMessage = data.content[0].text;
    messageHistory.push({ role: 'assistant', content: assistantMessage });
    
    // If streaming is requested, simulate it by breaking up the response
    if (onChunk) {
      // Simulate streaming by breaking the message into small segments
      let currentPosition = 0;
      const chunkSize = 3; // Number of characters per chunk
      
      while (currentPosition < assistantMessage.length) {
        const end = Math.min(currentPosition + chunkSize, assistantMessage.length);
        const chunk = assistantMessage.substring(currentPosition, end);
        onChunk(chunk);
        currentPosition = end;
        
        // Add a small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 15));
      }
      
      return assistantMessage;
    } else {
      return assistantMessage;
    }
  } catch (error) {
    console.error('Error calling Anthropic API via proxy:', error);
    throw error;
  }
}

async function sendMessage(block) {
  const input = block.querySelector('#user-input');
  const messagesDiv = block.querySelector('#messages');
  const userMessage = input.value.trim();

  if (!userMessage) return;

  // Create message elements
  const createMessageElement = (text, className) => {
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.textContent = text;
    return div;
  };

  // Add user message to chat
  messagesDiv.appendChild(createMessageElement(userMessage, 'user-message'));
  
  // Clear input and focus for next message
  input.value = '';
  input.focus();

  // Create response element for streaming
  const claudeDiv = createMessageElement('', 'claude-message');
  messagesDiv.appendChild(claudeDiv);
  
  try {
    // Get Claude's response with streaming
    await callAnthropicAPI(userMessage, (chunk) => {
      // Append each chunk to the response element as it arrives
      claudeDiv.textContent += chunk;
      
      // Scroll to bottom with each chunk
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  } catch (error) {
    claudeDiv.className = 'message claude-message error';
    claudeDiv.textContent = `Error getting response from Claude: ${error.message}`;
  } finally {
    // Final scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

export default async function decorate(block) {
  messageHistory = [];

  const chatInterface = document.createElement('div');
  chatInterface.className = 'chat-interface';

  chatInterface.innerHTML = `
    <div id="messages" class="messages"></div>
    <div class="input-area">
      <input type="text" id="user-input" placeholder="Type your message...">
      <button id="send-button">Send</button>
    </div>
  `;

  block.textContent = '';
  block.appendChild(chatInterface);

  const sendButton = block.querySelector('#send-button');
  const userInput = block.querySelector('#user-input');

  if (!sendButton || !userInput) {
    console.error('Required elements not found');
    return;
  }

  // Add event listeners
  sendButton.addEventListener('click', () => sendMessage(block));
  userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage(block);
  });
  
  // Focus input on load
  userInput.focus();
}
