"use strict";

/* =====================================================
   EverMore App
   ===================================================== */

   
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

const STORAGE_KEYS = {
  journal: "evermore_journal",
  bucket: "evermore_bucket",
  travel: "evermore_travel",
  gallery: "evermore_gallery",
  memory: "evermore_memory",
  letters: "evermore_letters",
  gratitude: "evermore_gratitude",
  sound: "evermore_sound",
  entered: "evermore_entered"
};

/* =====================================================
   Elements
   ===================================================== */

const landing = $("#landing");
const siteHeader = $("#siteHeader");
const soundButton = $("#soundButton");
const enterButton = $("#enterButton");
const brandButton = $("#brandButton");

const menuButton = $("#menuButton");
const mainNav = $("#mainNav");
const navButtons = $$("[data-page]", document).filter((el) => el.closest("nav") || el.classList.contains("garden-card") || el.id === "brandButton");

const pages = $$(".page");

const ambientAudio = $("#ambientAudio");

/* Journal */
const newJournalButton = $("#newJournalButton");
const journalSearch = $("#journalSearch");
const journalList = $("#journalList");
const journalDate = $("#journalDate");
const journalFavorite = $("#journalFavorite");
const journalTitle = $("#journalTitle");
const journalMood = $("#journalMood");
const journalContent = $("#journalContent");
const journalStatus = $("#journalStatus");
const deleteJournalButton = $("#deleteJournalButton");

/* Bucket */
const bucketForm = $("#bucketForm");
const bucketInput = $("#bucketInput");
const bucketGarden = $("#bucketGarden");

/* Travel */
const travelForm = $("#travelForm");
const travelPlace = $("#travelPlace");
const travelStatus = $("#travelStatus");
const travelNote = $("#travelNote");
const travelStars = $("#travelStars");
const travelList = $("#travelList");
const constellationLines = $("#constellationLines");

/* Gallery */
const galleryUpload = $("#galleryUpload");
const galleryGrid = $("#galleryGrid");

/* Memory */
const memoryForm = $("#memoryForm");
const memoryTitle = $("#memoryTitle");
const memoryDate = $("#memoryDate");
const memoryText = $("#memoryText");
const memoryEmotion = $("#memoryEmotion");
const memoryBoats = $("#memoryBoats");

/* Letters */
const letterForm = $("#letterForm");
const letterTitle = $("#letterTitle");
const letterDate = $("#letterDate");
const letterText = $("#letterText");
const letterTimeline = $("#letterTimeline");

/* Gratitude */
const gratitudeForm = $("#gratitudeForm");
const gratitudeInput = $("#gratitudeInput");
const gratitudeGarden = $("#gratitudeGarden");

/* Modal */
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalKicker = $("#modalKicker");
const modalBody = $("#modalBody");
const modalCloseTriggers = $$("[data-close-modal]");

/* =====================================================
   State
   ===================================================== */

const state = {
  currentPage: "landing",
  journal: load(STORAGE_KEYS.journal, []),
  bucket: load(STORAGE_KEYS.bucket, []),
  travel: load(STORAGE_KEYS.travel, []),
  gallery: load(STORAGE_KEYS.gallery, []),
  memory: load(STORAGE_KEYS.memory, []),
  letters: load(STORAGE_KEYS.letters, []),
  gratitude: load(STORAGE_KEYS.gratitude, []),
  currentJournalId: null,
  audioPlaying: load(STORAGE_KEYS.sound, false)
};

