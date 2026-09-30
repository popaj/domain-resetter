document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load current settings
    const saved = await browser.storage.local.get("settings");
    const settings = getSettings(saved.settings);

    const dataTypes = settings.dataTypes;
    document.getElementById("showConfirmation").checked = settings.showConfirmation;
    document.getElementById("history").checked = dataTypes.history;
    document.getElementById("cookies").checked = dataTypes.cookies;
    document.getElementById("cache").checked = dataTypes.cache;
    document.getElementById("localStorage").checked = dataTypes.localStorage;
    document.getElementById("indexedDB").checked = dataTypes.indexedDB;
    document.getElementById("cacheStorage").checked = dataTypes.cacheStorage;
    document.getElementById("sessionStorage").checked = dataTypes.sessionStorage;
    document.getElementById("serviceWorkers").checked = dataTypes.serviceWorkers;

    // Save button
    document.getElementById("save").addEventListener("click", async () => {
      try {
        const newSettings = {
          showConfirmation: document.getElementById("showConfirmation").checked,
          dataTypes: {
            history: document.getElementById("history").checked,
            cookies: document.getElementById("cookies").checked,
            cache: document.getElementById("cache").checked,
            localStorage: document.getElementById("localStorage").checked,
            indexedDB: document.getElementById("indexedDB").checked,
            cacheStorage: document.getElementById("cacheStorage").checked,
            sessionStorage: document.getElementById("sessionStorage").checked,
            serviceWorkers: document.getElementById("serviceWorkers").checked
          }
        };

        await browser.storage.local.set({ settings: newSettings });
        alert("Settings saved!");
        console.log("Settings saved:", newSettings);
      } catch (e) {
        console.error("Error saving settings:", e);
        alert("Failed to save settings: " + e.message);
      }
    });
  } catch (e) {
    console.error("Error initializing settings:", e);
  }
});