const searchInput = document.getElementById("search-input");
const dropdown = document.getElementById("search-dropdown");
const suggestionsRoot = document.getElementById("search-suggestions");
const mapFrame = document.getElementById("map-frame");
const groupSheet = document.getElementById("group-sheet");
const groupSheetTitle = document.getElementById("group-sheet-title");
const groupSheetMembers = document.getElementById("group-sheet-members");
const groupSheetDescription = document.getElementById("group-sheet-description");
const groupSheetAction = document.getElementById("group-sheet-action");
const groupSheetLink = document.getElementById("group-sheet-link");
const inviteModal = document.getElementById("invite-modal");
const inviteForm = document.getElementById("invite-form");
const inviteInput = document.getElementById("invite-input");
const requestOverlay = document.getElementById("request-overlay");
const defaultCenter = [-83.9207, 35.9606];
const styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const storageKey = "linkRequests";

const map = new maplibregl.Map({
  container: mapFrame,
  style: styleUrl,
  center: defaultCenter,
  zoom: 12.8,
  attributionControl: false
});

map.addControl(
  new maplibregl.AttributionControl({
    compact: true
  })
);

map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

const markerNode = document.createElement("div");
markerNode.className = "map-pin";

const marker = new maplibregl.Marker({
  element: markerNode,
  anchor: "center"
})
  .setLngLat(defaultCenter)
  .addTo(map);
const groupMarkers = [];
let activeGroupId = null;
let activeGroup = null;
let requestOverlayTimeout = null;
let requestOverlayFadeTimeout = null;
const pageParams = new URLSearchParams(window.location.search);

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

function applyMinimalTheme() {
  const style = map.getStyle();
  if (!style?.layers) return;

  style.layers.forEach((layer) => {
    const layerName = `${layer.id} ${layer["source-layer"] || ""}`.toLowerCase();
    const isPlaceLabel =
      layerName.includes("place") ||
      layerName.includes("settlement") ||
      layerName.includes("city") ||
      layerName.includes("town") ||
      layerName.includes("village");
    const isRoadLabel =
      layerName.includes("road") ||
      layerName.includes("street") ||
      layerName.includes("highway");
    const isPoiLabel =
      layerName.includes("poi") ||
      layerName.includes("transit") ||
      layerName.includes("airport");

    if (layer.type === "fill-extrusion") {
      map.setLayoutProperty(layer.id, "visibility", "none");
      return;
    }

    if (layer.type === "background") {
      map.setPaintProperty(layer.id, "background-color", "#f4f8ff");
      return;
    }

    if (layer.type === "fill") {
      const isWater = layerName.includes("water");
      const isPark =
        layerName.includes("park") ||
        layerName.includes("landuse") ||
        layerName.includes("wood") ||
        layerName.includes("grass") ||
        layerName.includes("green");

      map.setPaintProperty(layer.id, "fill-color", isWater ? "#dcebff" : isPark ? "#edf7d4" : "#f4f8ff");
      map.setPaintProperty(layer.id, "fill-outline-color", isPark ? "#c8d8ad" : "#d4dff1");
      map.setPaintProperty(layer.id, "fill-opacity", isWater ? 0.94 : 1);
      return;
    }

    if (layer.type === "symbol") {
      if (layer.layout && "icon-image" in layer.layout) {
        map.setLayoutProperty(layer.id, "icon-size", 0.75);
      }

      if (layer.paint && "text-color" in layer.paint) {
        map.setPaintProperty(
          layer.id,
          "text-color",
          isPlaceLabel ? "#17243f" : isRoadLabel ? "#5f6f92" : "#6478ff"
        );
      }

      if (layer.paint && "text-halo-color" in layer.paint) {
        map.setPaintProperty(layer.id, "text-halo-color", "rgba(244,248,255,0.94)");
      }

      if (layer.paint && "text-halo-width" in layer.paint) {
        map.setPaintProperty(layer.id, "text-halo-width", isPlaceLabel ? 1.2 : 0.9);
      }

      if (layer.paint && "text-opacity" in layer.paint) {
        map.setPaintProperty(layer.id, "text-opacity", isPoiLabel ? 0.72 : 1);
      }

      return;
    }

    if (layer.type === "line") {
      const isRoad =
        layerName.includes("road") ||
        layerName.includes("street") ||
        layerName.includes("path") ||
        layerName.includes("track");
      const isBoundary = layerName.includes("boundary");
      const isWater = layerName.includes("water");
      const isMajorRoad =
        layerName.includes("motorway") ||
        layerName.includes("trunk") ||
        layerName.includes("primary");

      map.setPaintProperty(
        layer.id,
        "line-color",
        isWater ? "#92bad5" : isBoundary ? "#b8c6df" : isMajorRoad ? "#6478ff" : "#a8b7d4"
      );
      map.setPaintProperty(layer.id, "line-opacity", isRoad ? 0.78 : 0.46);
      map.setPaintProperty(
        layer.id,
        "line-width",
        isRoad
          ? ["interpolate", ["linear"], ["zoom"], 6, isMajorRoad ? 0.42 : 0.28, 16, isMajorRoad ? 1.18 : 0.82]
          : ["interpolate", ["linear"], ["zoom"], 6, 0.2, 16, 0.6]
      );

      if (isBoundary) {
        map.setPaintProperty(layer.id, "line-dasharray", [2, 2]);
      }
    }
  });
}