/* =====================================================
   Utilities
   ===================================================== */

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Failed to load ${key}`, error);
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}`, error);
  }
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(dateString) {
  if (!dateString) return "Undated";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function truncate(str = "", max = 80) {
  return str.length > max ? `${str.slice(0, max).trim()}...` : str;
}

function setStatus(message) {
  if (!journalStatus) return;
  journalStatus.textContent = message;
  clearTimeout(setStatus._timer);
  setStatus._timer = setTimeout(() => {
    journalStatus.textContent = "Your page saves quietly.";
  }, 1400);
}

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* =====================================================
   Navigation
   ===================================================== */

function showMainUI() {
  siteHeader.classList.remove("hidden");
  soundButton.classList.remove("hidden");
}

function hideLanding() {
  landing.classList.remove("active");
  landing.style.display = "none";
}

function showPage(pageId) {
  hideLanding();
  showMainUI();

  pages.forEach((page) => page.classList.remove("active"));
  const nextPage = document.getElementById(pageId);
  if (nextPage) {
    nextPage.classList.add("active");
    state.currentPage = pageId;
  }

  $$("#mainNav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });

  mainNav.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pageId === "travel") {
    setTimeout(drawConstellationLines, 50);
  }
}

function enterGarden() {
  const password = prompt("Enter the EverMore password");

  if (password === "G~11:11") {
    localStorage.setItem(STORAGE_KEYS.entered, "true");
    showPage("home");
  } else if (password !== null) {
    alert("Saalaaa Yaaraa NEEE ????");
  }
}

function setupNavigation() {
  enterButton?.addEventListener("click", enterGarden);

  brandButton?.addEventListener("click", () => {
    showPage("home");
  });

  $$("#mainNav button, .garden-card").forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;
      if (page) showPage(page);
    });
  });

  menuButton?.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

/* =====================================================
   Audio
   ===================================================== */

function updateSoundButton() {
  soundButton.classList.toggle("playing", state.audioPlaying);
  soundButton.setAttribute(
    "aria-label",
    state.audioPlaying ? "Turn ambient sound off" : "Turn ambient sound on"
  );
}

async function toggleSound() {
  if (!ambientAudio) return;

  try {
    if (state.audioPlaying) {
      ambientAudio.pause();
      state.audioPlaying = false;
    } else {
      await ambientAudio.play();
      state.audioPlaying = true;
    }
    save(STORAGE_KEYS.sound, state.audioPlaying);
    updateSoundButton();
  } catch (error) {
    console.error("Audio playback failed:", error);
  }
}

/* =====================================================
   Journal
   ===================================================== */

function createBlankJournalEntry() {
  return {
    id: uid(),
    title: "",
    date: todayString(),
    mood: "dreamy",
    content: "",
    favorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function getCurrentJournalEntry() {
  return state.journal.find((entry) => entry.id === state.currentJournalId) || null;
}

function ensureJournalEntry() {
  if (!state.journal.length) {
    const entry = createBlankJournalEntry();
    state.journal.unshift(entry);
    state.currentJournalId = entry.id;
    save(STORAGE_KEYS.journal, state.journal);
    return;
  }

  if (!state.currentJournalId || !getCurrentJournalEntry()) {
    state.currentJournalId = state.journal[0].id;
  }
}

function renderJournalList() {
  ensureJournalEntry();

  const query = journalSearch.value.trim().toLowerCase();
  const sorted = [...state.journal].sort((a, b) => {
    if (b.favorite !== a.favorite) return Number(b.favorite) - Number(a.favorite);
    return b.updatedAt - a.updatedAt;
  });

  const filtered = sorted.filter((entry) => {
    const haystack = `${entry.title} ${entry.content} ${entry.mood}`.toLowerCase();
    return haystack.includes(query);
  });

  journalList.innerHTML = "";

  filtered.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "journal-list-item";
    if (entry.id === state.currentJournalId) button.classList.add("active");

    button.innerHTML = `
      <strong>${escapeHtml(entry.title || "Untitled page")}</strong>
      <small>${escapeHtml(formatDate(entry.date))} - ${escapeHtml(entry.mood)}</small>
    `;

    button.addEventListener("click", () => {
      state.currentJournalId = entry.id;
      renderJournalEditor();
      renderJournalList();
    });

    journalList.appendChild(button);
  });

  if (!filtered.length) {
    journalList.innerHTML = `<div class="empty-message">No pages match that feeling.</div>`;
  }
}

