/**
 * Chronos Tab - Main Application Logic
 * Lightweight, zero-dependency modern dashboard engine.
 */

// =============================================================================
// 1. STORAGE ABSTRACTION (Chrome Storage API with LocalStorage Fallback)
// =============================================================================
const Storage = {
  get: async (keys) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.get(keys, (res) => resolve(res || {}));
      } else {
        const res = {};
        const keyArr = Array.isArray(keys) ? keys : [keys];
        keyArr.forEach((k) => {
          const item = localStorage.getItem(k);
          if (item !== null) {
            try {
              res[k] = JSON.parse(item);
            } catch {
              res[k] = item;
            }
          }
        });
        resolve(res);
      }
    });
  },
  set: async (items) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.set(items, () => resolve());
      } else {
        Object.keys(items).forEach((k) => {
          localStorage.setItem(k, JSON.stringify(items[k]));
        });
        resolve();
      }
    });
  },
};

// =============================================================================
// 2. DEFAULT STATE & CONSTANTS
// =============================================================================
const DEFAULT_FAVS = [
  { title: "GitHub", url: "https://github.com" },
  { title: "Linkedin", url: "https://www.linkedin.com/" },
  { title: "YouTube", url: "https://youtube.com" },
  { title: "Hashnode", url: "https://hashnode.com/" },
  { title: "X (Twitter)", url: "https://x.com" },
];

const DEFAULT_COUNTDOWN = () => {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
  return {
    title: `New Year ${now.getFullYear() + 1}`,
    targetDate: nextYear.toISOString(),
  };
};

// =============================================================================
// 3. INITIALIZATION
// =============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  initClockAndCountdown();
  initFavicons();
  initCalendar();
  initTodos();
  initNotes();
});

