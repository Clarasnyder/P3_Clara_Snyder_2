const mapFrame = document.getElementById("map-frame");
const statusLabel = document.getElementById("status-label");
const locationTitle = document.getElementById("location-title");
const locationMeta = document.getElementById("location-meta");
const defaultCenter = [-83.9207, 35.9606];
const styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

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

map.once("load", () => {
  map.resize();
  applyMinimalTheme();
  updateMap(defaultCenter[1], defaultCenter[0]);
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

function updateLabels(data) {
  const city = data?.city || data?.location?.city || "Nearby area";
  const region = data?.region || data?.state_prov || data?.location?.region || "";
  const country = data?.country_name || data?.country || data?.location?.country_name || "";

  statusLabel.textContent = "Live approximate area";
  locationTitle.textContent = city;
  locationMeta.textContent = [region, country].filter(Boolean).join(", ") || "Using APIIP location estimate";
}

async function loadApiipLocation() {
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
    updateLabels(data);
  } catch (error) {
    statusLabel.textContent = "Map fallback";
    locationTitle.textContent = "Knoxville";
    locationMeta.textContent = "APIIP location unavailable, showing a default interactive map.";
    updateMap(defaultCenter[1], defaultCenter[0]);
    console.error(error);
  }
}

loadApiipLocation();