function renderJournalEditor() {
  ensureJournalEntry();
  const entry = getCurrentJournalEntry();
  if (!entry) return;

  journalDate.value = entry.date || "";
  journalTitle.value = entry.title || "";
  journalMood.value = entry.mood || "dreamy";
  journalContent.value = entry.content || "";
  journalFavorite.classList.toggle("selected", !!entry.favorite);
  journalFavorite.textContent = entry.favorite ? "★" : "☆";
}

function saveCurrentJournalEntry() {
  const entry = getCurrentJournalEntry();
  if (!entry) return;

  entry.date = journalDate.value || todayString();
  entry.title = journalTitle.value.trim();
  entry.mood = journalMood.value;
  entry.content = journalContent.value;
  entry.updatedAt = Date.now();

  save(STORAGE_KEYS.journal, state.journal);
  renderJournalList();
  setStatus("Saved.");
}

function setupJournal() {
  ensureJournalEntry();
  renderJournalList();
  renderJournalEditor();

  newJournalButton?.addEventListener("click", () => {
    const entry = createBlankJournalEntry();
    state.journal.unshift(entry);
    state.currentJournalId = entry.id;
    save(STORAGE_KEYS.journal, state.journal);
    renderJournalList();
    renderJournalEditor();
    setStatus("A fresh page opened.");
  });

  [journalDate, journalTitle, journalMood, journalContent].forEach((field) => {
    field?.addEventListener("input", saveCurrentJournalEntry);
    field?.addEventListener("change", saveCurrentJournalEntry);
  });

  journalFavorite?.addEventListener("click", () => {
    const entry = getCurrentJournalEntry();
    if (!entry) return;
    entry.favorite = !entry.favorite;
    entry.updatedAt = Date.now();
    save(STORAGE_KEYS.journal, state.journal);
    renderJournalEditor();
    renderJournalList();
    setStatus(entry.favorite ? "Marked as favorite." : "Removed from favorites.");
  });

  deleteJournalButton?.addEventListener("click", () => {
    const entry = getCurrentJournalEntry();
    if (!entry) return;

    state.journal = state.journal.filter((item) => item.id !== entry.id);

    if (!state.journal.length) {
      const blank = createBlankJournalEntry();
      state.journal.push(blank);
      state.currentJournalId = blank.id;
    } else {
      state.currentJournalId = state.journal[0].id;
    }

    save(STORAGE_KEYS.journal, state.journal);
    renderJournalList();
    renderJournalEditor();
    setStatus("Page deleted.");
  });

  journalSearch?.addEventListener("input", renderJournalList);
}

/* =====================================================
   Bucket List Garden
   ===================================================== */

function renderBucketGarden() {
  bucketGarden.innerHTML = "";

  if (!state.bucket.length) {
    bucketGarden.innerHTML = `<div class="empty-message">No dreams planted yet.</div>`;
    return;
  }

  state.bucket.forEach((item) => {
    const plant = document.createElement("button");
    plant.type = "button";
    plant.className = `dream-plant ${item.completed ? "completed" : ""}`;
    plant.innerHTML = `
      <button class="delete-mini" type="button" aria-label="Delete dream">×</button>
      <span class="plant-bloom"></span>
      <span class="plant-stem"></span>
      <span class="plant-label">${escapeHtml(item.text)}</span>
    `;
plant.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    item.completed = !item.completed;
    save(STORAGE_KEYS.bucket, state.bucket);
    renderBucketGarden();
  }
});


    $(".delete-mini", plant).addEventListener("click", (event) => {
      event.stopPropagation();
      state.bucket = state.bucket.filter((entry) => entry.id !== item.id);
      save(STORAGE_KEYS.bucket, state.bucket);
      renderBucketGarden();
    });

    bucketGarden.appendChild(plant);
  });
}

