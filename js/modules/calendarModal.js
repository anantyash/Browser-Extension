/**
 * Calendar Modal Component (Reusable UI Controller)
 * Manages the "Mark Memory" popup and the "Marked Details List" modal.
 */

import { DEFAULT_MEMORY_COLOR } from "./calendarMemoryStore.js";
import { showToast } from "./toast.js";

export class CalendarModalManager {
  constructor({ store, onMemoryChange }) {
    this.store = store;
    this.onMemoryChange = onMemoryChange;
    this.currentEditingId = null;

    this._cacheDom();
    this._bindEvents();
  }

  _cacheDom() {
    // Memory Edit/Add Modal elements
    this.memoryModal = document.getElementById("cal-memory-modal");
    this.modalTitle = document.getElementById("cal-memory-modal-title");
    this.closeBtn = document.getElementById("cal-memory-modal-close");
    this.cancelBtn = document.getElementById("cal-memory-modal-cancel");
    this.saveBtn = document.getElementById("cal-memory-modal-save");
    this.deleteBtn = document.getElementById("cal-memory-delete-btn");
    this.dateInput = document.getElementById("cal-memory-date");
    this.dayBadge = document.getElementById("cal-memory-day-badge");
    this.titleInput = document.getElementById("cal-memory-title");
    this.colorInput = document.getElementById("cal-memory-color");
    this.colorHexBadge = document.getElementById("cal-memory-hex");

    // Marked List Modal elements
    this.listModal = document.getElementById("cal-marked-list-modal");
    this.listCloseBtn = document.getElementById("cal-marked-list-close");
    this.listDoneBtn = document.getElementById("cal-marked-list-done");
    this.listContainer = document.getElementById("cal-marked-list-container");
    this.listTotalBadge = document.getElementById("cal-marked-list-total");
    this.addNewBtn = document.getElementById("cal-marked-add-new-btn");
  }

  _bindEvents() {
    // Memory Modal close / cancel
    this.closeBtn?.addEventListener("click", () => this.closeMemoryModal());
    this.cancelBtn?.addEventListener("click", () => this.closeMemoryModal());

    // Save Memory
    this.saveBtn?.addEventListener("click", () => this._handleSave());

    // Delete Memory
    this.deleteBtn?.addEventListener("click", () => this._handleDelete());

    // Date change updates the day badge
    this.dateInput?.addEventListener("input", () => {
      this._updateDayBadge(this.dateInput.value);
    });

    // Color picker input updates hex badge
    this.colorInput?.addEventListener("input", () => {
      this._updateColorBadge(this.colorInput.value);
    });

    // Marked List Modal close
    this.listCloseBtn?.addEventListener("click", () => this.closeListModal());
    this.listDoneBtn?.addEventListener("click", () => this.closeListModal());

    // Add New from list modal
    this.addNewBtn?.addEventListener("click", () => {
      this.closeListModal();
      const today = new Date();
      const todayStr = this.formatDateKey(today);
      this.openAddMemory(todayStr);
    });
  }

  _updateColorBadge(hex) {
    if (!this.colorHexBadge) return;
    const formattedHex = (hex || DEFAULT_MEMORY_COLOR).toUpperCase();
    this.colorHexBadge.textContent = formattedHex;
    this.colorHexBadge.style.setProperty("--badge-accent", formattedHex);
  }

  _setColorValue(hex) {
    const val = hex || DEFAULT_MEMORY_COLOR;
    if (this.colorInput) {
      this.colorInput.value = val;
    }
    this._updateColorBadge(val);
  }

