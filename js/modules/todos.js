/**
 * Todo Manager Widget Module
 * Handles adding, completing, filtering, editing, and drag-and-drop reordering of todo items with persistence.
 */

import { Storage } from "./storage.js";
import { showToast } from "./toast.js";

export function initTodos() {
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");
  const todoBadge = document.getElementById("todo-badge");
  const emptyState = document.getElementById("todo-empty");
  const filterPills = document.querySelectorAll(".filter-pill");

  let todos = [];
  let currentFilter = "all"; // 'all' | 'active' | 'completed'
  let editingId = null;
  let draggedId = null;

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
      li.dataset.id = todo.id;

      const isEditing = editingId === todo.id;

      if (isEditing) {
        li.classList.add("is-editing");
        li.draggable = false;

        // Left: Edit input
        const left = document.createElement("div");
        left.className = "todo-item-left";

        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.className = "todo-edit-input";
        editInput.value = todo.text;
        editInput.maxLength = 100;
        editInput.setAttribute("aria-label", "Edit task text");

        left.appendChild(editInput);

        // Right: Save & Cancel action buttons
        const actions = document.createElement("div");
        actions.className = "todo-actions is-editing-actions";

        const saveBtn = document.createElement("button");
        saveBtn.className = "todo-action-btn todo-save-btn";
        saveBtn.title = "Save (Enter)";
        saveBtn.setAttribute("aria-label", "Save task");
        saveBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "todo-action-btn todo-cancel-btn";
        cancelBtn.title = "Cancel (Esc)";
        cancelBtn.setAttribute("aria-label", "Cancel editing");
        cancelBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        `;

        const handleSave = () => {
          const newText = editInput.value.trim();
          if (!newText) {
            showToast("Task cannot be empty");
            editInput.focus();
            return;
          }
          todo.text = newText;
          editingId = null;
          saveTodos();
          showToast("Task updated");
        };

        const handleCancel = () => {
          editingId = null;
          renderTodos();
        };

        editInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
          }
        });

        saveBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleSave();
        });

        cancelBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleCancel();
        });

        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);

        li.appendChild(left);
        li.appendChild(actions);
        todoList.appendChild(li);

        requestAnimationFrame(() => {
          editInput.focus();
          editInput.select();
        });
        return;
      }

      // Normal mode (non-editing)
      li.draggable = true;

      // Left: Drag Handle + Checkbox + Text
      const left = document.createElement("div");
      left.className = "todo-item-left";

      const dragHandle = document.createElement("span");
      dragHandle.className = "todo-drag-handle";
      dragHandle.title = "Drag up or down to reorder";
      dragHandle.setAttribute("aria-label", "Drag up or down to reorder");
      dragHandle.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      `;

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
      textSpan.title = "Double-click to edit";

      textSpan.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        editingId = todo.id;
        renderTodos();
      });

      left.appendChild(dragHandle);
      left.appendChild(checkbox);
      left.appendChild(textSpan);

      // Right: Actions (Edit & Delete)
      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "todo-action-btn todo-edit-btn";
      editBtn.title = "Edit Task";
      editBtn.setAttribute("aria-label", "Edit Task");
      editBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
      `;

      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editingId = todo.id;
        renderTodos();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "todo-action-btn todo-delete-btn";
      deleteBtn.title = "Delete Task";
      deleteBtn.setAttribute("aria-label", "Delete Task");
      deleteBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      `;

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        todos = todos.filter((t) => t.id !== todo.id);
        if (editingId === todo.id) editingId = null;
        saveTodos();
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(left);
      li.appendChild(actions);

      // Drag and Drop Events
      li.addEventListener("dragstart", (e) => {
        draggedId = todo.id;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", todo.id);
        requestAnimationFrame(() => {
          li.classList.add("dragging");
        });
      });

      li.addEventListener("dragend", () => {
        draggedId = null;
        li.classList.remove("dragging");
        todoList.querySelectorAll(".todo-item").forEach((el) => {
          el.classList.remove("drag-over-top", "drag-over-bottom");
        });
      });

      li.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!draggedId || draggedId === todo.id) return;
        e.dataTransfer.dropEffect = "move";

        const rect = li.getBoundingClientRect();
        const isTop = e.clientY < rect.top + rect.height / 2;
        if (isTop) {
          li.classList.add("drag-over-top");
          li.classList.remove("drag-over-bottom");
        } else {
          li.classList.add("drag-over-bottom");
          li.classList.remove("drag-over-top");
        }
      });

      li.addEventListener("dragleave", (e) => {
        if (!li.contains(e.relatedTarget)) {
          li.classList.remove("drag-over-top", "drag-over-bottom");
        }
      });

      li.addEventListener("drop", (e) => {
        e.preventDefault();
        li.classList.remove("drag-over-top", "drag-over-bottom");
        if (!draggedId || draggedId === todo.id) return;

        const rect = li.getBoundingClientRect();
        const isTop = e.clientY < rect.top + rect.height / 2;

        const fromIndex = todos.findIndex((t) => t.id === draggedId);
        if (fromIndex === -1) return;

        const [movedTodo] = todos.splice(fromIndex, 1);
        let toIndex = todos.findIndex((t) => t.id === todo.id);
        if (toIndex !== -1) {
          if (!isTop) {
            toIndex += 1;
          }
          todos.splice(toIndex, 0, movedTodo);
          saveTodos();
        }
      });

      todoList.appendChild(li);
    });
  }

  // Handle dropping in the empty area below items
  todoList.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (draggedId) {
      e.dataTransfer.dropEffect = "move";
    }
  });

  todoList.addEventListener("drop", (e) => {
    if (e.target === todoList && draggedId) {
      e.preventDefault();
      const fromIndex = todos.findIndex((t) => t.id === draggedId);
      if (fromIndex !== -1) {
        const [movedTodo] = todos.splice(fromIndex, 1);
        todos.push(movedTodo);
        saveTodos();
      }
    }
  });

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
    editingId = null;
    saveTodos();
  });

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.dataset.filter;
      editingId = null;
      renderTodos();
    });
  });
}
