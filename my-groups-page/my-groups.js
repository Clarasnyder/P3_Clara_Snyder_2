const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const groupsNavLink = document.getElementById("groups-nav-link");
const messagesNavLink = document.getElementById("messages-nav-link");

document.documentElement.classList.toggle("is-embedded", isEmbedded);

function setupEmbeddedMode() {
  if (isEmbedded) {
    groupsNavLink?.addEventListener("click", (event) => {
      event.preventDefault();
      window.parent.postMessage({ type: "close-panel-overlay", panel: "profile" }, "*");
    });

    messagesNavLink?.addEventListener("click", (event) => {
      event.preventDefault();
      window.parent.postMessage({ type: "close-panel-overlay", panel: "profile" }, "*");
      window.parent.postMessage({ type: "open-panel-overlay", panel: "messages" }, "*");
    });
    return;
  }
}

setupEmbeddedMode();
