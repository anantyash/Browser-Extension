/**
 * Application Constants & Default Configuration
 */

export const DEFAULT_FAVS = [
  { title: "GitHub", url: "https://github.com" },
  { title: "Linkedin", url: "https://www.linkedin.com/" },
  { title: "YouTube", url: "https://youtube.com" },
  { title: "Hashnode", url: "https://hashnode.com/" },
  { title: "X (Twitter)", url: "https://x.com" },
];

export const DEFAULT_COUNTDOWN = () => {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
  return {
    title: `New Year ${now.getFullYear() + 1}`,
    targetDate: nextYear.toISOString(),
  };
};
