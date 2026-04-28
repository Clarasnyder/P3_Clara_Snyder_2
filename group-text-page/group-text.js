const chatTitle = document.getElementById("chat-title");
const chatSubtitle = document.getElementById("chat-subtitle");
const chatThread = document.getElementById("chat-thread");
const chatCompose = document.getElementById("chat-compose");
const chatInput = document.getElementById("chat-input");
const params = new URLSearchParams(window.location.search);

const conversationSeed = {
  "Brunch club": {
    subtitle: "24 members",
    messages: [
      { author: "Ava", text: "Saturday still works for me. Who's free at 11?", self: false },
      { author: "You", text: "I can do 11. Want to try the place on Central?", self: true },
      { author: "Mia", text: "Yes please. I've been wanting to go there for weeks.", self: false },
      { author: "Noah", text: "I'll be a little late but I can meet everyone there.", self: false },
      { author: "You", text: "Perfect. I can make us a reservation for six.", self: true }
    ]
  },
  "Crafting crew": {
    subtitle: "19 members",
    messages: [
      { author: "Lena", text: "I can bring yarn and extra scissors.", self: false },
      { author: "You", text: "Amazing. I'll bring glue sticks and some paper.", self: true },
      { author: "Reese", text: "Can we do vision boards this week?", self: false },
      { author: "Tara", text: "Yes, and I have magazines for everyone.", self: false }
    ]
  },
  Pickleball: {
    subtitle: "27 members",
    messages: [
      { author: "Sam", text: "Your link request is still pending.", self: false },
      { author: "You", text: "Sounds good. Let me know when I'm in.", self: true },
      { author: "Chris", text: "Open play starts at 6 if it goes through today.", self: false }
    ]
  },
  Maya: {
    subtitle: "Direct message",
    messages: [
      { author: "Maya", text: "Want to check out that market after class?", self: false },
      { author: "You", text: "Yes, I was hoping you'd ask.", self: true },
      { author: "Maya", text: "Perfect. Let's go around 4:30.", self: false }
    ]
  },
  "Running club": {
    subtitle: "31 members",
    messages: [
      { author: "Eli", text: "Route vote is up. River trail is winning right now.", self: false },
      { author: "You", text: "River trail gets my vote too.", self: true },
      { author: "Coach Ana", text: "We'll lock the route in tonight.", self: false }
    ]
  },
  Jordan: {
    subtitle: "Direct message",
    messages: [
      { author: "Jordan", text: "I found that cafe you were talking about.", self: false },
      { author: "You", text: "No way. Is it actually good?", self: true },
      { author: "Jordan", text: "Very good. We should go this weekend.", self: false }
    ]
  },
  "Art walk": {
    subtitle: "14 members",
    messages: [
      { author: "Nina", text: "Meet near the front entrance at 6:30.", self: false },
      { author: "You", text: "Got it. I'll be there a little early.", self: true },
      { author: "Leo", text: "I'm bringing two friends along.", self: false }
    ]
  }
};

const activeTitle = params.get("title") || "Brunch club";
const conversation = conversationSeed[activeTitle] || {
  subtitle: "Conversation",
  messages: [{ author: activeTitle, text: "Hey there!", self: false }]
};

function createMessageRow({ author, text, self }) {
  const row = document.createElement("article");
  const authorElement = document.createElement("p");
  const bubble = document.createElement("div");

  row.className = self ? "message-row message-row-self" : "message-row";
  authorElement.className = "message-author";
  bubble.className = "message-bubble";

  authorElement.textContent = author;
  bubble.textContent = text;

  row.append(authorElement, bubble);
  return row;
}

function renderMessages() {
  chatTitle.textContent = activeTitle;
  chatSubtitle.textContent = conversation.subtitle;
  chatInput.placeholder = `Message ${activeTitle}`;
  document.title = `${activeTitle} Chat`;
  chatThread.innerHTML = "";

  conversation.messages.forEach((message) => {
    chatThread.appendChild(createMessageRow(message));
  });

  chatThread.scrollTop = chatThread.scrollHeight;
}

function appendMessage(value) {
  const row = createMessageRow({
    author: "You",
    text: value,
    self: true
  });

  chatThread.appendChild(row);
  chatThread.scrollTop = chatThread.scrollHeight;
}

renderMessages();

chatCompose.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = chatInput.value.trim();

  if (!value) {
    return;
  }

  appendMessage(value);
  chatInput.value = "";
  chatInput.focus();
});
