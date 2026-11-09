/**
 * Stopwatch Engine Module
 * Handles start, pause, resume, reset, laps, and persistent state across reloads.
 */

import { Storage } from "./storage.js";
import { showToast } from "./toast.js";

export function initStopwatch() {
  const elHH = document.getElementById("sw-hh");
  const elMM = document.getElementById("sw-mm");
  const elSS = document.getElementById("sw-ss");
  const elMS = document.getElementById("sw-ms");

  const btnToggle = document.getElementById("sw-btn-toggle");
  const btnToggleText = document.getElementById("sw-btn-toggle-text");
  const iconPlay = btnToggle?.querySelector(".sw-icon-play");
  const iconPause = btnToggle?.querySelector(".sw-icon-pause");

  const btnLap = document.getElementById("sw-btn-lap");
  const btnReset = document.getElementById("sw-btn-reset");

  const lapsBadge = document.getElementById("sw-laps-badge");
  const lapsCount = document.getElementById("sw-laps-count");

  const lapsModal = document.getElementById("sw-laps-modal");
  const lapsModalClose = document.getElementById("sw-laps-modal-close");
  const lapsModalClear = document.getElementById("sw-laps-clear-btn");
  const lapsModalDone = document.getElementById("sw-laps-modal-done");
  const lapsListContainer = document.getElementById("sw-laps-list-container");
  const lapsModalTotal = document.getElementById("sw-laps-modal-total");

  let isRunning = false;
  let startTime = 0;
  let accumulatedTime = 0;
  let animFrameId = null;
  let laps = []; // array of { lapNumber, lapDuration, totalTime }

  // Load persistent state
  Storage.get(["stopwatchData"]).then((data) => {
    if (data.stopwatchData) {
      const sw = data.stopwatchData;
      accumulatedTime = sw.accumulatedTime || 0;
      laps = Array.isArray(sw.laps) ? sw.laps : [];

      if (sw.isRunning && sw.startTime) {
        // Was running when tab was last closed or refreshed
        const elapsedSinceSave = Date.now() - sw.startTime;
        accumulatedTime += Math.max(0, elapsedSinceSave);
        start(false);
      } else {
        updateDisplay(accumulatedTime);
        updateButtons();
      }
      updateLapsUI();
    }
  });

  function saveState() {
    Storage.set({
      stopwatchData: {
        isRunning,
        startTime: isRunning ? startTime : 0,
        accumulatedTime,
        laps,
      },
    });
  }

  function getElapsedTime() {
    if (isRunning) {
      return accumulatedTime + (Date.now() - startTime);
    }
    return accumulatedTime;
  }

  function formatTimeComponents(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return {
      hh: String(hours).padStart(2, "0"),
      mm: String(minutes).padStart(2, "0"),
      ss: String(seconds).padStart(2, "0"),
      ms: String(centis).padStart(2, "0"),
    };
  }

  function formatTimeString(ms) {
    const { hh, mm, ss, ms: centis } = formatTimeComponents(ms);
    return hh !== "00" ? `${hh}:${mm}:${ss}.${centis}` : `${mm}:${ss}.${centis}`;
  }

  function updateDisplay(ms) {
    const comps = formatTimeComponents(ms);
    if (elHH) elHH.textContent = comps.hh;
    if (elMM) elMM.textContent = comps.mm;
    if (elSS) elSS.textContent = comps.ss;
    if (elMS) elMS.textContent = comps.ms;
  }

  function updateButtons() {
    if (!btnToggle) return;
    if (isRunning) {
      btnToggle.classList.add("is-running");
      if (btnToggleText) btnToggleText.textContent = "Pause";
      if (iconPlay) iconPlay.style.display = "none";
      if (iconPause) iconPause.style.display = "block";
    } else {
      btnToggle.classList.remove("is-running");
      if (btnToggleText) {
        btnToggleText.textContent = accumulatedTime > 0 ? "Resume" : "Start";
      }
      if (iconPlay) iconPlay.style.display = "block";
      if (iconPause) iconPause.style.display = "none";
    }

    const hasTime = accumulatedTime > 0 || isRunning;
    if (btnLap) btnLap.disabled = !isRunning;
    if (btnReset) btnReset.disabled = !hasTime && laps.length === 0;
  }

  function loop() {
    if (!isRunning) return;
    const current = getElapsedTime();
    updateDisplay(current);
    animFrameId = requestAnimationFrame(loop);
  }

  function start(resetStartTime = true) {
    if (isRunning) return;
    isRunning = true;
    if (resetStartTime) {
      startTime = Date.now();
    }
    updateButtons();
    saveState();
    loop();
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    cancelAnimationFrame(animFrameId);
    accumulatedTime += Date.now() - startTime;
    startTime = 0;
    updateDisplay(accumulatedTime);
    updateButtons();
    saveState();
  }

  function reset() {
    isRunning = false;
    cancelAnimationFrame(animFrameId);
    startTime = 0;
    accumulatedTime = 0;
    laps = [];
    updateDisplay(0);
    updateButtons();
    updateLapsUI();
    saveState();
    showToast("Stopwatch reset");
  }

  function recordLap() {
    if (!isRunning) return;
    const currentTotal = getElapsedTime();
    const prevTotal = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
    const lapDuration = currentTotal - prevTotal;

    const newLap = {
      lapNumber: laps.length + 1,
      lapDuration,
      totalTime: currentTotal,
    };

    laps.push(newLap);
    updateLapsUI();
    saveState();
    showToast(`Lap ${newLap.lapNumber}: ${formatTimeString(lapDuration)}`);
  }

  function updateLapsUI() {
    if (!lapsBadge) return;
    if (laps.length === 0) {
      lapsBadge.style.display = "none";
    } else {
      lapsBadge.style.display = "inline-flex";
      if (lapsCount) {
        lapsCount.textContent = `${laps.length} Lap${laps.length === 1 ? "" : "s"}`;
      }
    }
  }

  function renderLapsList() {
    if (!lapsListContainer) return;
    if (lapsModalTotal) {
      lapsModalTotal.textContent = `${laps.length} recorded`;
    }

    if (laps.length === 0) {
      lapsListContainer.innerHTML = `
        <div class="empty-marked-state">
          <p>No laps recorded yet.</p>
          <span>Click "Lap" while the stopwatch is running to record split times.</span>
        </div>
      `;
      return;
    }

    let minDur = Infinity;
    let maxDur = -1;
    if (laps.length >= 2) {
      laps.forEach((l) => {
        if (l.lapDuration < minDur) minDur = l.lapDuration;
        if (l.lapDuration > maxDur) maxDur = l.lapDuration;
      });
    }

    let html = `
      <table class="sw-laps-table">
        <thead>
          <tr>
            <th>Lap</th>
            <th>Lap Time</th>
            <th>Overall Time</th>
          </tr>
        </thead>
        <tbody>
    `;

    const reversed = [...laps].reverse();
    reversed.forEach((lap) => {
      let tagHtml = "";
      let rowClass = "";
      if (laps.length >= 2) {
        if (lap.lapDuration === minDur) {
          tagHtml = '<span class="sw-lap-tag fastest">Fastest</span>';
          rowClass = "fastest-row";
        } else if (lap.lapDuration === maxDur) {
          tagHtml = '<span class="sw-lap-tag slowest">Slowest</span>';
          rowClass = "slowest-row";
        }
      }

      html += `
        <tr class="${rowClass}">
          <td class="sw-lap-num">#${lap.lapNumber}</td>
          <td class="sw-lap-time">${formatTimeString(lap.lapDuration)} ${tagHtml}</td>
          <td class="sw-lap-overall">${formatTimeString(lap.totalTime)}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    lapsListContainer.innerHTML = html;
  }

  // Event Listeners
  btnToggle?.addEventListener("click", () => {
    if (isRunning) pause();
    else start();
  });

  btnLap?.addEventListener("click", recordLap);
  btnReset?.addEventListener("click", reset);

  lapsBadge?.addEventListener("click", () => {
    renderLapsList();
    lapsModal?.classList.add("open");
  });

  const closeLapsModal = () => lapsModal?.classList.remove("open");
  lapsModalClose?.addEventListener("click", closeLapsModal);
  lapsModalDone?.addEventListener("click", closeLapsModal);
  lapsModal?.addEventListener("click", (e) => {
    if (e.target === lapsModal) closeLapsModal();
  });

  lapsModalClear?.addEventListener("click", () => {
    if (laps.length === 0) return;
    if (confirm("Clear all recorded laps?")) {
      laps = [];
      updateLapsUI();
      renderLapsList();
      saveState();
      showToast("Laps cleared");
    }
  });
}
