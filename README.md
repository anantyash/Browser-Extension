# ⏳ Clockwork 0 - Every Second Counts

> Time. Countdowns. Tasks. Memories. Notes.
> One new tab. Zero distractions.

**Clockwork 0** transforms your browser's new tab into a focused personal dashboard. Track the passage of time, count down to what matters, launch your favorite sites, capture memories, manage tasks, and keep quick notes — all within a **zero-scroll viewport**.

## ✨ Features

### 1. ⏱️ Time & Countdown

- **Clockwork Format**: Displays the elapsed day of the year with hours, minutes, and seconds in a compact `DDD:HH:MM:SS` format (e.g., _Feb 2nd 20:50_ displays as `032:20:50`).
- **Day-of-Year Progress**: Live metrics showing current day count, total days in year (handles leap years), and percentage of year completed (`Day 260 of 365 (71.2%)`).
- **Countdown Mode**:
  - Countdown to custom target events (`Days : Hours : Mins : Secs`).
  - Modal configuration with quick presets: **End of Year**, **End of Month**, and **Weekend Kickoff**.
  - One-click mode toggle in the top bar.

### 2. 🚀 Quick Launch

- Displays 5 most visited/bookmarked shortcuts with crisp, auto-fetched high-resolution favicons.
- Hover tooltips showing site titles.
- **Fully Editable**: Click the edit pencil icon to modify titles and URLs or restore default presets.

### 3. 🗓️ Calendar with Memories

- Clean month grid view with weekday headers starting on Monday.
- Previous (`<`) and Next (`>`) month navigation.
- **Today** jump button and active day highlighting.
- **Double-Click to Mark Memory**: Double-click any day to open a modal popup with date picker, day-of-week preview, title input, and dynamic native color picker (`input type="color"`) with live hex code preview.
- **Calendar Memory Persistence**: All memories stored as structured JSON (`id`, `title`, `color`, `markedDate`, `created_at`, `updated_at`).
- **Marked Details Chip**: Displays a live memory count badge in the calendar header. Clicking it opens a modal listing all saved memories with instant edit and delete actions.
- **Visual Indicators**: Marked dates show colored glowing indicator dots and hover tooltips.

### 4. ✅ Todo Manager

- Add tasks instantly with the Enter key or add button.
- Checkbox completion with smooth strike-through animation.
- Real-time progress badge `(completed/total)`.
- Quick filters: **All**, **Active**, and **Done**.
- Hover-to-delete functionality.

### 5. 📝 Auto-Saving Notes Scratchpad

- Instant debounced auto-save on every keystroke with a live status indicator (`Saved` / `Saving...`).
- Real-time **Word Count** and **Character Count** tracker.
- **Copy to Clipboard** button with toast feedback and **Clear Notes** button.

### 6. 🎨 Design & Performance

- **Zero-Scroll Viewport**: Built with CSS Grid and Flexbox locked to `100vh`. Everything is visible at a glance.
- **Dark Glassmorphism UI**: Deep obsidian backdrop (`#08090d`), ambient radiant glows, frosted glass cards (`backdrop-filter: blur(20px)`), and crisp typography (`Plus Jakarta Sans` & `JetBrains Mono`).
- **Ultra Lightweight & Fast**: Pure Vanilla JS, HTML5, and CSS3 — zero external framework dependencies or bundle overhead.
- **Smart Storage**: Uses `chrome.storage.local` with automatic fallback to `localStorage` for browser previews.

---

## 📁 Project Structure

```
Personal Extsn/
├── manifest.json            # Chrome Extension configuration
├── newtab.html              # Semantic HTML layout and modals
├── style.css
├── js/
│   ├── app.js               # Main application entry point & module orchestrator
│   ├── constants.js         # Default bookmarks & countdown configuration
│   └── modules/
│       ├── clock.js         # Clock & countdown engine
│       ├── favicons.js      #  Quick launch shortcuts & favicon handling
│       ├── calendar.js      # Interactive calendar grid
│       ├── calendarMemoryStore.js # Persistent calendar memory store
│       ├── calendarModal.js #  Memory creation & management modal
│       ├── todos.js         # Todo management & filters
│       ├── notes.js         # Auto-saving scratchpad
│       ├── storage.js       # Local storage abstraction
│       └── toast.js         # Toast notification utility
└── README.md
```

---

## 🛠️ Installation & Setup

### In Browsers (Chrome, Brave, Edge, Opera, etc.)

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/anantyash/Browser-Extension
   ```
2. Open Chrome and navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the project folder where you clone this.
6. Open a **New Tab** (`Ctrl + T` or `Cmd + T`) and let Clockwork 0 take over.

### Standalone Browser Preview

You can also preview or test the dashboard directly by opening `newtab.html` in any modern web browser — all data will seamlessly persist via `localStorage`.

---

## ⌨️ Technologies Used

- **HTML5** — Semantic, accessible dashboard structure and modal dialogs.
- **CSS3** — Custom properties, CSS Grid, Flexbox, glassmorphism, ambient lighting, and responsive viewport fitting.
- **JavaScript (ES6+)** — Asynchronous storage wrapper, date math engines, and DOM manipulation.
- **Chrome Extension API** — Manifest V3 `chrome.storage` & `chrome_url_overrides`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal and commercial use.
