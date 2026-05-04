const contentCards = document.querySelectorAll(".content-card");
const groupButtons = document.querySelectorAll(".card-action-button");
const searchInput = document.getElementById("search-input");
const dropdown = document.getElementById("search-dropdown");
const suggestionsRoot = document.getElementById("search-suggestions");
const pendingLinksShell = document.getElementById("pending-links-shell");
const pendingLinksList = document.getElementById("pending-links-list");
const scrollTail = document.getElementById("scroll-tail");
const searchOverlay = document.getElementById("search-overlay");
const searchOverlayBackdrop = document.getElementById("search-overlay-backdrop");
const searchOverlayFrame = document.getElementById("search-overlay-frame");
const profileLauncher = document.getElementById("profile-launcher");
const groupsLauncher = document.getElementById("groups-launcher");
const messagesLauncher = document.getElementById("messages-launcher");
const profileOverlay = document.getElementById("profile-overlay");
const profileOverlayBackdrop = document.getElementById("profile-overlay-backdrop");
const profileOverlayFrame = document.getElementById("profile-overlay-frame");
const messagesOverlay = document.getElementById("messages-overlay");
const messagesOverlayBackdrop = document.getElementById("messages-overlay-backdrop");
const messagesOverlayFrame = document.getElementById("messages-overlay-frame");
const page = document.querySelector(".page");
let searchOverlayOpenedAt = 0;
let embeddedSearchReady = false;
let pendingEmbeddedSearch = "";
let activePanel = "groups";
const storageKey = "linkRequests";
const defaultCenter = { lat: 35.9606, lng: -83.9207 };
const panelNavBackgrounds = {
  profile: "#f4f8ff",
  messages: "#f4f8ff"
};
const seedSuggestions = [
  "pickleball",
  "hiking",
  "running club",
  "book club",
  "brunch",
  "coffee meetups",
  "scrapbooking",
  "pottery",
  "movie nights",
  "volunteering",
  "study group",
  "language exchange",
  "networking",
  "pet sitting",
  "babysitting",
  "housesitting",
  "game night",
  "tennis",
  "badminton",
  "pilates",
  "yoga",
  "cooking class",
  "art walk",
  "photography",
  "live music",
  "museum trip",
  "dog walking",
  "gardening",
  "cycling",
  "camping"
];
const descriptionParts = [
  "Welcoming local meetups for",
  "Relaxed weekly hangs built around",
  "A nearby community that gets together for",
  "Casual social gatherings focused on",
  "Friendly meetups where people connect over"
];
const detailParts = [
  "easy conversation and making new friends.",
  "after-work plans and low-pressure group events.",
  "beginner-friendly meetups around town.",
  "recurring neighborhood sessions and spontaneous plans.",
  "meeting up with people who share the same interest."
];

function getGroupPagePath() {
  return window.location.pathname.includes("/homepage/")
    ? "../group-page/index.html"
    : "./group-page/index.html";
}

function getSearchPagePath() {
  return window.location.pathname.includes("/homepage/")
    ? "../search-page/index.html"
    : "./search-page/index.html";
}

function getMessagesPagePath() {
  return window.location.pathname.includes("/homepage/")
    ? "../messages-page/index.html"
    : "./messages-page/index.html";
}

function getProfilePagePath() {
  return window.location.pathname.includes("/homepage/")
    ? "../my-groups-page/index.html"
    : "./my-groups-page/index.html";
}

function buildEmbeddedSearchUrl(query = "") {
  const params = new URLSearchParams({
    embedded: "1",
    autofocus: "1"
  });

  if (query.trim()) {
    params.set("search", query.trim());
  }

  return `${getSearchPagePath()}?${params.toString()}`;
}

function getCardGroup(card) {
  return {
    title: card.dataset.groupTitle,
    members: card.dataset.groupMembers,
    description: card.dataset.groupDescription
  };
}

function sentenceCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toSearchLabel(value) {
  return value.replace(/^Search for "|"$|^Search for /g, "");
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGroupResults(query, center = defaultCenter) {
  const cleanedQuery = toSearchLabel(query).trim();

  if (!cleanedQuery) {
    return {
      cleanedQuery,
      count: 0,
      groups: []
    };
  }

  const random = seededRandom(
    hashString(`${cleanedQuery}-${center.lat.toFixed(3)}-${center.lng.toFixed(3)}`)
  );
  const markerCount = 5 + Math.floor(random() * 3);
  const groups = [];

  for (let index = 0; index < markerCount; index += 1) {
    const memberCount = 12 + Math.floor(random() * 31);
    const intro = descriptionParts[Math.floor(random() * descriptionParts.length)];
    const detail = detailParts[Math.floor(random() * detailParts.length)];

    groups.push({
      id: `${cleanedQuery}-${index}`,
      label: cleanedQuery,
      members: memberCount,
      description: `${intro} ${cleanedQuery.toLowerCase()}, with ${detail}`
    });
  }

  return {
    cleanedQuery,
    count: markerCount,
    groups
  };
}

function buildSuggestions(query) {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return [];
  }

  const startsWith = seedSuggestions.filter((item) => item.startsWith(trimmed));
  const includes = seedSuggestions.filter(
    (item) => !item.startsWith(trimmed) && item.includes(trimmed)
  );
  const related = [
    `${trimmed} group`,
    `${trimmed} near me`,
    `${trimmed} events`,
    `${trimmed} club`,
    `${trimmed} friends`
  ];

  const merged = [...startsWith, ...includes, ...related]
    .map((item) => sentenceCase(item))
    .filter((item, index, array) => array.indexOf(item) === index);

  const exactMatch = startsWith.length > 0 || includes.length > 0;
  const limit = trimmed.length >= 7 ? 2 : trimmed.length >= 4 ? 3 : 4;
  const sliced = merged.slice(0, limit);

  if (!exactMatch && sliced.length < limit) {
    sliced.push(`Search for "${sentenceCase(trimmed)}"`);
  }

  return sliced.slice(0, 4);
}

function resetPendingGroupsOnRefresh() {
  const navigationEntries = performance.getEntriesByType("navigation");
  const navigationType = navigationEntries[0]?.type;

  if (navigationType === "reload") {
    localStorage.removeItem(storageKey);
  }
}

function readPendingGroups() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored.filter((group) => group?.source === "request-link" && group?.title);
  } catch (error) {
    return [];
  }
}

function renderPendingGroups() {
  if (!pendingLinksShell || !pendingLinksList || !scrollTail) {
    return;
  }

  const groups = readPendingGroups();
  pendingLinksList.innerHTML = "";

  if (groups.length === 0) {
    pendingLinksShell.classList.add("is-hidden");
    scrollTail.style.height = "214%";
    return;
  }

  pendingLinksShell.classList.remove("is-hidden");
  scrollTail.style.height = `${214 + groups.length * 24}%`;

  groups.forEach((group) => {
    const item = document.createElement("article");
    const title = document.createElement("p");
    const status = document.createElement("span");

    item.className = "pending-link-item";
    title.className = "pending-link-title";
    status.className = "pending-link-status";

    title.textContent = group.title;
    status.textContent = "Pending";

    item.append(title, status);
    pendingLinksList.appendChild(item);
  });
}

function renderSuggestions(items) {
  if (!suggestionsRoot) {
    return;
  }

  suggestionsRoot.innerHTML = "";
  suggestionsRoot.style.gridTemplateRows = `repeat(${items.length}, minmax(0, 1fr))`;

  items.forEach((item) => {
    const results = buildGroupResults(item);
    const button = document.createElement("button");
    const title = document.createElement("span");
    const meta = document.createElement("span");

    button.type = "button";
    button.className = "suggestion-item";
    button.setAttribute("role", "option");
    title.className = "suggestion-title";
    title.textContent = item;
    meta.className = "suggestion-meta";
    meta.textContent = `${results.count} groups near you`;
    button.append(title, meta);
    button.addEventListener("click", () => {
      const selectedValue = toSearchLabel(item);

      if (searchInput) {
        searchInput.value = selectedValue;
      }

      if (dropdown) {
        dropdown.classList.add("is-hidden");
      }
      suggestionsRoot.innerHTML = "";
      sendEmbeddedSearch(selectedValue);
      searchInput?.blur();
    });

    suggestionsRoot.appendChild(button);
  });
}