const seedSuggestions = [
  "pickleball",
  "hiking",
  "running club",
  "book club",
  "brunch",
  "coffee meetups",
  "scrapbooking",
  "pottery",
  "movie nights",
  "volunteering",
  "study group",
  "language exchange",
  "networking",
  "pet sitting",
  "babysitting",
  "housesitting",
  "game night",
  "tennis",
  "badminton",
  "pilates",
  "yoga",
  "cooking class",
  "art walk",
  "photography",
  "live music",
  "museum trip",
  "dog walking",
  "gardening",
  "cycling",
  "camping"
];
const descriptionParts = [
  "Welcoming local meetups for",
  "Relaxed weekly hangs built around",
  "A nearby community that gets together for",
  "Casual social gatherings focused on",
  "Friendly meetups where people connect over"
];
const detailParts = [
  "easy conversation and making new friends.",
  "after-work plans and low-pressure group events.",
  "beginner-friendly meetups around town.",
  "recurring neighborhood sessions and spontaneous plans.",
  "meeting up with people who share the same interest."
];

function toSearchLabel(value) {
  return value.replace(/^Search for "|"$|^Search for /g, "");
}

function getRestoreState() {
  const query = toSearchLabel(pageParams.get("search") || "").trim();
  const groupId = pageParams.get("groupId") || "";
  const centerLat = Number.parseFloat(pageParams.get("centerLat") || "");
  const centerLng = Number.parseFloat(pageParams.get("centerLng") || "");

  if (!query) {
    return null;
  }

  return {
    query,
    groupId,
    center:
      Number.isFinite(centerLat) && Number.isFinite(centerLng)
        ? { lat: centerLat, lng: centerLng }
        : getActiveCenter()
  };
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function clearGroupMarkers() {
  groupMarkers.splice(0).forEach((groupMarker) => groupMarker.remove());
  activeGroupId = null;
  activeGroup = null;
}

function closeGroupSheet() {
  groupSheet.classList.remove("is-open");
  groupSheet.setAttribute("aria-hidden", "true");
  activeGroupId = null;
  activeGroup = null;
}

function openInviteModal() {
  if (!activeGroup) {
    return;
  }

  inviteInput.value = "";
  inviteModal.classList.add("is-open");
  inviteModal.setAttribute("aria-hidden", "false");
  window.setTimeout(() => inviteInput.focus(), 20);
}

function closeInviteModal() {
  inviteModal.classList.remove("is-open");
  inviteModal.setAttribute("aria-hidden", "true");
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

function openGroupSheet(group) {
  groupSheetTitle.textContent = sentenceCase(group.label);
  groupSheetMembers.textContent = `${group.members} members`;
  groupSheetDescription.textContent = group.description;
  groupSheetAction.textContent = readPendingTitles().has(sentenceCase(group.label))
    ? "Request sent!"
    : "Request to link";
  groupSheetLink.textContent = "Enter invite code";
  groupSheet.classList.add("is-open");
  groupSheet.setAttribute("aria-hidden", "false");
  activeGroupId = group.id;
  activeGroup = group;
}

function savePendingGroup(group) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const groups = Array.isArray(stored) ? stored : [];
    const title = sentenceCase(group.label);
    const nextGroups = groups.filter((entry) => entry.title !== title);

    nextGroups.unshift({
      title,
      status: "pending",
      source: "request-link"
    });

    localStorage.setItem(storageKey, JSON.stringify(nextGroups));
  } catch (error) {
    console.error(error);
  }
}

