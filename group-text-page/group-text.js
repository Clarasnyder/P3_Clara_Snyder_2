const chatTitle = document.getElementById("chat-title");
const chatSubtitle = document.getElementById("chat-subtitle");
const chatThread = document.getElementById("chat-thread");
const chatCompose = document.getElementById("chat-compose");
const chatInput = document.getElementById("chat-input");
const params = new URLSearchParams(window.location.search);
const isFramed = window.parent !== window;
const isEmbedded = params.get("embedded") === "1" || isFramed;
const returnTo = params.get("returnTo") || "";
const backLink = document.querySelector(".back-link");
const profileNavLink = document.getElementById("profile-nav-link");
const groupsNavLink = document.getElementById("groups-nav-link");
const messagesNavLink = document.getElementById("messages-nav-link");

document.documentElement.classList.toggle("is-embedded", isEmbedded);
document.documentElement.classList.toggle("is-framed", isFramed);

const conversationSeed = {
  "Brunch Club": {
    subtitle: "24 members",
    messages: [
      { author: "Ava", text: "Saturday still works for me. Who's free at 11?", self: false },
      { author: "You", text: "I can do 11. Want to try the place on Central?", self: true },
      { author: "Mia", text: "Yes please. I've been wanting to go there for weeks.", self: false },
      { author: "Noah", text: "I'll be a little late but I can meet everyone there.", self: false },
      { author: "You", text: "Perfect. I can make us a reservation for six.", self: true }
    ]
  },
  "Crafting Crew": {
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

const activeTitle = params.get("title") || "Brunch Club";
const conversation = conversationSeed[activeTitle] || {
  subtitle: "Direct message",
  messages: [
    { author: activeTitle, text: "Hey there! It was nice meeting you at the group.", self: false },
    { author: "You", text: "You too. I liked what you said about trying a smaller meetup first.", self: true },
    { author: activeTitle, text: "Same. Want to go to the next one together?", self: false },
    { author: "You", text: "Yes, that sounds way less intimidating.", self: true }
  ]
};

function postPanelNavigation(panel) {
  window.parent.postMessage({ type: "navigate-panel", panel }, "*");
}

function setupEmbeddedPanelSwipes() {
  if (!isEmbedded) {
    return;
  }

  let startX = 0;
  let startY = 0;
  let pointerId = null;
  let wheelDeltaX = 0;
  let wheelResetTimeout = null;

  const ignoredSwipeTarget = (target) =>
    target?.closest?.("input, textarea, select, button");

  const handleSwipeEnd = (endX, endY) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) < 72 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.35) {
      return;
    }

    postPanelNavigation(deltaX > 0 ? "groups" : "messages");
  };

  const resetWheelSwipe = () => {
    wheelDeltaX = 0;

    if (wheelResetTimeout) {
      window.clearTimeout(wheelResetTimeout);
      wheelResetTimeout = null;
    }
  };

  document.addEventListener(
    "touchstart",
    (event) => {
      if (ignoredSwipeTarget(event.target)) {
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      startX = touch.clientX;
      startY = touch.clientY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (event) => {
      if (ignoredSwipeTarget(event.target)) {
        return;
      }

      const touch = event.changedTouches[0];

      if (!touch) {
        return;
      }

      handleSwipeEnd(touch.clientX, touch.clientY);
    },
    { passive: true }
  );

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (ignoredSwipeTarget(event.target)) {
      return;
    }

    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });

  document.addEventListener("pointerup", (event) => {
    if (pointerId !== event.pointerId) {
      return;
    }

    pointerId = null;
    handleSwipeEnd(event.clientX, event.clientY);
  });

  document.addEventListener("pointercancel", () => {
    pointerId = null;
  });

  document.addEventListener(
    "wheel",
    (event) => {
      if (ignoredSwipeTarget(event.target)) {
        return;
      }

      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.35) {
        return;
      }

      event.preventDefault();
      wheelDeltaX += event.deltaX;

      if (Math.abs(wheelDeltaX) >= 72) {
        postPanelNavigation(wheelDeltaX < 0 ? "groups" : "messages");
        resetWheelSwipe();
        return;
      }

      if (wheelResetTimeout) {
        window.clearTimeout(wheelResetTimeout);
      }

      wheelResetTimeout = window.setTimeout(resetWheelSwipe, 180);
    },
    { passive: false }
  );
}

function setupEmbeddedMode() {
  if (!isEmbedded) {
    return;
  }

  if (!returnTo) {
    backLink?.setAttribute("href", "../messages-page/index.html?embedded=1");
  }

  groupsNavLink?.addEventListener("click", (event) => {
    event.preventDefault();
    postPanelNavigation("groups");
  });

  messagesNavLink?.addEventListener("click", (event) => {
    event.preventDefault();
  });

  profileNavLink?.addEventListener("click", (event) => {
    event.preventDefault();
    postPanelNavigation("profile");
  });
}

function setupBackLink() {
  if (!returnTo) {
    return;
  }

  const shouldReturnToUnderlyingPanel = returnTo === "panel";

  backLink?.setAttribute("href", shouldReturnToUnderlyingPanel ? "#" : returnTo);
  backLink?.setAttribute("aria-label", "Back to member profile");

  if (!isFramed) {
    return;
  }

  backLink?.addEventListener("click", (event) => {
    event.preventDefault();

    if (shouldReturnToUnderlyingPanel) {
      window.parent.postMessage({ type: "close-panel-overlay", panel: "messages" }, "*");
      return;
    }

    window.top.location.href = new URL(returnTo, window.location.href).href;
  });
}

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
  document.body.classList.toggle("is-group-thread", conversation.subtitle !== "Direct message");
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

setupBackLink();
setupEmbeddedMode();
setupEmbeddedPanelSwipes();
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
