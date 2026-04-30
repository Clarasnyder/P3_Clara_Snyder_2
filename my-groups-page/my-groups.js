const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const closeButton = document.getElementById("profile-close-button");

function setupEmbeddedMode() {
  if (isEmbedded) {
    closeButton?.addEventListener("click", (event) => {
      event.preventDefault();
      window.parent.postMessage({ type: "close-panel-overlay", panel: "profile" }, "*");
    });
  } else {
    closeButton?.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "../homepage/index.html";
    });
    return;
  }

  const navItems = document.querySelectorAll(".bottom-nav .nav-item");
  const homeLink = navItems[0];
  const messagesLink = navItems[1];
  const searchLink = navItems[2];
  const profileLink = navItems[3];

  homeLink?.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage({ type: "close-panel-overlay", panel: "profile" }, "*");
  });

  messagesLink?.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage({ type: "open-panel-overlay", panel: "messages" }, "*");
  });

  searchLink?.addEventListener("click", (event) => {
    event.preventDefault();
    window.top.location.href = searchLink.getAttribute("href");
  });

  profileLink?.addEventListener("click", (event) => {
    event.preventDefault();
  });
}

setupEmbeddedMode();