// =============================================================================
// 4. CLOCK & COUNTDOWN ENGINE
// =============================================================================
function initClockAndCountdown() {
  let currentMode = "clock"; // 'clock' | 'countdown'
  let countdownData = DEFAULT_COUNTDOWN();

  const btnClock = document.getElementById("btn-mode-clock");
  const btnCountdown = document.getElementById("btn-mode-countdown");
  const clockView = document.getElementById("clock-view");
  const countdownView = document.getElementById("countdown-view");

  // DOM Elements for Clock
  const elDDD = document.getElementById("time-ddd");
  const elHH = document.getElementById("time-hh");
  const elMM = document.getElementById("time-mm");
  const elSS = document.getElementById("time-ss");
  const elDayName = document.getElementById("clock-day-name");
  const elDayProgress = document.getElementById("clock-day-progress");
  const elGreeting = document.getElementById("greeting-text");

  // DOM Elements for Countdown
  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMins = document.getElementById("cd-mins");
  const cdSecs = document.getElementById("cd-secs");
  const cdTitle = document.getElementById("cd-title-display");
  const cdStatus = document.getElementById("cd-status-text");

  // Load saved mode & countdown target
  Storage.get(["activeMode", "countdownData"]).then((data) => {
    if (data.activeMode) {
      setMode(data.activeMode);
    }
    if (data.countdownData && data.countdownData.targetDate) {
      countdownData = data.countdownData;
    }
    updateCountdownDisplay();
  });

  function setMode(mode) {
    currentMode = mode;
    if (mode === "clock") {
      btnClock.classList.add("active");
      btnCountdown.classList.remove("active");
      clockView.classList.add("active");
      countdownView.classList.remove("active");
    } else {
      btnCountdown.classList.add("active");
      btnClock.classList.remove("active");
      countdownView.classList.add("active");
      clockView.classList.remove("active");
    }
    Storage.set({ activeMode: mode });
  }

  btnClock.addEventListener("click", () => setMode("clock"));
  btnCountdown.addEventListener("click", () => setMode("countdown"));

  // Calculate elapsed full days from Jan 1st 00:00 of current year
  // E.g. Feb 2nd 20:50 -> 32 elapsed days (032:20:50)
  function getElapsedDaysAndOrdinal(now) {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const diffMs = now.getTime() - start.getTime();
    const elapsedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const ordinalDay = elapsedDays + 1; // e.g. 33rd day of the year
    return { elapsedDays, ordinalDay };
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // Tick function running every second
  function tick() {
    const now = new Date();

    // 1. Clock DDD:HH:MM update
    const { elapsedDays, ordinalDay } = getElapsedDaysAndOrdinal(now);
    const totalDays = isLeapYear(now.getFullYear()) ? 366 : 365;
    const progressPct = ((ordinalDay / totalDays) * 100).toFixed(1);

    const dddStr = String(elapsedDays).padStart(3, "0");
    const hhStr = String(now.getHours()).padStart(2, "0");
    const mmStr = String(now.getMinutes()).padStart(2, "0");
    const ssStr = String(now.getSeconds()).padStart(2, "0");

    elDDD.textContent = dddStr;
    elHH.textContent = hhStr;
    elMM.textContent = mmStr;
    elSS.textContent = ssStr;

    // Formatted Day Name & Date
    const weekdayName = now.toLocaleDateString("en-US", { weekday: "long" });
    const fullDateStr = now.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    elDayName.textContent = `${weekdayName}, ${fullDateStr}`;
    elDayProgress.textContent = `Day ${ordinalDay} of ${totalDays} (${progressPct}%)`;

    // Dynamic greeting
    const hr = now.getHours();
    let greet = "CHRONOS";
    if (hr >= 5 && hr < 12) greet = "GOOD MORNING";
    else if (hr >= 12 && hr < 17) greet = "GOOD AFTERNOON";
    else if (hr >= 17 && hr < 22) greet = "GOOD EVENING";
    else greet = "NIGHT OWL";
    elGreeting.textContent = greet;

    // 2. Countdown update
    updateCountdownDisplay();
  }

  function updateCountdownDisplay() {
    cdTitle.textContent = countdownData.title || "Target Countdown";
    const target = new Date(countdownData.targetDate);
    const now = new Date();
    const diffMs = target - now;

    if (isNaN(target.getTime())) {
      cdDays.textContent = "000";
      cdHours.textContent = "00";
      cdMins.textContent = "00";
      cdSecs.textContent = "00";
      cdStatus.textContent = "Target Date: Invalid";
      return;
    }

    const formattedTarget = target.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (diffMs <= 0) {
      cdDays.textContent = "000";
      cdHours.textContent = "00";
      cdMins.textContent = "00";
      cdSecs.textContent = "00";
      cdStatus.textContent = `Target Reached! (${formattedTarget})`;
    } else {
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      cdDays.textContent = String(days).padStart(3, "0");
      cdHours.textContent = String(hours).padStart(2, "0");
      cdMins.textContent = String(mins).padStart(2, "0");
      cdSecs.textContent = String(secs).padStart(2, "0");
      cdStatus.textContent = `Target Date: ${formattedTarget}`;
    }
  }

  tick();
  setInterval(tick, 1000);

  // Setup Countdown Modal
  const cdModal = document.getElementById("cd-modal");
  const openCdModalBtn = document.getElementById("open-cd-settings-btn");
  const closeCdModalBtn = document.getElementById("cd-modal-close");
  const cancelCdModalBtn = document.getElementById("cd-modal-cancel");
  const saveCdModalBtn = document.getElementById("cd-modal-save");
  const cdInputTitle = document.getElementById("cd-input-title");
  const cdInputDate = document.getElementById("cd-input-date");

  openCdModalBtn.addEventListener("click", () => {
    cdInputTitle.value = countdownData.title || "";
    // Format ISO string to local input datetime-local string (YYYY-MM-DDTHH:mm)
    const d = new Date(countdownData.targetDate);
    if (!isNaN(d.getTime())) {
      const offset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - offset)
        .toISOString()
        .slice(0, 16);
      cdInputDate.value = localISOTime;
    }
    cdModal.classList.add("open");
  });

  const closeCdModal = () => cdModal.classList.remove("open");
  closeCdModalBtn.addEventListener("click", closeCdModal);
  cancelCdModalBtn.addEventListener("click", closeCdModal);

  // Presets
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.dataset.preset;
      const now = new Date();
      let target;
      if (preset === "eoy") {
        target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
        cdInputTitle.value = `New Year ${now.getFullYear() + 1}`;
      } else if (preset === "eom") {
        target = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
        cdInputTitle.value = "End of Month";
      } else if (preset === "weekend") {
        target = new Date(now);
        const day = now.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        target.setDate(now.getDate() + diff);
        target.setHours(17, 0, 0, 0);
        cdInputTitle.value = "Weekend Kickoff";
      }
      if (target) {
        const offset = target.getTimezoneOffset() * 60000;
        cdInputDate.value = new Date(target.getTime() - offset)
          .toISOString()
          .slice(0, 16);
      }
    });
  });

  saveCdModalBtn.addEventListener("click", () => {
    const title = cdInputTitle.value.trim() || "Custom Countdown";
    const dateVal = cdInputDate.value;
    if (!dateVal) {
      showToast("Please select a target date and time");
      return;
    }
    const targetDate = new Date(dateVal).toISOString();
    countdownData = { title, targetDate };
    Storage.set({ countdownData });
    updateCountdownDisplay();
    closeCdModal();
    setMode("countdown");
    showToast("Countdown target updated!");
  });
}

