const titleElement = document.getElementById("group-title");
const membersElement = document.getElementById("group-members");
const descriptionElement = document.getElementById("group-description");
const membersButton = document.getElementById("members-button");
const eventsButton = document.getElementById("events-button");
const checkinButton = document.getElementById("checkin-button");
const checkinOverlay = document.getElementById("checkin-overlay");
const checkinTitle = document.getElementById("checkin-title");
const checkinTask = document.getElementById("checkin-task");
const checkinCompleteButton = document.getElementById("checkin-complete-button");
const checkinNewTaskButton = document.getElementById("checkin-new-task-button");
const checkinTaskView = document.getElementById("checkin-task-view");
const checkinCameraView = document.getElementById("checkin-camera-view");
const cameraBackButton = document.getElementById("camera-back-button");
const cameraFrame = document.getElementById("camera-frame");
const cameraVideo = document.getElementById("camera-video");
const cameraCanvas = document.getElementById("camera-canvas");
const cameraError = document.getElementById("camera-error");
const cameraStatus = document.getElementById("camera-status");
const cameraActions = document.getElementById("camera-actions");
const cameraShutterButton = document.getElementById("camera-shutter-button");
const proofConfirmation = document.getElementById("proof-confirmation");
const proofRetakeButton = document.getElementById("proof-retake-button");
const proofSubmitButton = document.getElementById("proof-submit-button");
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
const isEmbedded = params.get("embedded") === "1" || window.parent !== window;
const isSearchEmbedded = params.get("embedded") === "1";
const rawDescription =
  params.get("description") ||
  "Welcoming local meetups for pickleball, with easy conversation and making new friends.";

document.documentElement.classList.toggle("is-search-embedded", isSearchEmbedded);

