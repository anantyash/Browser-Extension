/**
 * 5-Favicon Shortcuts Bar Module
 * Handles displaying top 5 shortcuts with auto-fetched favicons and edit modal.
 */

import { Storage } from "./storage.js";
import { showToast } from "./toast.js";
import { DEFAULT_FAVS } from "../constants.js";

export function initFavicons() {
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