// =============================================================================
// 5. 5-FAVICON SHORTCUTS BAR
// =============================================================================
function initFavicons() {
  const faviconsList = document.getElementById("favicons-list");
  const editBtn = document.getElementById("edit-favs-btn");
  const modal = document.getElementById("favs-modal");
  const modalClose = document.getElementById("favs-modal-close");
  const modalSave = document.getElementById("favs-modal-save");
  const modalReset = document.getElementById("favs-modal-reset");
  const editListContainer = document.getElementById("favs-edit-list");

  let currentFavs = [...DEFAULT_FAVS];

  function extractDomain(url) {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return parsed.hostname;
    } catch {
      return "";
    }
  }

  function renderFavicons() {
    faviconsList.innerHTML = "";
    currentFavs.forEach((fav) => {
      const a = document.createElement("a");
      a.className = "favicon-item";
      a.href = fav.url.startsWith("http") ? fav.url : `https://${fav.url}`;
      a.setAttribute("data-title", fav.title || "Shortcut");

      const domain = extractDomain(fav.url);
      const img = document.createElement("img");
      img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      img.alt = fav.title;

      // Fallback letter if image fails to load
      img.onerror = () => {
        img.style.display = "none";
        const fallback = document.createElement("span");
        fallback.className = "fav-fallback-letter";
        fallback.textContent = (fav.title || domain || "•")
          .charAt(0)
          .toUpperCase();
        a.appendChild(fallback);
      };

      a.appendChild(img);
      faviconsList.appendChild(a);
    });
  }

  Storage.get("favicons").then((data) => {
    if (
      data.favicons &&
      Array.isArray(data.favicons) &&
      data.favicons.length === 5
    ) {
      currentFavs = data.favicons;
    }
    renderFavicons();
  });

  // Edit Modal Setup
  editBtn.addEventListener("click", () => {
    editListContainer.innerHTML = "";
    currentFavs.forEach((fav, idx) => {
      const row = document.createElement("div");
      row.className = "fav-edit-row";
      row.innerHTML = `
        <span class="fav-edit-num">#${idx + 1}</span>
        <input type="text" class="fav-edit-title" value="${fav.title || ""}" placeholder="Title" maxlength="20">
        <input type="text" class="fav-edit-url" value="${fav.url || ""}" placeholder="https://example.com">
      `;
      editListContainer.appendChild(row);
    });
    modal.classList.add("open");
  });

  const closeModal = () => modal.classList.remove("open");
  modalClose.addEventListener("click", closeModal);

  modalSave.addEventListener("click", () => {
    const rows = editListContainer.querySelectorAll(".fav-edit-row");
    const updated = [];
    rows.forEach((row, idx) => {
      const title =
        row.querySelector(".fav-edit-title").value.trim() || `Site ${idx + 1}`;
      let url =
        row.querySelector(".fav-edit-url").value.trim() || "https://google.com";
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      updated.push({ title, url });
    });
    currentFavs = updated;
    Storage.set({ favicons: currentFavs });
    renderFavicons();
    closeModal();
    showToast("Shortcuts updated!");
  });

  modalReset.addEventListener("click", () => {
    currentFavs = [...DEFAULT_FAVS];
    Storage.set({ favicons: currentFavs });
    renderFavicons();
    closeModal();
    showToast("Shortcuts reset to defaults");
  });
}

// =============================================================================
// 6. CARD 1: CALENDAR
// =============================================================================
function initCalendar() {
  const monthTitle = document.getElementById("cal-month-title");
  const daysGrid = document.getElementById("cal-days-grid");
  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");
  const todayBtn = document.getElementById("cal-today-btn");

  let viewDate = new Date();
  const today = new Date();

  function renderMonth() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    monthTitle.textContent = viewDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    daysGrid.innerHTML = "";

    // First day of current month (0=Sun, 1=Mon, ..., 6=Sat)
    const firstDay = new Date(year, month, 1);
    // Adjust for Monday start: 0=Mon, 6=Sun
    let startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // 1. Previous month trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const cell = document.createElement("div");
      cell.className = "cal-day-cell other-month";
      cell.textContent = daysInPrevMonth - i;
      daysGrid.appendChild(cell);
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "cal-day-cell";
      cell.textContent = d;

      if (
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");
      }

      cell.addEventListener("click", () => {
        document
          .querySelectorAll(".cal-day-cell.selected")
          .forEach((el) => el.classList.remove("selected"));
        cell.classList.add("selected");
      });

      daysGrid.appendChild(cell);
    }

    // 3. Next month leading days to fill up remaining grid (up to 35 or 42 cells)
    const totalCells = daysGrid.children.length;
    const targetCells = totalCells > 35 ? 42 : 35;
    const remaining = targetCells - totalCells;
    for (let j = 1; j <= remaining; j++) {
      const cell = document.createElement("div");
      cell.className = "cal-day-cell other-month";
      cell.textContent = j;
      daysGrid.appendChild(cell);
    }
  }

  prevBtn.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderMonth();
  });

  nextBtn.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderMonth();
  });

  todayBtn.addEventListener("click", () => {
    viewDate = new Date();
    renderMonth();
  });

  renderMonth();
}

