const backLink = document.getElementById("back-link");
const calendarMonth = document.getElementById("calendar-month");
const calendarGrid = document.getElementById("calendar-grid");
const eventList = document.getElementById("event-list");
const pageElement = document.querySelector(".page");

const params = new URLSearchParams(window.location.search);
const rawTitle = params.get("title") || "Pickleball";
const rawMembers = params.get("members") || "24";
const rawBack = params.get("back") || "groups";
const rawSearch = params.get("search") || "";
const rawGroupId = params.get("groupId") || "";
const rawCenterLat = params.get("centerLat") || "";
const rawCenterLng = params.get("centerLng") || "";
const rawDescription =
  params.get("description") ||
  "Welcoming local meetups for pickleball, with easy conversation and making new friends.";
const groupPageColors = {
  "Brunch club": "#eef6ff",
  "Crafting crew": "#e3f2fb",
  "Running club": "#f2fbd1",
  "Book club": "#f7faff",
  "Art walk": "#eefad3",
  Gardening: "#f2fbd1",
  Pickleball: "#e3e9ff"
};
const paletteFallbacks = ["#eef6ff", "#e3f2fb", "#f2fbd1", "#f7faff", "#eefad3", "#e3e9ff", "#f1f6ff", "#f4fae7"];

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getGroupPageColor(title) {
  if (groupPageColors[title]) {
    return groupPageColors[title];
  }

  return paletteFallbacks[hashString(title) % paletteFallbacks.length];
}

const eventDirectory = {
  "Brunch club": {
    month: "May 2026",
    highlights: [
      { day: 3, tone: "primary" },
      { day: 11, tone: "secondary" },
      { day: 24, tone: "primary" }
    ],
    events: [
      {
        day: "03",
        month: "May",
        title: "Sunday patio brunch",
        time: "10:30 AM",
        spot: "Potchke Cafe patio",
        bring: "Just yourself and an appetite",
        note: "Kickoff meetup for coffee, pastries, and easy conversation. We are holding a long table near the front windows."
      },
      {
        day: "11",
        month: "May",
        title: "Midweek breakfast club",
        time: "8:15 AM",
        spot: "Wild Love Bakehouse",
        bring: "Optional book or local recommendation",
        note: "Shorter weekday meetup before work. People usually trickle in between 8:15 and 8:30."
      },
      {
        day: "24",
        month: "May",
        title: "Late brunch and market stroll",
        time: "11:00 AM",
        spot: "The Plaid Apron",
        bring: "Comfortable shoes",
        note: "Brunch first, then an easy walk through the market. We will split into smaller walking groups after brunch."
      }
    ]
  },
  "Crafting crew": {
    month: "May 2026",
    highlights: [
      { day: 5, tone: "primary" },
      { day: 17, tone: "secondary" },
      { day: 28, tone: "primary" }
    ],
    events: [
      {
        day: "05",
        month: "May",
        title: "Magazine collage night",
        time: "6:30 PM",
        spot: "Central Collective Studio",
        bring: "Any scraps or magazines you want to trade",
        note: "Shared scissors, glue, and inspiration boards. Basic supplies will be on the main table."
      },
      {
        day: "17",
        month: "May",
        title: "Open craft social",
        time: "2:00 PM",
        spot: "Old City coffee loft",
        bring: "Current project",
        note: "Bring-your-own project and casual conversation. Best for portable crafts like sketching, knitting, or journaling."
      },
      {
        day: "28",
        month: "May",
        title: "Mini zine workshop",
        time: "7:00 PM",
        spot: "South Press back room",
        bring: "Pens if you have favorites",
        note: "Simple folded zines and layout ideas for beginners. We will have a short prompt to get everyone started."
      }
    ]
  },
  Pickleball: {
    month: "May 2026",
    highlights: [
      { day: 6, tone: "primary" },
      { day: 13, tone: "secondary" },
      { day: 20, tone: "primary" }
    ],
    events: [
      {
        day: "06",
        month: "May",
        title: "Beginner courts night",
        time: "6:00 PM",
        spot: "Tyson Park courts",
        bring: "Paddle and water",
        note: "Casual rallying and short rotation games. Extra paddles are usually available if you need one."
      },
      {
        day: "13",
        month: "May",
        title: "Partner mix-in",
        time: "6:30 PM",
        spot: "West Hills Park",
        bring: "Light layer for after sunset",
        note: "Easy doubles rounds with rotating partners. We will sort by comfort level before play starts."
      },
      {
        day: "20",
        month: "May",
        title: "Weekend open play",
        time: "10:00 AM",
        spot: "World's Fair Park rec courts",
        bring: "Snack to share if you want",
        note: "A longer social session with snack break halfway through. We usually take a group photo near the end."
      }
    ]
  }
};

