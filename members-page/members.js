const rail = document.getElementById("member-rail");
const subtitle = document.getElementById("members-subtitle");
const backLink = document.getElementById("back-link");
const pageElement = document.querySelector(".page");
const params = new URLSearchParams(window.location.search);

const groupTitle = params.get("title") || "Pickleball";
const groupMembers = params.get("members") || "24";
const groupBack = params.get("back") || "groups";
const groupSearch = params.get("search") || "";
const groupId = params.get("groupId") || "";
const groupCenterLat = params.get("centerLat") || "";
const groupCenterLng = params.get("centerLng") || "";
const activeProfile = params.get("profile") || "";
const isSearchEmbedded = params.get("embedded") === "1";
const directConversationsStorageKey = "linkDirectConversations";
const groupDescription =
  params.get("description") ||
  "Welcoming local meetups for pickleball, with easy conversation and making new friends.";

document.documentElement.classList.toggle("is-search-embedded", isSearchEmbedded);

const memberSeed = {
  "Brunch Club": [
    { name: "Sophie", age: 23 },
    { name: "Maya", age: 24 },
    { name: "Noah", age: 26 },
    { name: "Ava", age: 22 },
    { name: "Luca", age: 25 }
  ],
  "Crafting Crew": [
    { name: "Lena", age: 27 },
    { name: "Tara", age: 25 },
    { name: "Reese", age: 24 },
    { name: "Nia", age: 26 },
    { name: "Callie", age: 23 }
  ],
  Pickleball: [
    { name: "Sam", age: 28 },
    { name: "Chris", age: 31 },
    { name: "Aiden", age: 26 },
    { name: "Mila", age: 24 },
    { name: "Leah", age: 29 }
  ],
  "Spanish Study Group": [
    { name: "Isabel", age: 24 },
    { name: "Mateo", age: 26 },
    { name: "Lucia", age: 25 },
    { name: "Camila", age: 23 },
    { name: "Diego", age: 27 }
  ],
  "Running club": [
    { name: "Eli", age: 30 },
    { name: "Ana", age: 34 },
    { name: "Skye", age: 25 },
    { name: "Mason", age: 27 },
    { name: "Harper", age: 26 }
  ],
  "Book club": [
    { name: "Olivia", age: 24 },
    { name: "Rina", age: 29 },
    { name: "Theo", age: 27 },
    { name: "Elsie", age: 25 },
    { name: "Marco", age: 28 }
  ],
  "Art walk": [
    { name: "Nina", age: 25 },
    { name: "Leo", age: 24 },
    { name: "Sofia", age: 23 },
    { name: "Jules", age: 27 },
    { name: "Ivy", age: 22 }
  ]
};

const fallbackNames = [
  "Jamie",
  "Taylor",
  "Riley",
  "Morgan",
  "Casey",
  "Parker",
  "Quinn",
  "Avery",
  "Rowan",
  "Sage",
  "Emerson",
  "Hayden",
  "Amelia",
  "Ezra",
  "Mina",
  "Kai",
  "Tessa",
  "Owen",
  "Priya",
  "Miles",
  "Elena",
  "Drew",
  "Maren",
  "Iris",
  "Dylan",
  "Cora",
  "Finn",
  "Zara",
  "Mateo",
  "June",
  "Ellis",
  "Wren",
  "Jonah",
  "Mika",
  "Lila",
  "Arlo",
  "Nora",
  "Theo",
  "Selah",
  "Remy",
  "Talia",
  "Micah",
  "Maeve",
  "Rory",
  "Sienna",
  "Caleb",
  "Naomi",
  "Julian",
  "Phoebe",
  "Cameron",
  "Anika",
  "Bennett"
];
const groupThemes = {
  default: {
    color: "#dcebff",
    cardBg: "#dcebff",
    cardBgAlt: "#dcebff",
    cardBgThird: "#dcebff",
    actionBg: "#dff478",
    actionBgHover: "#c8f05a",
    actionBorder: "rgba(55, 80, 15, 0.28)"
  },
  social: {
    color: "#9fc4ff",
    cardBg: "#dcebff",
    cardBgAlt: "#dcebff",
    cardBgThird: "#dcebff",
    actionBg: "#dff478",
    actionBgHover: "#c8f05a",
    actionBorder: "rgba(55, 80, 15, 0.28)"
  },
  physical: {
    color: "#f1ffc5",
    cardBg: "#dcebff",
    cardBgAlt: "#dcebff",
    cardBgThird: "#dcebff",
    actionBg: "#dff478",
    actionBgHover: "#c8f05a",
    actionBorder: "rgba(55, 80, 15, 0.28)"
  },
  educational: {
    color: "#2f4f9a",
    cardBg: "#dcebff",
    cardBgAlt: "#dcebff",
    cardBgThird: "#dcebff",
    actionBg: "#dff478",
    actionBgHover: "#c8f05a",
    actionBorder: "rgba(55, 80, 15, 0.28)"
  }
};
const socialThemeKeywords = [
  "brunch",
  "craft",
  "crafting",
  "coffee",
  "scrapbook",
  "pottery",
  "movie",
  "game night",
  "book",
  "art walk",
  "live music",
  "museum",
  "cooking",
  "friend",
  "social"
];
const physicalThemeKeywords = [
  "pickleball",
  "running",
  "run",
  "hiking",
  "hike",
  "walking",
  "trail",
  "jog",
  "tennis",
  "badminton",
  "pilates",
  "yoga",
  "cycling",
  "bike",
  "camping",
  "court",
  "fitness",
  "sport"
];
const educationalThemeKeywords = [
  "spanish",
  "study",
  "study group",
  "language",
  "class",
  "tutoring",
  "homework",
  "learning",
  "lecture",
  "academic",
  "educational"
];

