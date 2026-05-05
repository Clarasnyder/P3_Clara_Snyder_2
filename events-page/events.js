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
const isSearchEmbedded = params.get("embedded") === "1";
const rawDescription =
  params.get("description") ||
  "Welcoming local meetups for pickleball, with easy conversation and making new friends.";

document.documentElement.classList.toggle("is-search-embedded", isSearchEmbedded);
const groupThemes = {
  default: { color: "#dcebff" },
  social: { color: "#9fc4ff" },
  physical: { color: "#f1ffc5" },
  educational: { color: "#2f4f9a" }
};
const socialThemeKeywords = [
  "brunch",
  "craft",
  "crafting",
  "coffee",
  "scrapbook",
  "pottery",
  "movie",
  "game night",
  "book",
  "art walk",
  "live music",
  "museum",
  "cooking",
  "friend",
  "social"
];
const physicalThemeKeywords = [
  "pickleball",
  "running",
  "run",
  "hiking",
  "hike",
  "walking",
  "trail",
  "jog",
  "tennis",
  "badminton",
  "pilates",
  "yoga",
  "cycling",
  "bike",
  "camping",
  "court",
  "fitness",
  "sport"
];
const educationalThemeKeywords = [
  "spanish",
  "study",
  "study group",
  "language",
  "class",
  "tutoring",
  "homework",
  "learning",
  "lecture",
  "academic",
  "educational"
];

function matchesThemeKeyword(value, keyword) {
  if (keyword.includes(" ")) {
    return value.includes(keyword);
  }

  return new RegExp(`\\b${keyword}\\b`).test(value);
}

function buildGroupThemeBackground(color) {
  return `radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0) 26%), radial-gradient(circle at 82% 12%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 22%), linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 38%, rgba(255, 255, 255, 0.16) 100%), ${color}`;
}

function getGroupTheme(title, description = "") {
  const normalizedTitle = title.toLowerCase();
  const normalized = `${title} ${description}`.toLowerCase();

  if (educationalThemeKeywords.some((keyword) => matchesThemeKeyword(normalizedTitle, keyword))) {
    return groupThemes.educational;
  }

  if (physicalThemeKeywords.some((keyword) => matchesThemeKeyword(normalizedTitle, keyword))) {
    return groupThemes.physical;
  }

  if (socialThemeKeywords.some((keyword) => matchesThemeKeyword(normalizedTitle, keyword))) {
    return groupThemes.social;
  }

  if (educationalThemeKeywords.some((keyword) => matchesThemeKeyword(normalized, keyword))) {
    return groupThemes.educational;
  }

  if (physicalThemeKeywords.some((keyword) => matchesThemeKeyword(normalized, keyword))) {
    return groupThemes.physical;
  }

  if (socialThemeKeywords.some((keyword) => matchesThemeKeyword(normalized, keyword))) {
    return groupThemes.social;
  }

  return groupThemes.default;
}

const eventDirectory = {
  "Brunch Club": {
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
  "Crafting Crew": {
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
  },
  "Spanish Study Group": {
    month: "May 2026",
    highlights: [
      { day: 7, tone: "primary" },
      { day: 14, tone: "secondary" },
      { day: 21, tone: "primary" }
    ],
    events: [
      {
        day: "07",
        month: "May",
        title: "Conversation practice",
        time: "5:30 PM",
        spot: "Library study room B",
        bring: "Notebook or vocab list",
        note: "Low-pressure speaking practice with short prompts, pair rotations, and time to ask grammar questions."
      },
      {
        day: "14",
        month: "May",
        title: "Vocab review night",
        time: "6:00 PM",
        spot: "Student center tables",
        bring: "Five words to practice",
        note: "Bring a few words you want to remember. We will make quick examples and practice using them in conversation."
      },
      {
        day: "21",
        month: "May",
        title: "Cafe study session",
        time: "4:30 PM",
        spot: "Old City coffee loft",
        bring: "Homework or flashcards",
        note: "A quiet study block with a short group check-in at the beginning and end."
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

  if (isSearchEmbedded) {
    backParams.set("embedded", "1");
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
  const theme = getGroupTheme(rawTitle, rawDescription);
  const themeBackground = buildGroupThemeBackground(theme.color);

  pageElement.style.setProperty("--group-page-bg", theme.color);

  if (isSearchEmbedded) {
    window.parent.postMessage(
      { type: "set-shell-nav-background", color: theme.color, background: themeBackground },
      "*"
    );
  }
}
renderCalendar(eventData.highlights);
renderEvents(eventData.events);