function buildBackParams() {
  const backParams = new URLSearchParams({
    title: rawTitle,
    members: rawMembers,
    description: rawDescription,
    back: rawBack
  });

  if (rawSearch) {
    backParams.set("search", rawSearch);
  }

  if (rawGroupId) {
    backParams.set("groupId", rawGroupId);
  }

  if (rawCenterLat) {
    backParams.set("centerLat", rawCenterLat);
  }

  if (rawCenterLng) {
    backParams.set("centerLng", rawCenterLng);
  }

  return backParams;
}

function getEventData() {
  return (
    eventDirectory[rawTitle] || {
      month: "May 2026",
      highlights: [
        { day: 8, tone: "primary" },
        { day: 15, tone: "secondary" },
        { day: 27, tone: "primary" }
      ],
      events: [
        {
          day: "08",
          month: "May",
          title: `${rawTitle} meetup`,
          time: "6:30 PM",
          spot: "Downtown meeting point",
          bring: "Anything you need for the activity",
          note: `${rawDescription} A group host will message the exact spot the day before.`
        },
        {
          day: "15",
          month: "May",
          title: `${rawTitle} social`,
          time: "7:00 PM",
          spot: "Neighborhood cafe patio",
          bring: "Optional friend",
          note: "A more relaxed gathering to meet everyone in the group. Good first event if you are brand new."
        }
      ]
    }
  );
}

function renderCalendar(highlights) {
  const days = [
    "", "", "", "", "", "1", "2",
    "3", "4", "5", "6", "7", "8", "9",
    "10", "11", "12", "13", "14", "15", "16",
    "17", "18", "19", "20", "21", "22", "23",
    "24", "25", "26", "27", "28", "29", "30",
    "31", "", "", "", "", "", ""
  ];
  const highlightMap = new Map(highlights.map((item) => [String(item.day), item.tone]));

  calendarGrid.innerHTML = "";

  days.forEach((day) => {
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";

    if (!day) {
      dayCell.classList.add("is-muted");
      calendarGrid.appendChild(dayCell);
      return;
    }

    dayCell.textContent = day;

    if (highlightMap.has(day)) {
      dayCell.classList.add(
        highlightMap.get(day) === "secondary" ? "is-highlighted-secondary" : "is-highlighted"
      );
    }

    calendarGrid.appendChild(dayCell);
  });
}

function renderEvents(events) {
  eventList.innerHTML = "";

  events.forEach((event) => {
    const item = document.createElement("article");
    const top = document.createElement("div");
    const dateChip = document.createElement("div");
    const dateDay = document.createElement("strong");
    const dateMonth = document.createElement("span");
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    const meta = document.createElement("div");

    item.className = "event-item";
    top.className = "event-item-top";
    dateChip.className = "event-date-chip";
    title.className = "event-title";
    meta.className = "event-meta";

    dateDay.textContent = event.day;
    dateMonth.textContent = event.month;
    title.textContent = event.title;

    [
      { label: "Time", value: event.time },
      { label: "Meeting spot", value: event.spot },
      { label: "Bring", value: event.bring },
      { label: "Note", value: event.note }
    ].forEach((entry) => {
      const row = document.createElement("p");
      row.className = "event-meta-row";
      row.innerHTML = `<span>${entry.label}:</span> ${entry.value}`;
      meta.appendChild(row);
    });

    dateChip.append(dateDay, dateMonth);
    copy.append(title);
    top.append(dateChip, copy);
    item.append(top, meta);
    eventList.appendChild(item);
  });
}

const eventData = getEventData();

calendarMonth.textContent = eventData.month;
backLink.href = `../group-page/index.html?${buildBackParams().toString()}`;
if (pageElement) {
  pageElement.style.setProperty("--group-page-bg", getGroupPageColor(rawTitle));
}
renderCalendar(eventData.highlights);
renderEvents(eventData.events);