function openSearchOverlay(query = "") {
  if (!searchOverlay || !searchOverlayFrame) {
    return;
  }

  searchOverlay.classList.remove("is-fullscreen");
  page?.classList.remove("is-search-fullscreen");

  const nextUrl = buildEmbeddedSearchUrl(query);
  const shouldRefreshFrame = !searchOverlayFrame.dataset.src;

  if (shouldRefreshFrame && searchOverlayFrame.dataset.src !== nextUrl) {
    embeddedSearchReady = false;
    searchOverlayFrame.src = nextUrl;
    searchOverlayFrame.dataset.src = nextUrl;
  }

  searchOverlayOpenedAt = Date.now();
  searchOverlay.classList.add("is-open");
  searchOverlay.setAttribute("aria-hidden", "false");
  page?.classList.add("is-search-open");
}

function expandSearchOverlay() {
  if (!searchOverlay) {
    return;
  }

  searchOverlay.classList.add("is-open", "is-fullscreen");
  searchOverlay.setAttribute("aria-hidden", "false");
  page?.classList.add("is-search-open", "is-search-fullscreen");
}

function collapseSearchOverlay() {
  if (!searchOverlay) {
    return;
  }

  resetShellNavBackground();
  searchOverlay.classList.add("is-open");
  searchOverlay.classList.remove("is-fullscreen");
  searchOverlay.setAttribute("aria-hidden", "false");
  page?.classList.add("is-search-open");
  page?.classList.remove("is-search-fullscreen");
}

function openPanelOverlay(kind) {
  const isMessages = kind === "messages";
  const overlay = isMessages ? messagesOverlay : profileOverlay;
  const frame = isMessages ? messagesOverlayFrame : profileOverlayFrame;
  const src = `${isMessages ? getMessagesPagePath() : getProfilePagePath()}?embedded=1`;
  const otherOverlay = isMessages ? profileOverlay : messagesOverlay;

  if (!overlay || !frame) {
    return;
  }

  setShellNavBackground(panelNavBackgrounds[kind]);
  otherOverlay?.classList.remove("is-open");
  otherOverlay?.setAttribute("aria-hidden", "true");

  if (frame.dataset.src !== src) {
    frame.src = src;
    frame.dataset.src = src;
  }

  setActiveNav(kind);
  page?.classList.toggle("is-panel-profile", kind === "profile");
  page?.classList.toggle("is-panel-messages", kind === "messages");
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
}

function closePanelOverlay(kind) {
  const overlay = kind === "messages" ? messagesOverlay : profileOverlay;

  if (!overlay) {
    return;
  }

  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");

  if (!profileOverlay?.classList.contains("is-open") && !messagesOverlay?.classList.contains("is-open")) {
    page?.classList.remove("is-panel-profile", "is-panel-messages");
    setActiveNav("groups");
  }
}

function setActiveNav(kind) {
  activePanel = kind;
  const navItems = [
    { element: profileLauncher, panel: "profile" },
    { element: groupsLauncher, panel: "groups" },
    { element: messagesLauncher, panel: "messages" }
  ];

  navItems.forEach(({ element, panel }) => {
    if (!element) {
      return;
    }

    const isCurrent = panel === activePanel;
    element.classList.toggle("nav-item-current", isCurrent);

    if (isCurrent) {
      element.setAttribute("aria-current", "page");
      return;
    }

    element.removeAttribute("aria-current");
  });
}

function setShellNavBackground(color = "") {
  if (color) {
    page?.style.setProperty("--shell-nav-bg", color);
    return;
  }

  resetShellNavBackground();
}

function resetShellNavBackground() {
  page?.style.removeProperty("--shell-nav-bg");
}

function sendEmbeddedSearch(query) {
  if (!searchOverlayFrame) {
    return;
  }

  openSearchOverlay();
  pendingEmbeddedSearch = query.trim();

  if (!embeddedSearchReady || !searchOverlayFrame.contentWindow) {
    return;
  }

  searchOverlayFrame.contentWindow.postMessage(
    {
      type: "run-embedded-search",
      query: pendingEmbeddedSearch
    },
    "*"
  );
  pendingEmbeddedSearch = "";
}

