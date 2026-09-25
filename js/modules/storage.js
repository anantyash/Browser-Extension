/**
 * Storage Abstraction Module
 * Seamlessly wraps Chrome Extension Storage API with localStorage fallback
 */

export const Storage = {
  get: async (keys) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.get(keys, (res) => resolve(res || {}));
      } else {
        const res = {};
        const keyArr = Array.isArray(keys) ? keys : [keys];
        keyArr.forEach((k) => {
          const item = localStorage.getItem(k);
          if (item !== null) {
            try {
              res[k] = JSON.parse(item);
            } catch {
              res[k] = item;
            }
          }
        });
        resolve(res);
      }
    });
  },
  set: async (items) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.set(items, () => resolve());
      } else {
        Object.keys(items).forEach((k) => {
          localStorage.setItem(k, JSON.stringify(items[k]));
        });
        resolve();
      }
    });
  },
};
