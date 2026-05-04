const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const conversationLinks = document.querySelectorAll(".conversation-link");
const profileNavLink = document.getElementById("profile-nav-link");
const groupsNavLink = document.getElementById("groups-nav-link");

document.documentElement.classList.toggle("is-embedded", isEmbedded);

function setupEmbeddedMode() {
  if (isEmbedded) {
    conversationLinks.forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.href);

      url.searchParams.set("embedded", "1");
      link.href = url.toString();
    });

    profileNavLink?.addEventListener("click", (event) => {
      event.preventDefault();
      window.parent.postMessage({ type: "close-panel-overlay", panel: "messages" }, "*");
      window.parent.postMessage({ type: "open-panel-overlay", panel: "profile" }, "*");
    });

    groupsNavLink?.addEventListener("click", (event) => {
      event.preventDefault();
      window.parent.postMessage({ type: "close-panel-overlay", panel: "messages" }, "*");
    });
    return;
  }
}

setupEmbeddedMode();