function closeSearchOverlay() {
  if (!searchOverlay) {
    return;
  }

  resetShellNavBackground();
  searchOverlay.classList.remove("is-open");
  searchOverlay.setAttribute("aria-hidden", "true");
  searchOverlay.classList.remove("is-fullscreen");
  page?.classList.remove("is-search-open", "is-search-fullscreen");
  embeddedSearchReady = false;
  pendingEmbeddedSearch = "";

  if (searchOverlayFrame) {
    const resetUrl = buildEmbeddedSearchUrl();
    searchOverlayFrame.src = resetUrl;
    searchOverlayFrame.dataset.src = resetUrl;
  }

  if (searchInput) {
    searchInput.value = "";
  }
  dropdown?.classList.add("is-hidden");
  suggestionsRoot.innerHTML = "";
  searchInput?.blur();
}

function setupHeaderSearch() {
  if (!searchInput || !dropdown || !suggestionsRoot) {
    return;
  }

  searchInput.addEventListener("focus", () => {
    openSearchOverlay();

    const suggestions = buildSuggestions(searchInput.value);

    if (suggestions.length) {
      renderSuggestions(suggestions);
      dropdown.classList.remove("is-hidden");
    }
  });

  searchInput.addEventListener("click", () => {
    openSearchOverlay();
  });

  searchInput.addEventListener("input", () => {
    const suggestions = buildSuggestions(searchInput.value);

    if (suggestions.length === 0) {
      dropdown.classList.add("is-hidden");
      suggestionsRoot.innerHTML = "";
      return;
    }

    renderSuggestions(suggestions);
    dropdown.classList.remove("is-hidden");
  });

  searchOverlayBackdrop?.addEventListener("click", () => {
    if (Date.now() - searchOverlayOpenedAt < 220) {
      return;
    }

    closeSearchOverlay();
  });

  profileLauncher?.addEventListener("click", (event) => {
    event.preventDefault();
    openPanelOverlay("profile");
  });

  groupsLauncher?.addEventListener("click", (event) => {
    event.preventDefault();
    resetShellNavBackground();
    closePanelOverlay("profile");
    closePanelOverlay("messages");
  });

  messagesLauncher?.addEventListener("click", (event) => {
    event.preventDefault();
    openPanelOverlay("messages");
  });

  profileOverlayBackdrop?.addEventListener("click", () => {
    closePanelOverlay("profile");
  });

  messagesOverlayBackdrop?.addEventListener("click", () => {
    closePanelOverlay("messages");
  });

  window.addEventListener("message", (event) => {
    if (event.data?.type === "close-search-overlay") {
      closeSearchOverlay();
      return;
    }

    if (event.data?.type === "expand-search-overlay") {
      expandSearchOverlay();
      return;
    }

    if (event.data?.type === "collapse-search-overlay") {
      collapseSearchOverlay();
      return;
    }

    if (event.data?.type === "set-shell-nav-background") {
      setShellNavBackground(event.data.color);
      return;
    }

    if (event.data?.type === "reset-shell-nav-background") {
      resetShellNavBackground();
      return;
    }

    if (event.data?.type === "pending-links-updated") {
      renderPendingGroups();
      return;
    }

    if (event.data?.type === "close-panel-overlay") {
      closePanelOverlay(event.data.panel);
      return;
    }

    if (event.data?.type === "open-panel-overlay") {
      openPanelOverlay(event.data.panel);
      return;
    }

    if (event.data?.type === "embedded-search-ready") {
      embeddedSearchReady = true;

      if (pendingEmbeddedSearch && searchOverlayFrame?.contentWindow) {
        searchOverlayFrame.contentWindow.postMessage(
          {
            type: "run-embedded-search",
            query: pendingEmbeddedSearch
          },
          "*"
        );
        pendingEmbeddedSearch = "";
      }
    }
  });

  document.addEventListener("click", (event) => {
    const searchArea = document.querySelector(".search-area");

    if (searchArea && !searchArea.contains(event.target)) {
      dropdown.classList.add("is-hidden");
    }
  });
}

