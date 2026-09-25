/**
 * Notes Scratchpad Widget Module
 * Handles auto-saving scratchpad with live word/char counters, clipboard copy, and clear action.
 */

import { Storage } from "./storage.js";
import { showToast } from "./toast.js";

export function initNotes() {
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