function matchesThemeKeyword(value, keyword) {
  if (keyword.includes(" ")) {
    return value.includes(keyword);
  }

  return new RegExp(`\\b${keyword}\\b`).test(value);
}

function buildGroupThemeBackground(color) {
  return `radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0) 26%), radial-gradient(circle at 82% 12%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 22%), linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 38%, rgba(255, 255, 255, 0.16) 100%), ${color}`;
}

function getGroupTheme(title, description = "") {
  const normalizedTitle = title.toLowerCase();
  const normalized = `${title} ${description}`.toLowerCase();

  if (educationalThemeKeywords.some((keyword) => matchesThemeKeyword(normalizedTitle, keyword))) {
    return groupThemes.educational;
  }

  if (physicalThemeKeywords.some((keyword) => matchesThemeKeyword(normalizedTitle, keyword))) {
    return groupThemes.physical;
  }

  if (socialThemeKeywords.some((keyword) => matchesThemeKeyword(normalizedTitle, keyword))) {
    return groupThemes.social;
  }

  if (educationalThemeKeywords.some((keyword) => matchesThemeKeyword(normalized, keyword))) {
    return groupThemes.educational;
  }

  if (physicalThemeKeywords.some((keyword) => matchesThemeKeyword(normalized, keyword))) {
    return groupThemes.physical;
  }

  if (socialThemeKeywords.some((keyword) => matchesThemeKeyword(normalized, keyword))) {
    return groupThemes.social;
  }

  return groupThemes.default;
}
const profileDetails = [
  {
    prompt: "Usually up for",
    answers: ["coffee after the meetup", "weekend plans", "trying a new spot", "low-key group hangs"]
  },
  {
    prompt: "Group vibe",
    answers: ["easy to talk to", "brings good energy", "knows the best local places", "keeps plans simple"]
  },
  {
    prompt: "Best match",
    answers: ["new friends nearby", "casual meetups", "small group plans", "creative afternoons"]
  }
];

function applyPageTheme(title) {
  if (!pageElement) {
    return;
  }

  const theme = getGroupTheme(title, groupDescription);
  const themeBackground = buildGroupThemeBackground(theme.color);

  pageElement.style.setProperty("--group-page-bg", theme.color);
  pageElement.style.setProperty("--member-card-bg", theme.cardBg);
  pageElement.style.setProperty("--member-card-bg-alt", theme.cardBgAlt);
  pageElement.style.setProperty("--member-card-bg-third", theme.cardBgThird);
  pageElement.style.setProperty("--group-action-bg", theme.actionBg);
  pageElement.style.setProperty("--group-action-bg-hover", theme.actionBgHover);
  pageElement.style.setProperty("--group-action-border", theme.actionBorder);

  if (isSearchEmbedded) {
    window.parent.postMessage(
      { type: "set-shell-nav-background", color: theme.color, background: themeBackground },
      "*"
    );
  }
}