function renderCardTitles() {
  contentCards.forEach((card) => {
    const groupTitle = card.dataset.groupTitle;

    if (!groupTitle || card.querySelector(".card-title")) {
      return;
    }

    const title = document.createElement("h2");
    title.className = "card-title";
    title.textContent = groupTitle;
    card.prepend(title);
  });
}

function renderCardPhotoDescriptions() {
  contentCards.forEach((card) => {
    const photoShell = card.querySelector(".card-photo-shell");
    const groupDescription = card.dataset.groupDescription;

    if (!photoShell || !groupDescription || photoShell.querySelector(".card-photo-description")) {
      return;
    }

    const descriptionPanel = document.createElement("div");
    const descriptionText = document.createElement("p");
    const dots = document.createElement("div");
    const imageDot = document.createElement("span");
    const descriptionDot = document.createElement("span");

    photoShell.classList.add("card-photo-shell-swipeable");
    descriptionPanel.className = "card-photo-description";
    descriptionPanel.setAttribute("aria-hidden", "true");
    descriptionText.className = "card-photo-description-text";
    descriptionText.textContent = groupDescription;
    dots.className = "card-photo-dots";
    dots.setAttribute("aria-hidden", "true");
    imageDot.className = "card-photo-dot is-active";
    descriptionDot.className = "card-photo-dot";

    dots.append(imageDot, descriptionDot);
    descriptionPanel.appendChild(descriptionText);
    photoShell.append(descriptionPanel, dots);
  });
}

function setupCardPhotoSwipes() {
  const swipeablePhotoShells = document.querySelectorAll(".card-photo-shell-swipeable");

  swipeablePhotoShells.forEach((photoShell) => {
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipePointerId = null;
    let wheelDeltaX = 0;
    let wheelResetTimeout = null;

    const updateDescriptionState = (isVisible) => {
      photoShell.classList.toggle("is-description-visible", isVisible);
      const dots = photoShell.querySelectorAll(".card-photo-dot");

      if (dots.length === 2) {
        dots[0].classList.toggle("is-active", !isVisible);
        dots[1].classList.toggle("is-active", isVisible);
      }
    };

    const handleSwipeStart = (pointX, pointY) => {
      swipeStartX = pointX;
      swipeStartY = pointY;
    };

    const handleSwipeEnd = (pointX, pointY) => {
      const deltaX = pointX - swipeStartX;
      const deltaY = pointY - swipeStartY;

      if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return;
      }

      if (deltaX < 0) {
        updateDescriptionState(true);
        return;
      }

      updateDescriptionState(false);
    };

    const releasePointer = () => {
      swipePointerId = null;
    };

    const resetWheelSwipe = () => {
      wheelDeltaX = 0;
      if (wheelResetTimeout) {
        window.clearTimeout(wheelResetTimeout);
        wheelResetTimeout = null;
      }
    };

    photoShell.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      handleSwipeStart(event.clientX, event.clientY);
      swipePointerId = event.pointerId;
      photoShell.setPointerCapture(event.pointerId);
    });

    photoShell.addEventListener("pointerup", (event) => {
      if (swipePointerId !== event.pointerId) {
        return;
      }

      handleSwipeEnd(event.clientX, event.clientY);
      releasePointer();
    });

    photoShell.addEventListener("pointercancel", releasePointer);
    photoShell.addEventListener("lostpointercapture", releasePointer);
    photoShell.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    photoShell.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
          return;
        }

        event.preventDefault();
        wheelDeltaX += event.deltaX;

        if (wheelDeltaX >= 36) {
          updateDescriptionState(true);
          resetWheelSwipe();
          return;
        }

        if (wheelDeltaX <= -36) {
          updateDescriptionState(false);
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
  });
}

function setupGroupButtons() {
  const groupPagePath = getGroupPagePath();

  groupButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".content-card");

      if (!card) {
        return;
      }

      const group = getCardGroup(card);
      const params = new URLSearchParams({
        title: group.title,
        members: group.members,
        description: group.description,
        back: "home"
      });

      window.location.href = `${groupPagePath}?${params.toString()}`;
    });
  });
}

renderCardTitles();
renderCardPhotoDescriptions();
setupCardPhotoSwipes();
setupGroupButtons();
resetPendingGroupsOnRefresh();
renderPendingGroups();
setupHeaderSearch();
