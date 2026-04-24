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
      map.setPaintProperty(layer.id, "background-color", "#f7f3ea");
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

      map.setPaintProperty(layer.id, "fill-color", isWater ? "#d7edf8" : isPark ? "#dceccf" : "#f3eee2");
      map.setPaintProperty(layer.id, "fill-outline-color", isPark ? "#bdd2ae" : "#d6cfbf");
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
          isPlaceLabel ? "#696055" : isRoadLabel ? "#84786d" : "#7f9470"
        );
      }

      if (layer.paint && "text-halo-color" in layer.paint) {
        map.setPaintProperty(layer.id, "text-halo-color", "rgba(255,255,255,0.92)");
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
        isWater ? "#a8cfe1" : isBoundary ? "#c9c2ad" : isMajorRoad ? "#b59d82" : "#b9c7a4"
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

map.once("load", () => {
  map.resize();
  applyMinimalTheme();
  updateMap(defaultCenter[1], defaultCenter[0]);
});

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

function openGroupSheet(group) {
  groupSheetTitle.textContent = sentenceCase(group.label);
  groupSheetMembers.textContent = `${group.members} members`;
  groupSheetDescription.textContent = group.description;
  groupSheetAction.textContent = "Request to link";
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

function renderGroupMarkers(query) {
  const results = buildGroupResults(query);

  if (!results.cleanedQuery) {
    clearGroupMarkers();
    closeGroupSheet();
    return;
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
  window.location.href = "../request%20sent%20page/index.html";
});

groupSheetLink.addEventListener("click", closeGroupSheet);

groupSheet.addEventListener("click", (event) => {
  if (event.target === groupSheetAction || event.target === groupSheetLink) {
    return;
  }

  closeGroupSheet();
});

function updateMap(lat, lon) {
  const center = [lon, lat];
  marker.setLngLat(center);
  map.easeTo({
    center,
    zoom: 12.8,
    duration: 1200
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

loadMapLocation();
