const inviteModal = document.getElementById("invite-modal");
const inviteForm = document.getElementById("invite-form");
const inviteInput = document.getElementById("invite-input");
const inviteLoadingOverlay = document.getElementById("invite-loading-overlay");
const requestOverlay = document.getElementById("request-overlay");
const contentCards = document.querySelectorAll(".content-card");
const requestButtons = document.querySelectorAll(".card-action-button");
const inviteButtons = document.querySelectorAll(".card-action-link");
const storageKey = "linkRequests";

let activeInviteGroup = null;
let requestOverlayTimeout = null;
let requestOverlayFadeTimeout = null;

function readPendingTitles() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const groups = Array.isArray(stored) ? stored : [];

    return new Set(
      groups
        .filter((entry) => entry?.source === "request-link" && entry?.title)
        .map((entry) => entry.title)
    );
  } catch (error) {
    return new Set();
  }
}

function savePendingGroup(group) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const groups = Array.isArray(stored) ? stored : [];
    const nextGroups = groups.filter((entry) => entry.title !== group.title);

    nextGroups.unshift({
      title: group.title,
      status: "pending",
      source: "request-link"
    });

    localStorage.setItem(storageKey, JSON.stringify(nextGroups));
  } catch (error) {
    console.error(error);
  }
}

function getCardGroup(card) {
  return {
    title: card.dataset.groupTitle,
    members: card.dataset.groupMembers,
    description: card.dataset.groupDescription
  };
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

    photoShell.classList.add("card-photo-shell-swipeable");
    descriptionPanel.className = "card-photo-description";
    descriptionPanel.setAttribute("aria-hidden", "true");
    descriptionText.className = "card-photo-description-text";
    descriptionText.textContent = groupDescription;

    descriptionPanel.appendChild(descriptionText);
    photoShell.appendChild(descriptionPanel);
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

      if (deltaX > 0) {
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

function syncRequestButtons() {
  const pendingTitles = readPendingTitles();

  requestButtons.forEach((button) => {
    const card = button.closest(".content-card");
    const groupTitle = card?.dataset.groupTitle;
    const isPending = Boolean(groupTitle && pendingTitles.has(groupTitle));

    button.textContent = isPending ? "Request sent!" : "Request to link";
  });
}

function openInviteModal(group) {
  activeInviteGroup = group;
  inviteInput.value = "";
  inviteModal.classList.add("is-open");
  inviteModal.setAttribute("aria-hidden", "false");
  window.setTimeout(() => inviteInput.focus(), 20);
}

function closeInviteModal() {
  inviteModal.classList.remove("is-open");
  inviteModal.setAttribute("aria-hidden", "true");
  activeInviteGroup = null;
}

function openInviteLoading() {
  if (!inviteLoadingOverlay) {
    return;
  }

  inviteLoadingOverlay.classList.add("is-open");
  inviteLoadingOverlay.setAttribute("aria-hidden", "false");
}

function showRequestOverlay(onComplete) {
  if (!requestOverlay) {
    return;
  }

  if (requestOverlayTimeout) {
    window.clearTimeout(requestOverlayTimeout);
  }

  if (requestOverlayFadeTimeout) {
    window.clearTimeout(requestOverlayFadeTimeout);
  }

  requestOverlay.classList.remove("is-fading");
  requestOverlay.classList.add("is-open");
  requestOverlay.setAttribute("aria-hidden", "false");

  requestOverlayTimeout = window.setTimeout(() => {
    requestOverlay.classList.add("is-fading");

    requestOverlayFadeTimeout = window.setTimeout(() => {
      requestOverlay.classList.remove("is-open", "is-fading");
      requestOverlay.setAttribute("aria-hidden", "true");
      if (typeof onComplete === "function") {
        onComplete();
      }
    }, 550);
  }, 1600);
}

requestButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".content-card");

    if (!card) {
      return;
    }

    savePendingGroup(getCardGroup(card));
    showRequestOverlay(syncRequestButtons);
  });
});

inviteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".content-card");

    if (!card) {
      return;
    }

    openInviteModal(getCardGroup(card));
  });
});

inviteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!activeInviteGroup || !inviteInput.value.trim()) {
    return;
  }

  const params = new URLSearchParams({
    title: activeInviteGroup.title,
    members: activeInviteGroup.members,
    description: activeInviteGroup.description,
    back: "home"
  });

  closeInviteModal();
  openInviteLoading();

  window.setTimeout(() => {
    window.location.href = `../group-page/index.html?${params.toString()}`;
  }, 1350);
});

inviteModal.addEventListener("click", (event) => {
  if (event.target === inviteModal) {
    closeInviteModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && inviteModal.classList.contains("is-open")) {
    closeInviteModal();
  }
});

syncRequestButtons();
renderCardTitles();
renderCardPhotoDescriptions();
setupCardPhotoSwipes();
