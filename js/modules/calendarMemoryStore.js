/**
 * Calendar Memory Store Module (Reusable Component)
 * Handles CRUD operations, schema validation, and persistence for Calendar Memories.
 *
 * Schema:
 * - id: string
 * - title: string
 * - color: string (hex)
 * - markedDate: string (YYYY-MM-DD)
 * - created_at: string (ISO timestamp)
 * - updated_at: string (ISO timestamp)
 */

import { Storage } from "./storage.js";

export const DEFAULT_MEMORY_COLOR = "#00ffea";

class CalendarMemoryStore {
  constructor() {
    this.storageKey = "calendarMemories";
    this.listeners = new Set();
  }

  /**
   * Subscribe to store updates
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all subscribers with updated memories list
   * @param {Array} memories
   */
  _notify(memories) {
    this.listeners.forEach((cb) => {
      try {
        cb(memories);
      } catch (err) {
        console.error("Error in calendar store subscriber:", err);
      }
    });
  }

  /**
   * Fetch all calendar memories
   * @returns {Promise<Array>}
   */
  async getAll() {
    const data = await Storage.get(this.storageKey);
    const memories = Array.isArray(data[this.storageKey])
      ? data[this.storageKey]
      : [];
    // Sort by markedDate ascending, then created_at ascending
    return memories.sort((a, b) => {
      if (a.markedDate !== b.markedDate) {
        return a.markedDate.localeCompare(b.markedDate);
      }
      return (a.created_at || "").localeCompare(b.created_at || "");
    });
  }

  /**
   * Get all memories for a specific date (YYYY-MM-DD)
   * @param {string} dateStr
   * @returns {Promise<Array>}
   */
  async getByDate(dateStr) {
    const all = await this.getAll();
    return all.filter((m) => m.markedDate === dateStr);
  }

  /**
   * Get memory by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    const all = await this.getAll();
    return all.find((m) => m.id === id) || null;
  }

  /**
   * Save a memory (create or update)
   * @param {Object} memoryData
   * @returns {Promise<Object>} saved memory
   */
  async save(memoryData) {
    const all = await this.getAll();
    const now = new Date().toISOString();

    const title = (memoryData.title || "").trim();
    if (!title) {
      throw new Error("Memory title is required");
    }

    const markedDate = memoryData.markedDate;
    if (!markedDate || !/^\d{4}-\d{2}-\d{2}$/.test(markedDate)) {
      throw new Error("A valid date (YYYY-MM-DD) is required");
    }

    const color = memoryData.color || DEFAULT_MEMORY_COLOR;

    let savedItem;
    if (memoryData.id) {
      // Update existing
      const index = all.findIndex((m) => m.id === memoryData.id);
      if (index !== -1) {
        savedItem = {
          ...all[index],
          title,
          color,
          markedDate,
          updated_at: now,
        };
        all[index] = savedItem;
      } else {
        // ID provided but not found; create new with given ID
        savedItem = {
          id: memoryData.id,
          title,
          color,
          markedDate,
          created_at: memoryData.created_at || now,
          updated_at: now,
        };
        all.push(savedItem);
      }
    } else {
      // Create new
      const id =
        "mem_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).substring(2, 7);
      savedItem = {
        id,
        title,
        color,
        markedDate,
        created_at: now,
        updated_at: now,
      };
      all.push(savedItem);
    }

    await Storage.set({ [this.storageKey]: all });
    this._notify(all);
    return savedItem;
  }

  /**
   * Delete a memory by ID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const all = await this.getAll();
    const filtered = all.filter((m) => m.id !== id);
    if (filtered.length !== all.length) {
      await Storage.set({ [this.storageKey]: filtered });
      this._notify(filtered);
      return true;
    }
    return false;
  }
}

export const calendarMemoryStore = new CalendarMemoryStore();
