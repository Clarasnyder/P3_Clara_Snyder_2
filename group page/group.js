const titleElement = document.getElementById("group-title");
const membersElement = document.getElementById("group-members");
const descriptionElement = document.getElementById("group-description");

const params = new URLSearchParams(window.location.search);
const rawTitle = params.get("title") || "Pickleball";
const rawMembers = params.get("members") || "24";
const rawDescription =
  params.get("description") ||
  "Welcoming local meetups for pickleball, with easy conversation and making new friends.";

titleElement.textContent = rawTitle;
membersElement.textContent = `${rawMembers} members`;
descriptionElement.textContent = rawDescription;