  _updateDayBadge(dateVal) {
    if (!this.dayBadge) return;
    if (!dateVal) {
      this.dayBadge.textContent = "Select date";
      return;
    }
    const [y, m, d] = dateVal.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) {
      this.dayBadge.textContent = "Invalid date";
      return;
    }
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    this.dayBadge.textContent = dayName;
  }

  formatDateKey(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  formatHumanDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  /**
   * Open modal to create a new memory for given date string (YYYY-MM-DD)
   */
  openAddMemory(dateStr) {
    this.currentEditingId = null;
    this.modalTitle.textContent = "Mark Calendar Memory";
    this.dateInput.value = dateStr || this.formatDateKey(new Date());
    this._updateDayBadge(this.dateInput.value);
    this.titleInput.value = "";
    this._setColorValue(DEFAULT_MEMORY_COLOR);
    this.deleteBtn.style.display = "none";
    this.saveBtn.textContent = "Save Memory";

    this.memoryModal.classList.add("open");
    setTimeout(() => this.titleInput.focus(), 50);
  }

  /**
   * Open modal to edit an existing memory item
   */
  openEditMemory(memory) {
    this.currentEditingId = memory.id;
    this.modalTitle.textContent = "Edit Calendar Memory";
    this.dateInput.value = memory.markedDate;
    this._updateDayBadge(memory.markedDate);
    this.titleInput.value = memory.title;
    this._setColorValue(memory.color || DEFAULT_MEMORY_COLOR);
    this.deleteBtn.style.display = "inline-flex";
    this.saveBtn.textContent = "Update Memory";

    this.memoryModal.classList.add("open");
    setTimeout(() => this.titleInput.focus(), 50);
  }

  closeMemoryModal() {
    this.memoryModal.classList.remove("open");
    this.currentEditingId = null;
  }

  async _handleSave() {
    const title = this.titleInput.value.trim();
    const markedDate = this.dateInput.value;
    const color = (
      this.colorInput ? this.colorInput.value : DEFAULT_MEMORY_COLOR
    ).toLowerCase();

    if (!title) {
      showToast("Please enter a memory or event title");
      this.titleInput.focus();
      return;
    }
    if (!markedDate) {
      showToast("Please select a valid date");
      return;
    }

    try {
      await this.store.save({
        id: this.currentEditingId || undefined,
        title,
        markedDate,
        color,
      });

      this.closeMemoryModal();
      showToast(
        this.currentEditingId
          ? "Calendar memory updated!"
          : "Date marked successfully!",
      );
      if (this.onMemoryChange) this.onMemoryChange();
    } catch (err) {
      showToast(err.message || "Failed to save memory");
    }
  }

  async _handleDelete() {
    if (!this.currentEditingId) return;
    if (confirm("Delete this marked memory?")) {
      try {
        await this.store.delete(this.currentEditingId);
        this.closeMemoryModal();
        showToast("Memory removed");
        if (this.onMemoryChange) this.onMemoryChange();
      } catch (err) {
        showToast("Failed to delete memory");
      }
    }
  }

  /**
   * Open the "Marked Details" list modal
   */
  async openMarkedList() {
    const memories = await this.store.getAll();
    this.renderMarkedList(memories);
    this.listModal.classList.add("open");
  }

  closeListModal() {
    this.listModal.classList.remove("open");
  }

  renderMarkedList(memories) {
    if (!this.listContainer) return;
    this.listTotalBadge.textContent = `${memories.length} saved`;
    this.listContainer.innerHTML = "";

    if (memories.length === 0) {
      this.listContainer.innerHTML = `
        <div class="empty-marked-state">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <p>No marked calendar memories yet.</p>
          <span>Double-click any date on the calendar to mark a memory!</span>
        </div>
      `;
      return;
    }

    const listUl = document.createElement("ul");
    listUl.className = "marked-items-list";

    memories.forEach((item) => {
      const li = document.createElement("li");
      li.className = "marked-item-card";
      li.style.setProperty("--item-accent", item.color || "#63f178");

      const humanDate = this.formatHumanDate(item.markedDate);

      li.innerHTML = `
        <div class="marked-item-left">
          <span class="marked-color-pill" style="background-color: ${item.color}; box-shadow: 0 0 8px ${item.color}40;"></span>
          <div class="marked-item-info">
            <div class="marked-item-title">${item.title}</div>
            <div class="marked-item-date">${humanDate}</div>
          </div>
        </div>
        <div class="marked-item-actions">
          <button class="marked-edit-btn" title="Edit Memory" aria-label="Edit Memory">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
          <button class="marked-del-btn" title="Delete Memory" aria-label="Delete Memory">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;

      // Edit click
      const editBtn = li.querySelector(".marked-edit-btn");
      editBtn.addEventListener("click", () => {
        this.closeListModal();
        this.openEditMemory(item);
      });

      // Delete click
      const delBtn = li.querySelector(".marked-del-btn");
      delBtn.addEventListener("click", async () => {
        if (confirm(`Delete memory "${item.title}"?`)) {
          await this.store.delete(item.id);
          const updated = await this.store.getAll();
          this.renderMarkedList(updated);
          showToast("Memory deleted");
          if (this.onMemoryChange) this.onMemoryChange();
        }
      });

      listUl.appendChild(li);
    });

    this.listContainer.appendChild(listUl);
  }
}
