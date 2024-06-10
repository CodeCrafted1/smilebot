class Chatbox {
  constructor(options) {
    this.agentId = options.agentId;
    this.contact = options.contact || {};
    this.initialMessages = options.initialMessages || [];
    this.context = options.context || "";

    this.createChatbox();
    this.initMessages();
    this.fetchChatboxConfig();
  }

  async fetchChatboxConfig() {
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          mainColor: "red",
          chatbotIcon: "../img/agent-awatar.svg",
          widgetIcon: "../img/widget-icon.svg",
        });
      }, 1000);
    });

    // Update colors and icons
    const { mainColor, chatbotIcon, widgetIcon } = response;

    // Update main color
    document.documentElement.style.setProperty("--main-color", mainColor);

    // Update styles
    this.chatboxElement.querySelector(".chatbox-header").style.backgroundColor =
      mainColor;
    this.chatboxElement.querySelector(
      ".chatbox-message.bot"
    ).style.backgroundColor = mainColor;

    // Update avatar icon
    this.chatboxElement.querySelector(".agent-avatar").src = chatbotIcon;

    // Update widget icon
    this.chatButton.style.backgroundImage = `url(${widgetIcon})`;
  }

  createChatbox() {
    this.chatboxElement = document.createElement("div");
    this.chatboxElement.className = "chatbox-container";
    this.chatboxElement.innerHTML = `
          <div class="chatbox-header">
            <div class="chatbox-header-avatar-wrapper">
              <img src="agent-avatar.png" alt="Agent" class="agent-avatar">
              <span>Adam</span>
            </div>
            <button class="close-button"><img src="../img/close.svg" alt="close"></button>
          </div>
          <div id="chatMessages" class="chatbox-messages"></div>
          <div class="chatbox-input">
            <input type="text" id="chatInput" placeholder="Type a message..." />
            <button id="sendButton"><img src="../img/send.svg" alt="Send"></button>
          </div>
          <div class="chatbox-footer">
            <img src="../img/logo.svg" alt="logo"/> <span>Powered by <a href="https://chatlix.eu" class="chatbox-footer-link">Chatlix.eu</a></span>
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

    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
    this.closeButton.addEventListener("click", () => {
      this.chatboxElement.style.display = "none";
      this.chatButton.style.display = "flex";
    });

    this.chatButton.addEventListener("click", () => {
      this.chatboxElement.style.display = "flex";
      this.chatButton.style.display = "none";
    });

    this.chatboxElement.style.display = "none";
  }

  initMessages() {
    this.initialMessages.forEach((message) => {
      this.addMessage("bot", message);
    });
  }

  addMessage(from, message) {
    const messageElement = document.createElement("div");
    messageElement.className = `chatbox-message ${from}`;
    messageElement.innerText = message;
    this.chatMessages.appendChild(messageElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  async sendMessage() {
    const message = this.chatInput.value;
    if (!message) return;

    this.addMessage("user", message);
    this.chatInput.value = "";

    // Simulate bot response for testing purposes
    this.addMessage("bot", `You said: ${message}`);
  }
}

// Initialize chatbox
export function initBubble(options) {
  new Chatbox(options);
}

// Add styles to match the provided screenshot
const styles = document.createElement("style");
styles.innerHTML = `
      :root {
        --main-color: #f37021; /* Default color */
      }
  
      .chatbox-container {
        width: 300px;
        height: 400px;
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        border-radius: 10px;
      }
    
      .chatbox-header {
        background: var(--main-color);
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
  
      .close-button{
          background: transparent;
          border: none;
      }
    
      .agent-avatar {
        width: 30px;
        height: 30px;
        margin-right: 10px;
      }

      .chatbox-header-avatar-wrapper{
        display: flex;
        align-items: center;
      }
    
      .chatbox-messages {
        flex: 1;
        padding: 10px;
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
        top: 17px;
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
    
      .chatbox-message.bot {
        text-align: left;
        background: var(--main-color);
        color: white;
        padding: 5px 10px;
        border-radius: 10px;
        margin-bottom: 12px;
        width: fit-content;
        font-size: 12px;
      }
    
      .chatbox-message.user {
        text-align: right;
        background: #F8F8F8;
        color: #000000;
        padding: 5px 10px;
        border-radius: 10px;
        margin-bottom: 5px;
        font-size: 12px;
        width: fit-content;
        margin-left: auto;
      }
    `;
document.head.appendChild(styles);

console.log("chatbox.js loaded");
