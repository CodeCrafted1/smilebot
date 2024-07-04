import { generateUUID } from "./uuid.js";

// Створення нового UUID при завантаженні сторінки
const currentUUID = generateUUID();

const agentAvatarPath =
  "https://codecrafted1.github.io/smilebot/img/agent-avatar.svg";
const closeIconPath = "https://codecrafted1.github.io/smilebot/img/close.svg";
const sendIconPath = "https://codecrafted1.github.io/smilebot/img/send.svg";
const logoPath = "https://codecrafted1.github.io/smilebot/img/logo.svg";
const reload = "https://codecrafted1.github.io/smilebot/img/reload.svg";

class Chatbox {
  constructor(options) {
    this.agentId = options.agentId;
    this.contact = options.contact || {};
    this.initialMessages = options.initialMessages || [];
    this.context = options.context || "";
    this.secretChatId = options.secret_chat_id;
    this.currentUUID = currentUUID;
    this.chatBotName = options.name_chat_bot;
    this.domainHostName = window.location.hostname;

    this.fetchChatboxConfig();
  }

  async fetchChatboxConfig() {
    const response = await fetch(
      "https://smilebot-sk-1.onrender.com/api/chat-bot/get-style-predifened-answer/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret_key: this.secretChatId,
          user_uuid: this.currentUUID,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch chatbox config");
      return;
    }

    this.createChatbox();
    this.initMessages();

    const data = await response.json();
    const {
      style: { icon_bot = agentAvatarPath, icon_widget = logoPath, main_color },
      start_message,
      predefined_answers,
    } = data;

    const sendButton = this.chatboxElement.querySelector("#sendButton img");
    if (sendButton) {
      sendButton.style.path = main_color;
    }

    // Update main color
    document.documentElement.style.setProperty("--main-color", main_color);

    // Get elements
    const chatboxHeader = this.chatboxElement.querySelector(".chatbox-header");
    const agentAvatar = this.chatboxElement.querySelector(".agent-avatar");
    const chatButton = this.chatButton;

    // Check if elements exist before updating styles
    if (chatboxHeader) {
      chatboxHeader.style.backgroundColor = main_color;
    } else {
      console.error(".chatbox-header not found");
    }

    if (agentAvatar) {
      agentAvatar.src = icon_bot;
    } else {
      console.error(".agent-avatar not found");
    }

    if (chatButton) {
      chatButton.style.backgroundImage = `url(${icon_widget})`;
    } else {
      console.error("#chatButton not found");
    }

    // Save bot icon URL
    this.iconBot = icon_bot;

    // Display start_message
    if (start_message && start_message.length > 0) {
      this.addMessage("bot", start_message[0].message, this.iconBot);
    }

    // Display predefined_answers as buttons
    if (predefined_answers && predefined_answers.length > 0) {
      this.displayPredefinedAnswers(predefined_answers);
    }
  }

  formatText(message) {
    // Handle bold text: **text**
    message = message.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    // Handle italic text: *text*
    message = message.replace(/\*(.*?)\*/g, "<i>$1</i>");

    // Handle headings: # Heading
    message = message.replace(/^#\s(.*$)/gm, "<h1>$1</h1>");

    // Handle unordered list: - List item
    message = message.replace(/^\s*-\s(.*)$/gm, "<li>$1</li>");
    message = `<ul>${message}</ul>`;

    // Handle ordered list: 1. List item
    message = message.replace(/^\s*\d+\.\s(.*)$/gm, "<li>$1</li>");
    message = `<ol>${message}</ol>`;

    // Handle links: [Link text](url)
    message = message.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank">$1</a>'
    );

    // Handle inline code: `code`
    message = message.replace(/`(.*?)`/g, "<code>$1</code>");

    // Handle blockquotes: > Quote
    message = message.replace(/^\s*>\s(.*)$/gm, "<blockquote>$1</blockquote>");

    return message;
  }

