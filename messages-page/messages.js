const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const closeButton = document.getElementById("messages-close-button");

function setupEmbeddedMode() {
  if (isEmbedded) {
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
