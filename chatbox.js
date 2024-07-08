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
    this.iconWidget = "";
    this.closeIconPath = "";

    this.fetchChatboxConfig();
  }

  addTypingAnimation() {
    const typingContainer = document.createElement("div");
    typingContainer.className =
      "chatbox-message-container bot typing-container";
    const typingDots = `
      <div class="typing-animation">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;
    typingContainer.innerHTML = typingDots;
    this.chatMessages.appendChild(typingContainer);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    return typingContainer;
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

    this.iconWidget = icon_widget;
    this.closeIconPath = closeIconPath;

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
      chatButton.style.backgroundSize = "24px 24px";
      chatButton.style.backgroundPosition = "center";
      chatButton.style.backgroundRepeat = "no-repeat";
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
    const existingChatbox = document.querySelector(".chatbox-container");
    if (existingChatbox) {
      existingChatbox.remove();
    }
    this.chatboxElement = document.createElement("div");
    this.chatboxElement.className = "chatbox-container";
    this.chatboxElement.innerHTML = `
      <div class="chatbox-header">
        <div class="chatbox-header-buttons">
          <button class="reload-button"><img src="${reload}" alt="Reload"></button>
        </div>
        <div class="chatbox-header-avatar-wrapper">
          <span class="chatBotName">${this.chatBotName}</span>
        </div>
      </div>
      <div id="chatMessages" class="chatbox-messages"></div>
      <div class="chatbox-input">
        <textarea id="chatInput" placeholder="Type a message..."></textarea>
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

    this.reloadButton.addEventListener("click", () => this.reloadChatbox());

    this.chatButton.addEventListener("click", () => {
      if (this.chatboxElement.style.display === "none") {
        this.openChatbox();
      } else {
        this.closeChatbox();
      }
    });

    this.chatboxElement.style.display = "none";
  }

  openChatbox() {
    this.chatboxElement.style.display = "flex";
    this.chatButton.style.backgroundImage = `url(${closeIconPath})`;
  }

  closeChatbox() {
    this.chatboxElement.style.display = "none";
    this.chatButton.style.backgroundImage = `url(${this.iconWidget})`;
    this.chatButton.style.backgroundSize = "24px 24px";
    this.chatButton.style.backgroundPosition = "center";
    this.chatButton.style.backgroundRepeat = "no-repeat";
  }

  reloadChatbox() {
    this.chatMessages.innerHTML = "";
    this.fetchChatboxConfig().then(() => {
      this.openChatbox();
    });
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
    this.addMessage("user", answer.question);

    // Add typing animation
    const typingContainer = this.addTypingAnimation();

    // Simulate delay for typing animation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Remove typing animation
    typingContainer.remove();

    this.addMessage("bot", answer.answer, this.iconBot);
  }

  async sendMessage() {
    const message = this.chatInput.value;
    if (!message) return;

    this.addMessage("user", message);
    this.chatInput.value = "";

    // Add typing animation
    const typingContainer = this.addTypingAnimation();

    const botResponse = await this.getBotResponse(
      this.secretChatId,
      message,
      this.domainHostName
    );

    const formattedResponse = this.formatText(botResponse);

    // Remove typing animation
    typingContainer.remove();

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

      if (
        data.detail &&
        data.detail === "chat requests cannot be sent from this domain"
      ) {
        return data.detail;
      }

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

      *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      ul, ol {
        padding: 0 !important;
      }
  
      .chatbox-container {
        width: 450px;
        height: 600px;
        position: fixed;
        bottom: 100px;
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

      .chatbox-message-container.bot ol{
        padding: 0 !important;
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
    
      .chatbox-input textarea {
        resize: none;
        flex: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
        outline: none;
        box-shadow: none;
        font-family: "Inter";
        align-content: center;
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
        top: 20px;
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
        height: 70px;
        width: 70px;
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
        background: #F8F8F8;
        color: #333;
        padding: 10px !important;
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
        padding: 10px !important;
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
        font-family: "Inter";
        font-weight: 500;
      }

      .icon-wrapper{
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        background: #F8F8F8;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        margin-right: 10px;
      }
      
      .bot-icon {
        width: 14px;
        height: 14px;
      }

      .typing-animation {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--main-color);
        padding: 10px;
        border-radius: 4px;
        gap: 5px;
      }
    
      .dot {
        width: 6px;
        height: 6px;
        background-color: #FFF;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
      }
    
      .dot:nth-child(2) {
        animation-delay: 0.2s;
      }
    
      .dot:nth-child(3) {
        animation-delay: 0.4s;
      }
    
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      @media screen and (max-width: 440px) {
        .chatbox-container{
          right: 8px;
          width: 96%;
          height: 90%;
          bottom: 80px
        }

        .chatbox-chat-button{
          height: 50px;
          width: 50px;
        }
      }
    `;
document.head.appendChild(styles);

//<img src="${agentAvatarPath}" alt="Agent" class="agent-avatar"> inside class chatbox-header-avatar-wrapper before name
