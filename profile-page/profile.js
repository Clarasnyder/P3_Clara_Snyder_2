const groupsButton = document.getElementById("groups-button");
const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const closeButton = document.getElementById("profile-close-button");

groupsButton?.addEventListener("click", () => {
  window.location.href = "../my-groups-page/index.html";
});

function setupEmbeddedMode() {
  if (isEmbedded) {
    closeButton?.addEventListener("click", (event) => {
      event.preventDefault();
      window.parent.postMessage({ type: "close-panel-overlay", panel: "profile" }, "*");
    });
    return;
  }

  closeButton?.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "../homepage/index.html?skipSplash=1";
  });
}

setupEmbeddedMode();