function setupBucket() {
  renderBucketGarden();

  bucketForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = bucketInput.value.trim();
    if (!text) return;

    state.bucket.unshift({
      id: uid(),
      text,
      completed: false,
      createdAt: Date.now()
    });

    save(STORAGE_KEYS.bucket, state.bucket);
    bucketInput.value = "";
    renderBucketGarden();
  });
}

/* =====================================================
   Travel
   ===================================================== */

function randomPercent(min, max) {
  return Math.random() * (max - min) + min;
}

function placeStar(starButton, item) {
  const left = item.x ?? randomPercent(8, 88);
  const top = item.y ?? randomPercent(10, 78);
  item.x = left;
  item.y = top;

  starButton.style.left = `${left}%`;
  starButton.style.top = `${top}%`;
}

function drawConstellationLines() {
  if (!constellationLines) return;

  constellationLines.innerHTML = "";

  if (state.travel.length < 2) return;

  for (let i = 0; i < state.travel.length - 1; i += 1) {
    const current = state.travel[i];
    const next = state.travel[i + 1];

    const line = document.createElementNS("[w3.org](http://www.w3.org/2000/svg)", "line");
    line.setAttribute("x1", `${current.x * 10}`);
    line.setAttribute("y1", `${current.y * 5.6}`);
    line.setAttribute("x2", `${next.x * 10}`);
    line.setAttribute("y2", `${next.y * 5.6}`);
    constellationLines.appendChild(line);
  }
}

function renderTravel() {
  travelStars.innerHTML = "";
  travelList.innerHTML = "";

  if (!state.travel.length) {
    travelList.innerHTML = `<div class="empty-message">No stars mapped yet.</div>`;
    drawConstellationLines();
    return;
  }

  state.travel.forEach((item) => {
    const star = document.createElement("button");
    star.type = "button";
    star.className = `travel-star ${item.status === "visited" ? "visited" : ""} ${/japan/i.test(item.place) ? "japan-star" : ""}`;
    star.dataset.place = item.place;
    placeStar(star, item);

    star.addEventListener("click", () => {
      openModal({
        kicker: item.status === "visited" ? "Visited place" : "Dream destination",
        title: item.place,
        body: item.note || "No note written for this star yet."
      });
    });

    travelStars.appendChild(star);

    const chip = document.createElement("div");
    chip.className = "compact-item";
    chip.innerHTML = `
      <span>${escapeHtml(item.status === "visited" ? "Visited" : "Dreaming of")} ${escapeHtml(item.place)}</span>
      <button type="button" aria-label="Delete place">×</button>
    `;

    $("button", chip).addEventListener("click", () => {
      state.travel = state.travel.filter((entry) => entry.id !== item.id);
      save(STORAGE_KEYS.travel, state.travel);
      renderTravel();
    });

    travelList.appendChild(chip);
  });

  save(STORAGE_KEYS.travel, state.travel);
  drawConstellationLines();
}

function setupTravel() {
  renderTravel();

  travelForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const place = travelPlace.value.trim();
    const status = travelStatus.value;
    const note = travelNote.value.trim();

    if (!place) return;

    state.travel.push({
      id: uid(),
      place,
      status,
      note,
      x: randomPercent(8, 88),
      y: randomPercent(10, 78),
      createdAt: Date.now()
    });

    save(STORAGE_KEYS.travel, state.travel);
    travelForm.reset();
    travelStatus.value = "dream";
    renderTravel();
  });

  window.addEventListener("resize", drawConstellationLines);
}

/* =====================================================
   Gallery
   ===================================================== */