// =============================================================================
// 7. CARD 2: TODO MANAGER
// =============================================================================
function initTodos() {
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");
  const todoBadge = document.getElementById("todo-badge");
  const emptyState = document.getElementById("todo-empty");
  const filterPills = document.querySelectorAll(".filter-pill");

  let todos = [];
  let currentFilter = "all"; // 'all' | 'active' | 'completed'

  Storage.get("todos").then((data) => {
    if (data.todos && Array.isArray(data.todos)) {
      todos = data.todos;
    } else {
      // Starter default tasks
      todos = [
        { id: "1", text: "Plan today's focus goals", done: false },
        { id: "2", text: "Review project milestones", done: true },
      ];
    }
    renderTodos();
  });

  function saveTodos() {
    Storage.set({ todos });
    renderTodos();
  }

  function updateBadge() {
    const completedCount = todos.filter((t) => t.done).length;
    todoBadge.textContent = `${completedCount}/${todos.length}`;
  }

  function renderTodos() {
    todoList.innerHTML = "";
    updateBadge();

    const filtered = todos.filter((t) => {
      if (currentFilter === "active") return !t.done;
      if (currentFilter === "completed") return t.done;
      return true;
    });

    if (filtered.length === 0) {
      emptyState.style.display = "flex";
      if (currentFilter === "completed")
        emptyState.textContent = "No completed tasks.";
      else if (currentFilter === "active")
        emptyState.textContent = "All caught up!";
      else emptyState.textContent = "No tasks yet. Create one above!";
    } else {
      emptyState.style.display = "none";
    }

    filtered.forEach((todo) => {
      const li = document.createElement("li");
      li.className = `todo-item ${todo.done ? "done" : ""}`;

      // Left: Checkbox + Text
      const left = document.createElement("div");
      left.className = "todo-item-left";

      const checkbox = document.createElement("button");
      checkbox.className = "todo-checkbox";
      checkbox.setAttribute("aria-label", "Toggle complete");
      checkbox.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;

      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        todo.done = !todo.done;
        saveTodos();
      });

      const textSpan = document.createElement("span");
      textSpan.className = "todo-text";
      textSpan.textContent = todo.text;

      left.appendChild(checkbox);
      left.appendChild(textSpan);

      // Right: Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "todo-delete-btn";
      deleteBtn.title = "Delete Task";
      deleteBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      `;

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        todos = todos.filter((t) => t.id !== todo.id);
        saveTodos();
      });

      li.appendChild(left);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    todos.unshift({
      id: Date.now().toString(),
      text,
      done: false,
    });
    todoInput.value = "";
    saveTodos();
  });

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.dataset.filter;
      renderTodos();
    });
  });
}

// =============================================================================
// 8. CARD 3: NOTES (AUTO-SAVING SCRATCHPAD)
// =============================================================================
function initNotes() {
  const textarea = document.getElementById("notes-textarea");
  const saveStatus = document.getElementById("notes-save-status");
  const stats = document.getElementById("notes-stats");
  const copyBtn = document.getElementById("notes-copy-btn");
  const clearBtn = document.getElementById("notes-clear-btn");

  let debounceTimer = null;

  function updateStats(text) {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    stats.textContent = `${words} word${words === 1 ? "" : "s"} · ${chars} char${chars === 1 ? "" : "s"}`;
  }

  Storage.get("quickNotes").then((data) => {
    if (data.quickNotes !== undefined) {
      textarea.value = data.quickNotes;
      updateStats(data.quickNotes);
    }
  });

  textarea.addEventListener("input", () => {
    saveStatus.textContent = "Saving...";
    saveStatus.classList.add("saving");
    updateStats(textarea.value);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      Storage.set({ quickNotes: textarea.value }).then(() => {
        saveStatus.textContent = "Saved";
        saveStatus.classList.remove("saving");
      });
    }, 400);
  });

  copyBtn.addEventListener("click", async () => {
    if (!textarea.value.trim()) {
      showToast("Note is empty");
      return;
    }
    try {
      await navigator.clipboard.writeText(textarea.value);
      showToast("Notes copied to clipboard!");
    } catch {
      showToast("Unable to copy");
    }
  });

  clearBtn.addEventListener("click", () => {
    if (!textarea.value.trim()) return;
    if (confirm("Clear all notes?")) {
      textarea.value = "";
      updateStats("");
      Storage.set({ quickNotes: "" });
      showToast("Notes cleared");
    }
  });
}

// =============================================================================
// 9. TOAST NOTIFICATION HELPER
// =============================================================================
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
