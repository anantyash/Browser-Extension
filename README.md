# ⏳ New Tab — Minimalist Productivity Dashboard

> A lightweight, modern dark-themed Chrome extension that replaces your new tab page with a centered hero `DDD:HH:MM` clock & countdown, quick favicon launcher, calendar, todo manager, and auto-saving scratchpad — designed to fit seamlessly on any screen with **zero scroll**.

---

## ✨ Features

### 1. ⏱️ Hero Clock & Countdown Display (Full Width, Centered)

- **Creative `DDD:HH:MM:SS` Format**: Displays elapsed full days since Jan 1st (padded to 3 digits) along with hours, minutes, and seconds (e.g., _Feb 2nd 20:50_ displays as `032:20:50`).
- **Day-of-Year Progress**: Live metrics showing current day count, total days in year (handles leap years), and percentage of year completed (`Day 260 of 365 (71.2%)`).
- **Countdown Mode**:
  - Countdown to custom target events (`Days : Hours : Mins : Secs`).
  - Modal configuration with quick presets: **End of Year**, **End of Month**, and **Weekend Kickoff**.
  - One-click mode toggle in the top bar.

### 2. 🚀 Quick Launch Favicon Bar

- Displays 5 most visited/bookmarked shortcuts with crisp, auto-fetched high-resolution favicons.
- Hover tooltips showing site titles.
- **Fully Editable**: Click the edit pencil icon to modify titles and URLs or restore default presets.

### 3. 🗓️ Interactive Calendar Card

- Clean month grid view with weekday headers starting on Monday.
- Previous (`<`) and Next (`>`) month navigation.
- **Today** jump button and active day highlighting.

### 4. ✅ Complete Todo Manager Card

- Add tasks instantly with the Enter key or add button.
- Checkbox completion with smooth strike-through animation.
- Real-time progress badge `(completed/total)`.
- Quick filters: **All**, **Active**, and **Done**.
- Hover-to-delete functionality.

### 5. 📝 Auto-Saving Notes Scratchpad Card

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
├── manifest.json      # Chrome Extension (Manifest V3) configuration
├── newtab.html        # Semantic HTML layout and modals
├── style.css          # Dark glassmorphism styling & zero-scroll layout
├── app.js             # Core logic (clock, countdown, calendar, todos, notes, storage)
└── README.md          # Project documentation
```

---

## 🛠️ Installation & Setup

### In Google Chrome / Chromium Browsers (Brave, Edge, Opera, etc.)

1. Clone or download this repository to your local machine:
   ```bash
   git clone <repository-url>
   ```
2. Open Chrome and navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the `Personal Extsn` project folder.
6. Open a **New Tab** (`Ctrl + T` or `Cmd + T`) to enjoy your new dashboard!

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
