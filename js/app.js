/**
 * Chronos Tab - Main Application Entry Point
 * Initializes all dashboard modules.
 */

import { initClockAndCountdown } from "./modules/clock.js";
import { initFavicons } from "./modules/favicons.js";
import { initCalendar } from "./modules/calendar.js";
import { initTodos } from "./modules/todos.js";
import { initNotes } from "./modules/notes.js";

document.addEventListener("DOMContentLoaded", () => {
  initClockAndCountdown();
  initFavicons();
  initCalendar();
  initTodos();
  initNotes();
});
