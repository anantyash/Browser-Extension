/**
 * Clock & Countdown Engine Module
 * Handles DDD:HH:MM timer, live countdown, presets, and target settings modal.
 */

import { Storage } from "./storage.js";
import { showToast } from "./toast.js";
import { DEFAULT_COUNTDOWN } from "../constants.js";

export function initClockAndCountdown() {
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
