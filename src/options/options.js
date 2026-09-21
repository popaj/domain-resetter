document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load current settings
    const settings = (await browser.storage.local.get("settings")).settings || {
      showConfirmation: true,
      dataTypes: { history: true, cookies: true, cache: true, localStorage: true }
    };

    // Set checkbox states
    document.getElementById("showConfirmation").checked = settings.showConfirmation;
    document.getElementById("history").checked = settings.dataTypes.history;
    document.getElementById("cookies").checked = settings.dataTypes.cookies;
    document.getElementById("cache").checked = settings.dataTypes.cache;
    document.getElementById("localStorage").checked = settings.dataTypes.localStorage;

    // Save button
    document.getElementById("save").addEventListener("click", async () => {
      try {
        const newSettings = {
          showConfirmation: document.getElementById("showConfirmation").checked,
          dataTypes: {
            history: document.getElementById("history").checked,
            cookies: document.getElementById("cookies").checked,
            cache: document.getElementById("cache").checked,
            localStorage: document.getElementById("localStorage").checked
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