function renderGallery() {
  galleryGrid.innerHTML = "";

  if (!state.gallery.length) {
    galleryGrid.innerHTML = `<div class="gallery-empty">No photographs resting here yet.</div>`;
    return;
  }

  state.gallery.forEach((item) => {
    const card = document.createElement("article");
    card.className = "photo-card";
    card.style.setProperty("--rotation", `${(Math.random() * 6 - 3).toFixed(1)}deg`);

    card.innerHTML = `
      <img src="${item.dataUrl}" alt="${escapeHtml(item.name || "Uploaded photograph")}">
      <button type="button" aria-label="Delete photograph">×</button>
    `;

    $("button", card).addEventListener("click", () => {
      state.gallery = state.gallery.filter((entry) => entry.id !== item.id);
      save(STORAGE_KEYS.gallery, state.gallery);
      renderGallery();
    });

    card.addEventListener("click", (event) => {
      if (event.target.tagName === "BUTTON") return;
      openModal({
        kicker: "Photography",
        title: item.name || "Untitled photograph",
        body: ""
      });
      modalBody.innerHTML = `<img src="${item.dataUrl}" alt="${escapeHtml(item.name || "Uploaded photograph")}" style="width:100%;border-radius:16px;display:block;">`;
    });

    galleryGrid.appendChild(card);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setupGallery() {
  renderGallery();

  galleryUpload?.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      try {
        const dataUrl = await fileToDataUrl(file);
        state.gallery.unshift({
          id: uid(),
          name: file.name,
          dataUrl,
          createdAt: Date.now()
        });
      } catch (error) {
        console.error("Failed to read file:", error);
      }
    }

    save(STORAGE_KEYS.gallery, state.gallery);
    galleryUpload.value = "";
    renderGallery();
  });
}

/* =====================================================
   Memory Lake
   ===================================================== */

function renderMemoryLake() {
  memoryBoats.innerHTML = "";

  if (!state.memory.length) {
    memoryBoats.innerHTML = `<div class="empty-message" style="position:absolute;left:20px;bottom:20px;">No memories floating yet.</div>`;
    return;
  }

  state.memory.forEach((item, index) => {
    const boat = document.createElement("button");
    boat.type = "button";
    boat.className = "memory-boat";
    boat.style.left = `${8 + (index * 19) % 78}%`;
    boat.style.top = `${8 + (index % 4) * 16}%`;
    boat.style.animationDelay = `${(index % 5) * 0.6}s`;
    boat.innerHTML = `<span>${escapeHtml(item.title)}</span>`;

    boat.addEventListener("click", () => {
      openModal({
        kicker: item.emotion ? `${item.emotion} memory` : "Memory",
        title: item.title,
        body: `${item.date ? `${formatDate(item.date)}\n\n` : ""}${item.text}`
      });
    });

    memoryBoats.appendChild(boat);
  });
}

function setupMemory() {
  renderMemoryLake();

  memoryForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = memoryTitle.value.trim();
    const date = memoryDate.value;
    const text = memoryText.value.trim();
    const emotion = memoryEmotion.value;

    if (!title || !text) return;

    state.memory.unshift({
      id: uid(),
      title,
      date,
      text,
      emotion,
      createdAt: Date.now()
    });

    save(STORAGE_KEYS.memory, state.memory);
    memoryForm.reset();
    memoryEmotion.value = "warm";
    renderMemoryLake();
  });
}

/* =====================================================
   Letters
   ===================================================== */

function isLetterOpenable(openDate) {
  if (!openDate) return false;
  return new Date(openDate).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0);
}

function renderLetters() {
  letterTimeline.innerHTML = "";

  if (!state.letters.length) {
    letterTimeline.innerHTML = `<div class="empty-message">No sealed letters waiting yet.</div>`;
    return;
  }

  const sorted = [...state.letters].sort((a, b) => a.openDate.localeCompare(b.openDate));

  sorted.forEach((item) => {
    const openable = isLetterOpenable(item.openDate);
    const card = document.createElement("article");
    card.className = "sealed-letter";

    card.innerHTML = `
      <h4>${escapeHtml(item.title)}</h4>
      <p>Open on ${escapeHtml(formatDate(item.openDate))}</p>
      <div class="letter-actions">
        <button type="button" ${openable ? "" : "disabled"}>Open</button>
        <button type="button">Delete</button>
      </div>
    `;

    const [openBtn, deleteBtn] = $$("button", card);

    openBtn.addEventListener("click", () => {
      openModal({
        kicker: "Letter to Future Me",
        title: item.title,
        body: item.text
      });
    });

    deleteBtn.addEventListener("click", () => {
      state.letters = state.letters.filter((entry) => entry.id !== item.id);
      save(STORAGE_KEYS.letters, state.letters);
      renderLetters();
    });

    letterTimeline.appendChild(card);
  });
}

