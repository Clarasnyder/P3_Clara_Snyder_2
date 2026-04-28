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
const groupBackgrounds = {
  "Crafting crew": "../assets/photos/e68c81992aa09dce515b5a73f77d17b5.jpg"
};

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

if (groupBackgrounds[rawTitle]) {
  pageElement.style.setProperty("--group-background-image", `url("${groupBackgrounds[rawTitle]}")`);
  pageElement.classList.add("has-photo-background");
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