  createChatbox() {
    this.chatboxElement = document.createElement("div");
    this.chatboxElement.className = "chatbox-container";
    this.chatboxElement.innerHTML = `
      <div class="chatbox-header">
        <div class="chatbox-header-buttons">
          <button class="close-button"><img src="${closeIconPath}" alt="close"></button>
          <button class="reload-button"><img src="${reload}" alt="Reload"></button>
        </div>
        <div class="chatbox-header-avatar-wrapper">
          <span class="chatBotName">${this.chatBotName}</span>
        </div>
      </div>
      <div id="chatMessages" class="chatbox-messages"></div>
      <div class="chatbox-input">
        <input type="text" id="chatInput" placeholder="Type a message..." />
        <button id="sendButton"><img class="send-button" src="${sendIconPath}" alt="Send"></button>
      </div>
      <div class="chatbox-footer">
        <img src="${logoPath}" alt="logo" class="logo"/> <span>Powered by <a href="https://chatlix.eu" class="chatbox-footer-link">Chatlix.eu</a></span>
      </div>
    `;

    this.chatButton = document.createElement("button");
    this.chatButton.id = "chatButton";
    this.chatButton.className = "chatbox-chat-button";
    document.body.appendChild(this.chatButton);

    document.body.appendChild(this.chatboxElement);

    this.chatMessages = this.chatboxElement.querySelector("#chatMessages");
    this.chatInput = this.chatboxElement.querySelector("#chatInput");
    this.sendButton = this.chatboxElement.querySelector("#sendButton");
    this.closeButton = this.chatboxElement.querySelector(".close-button");
    this.reloadButton = this.chatboxElement.querySelector(".reload-button");

    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
    this.closeButton.addEventListener("click", () => {
      this.chatboxElement.style.display = "none";
      this.chatButton.style.display = "flex";
    });

    this.reloadButton.addEventListener("click", () => this.reloadChatbox());

    this.chatButton.addEventListener("click", () => {
      this.chatboxElement.style.display = "flex";
      this.chatButton.style.display = "none";
    });

    this.chatboxElement.style.display = "none";
  }

  reloadChatbox() {
    this.chatMessages.innerHTML = "";
    this.fetchChatboxConfig();
    this.initMessages();
  }

  initMessages() {
    this.initialMessages.forEach((message) => {
      this.addMessage("bot", message);
    });
  }

