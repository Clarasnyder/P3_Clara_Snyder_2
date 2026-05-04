const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const groupsNavLink = document.getElementById("groups-nav-link");
const messagesNavLink = document.getElementById("messages-nav-link");

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

setupEmbeddedMode();
setupEmbeddedPanelSwipes();
