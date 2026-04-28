const groupsList = document.getElementById("groups-list");
const storageKey = "linkRequests";
const baseGroups = [
  { title: "Brunch club", status: "" },
  { title: "Crafting crew", status: "" }
];
const linkedGroups = {
  "Brunch club": {
    members: "24",
    description:
      "Welcoming local meetups for long brunches, easy conversation, and trying new spots around Knoxville."
  },
  "Crafting crew": {
    members: "19",
    description:
      "A nearby community for relaxed craft nights, shared supplies, and weekend projects with new friends."
  }
};

function resetPendingGroupsOnRefresh() {
  const navigationEntries = performance.getEntriesByType("navigation");
  const navigationType = navigationEntries[0]?.type;

  if (navigationType === "reload") {
    localStorage.removeItem(storageKey);
  }
}

function readGroups() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(stored)) {
      return [];
    }

    return stored.filter((group) => group?.source === "request-link");
  } catch (error) {
    return [];
  }
}

function renderGroups() {
  const groups = [...baseGroups, ...readGroups()];
  groupsList.innerHTML = "";

  if (groups.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No group requests yet. Requested groups will show up here as pending.";
    groupsList.appendChild(emptyState);
    return;
  }

  groups.forEach((group) => {
    const groupPageData = linkedGroups[group.title];
    const item = document.createElement(groupPageData ? "a" : "article");
    const title = document.createElement("p");
    const status = document.createElement("span");

    item.className = "group-item";
    title.className = "group-item-title";
    status.className = "group-item-status";

    title.textContent = group.title;
    status.textContent = group.status || "";

    if (groupPageData) {
      const params = new URLSearchParams({
        title: group.title,
        members: groupPageData.members,
        description: groupPageData.description,
        back: "groups"
      });

      item.href = `../group-page/index.html?${params.toString()}`;
    }

    if (!group.status) {
      status.classList.add("is-hidden");
    }

    item.append(title, status);
    groupsList.appendChild(item);
  });
}

resetPendingGroupsOnRefresh();
renderGroups();
