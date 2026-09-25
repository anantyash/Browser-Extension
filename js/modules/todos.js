/**
 * Todo Manager Widget Module
 * Handles adding, completing, filtering, and deleting todo items with persistence.
 */

import { Storage } from "./storage.js";

export function initTodos() {
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