const backTargets = {
  search: "../search-page/index.html",
  home: "../homepage/index.html?skipSplash=1",
  groups: "../my-groups-page/index.html"
};
const groupThemes = {
  default: {
    color: "#dcebff",
    actionBg: "#dff478",
    actionBgHover: "#c8f05a",
    actionBorder: "rgba(55, 80, 15, 0.28)"
  },
  social: {
    color: "#9fc4ff",
    actionBg: "#dff478",
    actionBgHover: "#c8f05a",
    actionBorder: "rgba(55, 80, 15, 0.28)"
  },
  physical: {
    color: "#f1ffc5",
    actionBg: "#dff478",
    actionBgHover: "#c8f05a",
    actionBorder: "rgba(55, 80, 15, 0.28)"
  },
  educational: {
    color: "#2f4f9a",
    background:
      "linear-gradient(180deg, #3d63b8 0%, #2f4f9a 36%, #28478f 100%)",
    actionBg: "#dff478",
    actionBgHover: "#c8f05a",
    actionBorder: "rgba(55, 80, 15, 0.28)",
    isDark: true
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
const sharedCheckinTasks = [
  {
    title: "Meet 2 new people",
    getTask: (groupTitle) =>
      `Before you check in, introduce yourself to two people you have not met yet. Ask each what brought them to ${groupTitle}, then find one thing you have in common.`
  },
  {
    title: "Learn a tiny fact",
    getTask: () =>
      "Introduce yourself to someone new and learn one tiny fact about them that would not show up on a profile."
  },
  {
    title: "Bring someone in",
    getTask: (groupTitle) =>
      `Find two people who have not met each other yet. Learn both of their names, introduce them, and start the first question for the group.`
  }
];
const groupCheckinTasks = {
  "brunch club": [
    {
      title: "Match a coffee order",
      getTask: () =>
        "Find someone who has the same coffee order as you, or the closest match you can find. Learn their name and ask when they first started ordering it."
    },
    {
      title: "Trade brunch picks",
      getTask: () =>
        "Ask someone new for their favorite brunch order in town. Share yours too, then find out whether they are more sweet or savory."
    },
    {
      title: "Find a table twin",
      getTask: () =>
        "Find someone who would order the same side as you. Ask their name and what makes a brunch spot worth going back to."
    }
  ],
  "crafting crew": [
    {
      title: "Find a medium match",
      getTask: () =>
        "Find someone who likes the same craft medium as you, or one you want to try. Ask what they made most recently."
    },
    {
      title: "Trade project stories",
      getTask: () =>
        "Ask someone new about a project they are proud of. Share one thing you have made, even if it is unfinished."
    },
    {
      title: "Swap supply tips",
      getTask: () =>
        "Find someone who uses a tool or material you have never tried. Ask what they like about it and where they learned it."
    }
  ],
  pickleball: [
    {
      title: "Find a court buddy",
      getTask: () =>
        "Find someone around your skill level and ask what they are working on in their game right now."
    },
    {
      title: "Trade game rituals",
      getTask: () =>
        "Ask someone new what they do before a game to warm up, loosen up, or get less nervous."
    },
    {
      title: "Learn a lucky shot",
      getTask: () =>
        "Find someone who has a favorite shot or move. Ask them to name it, then tell them yours or one you want to learn."
    }
  ],
  "spanish study group": [
    {
      title: "Find a phrase partner",
      getTask: () =>
        "Find someone practicing at a similar level and trade one phrase you want to use more naturally."
    },
    {
      title: "Practice a tiny intro",
      getTask: () =>
        "Introduce yourself to someone new in Spanish, then ask what topic they want to get better at discussing."
    },
    {
      title: "Swap study tricks",
      getTask: () =>
        "Ask someone what helps them remember new words. Share one method that has worked for you."
    }
  ],
  "running club": [
    {
      title: "Find your pace pair",
      getTask: () =>
        "Find someone who runs at a similar pace or distance as you. Ask what route they like when they want an easy run."
    },
    {
      title: "Trade run fuel",
      getTask: () =>
        "Ask someone new what they eat or drink before a run. Share your answer too, even if it is just coffee."
    },
    {
      title: "Ask about a finish line",
      getTask: () =>
        "Find someone who has done a race, walk, or run they still remember. Ask what made it stick with them."
    }
  ],
  "book club": [
    {
      title: "Find a shelf twin",
      getTask: () =>
        "Find someone who likes the same kind of book as you. Ask for one book they would recommend without thinking too hard."
    },
    {
      title: "Trade fictional places",
      getTask: () =>
        "Ask someone new what fictional world, town, or setting they would visit for a day. Share yours too."
    },
    {
      title: "Ask about a character",
      getTask: () =>
        "Find someone with a favorite character from anything they have read. Ask why that person stuck with them."
    }
  ],
  "art walk": [
    {
      title: "Pick a piece together",
      getTask: () =>
        "Find someone new and choose one artwork nearby that you both notice. Ask what caught their eye first."
    },
    {
      title: "Trade color instincts",
      getTask: () =>
        "Ask someone what color they have been noticing lately. Share yours, then look for that color together."
    },
    {
      title: "Find a style surprise",
      getTask: () =>
        "Ask someone new what kind of art they did not expect to like but do. Find out what changed their mind."
    }
  ],
  gardening: [
    {
      title: "Find a plant person",
      getTask: () =>
        "Find someone who has grown a plant you have never tried. Ask what made it easy, hard, or worth it."
    },
    {
      title: "Trade garden goals",
      getTask: () =>
        "Ask someone new what they would grow if space, money, and weather were no issue. Share your answer too."
    },
    {
      title: "Ask about a mistake",
      getTask: () =>
        "Find someone who has killed a plant before. Ask what happened and what they learned from it."
    }
  ],
  default: [
    {
      title: "Find a hometown twin",
      getTask: () =>
        "Find someone who grew up in the same city, state, or kind of place as you. Ask what they miss most about it."
    },
    {
      title: "Trade favorites",
      getTask: () =>
        "Ask someone new for their current favorite song, snack, or TV show. Share yours too, then remember their name before you check in."
    },
    {
      title: "Find a shared habit",
      getTask: () =>
        "Find someone who shares a small everyday habit with you. Ask how long they have been doing it."
    }
  ]
};
const keywordCheckinTasks = [
  {
    keywords: ["brunch", "coffee", "breakfast", "food"],
    key: "brunch club"
  },
  {
    keywords: ["craft", "knit", "sew", "paint", "collage", "ceramic"],
    key: "crafting crew"
  },
  {
    keywords: ["run", "walk", "trail", "jog"],
    key: "running club"
  },
  {
    keywords: ["book", "read", "novel"],
    key: "book club"
  },
  {
    keywords: ["art", "gallery", "museum"],
    key: "art walk"
  },
  {
    keywords: ["garden", "plant"],
    key: "gardening"
  },
  {
    keywords: ["pickleball", "tennis", "court"],
    key: "pickleball"
  },
  {
    keywords: ["spanish", "study", "language", "class"],
    key: "spanish study group"
  },
];
let activeCheckinTaskIndex = 0;
let cameraStream = null;

function normalizeTitle(value) {
  return value.toLowerCase().trim();
}

function applyPageTheme(title) {
  if (!pageElement) {
    return;
  }

  const theme = getGroupTheme(title, rawDescription);
  const themeBackground = theme.background || buildGroupThemeBackground(theme.color);

  pageElement.classList.toggle("is-dark-theme", Boolean(theme.isDark));
  pageElement.style.setProperty("--group-page-bg", theme.color);
  pageElement.style.setProperty("--group-page-background", themeBackground);
  pageElement.style.setProperty("--text", theme.isDark ? "#eef4ff" : "#17243f");
  pageElement.style.setProperty("--muted", theme.isDark ? "#c9d4ea" : "#5f6f92");
  pageElement.style.setProperty("--accent", theme.isDark ? "#dbe6ff" : "#6478ff");
  pageElement.style.setProperty("--group-action-bg", theme.actionBg);
  pageElement.style.setProperty("--group-action-bg-hover", theme.actionBgHover);
  pageElement.style.setProperty("--group-action-bg-active", theme.actionBgHover);
  pageElement.style.setProperty("--group-action-border", theme.actionBorder);

  if (isSearchEmbedded) {
    window.parent.postMessage(
      { type: "set-shell-nav-background", color: theme.color, background: themeBackground, isDark: Boolean(theme.isDark) },
      "*"
    );
  }
}

function getCheckinTasks(groupTitle) {
  const normalizedTitle = normalizeTitle(groupTitle);
  const directTasks = groupCheckinTasks[normalizedTitle];

  if (directTasks) {
    return [...directTasks, ...sharedCheckinTasks];
  }

  const keywordMatch = keywordCheckinTasks.find((entry) =>
    entry.keywords.some((keyword) => normalizedTitle.includes(keyword))
  );

  if (keywordMatch) {
    return [...groupCheckinTasks[keywordMatch.key], ...sharedCheckinTasks];
  }

  return [...groupCheckinTasks.default, ...sharedCheckinTasks];
}

function setCheckinTask(index) {
  const tasks = getCheckinTasks(rawTitle);
  const taskIndex = index % tasks.length;
  const task = tasks[taskIndex];

  activeCheckinTaskIndex = taskIndex;
  checkinTitle.textContent = task.title;
  checkinTask.textContent = task.getTask(rawTitle);
}

function stopCameraStream() {
  if (!cameraStream) {
    return;
  }

  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  cameraVideo.srcObject = null;
}

function resetCameraProof() {
  cameraFrame.classList.remove("has-photo", "has-error", "is-loading");
  closeProofConfirmation();
  cameraCanvas.hidden = true;
  cameraVideo.hidden = false;
  cameraError.textContent = "";
  cameraStatus.textContent = "Opening camera";
  cameraShutterButton.setAttribute("aria-label", "Take photo");
  cameraShutterButton.disabled = true;
}

function showCameraError(message) {
  cameraFrame.classList.remove("is-loading");
  cameraFrame.classList.add("has-error");
  closeProofConfirmation();
  cameraVideo.hidden = true;
  cameraCanvas.hidden = true;
  cameraError.textContent = message;
  cameraStatus.textContent = "Camera unavailable";
  cameraShutterButton.disabled = true;
}

function openProofConfirmation() {
  proofConfirmation?.classList.add("is-open");
  proofConfirmation?.setAttribute("aria-hidden", "false");
}

function closeProofConfirmation() {
  proofConfirmation?.classList.remove("is-open");
  proofConfirmation?.setAttribute("aria-hidden", "true");
}

async function requestCameraStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 720 },
        height: { ideal: 720 }
      }
    });
  } catch (error) {
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    });
  }
}