  addMessage(from, message, iconUrl) {
    const messageContainer = document.createElement("div");
    messageContainer.className = `chatbox-message-container ${from}`;

    if (from === "bot" && iconUrl) {
      const wrapper = document.createElement("div");
      wrapper.className = "icon-wrapper";

      const icon = document.createElement("img");
      icon.src = iconUrl;
      icon.className = "bot-icon";

      wrapper.appendChild(icon);
      messageContainer.appendChild(wrapper);
    }

    const messageElement = document.createElement("div");
    messageElement.className = `chatbox-message ${from}`;

    // Check if the message contains ul, ol, li
    const containsLists = /<ul|<ol|<li/.test(message);

    if (from === "bot" && containsLists) {
      messageElement.style.padding = "0";
    } else {
      messageElement.style.padding = "5px 10px";
    }

    messageElement.innerHTML = message;

    messageContainer.appendChild(messageElement);
    this.chatMessages.appendChild(messageContainer);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  displayPredefinedAnswers(answers) {
    answers.forEach((answer) => {
      const button = document.createElement("button");
      button.className = "chatbox-predefined-answer";
      button.innerText = answer.question;
      button.addEventListener("click", () => {
        this.handlePredefinedAnswerClick(answer);
      });
      this.chatMessages.appendChild(button);
    });
  }

  async handlePredefinedAnswerClick(answer) {
    // Add user message
    this.addMessage("user", answer.question);

    // Add typing animation
    const typingMessage = document.createElement("div");
    typingMessage.className = "chatbox-message bot typing";
    typingMessage.innerText = "Bot is typing";
    this.chatMessages.appendChild(typingMessage);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

    // Simulate delay for typing animation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Remove typing animation
    typingMessage.remove();

    // Add bot response
    this.addMessage("bot", answer.answer, this.iconBot);
  }

  async sendMessage() {
    const message = this.chatInput.value;
    if (!message) return;

    this.addMessage("user", message);
    this.chatInput.value = "";

    // Add typing animation
    const typingMessage = document.createElement("div");
    typingMessage.className = "chatbox-message-container bot typing-container";
    const typingElement = document.createElement("div");
    typingElement.className = "chatbox-message bot typing";
    typingElement.innerText = ".";
    typingMessage.appendChild(typingElement);
    this.chatMessages.appendChild(typingMessage);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

    const botResponse = await this.getBotResponse(
      this.secretChatId,
      message,
      this.domainHostName
    );

    const formattedResponse = this.formatText(botResponse);

    // Remove typing animation
    typingMessage.remove();

    this.addMessage("bot", formattedResponse, this.iconBot);
  }

  async getBotResponse(secretKey, message, domain) {
    try {
      const response = await fetch(
        "https://smilebot-sk-1.onrender.com/api/chat-bot/do-request-chat-gpt/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            secret_key: secretKey,
            message: message,
            user_uuid: this.currentUUID,
            domain: domain,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Failed to get bot response:", error);
      return "Sorry, I couldn't process your request at the moment.";
    }
  }
}

// Initialize chatbox
export function initBubble(options) {
  new Chatbox(options);
}

// Add styles to match the provided screenshot
const styles = document.createElement("style");
styles.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
      :root {
        --main-color: #f37021; /* Default color */
      }

      ul, ol {
        padding: 0;
        margin-left: 4px;
      }
  
      .chatbox-container {
        width: 450px;
        height: 600px;
        position: fixed;
        bottom: 30px;
        right: 30px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }
    
      .chatbox-header {
        background: var(--main-color);
        color: white;
        padding: 20px 15px;
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        align-items: center;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
  
      .close-button{
          background: transparent;
          border: none;
      }

      .close-button img {
        width: 17px;
        height: 17px;
      }

      .logo {
       width: 25px;
      }

      .send-button {
         width: 23px;
         height: 23px;
        }

      .chatBotName {
        font-size: 18px;
        font-weight: 500;
        font-family: Inter;
      }

      .reload-button {
        background: transparent;
        border: none;
        cursor: pointer;
        margin-right: 10px;
      }
      
      .reload-button img {
        width: 17px;
        height: 17px;
      }

      .chatbox-header-buttons{
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
      }
    
      .agent-avatar {
        width: 30px;
        height: 30px;
        margin-right: 10px;
        border-radius: 50%;
      }

      .chatbox-header-avatar-wrapper{
        display: flex;
        align-items: center;
      }

      .chatbox-message-container {
        display: flex;
        width: 100%;
        margin-bottom: 12px;
      }
      
      .chatbox-message-container.bot {
        justify-content: flex-start;
      }
      
      .chatbox-message-container.user {
        justify-content: flex-end;
      }
    
      .chatbox-messages {
        flex: 1;
        padding: 20px 10px;
        overflow-y: auto;
        background: #fff;
        height: 266px;
        overflow: auto;
      }
    
      .chatbox-input {
        display: flex;
        padding: 10px;
        position: relative;
      }
    
      .chatbox-input input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
        outline: none;
        box-shadow: none;
      }
    
      .chatbox-input button {
        padding: 5px 10px;
        border: none;
        background: transparent;
        color: white;
        cursor: pointer;
        border-radius: 3px;
        position: absolute;
        right: 15px;
        top: 12px;
      }
    
      .chatbox-footer {
        padding: 10px;
        text-align: center;
        align-items: center;
        display: flex;
        margin: 0 auto;
        font-size: 12px;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
  
      .chatbox-footer-link{
          text-decoration: none;
          color: var(--main-color);
      }
    
      .chatbox-chat-button {
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: var(--main-color);
        color: white;
        border: none;
        height: 61px;
        width: 61px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        background-repeat: no-repeat;
        background-position: center;
      }
    
      .chatbox-message.user {
        text-align: right;
        background: #eee;
        color: #333;
        padding: 5px 10px;
        border-radius: 10px;
        margin-bottom: 12px;
        max-width: 70%;
        align-self: flex-end;
        font-size: 12px;
        font-family: "Inter"
      }
      
      .chatbox-message.bot {
        text-align: left;
        background: var(--main-color);
        color: white;
        border-radius: 10px;
        margin-bottom: 12px;
        padding: 5px 10px;
        min-width: 15px;
        max-width: fit-content;
        align-self: flex-start;
        font-size: 12px;
        font-family: "Inter"
      }
      
      .chatbox-predefined-answer {
        background: transparent;
        color: white;
        border: 1px solid var(--main-color);
        padding: 5px 10px;
        color: var(--main-color);
        margin: 5px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        font-family: "Inter"
      }

      .typing::after {
        content: ".";
        animation: dots 1s steps(5, end) infinite;
      }
      
      @keyframes dots {
        0%, 20% {
          color: transparent;
          text-shadow: .25em 0 0 transparent, .5em 0 0 transparent;
        }
        40% {
          color: #fff;
          text-shadow: .25em 0 0 #fff, .5em 0 0 transparent;
        }
        60% {
          text-shadow: .25em 0 0 #fff, .5em 0 0 #fff;
        }
        80%, 100% {
          text-shadow: .25em 0 0 #fff, .5em 0 0 #fff;
        }
      }

      .icon-wrapper{
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        background: #F8F8F8;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        margin-right: 10px;
      }
      
      .bot-icon {
        width: 14px;
        height: 14px;
      }

      @keyframes typing {
        0% {
          width: 5px;
          height: 5px;
          background-color: #fff;
        }
        33% {
          width: 5px;
          height: 5px;
          background-color: #fff;
        }
        66% {
          width: 5px;
          height: 5px;
          background-color: #fff;
        }
        100% {
          width: 5px;
          height: 5px;
          background-color: #fff;
        }
      }
    `;
document.head.appendChild(styles);

//<img src="${agentAvatarPath}" alt="Agent" class="agent-avatar"> inside class chatbox-header-avatar-wrapper before name
