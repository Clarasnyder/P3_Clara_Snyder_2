const page = document.querySelector(".page");
const params = new URLSearchParams(window.location.search);
const returnTarget = params.get("return");
const returnUrls = {
  feed: "../homepage/index.html",
  search: "../search-page/index.html"
};

if (page && returnTarget && returnUrls[returnTarget]) {
  window.setTimeout(() => {
    page.classList.add("is-fading");

    window.setTimeout(() => {
      window.location.href = returnUrls[returnTarget];
    }, 550);
  }, 1600);
}
