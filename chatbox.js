class Chatbox {
    constructor(options) {
      console.log("Chatbox constructor called");
      this.agentId = options.agentId;
      this.contact = options.contact || {};
      this.initialMessages = options.initialMessages || [];
      this.context = options.context || '';
  
      this.createChatbox();
      this.initMessages();
    }
  
    createChatbox() {
      console.log("createChatbox called");
      this.chatboxElement = document.createElement('div');
      this.chatboxElement.style.position = 'fixed';
      this.chatboxElement.style.bottom = '20px';
      this.chatboxElement.style.right = '20px';
      this.chatboxElement.style.width = '300px';
      this.chatboxElement.style.height = '400px';
      this.chatboxElement.style.border = '1px solid #ccc';
      this.chatboxElement.style.borderRadius = '10px';
      this.chatboxElement.style.backgroundColor = '#fff';
      this.chatboxElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
      this.chatboxElement.style.overflow = 'hidden';
      this.chatboxElement.innerHTML = `
        <div style="height: 80%; overflow-y: auto; padding: 10px;" id="chatMessages"></div>
        <div style="height: 20%; padding: 10px; border-top: 1px solid #ccc;">
          <input type="text" id="chatInput" style="width: 80%;" placeholder="Type a message..." />
          <button id="sendButton" style="width: 20%;">Send</button>
        </div>
      `;
      document.body.appendChild(this.chatboxElement);
  
      this.chatMessages = this.chatboxElement.querySelector('#chatMessages');
      this.chatInput = this.chatboxElement.querySelector('#chatInput');
      this.sendButton = this.chatboxElement.querySelector('#sendButton');
  
      this.sendButton.addEventListener('click', () => this.sendMessage());
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
  
    initMessages() {
      console.log("initMessages called");
      this.initialMessages.forEach(message => {
        this.addMessage('bot', message);
      });
    }
  
    addMessage(from, message) {
      console.log("addMessage called");
      const messageElement = document.createElement('div');
      messageElement.style.padding = '10px';
      messageElement.style.margin = '10px 0';
      messageElement.style.borderRadius = '10px';
      messageElement.style.backgroundColor = from === 'bot' ? '#e0e0e0' : '#007bff';
      messageElement.style.color = from === 'bot' ? '#000' : '#fff';
      messageElement.style.textAlign = from === 'bot' ? 'left' : 'right';
      messageElement.innerText = message;
      this.chatMessages.appendChild(messageElement);
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  
    async sendMessage() {
      const message = this.chatInput.value;
      if (!message) return;
  
      console.log("sendMessage called");
      this.addMessage('user', message);
      this.chatInput.value = '';
  
      // Виклик API тимчасово закоментовано для перевірки роботи клієнта
      // const response = await fetch('/api/message', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: this.contact.userId, message })
      // });
  
      // const data = await response.json();
      // this.addMessage('bot', data.response);
  
      // Для тестування додамо тимчасову відповідь
      this.addMessage('bot', `You said: ${message}`);
    }
  }
  
  // Ініціалізація чатбота
  export function initBubble(options) {
    console.log("initBubble called");
    new Chatbox(options);
  }
  
  console.log('chatbox.js loaded');
  