function buildFallbackMembers(countText) {
  const total = Number.parseInt(countText, 10);
  const fallbackTotal = Number.isFinite(total) ? Math.max(total, 5) : 5;
  const names = fallbackNames.slice(0, fallbackTotal);

  return names.map((name, index) => ({
    name,
    age: 22 + (index % 12)
  }));
}

function buildMemberList(title, countText) {
  const total = Number.parseInt(countText, 10);
  const targetCount = Number.isFinite(total) ? Math.max(total, 1) : 5;
  const seedMembers = memberSeed[title];

  if (!Array.isArray(seedMembers) || seedMembers.length === 0) {
    return buildFallbackMembers(targetCount);
  }

  const members = seedMembers.slice(0, targetCount);
  const usedNames = new Set(members.map((member) => member.name));
  const availableNames = fallbackNames.filter((name) => !usedNames.has(name));

  availableNames.some((name, index) => {
    if (members.length >= targetCount) {
      return true;
    }

    members.push({
      name,
      age: 22 + ((members.length + index) % 12)
    });

    return false;
  });

  return members;
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

function readDirectConversations() {
  try {
    const stored = JSON.parse(localStorage.getItem(directConversationsStorageKey) || "[]");

    return Array.isArray(stored) ? stored : [];
  } catch {
    localStorage.removeItem(directConversationsStorageKey);
    return [];
  }
}

function resetDirectConversationsOnRefresh() {
  const navigationEntry = performance.getEntriesByType?.("navigation")?.[0];
  const isReload = navigationEntry ? navigationEntry.type === "reload" : performance.navigation?.type === 1;

  if (isReload) {
    localStorage.removeItem(directConversationsStorageKey);
  }
}

function saveDirectConversation(memberName) {
  const conversations = readDirectConversations();
  const nextConversation = {
    title: memberName,
    preview: `You started a chat from ${groupTitle}.`,
    time: "Now",
    updatedAt: Date.now()
  };
  const nextConversations = [
    nextConversation,
    ...conversations.filter((conversation) => conversation?.title !== memberName)
  ];

  localStorage.setItem(directConversationsStorageKey, JSON.stringify(nextConversations));
}

function buildMemberProfile(member, index) {
  return {
    bio: `${member.name} likes ${groupTitle.toLowerCase()} meetups that feel relaxed, friendly, and easy to jump into.`,
    details: profileDetails.map((detail, detailIndex) => ({
      prompt: detail.prompt,
      answer: detail.answers[(index + detailIndex) % detail.answers.length]
    }))
  };
}

function closeOtherCards(activeCard) {
  rail.querySelectorAll(".member-card.is-flipped").forEach((card) => {
    if (card !== activeCard) {
      card.classList.remove("is-flipped");
      card.querySelector(".member-action")?.setAttribute("aria-expanded", "false");
    }
  });
}

function flipMemberCard(card, action, behavior = "smooth") {
  closeOtherCards(card);
  card.classList.add("is-flipped");
  action.setAttribute("aria-expanded", "true");
  card.scrollIntoView({ behavior, block: "nearest", inline: "center" });
  updateCenteredCard();
}

function unflipMemberCard(card, action) {
  card.classList.remove("is-flipped");
  action.setAttribute("aria-expanded", "false");
  updateCenteredCard();
}

function renderMembers() {
  const members = buildMemberList(groupTitle, groupMembers);
  const backParams = new URLSearchParams({
    title: groupTitle,
    members: groupMembers,
    description: groupDescription,
    back: groupBack
  });

  if (groupSearch) {
    backParams.set("search", groupSearch);
  }

  if (groupId) {
    backParams.set("groupId", groupId);
  }

  if (groupCenterLat) {
    backParams.set("centerLat", groupCenterLat);
  }

  if (groupCenterLng) {
    backParams.set("centerLng", groupCenterLng);
  }

  if (isSearchEmbedded) {
    backParams.set("embedded", "1");
  }

  subtitle.textContent = `${members.length} members`;
  backLink.href = `../group-page/index.html?${backParams.toString()}`;
  applyPageTheme(groupTitle);
  rail.innerHTML = "";

  members.forEach((member, index) => {
    const card = document.createElement("article");
    const cardInner = document.createElement("div");
    const cardFront = document.createElement("div");
    const cardBack = document.createElement("div");
    const avatar = document.createElement("div");
    const name = document.createElement("p");
    const age = document.createElement("p");
    const action = document.createElement("button");
    const backName = document.createElement("p");
    const backMeta = document.createElement("p");
    const bio = document.createElement("p");
    const detailsList = document.createElement("dl");
    const closeAction = document.createElement("button");
    const profile = buildMemberProfile(member, index);

    card.className = "member-card";
    cardInner.className = "member-card-inner";
    cardFront.className = "member-card-face member-card-front";
    cardBack.className = "member-card-face member-card-back";
    avatar.className = "member-avatar";
    name.className = "member-name";
    age.className = "member-age";
    action.className = "member-action";
    backName.className = "member-back-name";
    backMeta.className = "member-back-meta";
    bio.className = "member-bio";
    detailsList.className = "member-details";
    closeAction.className = "member-close-action";
    action.type = "button";
    closeAction.type = "button";
    action.setAttribute("aria-expanded", "false");

    avatar.textContent = getInitials(member.name);
    name.textContent = member.name;
    age.textContent = `${member.age} years old`;
    action.textContent = "Go to profile";
    backName.textContent = member.name;
    backMeta.textContent = `${member.age} years old · ${groupTitle}`;
    bio.textContent = profile.bio;
    closeAction.textContent = "Message";

    profile.details.forEach((detail) => {
      const term = document.createElement("dt");
      const description = document.createElement("dd");

      term.textContent = detail.prompt;
      description.textContent = detail.answer;
      detailsList.append(term, description);
    });

    action.addEventListener("click", () => {
      flipMemberCard(card, action);
    });

    cardBack.addEventListener("click", () => {
      unflipMemberCard(card, action);
    });

    closeAction.addEventListener("click", (event) => {
      event.stopPropagation();
      saveDirectConversation(member.name);

      const returnParams = new URLSearchParams(window.location.search);
      const returnUrl = new URL(window.location.href);
      const shellParams = new URLSearchParams({
        panel: "messages",
        thread: member.name,
        skipSplash: "1"
      });

      returnParams.set("profile", member.name);
      returnUrl.search = returnParams.toString();
      shellParams.set("returnTo", `../members-page/index.html?${returnParams.toString()}`);

      if (isSearchEmbedded) {
        window.history.replaceState(null, "", returnUrl.toString());
        window.parent.postMessage({ type: "open-message-thread", title: member.name, returnTo: "panel" }, "*");
        return;
      }

      window.history.replaceState(null, "", returnUrl.toString());
      window.location.href = `../homepage/index.html?${shellParams.toString()}`;
    });

    cardFront.append(avatar, name, age, action);
    cardBack.append(backName, backMeta, bio, detailsList, closeAction);
    cardInner.append(cardFront, cardBack);
    card.append(cardInner);
    rail.appendChild(card);

    if (activeProfile === member.name) {
      window.requestAnimationFrame(() => {
        flipMemberCard(card, action, "auto");
      });
    }
  });
}

function updateCenteredCard() {
  const cards = [...rail.querySelectorAll(".member-card")];

  if (!cards.length) {
    return;
  }

  const railRect = rail.getBoundingClientRect();
  const railCenter = railRect.left + railRect.width / 2;
  const maxDistance = railRect.width / 2 + 123;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    const distance = Math.abs(cardCenter - railCenter);
    const proximity = Math.max(0, 1 - distance / maxDistance);
    const lift = 18 * proximity;
    const scale = 0.96 + 0.04 * proximity;
    const shadowBlur = 30 + 12 * proximity;
    const shadowSpread = 14 + 8 * proximity;
    const shadowOpacity = 0.14 + 0.06 * proximity;

    if (card.classList.contains("is-flipped")) {
      card.style.transform = "translateY(-8px) scale(1.03)";
      card.style.setProperty("--member-shadow", "0 30px 46px rgba(23, 36, 63, 0.24)");
    } else {
      card.style.transform = `translateY(${-lift}px) scale(${scale})`;
      card.style.setProperty("--member-shadow", `0 ${shadowSpread}px ${shadowBlur}px rgba(23, 36, 63, ${shadowOpacity})`);
    }
  });
}

resetDirectConversationsOnRefresh();
renderMembers();
updateCenteredCard();

rail.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateCenteredCard);
});

window.addEventListener("resize", updateCenteredCard);
