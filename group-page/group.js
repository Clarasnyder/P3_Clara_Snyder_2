const titleElement = document.getElementById("group-title");
const membersElement = document.getElementById("group-members");
const descriptionElement = document.getElementById("group-description");
const membersButton = document.getElementById("members-button");
const eventsButton = document.getElementById("events-button");
const backLink = document.getElementById("back-link");
const pageElement = document.getElementById("group-page");

const params = new URLSearchParams(window.location.search);
const rawTitle = params.get("title") || "Pickleball";
const rawMembers = params.get("members") || "24";
const rawBack = params.get("back") || "groups";
const rawSearch = params.get("search") || "";
const rawGroupId = params.get("groupId") || "";
const rawCenterLat = params.get("centerLat") || "";
const rawCenterLng = params.get("centerLng") || "";
const rawDescription =
  params.get("description") ||
  "Welcoming local meetups for pickleball, with easy conversation and making new friends.";

const backTargets = {
  search: "../search-page/index.html",
  home: "../homepage/index.html",
  groups: "../my-groups-page/index.html"
};
const groupPageColors = {
  "Brunch club": "#dcebff",
  "Crafting crew": "#92bad5",
  "Running club": "#dff478",
  "Book club": "#eef4ff",
  "Art walk": "#c8f05a",
  Pickleball: "#788ce3"
};
const paletteFallbacks = ["#dcebff", "#92bad5", "#dff478", "#eef4ff", "#c8f05a", "#788ce3", "#d8e4ff", "#edf7d4"];

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

function buildBackHref() {
  if (rawBack !== "search") {
    return backTargets[rawBack] || backTargets.groups;
  }

  const backParams = new URLSearchParams();

  if (rawSearch) {
    backParams.set("search", rawSearch);
  }

  if (rawGroupId) {
    backParams.set("groupId", rawGroupId);
  }

  if (rawCenterLat) {
    backParams.set("centerLat", rawCenterLat);
  }

  if (rawCenterLng) {
    backParams.set("centerLng", rawCenterLng);
  }

  const queryString = backParams.toString();
  return queryString ? `${backTargets.search}?${queryString}` : backTargets.search;
}

titleElement.textContent = rawTitle;
membersElement.textContent = `${rawMembers} members`;
descriptionElement.textContent = rawDescription;
backLink.href = buildBackHref();

if (pageElement && groupPageColors[rawTitle]) {
  pageElement.style.setProperty("--group-page-bg", getGroupPageColor(rawTitle));
} else if (pageElement) {
  pageElement.style.setProperty("--group-page-bg", getGroupPageColor(rawTitle));
}

membersButton.addEventListener("click", () => {
  const nextParams = new URLSearchParams({
    title: rawTitle,
    members: rawMembers,
    description: rawDescription,
    back: rawBack
  });

  if (rawSearch) {
    nextParams.set("search", rawSearch);
  }

  if (rawGroupId) {
    nextParams.set("groupId", rawGroupId);
  }

  if (rawCenterLat) {
    nextParams.set("centerLat", rawCenterLat);
  }

  if (rawCenterLng) {
    nextParams.set("centerLng", rawCenterLng);
  }

  window.location.href = `../members-page/index.html?${nextParams.toString()}`;
});

eventsButton.addEventListener("click", () => {
  const nextParams = new URLSearchParams({
    title: rawTitle,
    members: rawMembers,
    description: rawDescription,
    back: rawBack
  });

  if (rawSearch) {
    nextParams.set("search", rawSearch);
  }

  if (rawGroupId) {
    nextParams.set("groupId", rawGroupId);
  }

  if (rawCenterLat) {
    nextParams.set("centerLat", rawCenterLat);
  }

  if (rawCenterLng) {
    nextParams.set("centerLng", rawCenterLng);
  }

  window.location.href = `../events-page/index.html?${nextParams.toString()}`;
});
