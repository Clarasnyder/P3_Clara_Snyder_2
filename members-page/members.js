const rail = document.getElementById("member-rail");
const subtitle = document.getElementById("members-subtitle");
const backLink = document.getElementById("back-link");
const params = new URLSearchParams(window.location.search);

const groupTitle = params.get("title") || "Pickleball";
const groupMembers = params.get("members") || "24";
const groupBack = params.get("back") || "groups";
const groupSearch = params.get("search") || "";
const groupId = params.get("groupId") || "";
const groupCenterLat = params.get("centerLat") || "";
const groupCenterLng = params.get("centerLng") || "";
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
  "Hayden"
];

function buildFallbackMembers(countText) {
  const total = Number.parseInt(countText, 10);
  const fallbackTotal = Number.isFinite(total) ? Math.max(total, 5) : 5;

  return Array.from({ length: fallbackTotal }, (_, index) => ({
    name: fallbackNames[index % fallbackNames.length],
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

  return Array.from({ length: targetCount }, (_, index) => {
    const seedMember = seedMembers[index % seedMembers.length];
    const cycle = Math.floor(index / seedMembers.length);

    return {
      name: cycle === 0 ? seedMember.name : `${seedMember.name} ${cycle + 1}`,
      age: seedMember.age + (cycle % 3)
    };
  });
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

  subtitle.textContent = groupTitle;
  backLink.href = `../group-page/index.html?${backParams.toString()}`;
  rail.innerHTML = "";

  members.forEach((member) => {
    const card = document.createElement("article");
    const avatar = document.createElement("div");
    const name = document.createElement("p");
    const age = document.createElement("p");
    const action = document.createElement("button");

    card.className = "member-card";
    avatar.className = "member-avatar";
    name.className = "member-name";
    age.className = "member-age";
    action.className = "member-action";
    action.type = "button";

    name.textContent = member.name;
    age.textContent = String(member.age);
    action.textContent = "Message";

    card.append(avatar, name, age, action);
    rail.appendChild(card);
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

    card.style.transform = `translateY(${-lift}px) scale(${scale})`;
    card.style.boxShadow = `0 ${shadowSpread}px ${shadowBlur}px rgba(23, 36, 63, ${shadowOpacity})`;
  });
}

renderMembers();
updateCenteredCard();

rail.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateCenteredCard);
});

window.addEventListener("resize", updateCenteredCard);
