const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const groupsNavLink = document.getElementById("groups-nav-link");
const messagesNavLink = document.getElementById("messages-nav-link");
const editProfileButton = document.getElementById("edit-profile-button");
const logoutButton = document.getElementById("logout-button");
const accountAvatar = document.getElementById("account-avatar");
const accountName = document.getElementById("account-name");
const accountHandle = document.getElementById("account-handle");
const accountLocation = document.getElementById("account-location");
const accountBio = document.getElementById("account-bio");
const profileStorageKey = "linkProfile";
const defaultProfile = {
  name: "Clara Snyder",
  handle: "@clarasnyder",
  location: "Knoxville, Tennessee",
  bio: "Into brunch plans, creative projects, and meeting new people around town.",
  photo: ""
};

document.documentElement.classList.toggle("is-embedded", isEmbedded);

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

    postPanelNavigation(deltaX < 0 ? "groups" : "profile");
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
        postPanelNavigation(wheelDeltaX > 0 ? "groups" : "profile");
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
    groupsNavLink?.addEventListener("click", (event) => {
      event.preventDefault();
      postPanelNavigation("groups");
    });

    messagesNavLink?.addEventListener("click", (event) => {
      event.preventDefault();
      postPanelNavigation("messages");
    });
    return;
  }
}

function setupEditProfileButton() {
  editProfileButton?.addEventListener("click", () => {
    const nextParams = new URLSearchParams();

    if (isEmbedded) {
      nextParams.set("embedded", "1");
    }

    const queryString = nextParams.toString();
    window.location.href = `../edit-profile-page/index.html${queryString ? `?${queryString}` : ""}`;
  });
}

function setupLogoutButton() {
  logoutButton?.addEventListener("click", () => {
    const loginUrl = new URL("../index.html?login=1", window.location.href);

    window.top.location.href = loginUrl.toString();
  });
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "CS";
  }

  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function readProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(profileStorageKey) || "{}");
    return { ...defaultProfile, ...stored };
  } catch (error) {
    return { ...defaultProfile };
  }
}

function renderProfile() {
  const profile = readProfile();

  accountName.textContent = profile.name;
  accountHandle.textContent = profile.handle;
  accountLocation.textContent = profile.location;
  accountBio.textContent = profile.bio;
  accountAvatar.textContent = getInitials(profile.name);

  if (profile.photo) {
    accountAvatar.style.backgroundImage = `url("${profile.photo}")`;
    accountAvatar.classList.add("has-photo");
    return;
  }

  accountAvatar.style.removeProperty("background-image");
  accountAvatar.classList.remove("has-photo");
}

renderProfile();
setupEmbeddedMode();
setupEmbeddedPanelSwipes();
setupEditProfileButton();
setupLogoutButton();
