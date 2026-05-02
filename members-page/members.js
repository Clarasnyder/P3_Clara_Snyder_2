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
const groupDescription =
  params.get("description") ||
  "Welcoming local meetups for pickleball, with easy conversation and making new friends.";

const memberSeed = {
  "Brunch club": [
    { name: "Jane Doe", age: 23 },
    { name: "Maya", age: 24 },
    { name: "Noah", age: 26 },
    { name: "Ava", age: 22 },
    { name: "Luca", age: 25 }
  ],
  "Crafting crew": [
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
const groupPageColors = {
  "Brunch club": "#dcebff",
  "Crafting crew": "#92bad5",
  "Running club": "#dff478",
  "Book club": "#eef4ff",
  "Art walk": "#c8f05a",
  Pickleball: "#788ce3"
};
const paletteFallbacks = ["#dcebff", "#92bad5", "#dff478", "#eef4ff", "#c8f05a", "#788ce3", "#d8e4ff", "#edf7d4"];
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

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getGroupPageColor(title) {
  if (groupPageColors[title]) {
    return groupPageColors[title];
  }

  return paletteFallbacks[hashString(title) % paletteFallbacks.length];
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

  subtitle.textContent = `${members.length} members`;
  backLink.href = `../group-page/index.html?${backParams.toString()}`;
  if (pageElement) {
    pageElement.style.setProperty("--group-page-bg", getGroupPageColor(groupTitle));
  }
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

      const returnParams = new URLSearchParams(window.location.search);
      const returnUrl = new URL(window.location.href);
      const messageParams = new URLSearchParams({ title: member.name });

      returnParams.set("profile", member.name);
      returnUrl.search = returnParams.toString();
      messageParams.set("returnTo", `../members-page/index.html?${returnParams.toString()}`);
      window.history.replaceState(null, "", returnUrl.toString());
      window.location.href = `../group-text-page/index.html?${messageParams.toString()}`;
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

renderMembers();
updateCenteredCard();

rail.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateCenteredCard);
});

window.addEventListener("resize", updateCenteredCard);
