/**
 * Interactive Calendar Widget Module with Memory Marking
 * Handles monthly grid rendering, double-click to mark memory,
 * visual indicators, and marked memories list integration.
 */

import { calendarMemoryStore } from "./calendarMemoryStore.js";
import { CalendarModalManager } from "./calendarModal.js";

export function initCalendar() {
  const monthTitle = document.getElementById("cal-month-title");
  const daysGrid = document.getElementById("cal-days-grid");
  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");
  const todayBtn = document.getElementById("cal-today-btn");
  const markedBtn = document.getElementById("cal-marked-btn");
  const markedCountBadge = document.getElementById("cal-marked-count");

  let viewDate = new Date();
  const today = new Date();
  let memoriesCache = [];

  // Helper to get YYYY-MM-DD
  function toDateKey(year, monthIndex, day) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
  }

  // Initialize the reusable CalendarModalManager
  const modalManager = new CalendarModalManager({
    store: calendarMemoryStore,
    onMemoryChange: () => {
      loadMemoriesAndRender();
    },
  });

  // Load memories and refresh calendar
  async function loadMemoriesAndRender() {
    memoriesCache = await calendarMemoryStore.getAll();
    updateMarkedBadge();
    renderMonth();
  }

  function updateMarkedBadge() {
    if (markedCountBadge) {
      markedCountBadge.textContent = memoriesCache.length;
    }
  }

  // Subscribe to store updates
  calendarMemoryStore.subscribe((memories) => {
    memoriesCache = memories;
    updateMarkedBadge();
    renderMonth();
  });

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

    // Days in current & previous months
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // 1. Previous month trailing days
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dateKey = toDateKey(prevYear, prevMonthIdx, dayNum);
      const cell = createDayCell(dayNum, dateKey, true);
      daysGrid.appendChild(cell);
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = toDateKey(year, month, d);
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const cell = createDayCell(d, dateKey, false, isToday);
      daysGrid.appendChild(cell);
    }

    // 3. Next month leading days (to fill up 35 or 42 cells)
    const totalCells = daysGrid.children.length;
    const targetCells = totalCells > 35 ? 42 : 35;
    const remaining = targetCells - totalCells;
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let j = 1; j <= remaining; j++) {
      const dateKey = toDateKey(nextYear, nextMonthIdx, j);
      const cell = createDayCell(j, dateKey, true);
      daysGrid.appendChild(cell);
    }
  }

  function createDayCell(dayNum, dateKey, isOtherMonth, isToday = false) {
    const cell = document.createElement("div");
    cell.className = "cal-day-cell";
    cell.dataset.date = dateKey;

    if (isOtherMonth) {
      cell.classList.add("other-month");
    }
    if (isToday) {
      cell.classList.add("today");
    }

    // Find memories for this date
    const dayMemories = memoriesCache.filter((m) => m.markedDate === dateKey);

    const numSpan = document.createElement("span");
    numSpan.className = "cal-day-num";
    numSpan.textContent = dayNum;
    cell.appendChild(numSpan);

    if (dayMemories.length > 0) {
      cell.classList.add("has-memory");
      const dotsWrap = document.createElement("div");
      dotsWrap.className = "cal-memory-dots";

      // Show up to 3 indicator dots
      dayMemories.slice(0, 3).forEach((mem) => {
        const dot = document.createElement("span");
        dot.className = "cal-memory-dot";
        dot.style.backgroundColor = mem.color || "#63f178";
        dot.style.boxShadow = `0 0 5px ${mem.color || "#63f178"}`;
        dotsWrap.appendChild(dot);
      });

      cell.appendChild(dotsWrap);

      // Custom tooltip matching favicon feature
      const tooltipText =
        dayMemories.length === 1
          ? dayMemories[0].title
          : dayMemories.map((m) => m.title).join(" • ");
      cell.setAttribute("data-tooltip", tooltipText);
    } else {
      cell.setAttribute("data-tooltip", "Double tap to mark");
    }

    // Single click: select day
    cell.addEventListener("click", () => {
      document
        .querySelectorAll(".cal-day-cell.selected")
        .forEach((el) => el.classList.remove("selected"));
      cell.classList.add("selected");
    });

    // Double click: open popup to mark or edit memory
    cell.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      if (dayMemories.length === 1) {
        modalManager.openEditMemory(dayMemories[0]);
      } else if (dayMemories.length > 1) {
        modalManager.openMarkedList();
      } else {
        modalManager.openAddMemory(dateKey);
      }
    });

    return cell;
  }

  // Month navigation
  prevBtn?.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderMonth();
  });

  nextBtn?.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderMonth();
  });

  // Jump to Today
  todayBtn?.addEventListener("click", () => {
    viewDate = new Date();
    renderMonth();
  });

  // Marked Details Chip Click: opens Marked details list modal
  markedBtn?.addEventListener("click", () => {
    modalManager.openMarkedList();
  });

  // Initial load
  loadMemoriesAndRender();
}