function setupLetters() {
  renderLetters();

  letterForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = letterTitle.value.trim();
    const openDate = letterDate.value;
    const text = letterText.value.trim();

    if (!title || !openDate || !text) return;

    state.letters.unshift({
      id: uid(),
      title,
      openDate,
      text,
      createdAt: Date.now()
    });

    save(STORAGE_KEYS.letters, state.letters);
    letterForm.reset();
    renderLetters();
  });
}

/* =====================================================
   Gratitude Garden
   ===================================================== */

function renderGratitudeGarden() {
  gratitudeGarden.innerHTML = "";

  if (!state.gratitude.length) {
    gratitudeGarden.innerHTML = `<div class="empty-message">No flowers of gratitude yet.</div>`;
    return;
  }

  state.gratitude.forEach((item) => {
    const flower = document.createElement("button");
    flower.type = "button";
    flower.className = "gratitude-flower";
    flower.innerHTML = `
      <button class="delete-mini" type="button" aria-label="Delete gratitude">×</button>
      <span class="gratitude-bloom"></span>
      <span class="gratitude-stem"></span>
      <span class="gratitude-label">${escapeHtml(item.text)}</span>
    `;
flower.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openModal({
      kicker: "Gratitude",
      title: "A quiet light",
      body: item.text
    });
  }
});


    $(".delete-mini", flower).addEventListener("click", (event) => {
      event.stopPropagation();
      state.gratitude = state.gratitude.filter((entry) => entry.id !== item.id);
      save(STORAGE_KEYS.gratitude, state.gratitude);
      renderGratitudeGarden();
    });

    gratitudeGarden.appendChild(flower);
  });
}

function setupGratitude() {
  renderGratitudeGarden();

  gratitudeForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = gratitudeInput.value.trim();
    if (!text) return;

    state.gratitude.unshift({
      id: uid(),
      text,
      createdAt: Date.now()
    });

    save(STORAGE_KEYS.gratitude, state.gratitude);
    gratitudeForm.reset();
    renderGratitudeGarden();
  });
}

/* =====================================================
   Modal
   ===================================================== */

function openModal({ kicker = "", title = "", body = "" }) {
  modalKicker.textContent = kicker;
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
}

function setupModal() {
  modalCloseTriggers.forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

/* =====================================================
   Init
   ===================================================== */

function initHydrangeaHero() {
  const hero = document.querySelector(".hydrangea-hero");
  if (!hero) return;

  if (!getComputedStyle(hero).backgroundImage || getComputedStyle(hero).backgroundImage === "none") {
    hero.innerHTML = `
      <span class="petal p1"></span>
      <span class="petal p2"></span>
      <span class="petal p3"></span>
      <span class="petal p4"></span>
      <span class="petal p5"></span>
      <span class="petal p6"></span>
      <span class="flower-core"></span>
    `;
  }
}

function init() {
  initHydrangeaHero();
  setupNavigation();
  setupModal();
  setupJournal();
  setupBucket();
  setupTravel();
  setupGallery();
  setupMemory();
  setupLetters();
  setupGratitude();

  soundButton?.addEventListener("click", toggleSound);
  updateSoundButton();

  // Always start at the landing page
landing.style.display = "flex";
landing.classList.add("active");

pages.forEach(page => page.classList.remove("active"));

siteHeader.classList.add("hidden");
soundButton.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", init);