function getActiveCenter() {
  const center = map.getCenter();
  return center || { lat: defaultCenter[1], lng: defaultCenter[0] };
}

function buildGroupResults(query, center = getActiveCenter()) {
  const cleanedQuery = toSearchLabel(query).trim();

  if (!cleanedQuery) {
    return {
      cleanedQuery,
      count: 0,
      points: []
    };
  }

  const random = seededRandom(hashString(`${cleanedQuery}-${center.lat.toFixed(3)}-${center.lng.toFixed(3)}`));
  const markerCount = 5 + Math.floor(random() * 3);
  const lngScale = Math.cos((center.lat * Math.PI) / 180) || 1;
  const groups = [];

  for (let index = 0; index < markerCount; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.01 + random() * 0.02;
    const latOffset = Math.sin(angle) * distance;
    const lngOffset = (Math.cos(angle) * distance) / lngScale;
    const memberCount = 12 + Math.floor(random() * 31);
    const intro = descriptionParts[Math.floor(random() * descriptionParts.length)];
    const detail = detailParts[Math.floor(random() * detailParts.length)];

    groups.push({
      id: `${cleanedQuery}-${index}`,
      lat: center.lat + latOffset,
      lng: center.lng + lngOffset,
      label: cleanedQuery,
      members: memberCount,
      description: `${intro} ${cleanedQuery.toLowerCase()}, with ${detail}`
    });
  }

  return {
    cleanedQuery,
    count: markerCount,
    groups
  };
}

function renderGroupMarkers(query, options = {}) {
  const results = buildGroupResults(query, options.center);

  if (!results.cleanedQuery) {
    clearGroupMarkers();
    closeGroupSheet();
    return null;
  }

  clearGroupMarkers();
  closeGroupSheet();

  results.groups.forEach((group, index) => {
    const groupNode = document.createElement("button");

    groupNode.type = "button";
    groupNode.className = "group-map-pin";
    groupNode.setAttribute("aria-label", `${results.cleanedQuery} group ${index + 1}`);
    groupNode.title = `${sentenceCase(results.cleanedQuery)} nearby`;
    groupNode.addEventListener("click", () => {
      openGroupSheet(group);
    });

    const groupMarker = new maplibregl.Marker({
      element: groupNode,
      anchor: "bottom"
    })
      .setLngLat([group.lng, group.lat])
      .addTo(map);

    groupMarkers.push(groupMarker);
  });

  if (options.openGroupId) {
    const matchedGroup = results.groups.find((group) => group.id === options.openGroupId);

    if (matchedGroup) {
      openGroupSheet(matchedGroup);
    }
  }

  return results;
}

function sentenceCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildSuggestions(query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const startsWith = seedSuggestions.filter((item) => item.startsWith(trimmed));
  const includes = seedSuggestions.filter(
    (item) => !item.startsWith(trimmed) && item.includes(trimmed)
  );
  const related = [
    `${trimmed} group`,
    `${trimmed} near me`,
    `${trimmed} events`,
    `${trimmed} club`,
    `${trimmed} friends`
  ];

  const merged = [...startsWith, ...includes, ...related]
    .map((item) => sentenceCase(item))
    .filter((item, index, array) => array.indexOf(item) === index);

  const exactMatch = startsWith.length > 0 || includes.length > 0;
  const limit = trimmed.length >= 7 ? 2 : trimmed.length >= 4 ? 3 : 4;
  const sliced = merged.slice(0, limit);

  if (!exactMatch && sliced.length < limit) {
    sliced.push(`Search for "${sentenceCase(trimmed)}"`);
  }

  return sliced.slice(0, 4);
}

