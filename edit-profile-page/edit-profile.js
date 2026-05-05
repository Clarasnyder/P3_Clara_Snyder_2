const params = new URLSearchParams(window.location.search);
const isEmbedded = params.get("embedded") === "1";
const groupsNavLink = document.getElementById("groups-nav-link");
const messagesNavLink = document.getElementById("messages-nav-link");
const backLink = document.getElementById("back-link");
const profileForm = document.getElementById("profile-form");
const avatarPreview = document.getElementById("avatar-preview");
const avatarButton = document.getElementById("avatar-button");
const nameInput = document.getElementById("name-input");
const handleInput = document.getElementById("handle-input");
const locationInput = document.getElementById("location-input");
const bioInput = document.getElementById("bio-input");
const photoCameraOverlay = document.getElementById("photo-camera-overlay");
const photoCameraClose = document.getElementById("photo-camera-close");
const photoCameraFrame = document.getElementById("photo-camera-frame");
const photoCameraVideo = document.getElementById("photo-camera-video");
const photoCameraCanvas = document.getElementById("photo-camera-canvas");
const photoCameraError = document.getElementById("photo-camera-error");
const photoCameraStatus = document.getElementById("photo-camera-status");
const photoCameraShutter = document.getElementById("photo-camera-shutter");
const profileStorageKey = "linkProfile";
const defaultProfile = {
  name: "Clara Snyder",
  handle: "@clarasnyder",
  location: "Knoxville, Tennessee",
  bio: "Into brunch plans, creative projects, and meeting new people around town.",
  photo: ""
};
let photoCameraStream = null;
let capturedProfilePhoto = "";

document.documentElement.classList.toggle("is-embedded", isEmbedded);

function postPanelNavigation(panel) {
  window.parent.postMessage({ type: "navigate-panel", panel }, "*");
}

function buildProfileHref() {
  return `../my-groups-page/index.html${isEmbedded ? "?embedded=1" : ""}`;
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "CS";
  }

  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function readProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(profileStorageKey) || "{}");
    return { ...defaultProfile, ...stored };
  } catch (error) {
    return { ...defaultProfile };
  }
}

function applyAvatarPhoto(photo, name = nameInput.value) {
  capturedProfilePhoto = photo || "";

  if (capturedProfilePhoto) {
    avatarPreview.style.backgroundImage = `url("${capturedProfilePhoto}")`;
    avatarPreview.classList.add("has-photo");
    return;
  }

  avatarPreview.style.removeProperty("background-image");
  avatarPreview.classList.remove("has-photo");
  avatarPreview.textContent = getInitials(name);
}

function populateProfileForm() {
  const profile = readProfile();

  nameInput.value = profile.name;
  handleInput.value = profile.handle;
  locationInput.value = profile.location;
  bioInput.value = profile.bio;
  avatarPreview.textContent = getInitials(profile.name);
  applyAvatarPhoto(profile.photo, profile.name);
}

function saveProfile() {
  const profile = {
    name: nameInput.value.trim() || defaultProfile.name,
    handle: handleInput.value.trim() || defaultProfile.handle,
    location: locationInput.value.trim() || defaultProfile.location,
    bio: bioInput.value.trim() || defaultProfile.bio,
    photo: capturedProfilePhoto
  };

  localStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

function setupEmbeddedMode() {
  backLink.href = buildProfileHref();

  if (!isEmbedded) {
    return;
  }

  groupsNavLink?.addEventListener("click", (event) => {
    event.preventDefault();
    postPanelNavigation("groups");
  });

  messagesNavLink?.addEventListener("click", (event) => {
    event.preventDefault();
    postPanelNavigation("messages");
  });
}

function stopPhotoCamera() {
  if (!photoCameraStream) {
    return;
  }

  photoCameraStream.getTracks().forEach((track) => track.stop());
  photoCameraStream = null;
  photoCameraVideo.srcObject = null;
}

function showPhotoCameraError(message) {
  photoCameraFrame.classList.add("has-error");
  photoCameraVideo.hidden = true;
  photoCameraCanvas.hidden = true;
  photoCameraError.textContent = message;
  photoCameraStatus.textContent = "Camera unavailable";
  photoCameraShutter.disabled = true;
}

async function openPhotoCamera() {
  photoCameraOverlay.classList.add("is-open");
  photoCameraOverlay.setAttribute("aria-hidden", "false");
  photoCameraFrame.classList.remove("has-error");
  photoCameraVideo.hidden = false;
  photoCameraCanvas.hidden = true;
  photoCameraError.textContent = "";
  photoCameraStatus.textContent = "Opening camera";
  photoCameraShutter.disabled = true;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showPhotoCameraError("Camera access is not available in this browser.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "user" }
      }
    });

    if (!photoCameraOverlay.classList.contains("is-open")) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    photoCameraStream = stream;
    photoCameraVideo.srcObject = stream;
    await photoCameraVideo.play();
    photoCameraStatus.textContent = "Line up your photo";
    photoCameraShutter.disabled = false;
  } catch (error) {
    showPhotoCameraError("Allow camera access to take a profile photo.");
  }
}

function closePhotoCamera() {
  stopPhotoCamera();
  photoCameraOverlay.classList.remove("is-open");
  photoCameraOverlay.setAttribute("aria-hidden", "true");
}

function captureProfilePhoto() {
  if (!photoCameraStream || photoCameraVideo.readyState < 2) {
    photoCameraStatus.textContent = "Camera is still loading";
    return;
  }

  const width = photoCameraVideo.videoWidth || 640;
  const height = photoCameraVideo.videoHeight || 640;
  const context = photoCameraCanvas.getContext("2d");

  photoCameraCanvas.width = width;
  photoCameraCanvas.height = height;
  context.drawImage(photoCameraVideo, 0, 0, width, height);

  applyAvatarPhoto(photoCameraCanvas.toDataURL("image/png"));
  closePhotoCamera();
}

avatarButton?.addEventListener("click", openPhotoCamera);

photoCameraClose?.addEventListener("click", closePhotoCamera);

photoCameraShutter?.addEventListener("click", captureProfilePhoto);

photoCameraOverlay?.addEventListener("click", (event) => {
  if (event.target === photoCameraOverlay) {
    closePhotoCamera();
  }
});

profileForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  saveProfile();
  window.location.href = buildProfileHref();
});

setupEmbeddedMode();
populateProfileForm();