async function playCameraStream(stream) {
  cameraVideo.muted = true;
  cameraVideo.playsInline = true;
  cameraVideo.setAttribute("playsinline", "");
  cameraVideo.setAttribute("webkit-playsinline", "");
  cameraVideo.srcObject = stream;

  if (cameraVideo.readyState < 2) {
    await new Promise((resolve) => {
      const finish = () => {
        cameraVideo.removeEventListener("loadedmetadata", finish);
        resolve();
      };

      cameraVideo.addEventListener("loadedmetadata", finish, { once: true });
      window.setTimeout(finish, 900);
    });
  }

  await cameraVideo.play();
}

async function startCameraProof() {
  resetCameraProof();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraError("Camera access is not available in this browser.");
    return;
  }

  cameraFrame.classList.add("is-loading");

  try {
    const stream = await requestCameraStream();

    if (checkinCameraView.hidden) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    cameraStream = stream;
    await playCameraStream(stream);
    cameraFrame.classList.remove("is-loading");
    cameraStatus.textContent = "Line up your proof";
    cameraShutterButton.disabled = false;
  } catch (error) {
    showCameraError("Allow camera access to add proof.");
  }
}

function captureCameraProof() {
  if (!cameraStream || cameraVideo.readyState < 2) {
    cameraStatus.textContent = "Camera is still loading";
    return;
  }

  const width = cameraVideo.videoWidth || 640;
  const height = cameraVideo.videoHeight || 480;
  const context = cameraCanvas.getContext("2d");

  cameraCanvas.width = width;
  cameraCanvas.height = height;
  context.drawImage(cameraVideo, 0, 0, width, height);

  cameraFrame.classList.add("has-photo");
  cameraCanvas.hidden = false;
  cameraVideo.hidden = true;
  cameraStatus.textContent = "Proof captured";
  cameraShutterButton.setAttribute("aria-label", "Retake photo");
  openProofConfirmation();
}

