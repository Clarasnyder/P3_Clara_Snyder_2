const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const closeButton = document.getElementById("messages-close-button");
const conversationLinks = document.querySelectorAll(".conversation-link");

function setupEmbeddedMode() {
  if (isEmbedded) {
    conversationLinks.forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.href);

      url.searchParams.set("embedded", "1");
      link.href = url.toString();
    });

    closeButton?.addEventListener("click", (event) => {
      event.preventDefault();
      window.parent.postMessage({ type: "close-panel-overlay", panel: "messages" }, "*");
    });
    return;
  }

  closeButton?.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "../homepage/index.html";
  });
}

setupEmbeddedMode();