function renderSuggestions(items) {
  suggestionsRoot.innerHTML = "";
  suggestionsRoot.style.gridTemplateRows = `repeat(${items.length}, minmax(0, 1fr))`;

  items.forEach((item) => {
    const results = buildGroupResults(item);
    const button = document.createElement("button");
    const title = document.createElement("span");
    const meta = document.createElement("span");

    button.type = "button";
    button.className = "suggestion-item";
    button.setAttribute("role", "option");
    title.className = "suggestion-title";
    title.textContent = item;
    meta.className = "suggestion-meta";
    meta.textContent = `${results.count} groups near you`;
    button.append(title, meta);
    button.addEventListener("click", () => {
      const selectedValue = toSearchLabel(item);

      searchInput.value = selectedValue;
      dropdown.classList.add("is-hidden");
      renderGroupMarkers(selectedValue);
      searchInput.blur();
    });
    suggestionsRoot.appendChild(button);
  });
}

searchInput.addEventListener("input", () => {
  const suggestions = buildSuggestions(searchInput.value);
  closeGroupSheet();

  if (suggestions.length === 0) {
    dropdown.classList.add("is-hidden");
    suggestionsRoot.innerHTML = "";
    clearGroupMarkers();
    return;
  }

  renderSuggestions(suggestions);
  dropdown.classList.remove("is-hidden");
});

searchInput.addEventListener("focus", () => {
  const suggestions = buildSuggestions(searchInput.value);
  if (suggestions.length) {
    renderSuggestions(suggestions);
    dropdown.classList.remove("is-hidden");
  }
});

document.addEventListener("click", (event) => {
  const searchArea = document.querySelector(".search-area");
  if (!searchArea.contains(event.target)) {
    dropdown.classList.add("is-hidden");
  }
});

groupSheetAction.addEventListener("click", () => {
  if (!activeGroup) {
    return;
  }

  savePendingGroup(activeGroup);
  closeInviteModal();
  showRequestOverlay(() => {
    groupSheetAction.textContent = "Request sent!";
  });
});

groupSheetLink.addEventListener("click", openInviteModal);

inviteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!activeGroup || !inviteInput.value.trim()) {
    return;
  }

  const center = getActiveCenter();

  const params = new URLSearchParams({
    title: sentenceCase(activeGroup.label),
    members: String(activeGroup.members),
    description: activeGroup.description,
    back: "search",
    search: activeGroup.label,
    groupId: activeGroup.id,
    centerLat: center.lat.toFixed(6),
    centerLng: center.lng.toFixed(6)
  });

  window.location.href = `../group-page/index.html?${params.toString()}`;
});

groupSheet.addEventListener("click", (event) => {
  if (event.target === groupSheetAction || event.target === groupSheetLink) {
    return;
  }

  closeGroupSheet();
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

function updateMap(lat, lon, options = {}) {
  const center = [lon, lat];
  marker.setLngLat(center);
  map.easeTo({
    center,
    zoom: 12.8,
    duration: options.instant ? 0 : 1200
  });
}

function extractCoordinates(data) {
  const lat =
    data?.latitude ??
    data?.lat ??
    data?.location?.latitude ??
    data?.location?.lat;
  const lon =
    data?.longitude ??
    data?.lon ??
    data?.lng ??
    data?.location?.longitude ??
    data?.location?.lon ??
    data?.location?.lng;

  if (typeof lat === "number" && typeof lon === "number") {
    return { lat, lon };
  }

  return null;
}

async function loadMapLocation() {
  try {
    const response = await fetch("https://apiip.net/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log(data);

    const coords = extractCoordinates(data);
    if (!coords) {
      throw new Error("No coordinates returned from APIIP.");
    }

    updateMap(coords.lat, coords.lon);
    renderGroupMarkers(searchInput.value);
  } catch (error) {
    updateMap(defaultCenter[1], defaultCenter[0]);
    renderGroupMarkers(searchInput.value);
    console.error(error);
  }
}

function restoreSearchState() {
  const restoreState = getRestoreState();

  if (!restoreState) {
    return false;
  }

  searchInput.value = restoreState.query;
  dropdown.classList.add("is-hidden");
  suggestionsRoot.innerHTML = "";
  updateMap(restoreState.center.lat, restoreState.center.lng, { instant: true });
  renderGroupMarkers(restoreState.query, {
    center: restoreState.center,
    openGroupId: restoreState.groupId
  });
  searchInput.blur();

  return true;
}

map.once("load", () => {
  map.resize();
  applyMinimalTheme();

  if (!restoreSearchState()) {
    updateMap(defaultCenter[1], defaultCenter[0]);
  }
});

if (!getRestoreState()) {
  loadMapLocation();
}
