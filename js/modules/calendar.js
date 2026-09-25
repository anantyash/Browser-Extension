/**
 * Interactive Calendar Widget Module
 * Handles monthly grid rendering, navigation, today jump, and active day selection.
 */

export function initCalendar() {
  const monthTitle = document.getElementById("cal-month-title");
  const daysGrid = document.getElementById("cal-days-grid");
  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");
  const todayBtn = document.getElementById("cal-today-btn");

  let viewDate = new Date();
  const today = new Date();

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

    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // 1. Previous month trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const cell = document.createElement("div");
      cell.className = "cal-day-cell other-month";
      cell.textContent = daysInPrevMonth - i;
      daysGrid.appendChild(cell);
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "cal-day-cell";
      cell.textContent = d;

      if (
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");
      }

      cell.addEventListener("click", () => {
        document
          .querySelectorAll(".cal-day-cell.selected")
          .forEach((el) => el.classList.remove("selected"));
        cell.classList.add("selected");
      });

      daysGrid.appendChild(cell);
    }

    // 3. Next month leading days to fill up remaining grid (up to 35 or 42 cells)
    const totalCells = daysGrid.children.length;
    const targetCells = totalCells > 35 ? 42 : 35;
    const remaining = targetCells - totalCells;
    for (let j = 1; j <= remaining; j++) {
      const cell = document.createElement("div");
      cell.className = "cal-day-cell other-month";
      cell.textContent = j;
      daysGrid.appendChild(cell);
    }
  }

  prevBtn.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderMonth();
  });

  nextBtn.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderMonth();
  });

  todayBtn.addEventListener("click", () => {
    viewDate = new Date();
    renderMonth();
  });

  renderMonth();
}
