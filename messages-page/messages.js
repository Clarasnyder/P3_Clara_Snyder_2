const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const conversationList = document.querySelector(".conversation-list");
const profileNavLink = document.getElementById("profile-nav-link");
const groupsNavLink = document.getElementById("groups-nav-link");
const directConversationsStorageKey = "linkDirectConversations";

document.documentElement.classList.toggle("is-embedded", isEmbedded);

function isReloadNavigation() {
  const navigationEntry = performance.getEntriesByType?.("navigation")?.[0];

  if (navigationEntry) {
    return navigationEntry.type === "reload";
  }

  return performance.navigation?.type === 1;
}

function resetDirectConversationsOnRefresh() {
  if (isReloadNavigation()) {
    localStorage.removeItem(directConversationsStorageKey);
  }
}

function readDirectConversations() {
  try {
    const stored = JSON.parse(localStorage.getItem(directConversationsStorageKey) || "[]");

    return Array.isArray(stored) ? stored.filter((conversation) => conversation?.title) : [];
  } catch {
    localStorage.removeItem(directConversationsStorageKey);
    return [];
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function buildConversationUrl(title) {
  const url = new URL("../group-text-page/index.html", window.location.href);

  url.searchParams.set("title", title);

  if (isEmbedded) {
    url.searchParams.set("embedded", "1");
  }

  return url.toString();
}

function createDirectConversationCard(conversation) {
  const link = document.createElement("a");
  const avatar = document.createElement("div");
  const copy = document.createElement("div");
  const name = document.createElement("p");
  const preview = document.createElement("p");
  const time = document.createElement("span");
  const title = conversation.title;

  link.className = "conversation-card conversation-link conversation-direct";
  link.href = buildConversationUrl(title);
  link.setAttribute("aria-label", `Open ${title} messages`);
  avatar.className = "conversation-avatar";
  avatar.setAttribute("aria-hidden", "true");
  copy.className = "conversation-copy";
  name.className = "conversation-name";
  preview.className = "conversation-preview";
  time.className = "conversation-time";

  avatar.textContent = getInitials(title);
  name.textContent = title;
  preview.textContent = conversation.preview || `You started a chat with ${title}.`;
  time.textContent = conversation.time || "Now";

  copy.append(name, preview);
  link.append(avatar, copy, time);
  return link;
}

function renderSavedDirectConversations() {
  if (!conversationList) {
    return;
  }

  readDirectConversations().reverse().forEach((conversation) => {
    const existingCard = [...conversationList.querySelectorAll(".conversation-link")].find((card) => {
      return card.querySelector(".conversation-name")?.textContent.trim() === conversation.title;
    });

    if (existingCard) {
      const preview = existingCard.querySelector(".conversation-preview");
      const time = existingCard.querySelector(".conversation-time");

      existingCard.href = buildConversationUrl(conversation.title);
      preview.textContent = conversation.preview || preview.textContent;
      time.textContent = conversation.time || time.textContent;
      conversationList.prepend(existingCard);
      return;
    }

    conversationList.prepend(createDirectConversationCard(conversation));
  });
}

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
  if (isEmbedded) {
    document.querySelectorAll(".conversation-link").forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.href);

      url.searchParams.set("embedded", "1");
      link.href = url.toString();
    });

    profileNavLink?.addEventListener("click", (event) => {
      event.preventDefault();
      postPanelNavigation("profile");
    });

    groupsNavLink?.addEventListener("click", (event) => {
      event.preventDefault();
      postPanelNavigation("groups");
    });
    return;
  }
}

resetDirectConversationsOnRefresh();
renderSavedDirectConversations();
setupEmbeddedMode();
setupEmbeddedPanelSwipes();