function retakeCameraProof() {
  cameraFrame.classList.remove("has-photo");
  closeProofConfirmation();
  cameraCanvas.hidden = true;
  cameraVideo.hidden = false;
  cameraStatus.textContent = "Line up your proof";
  cameraShutterButton.setAttribute("aria-label", "Take photo");
}

function showCheckinTaskView() {
  stopCameraStream();
  checkinTaskView.hidden = false;
  checkinCameraView.hidden = true;
  checkinCameraView.setAttribute("aria-hidden", "true");
  checkinOverlay.classList.remove("is-camera");
}

function showCheckinCameraView() {
  checkinTaskView.hidden = true;
  checkinCameraView.hidden = false;
  checkinCameraView.setAttribute("aria-hidden", "false");
  checkinOverlay.classList.add("is-camera");
  startCameraProof();
}

function openCheckinOverlay() {
  setCheckinTask(activeCheckinTaskIndex);
  showCheckinTaskView();
  checkinOverlay.classList.add("is-open");
  checkinOverlay.setAttribute("aria-hidden", "false");
}

function closeCheckinOverlay() {
  stopCameraStream();
  checkinOverlay.classList.remove("is-open");
  checkinOverlay.classList.remove("is-camera");
  checkinOverlay.setAttribute("aria-hidden", "true");
}

function submitCheckinProof() {
  closeProofConfirmation();
  stopCameraStream();
  checkinButton.textContent = "Check-in complete";
  checkinButton.classList.add("is-complete");
  closeCheckinOverlay();
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

  if (isEmbedded) {
    backParams.set("embedded", "1");
  }

  const queryString = backParams.toString();
  return queryString ? `${backTargets.search}?${queryString}` : backTargets.search;
}

titleElement.textContent = rawTitle;
membersElement.textContent = `${rawMembers} members`;
descriptionElement.textContent = rawDescription;
backLink.href = buildBackHref();

backLink.addEventListener("click", () => {
  if (rawBack === "search" && isEmbedded) {
    window.parent.postMessage({ type: "collapse-search-overlay" }, "*");
  }
});

applyPageTheme(rawTitle);

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

  if (isSearchEmbedded) {
    nextParams.set("embedded", "1");
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

  if (isSearchEmbedded) {
    nextParams.set("embedded", "1");
  }

  window.location.href = `../events-page/index.html?${nextParams.toString()}`;
});

checkinButton.addEventListener("click", openCheckinOverlay);

checkinOverlay.addEventListener("click", (event) => {
  if (event.target === checkinOverlay) {
    closeCheckinOverlay();
  }
});

checkinCompleteButton.addEventListener("click", showCheckinCameraView);

checkinNewTaskButton.addEventListener("click", () => {
  setCheckinTask(activeCheckinTaskIndex + 1);
});

cameraBackButton.addEventListener("click", showCheckinTaskView);

cameraShutterButton.addEventListener("click", () => {
  if (cameraFrame.classList.contains("has-photo")) {
    retakeCameraProof();
    return;
  }

  captureCameraProof();
});

proofRetakeButton.addEventListener("click", retakeCameraProof);

proofSubmitButton.addEventListener("click", submitCheckinProof);
