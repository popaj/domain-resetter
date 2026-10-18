async function clearPageStorage() {
  try {
    // Clear sessionStorage
    if (window.sessionStorage) window.sessionStorage.clear();
  } catch (e) {
    console.warn("Failed to clear sessionStorage:", e);
  }

  try {
    // Clear Cache Storage
    if (window.caches) {
      const names = await window.caches.keys();
      await Promise.all(names.map(name =>
        window.caches.delete(name).catch(e => console.warn("Failed to delete cache:", e))
      ));
    }
  } catch (e) {
    console.warn("Failed to clear Cache Storage:", e);
  }

  try {
    // Clear IndexedDB (this requires more complex handling in background)
    if ('indexedDB' in window) {
      await browser.runtime.sendMessage({
        action: "clearIndexedDB",
        origin: location.origin
      });
    }
  } catch (e) {
    console.warn("Failed to clear IndexedDB:", e);
  }

  // Unregister Service Workers (per-origin, tab-scoped)
  if ('serviceWorker' in navigator && 'getRegistrations' in navigator.serviceWorker) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(async (reg) => {
        const wasRegistered = !!reg.active || !!reg.installing || !!reg.waiting;
        if (!wasRegistered) return;
        try {
          const success = await reg.unregister();
          console.log(success ? `✅ Unregistered SW: ${reg.scriptURL}` : `⚠️ Failed to unregister SW`);
        } catch (e) {
          console.warn(`Failed to unregister SW ${reg.scriptURL}:`, e);
        }
      }));
    } catch (e) {
      console.warn("Failed to get SW registrations:", e);
    }
  }

  // Send confirmation back to background (existing "storageCleared" contract)
  try {
    await browser.runtime.sendMessage({ action: "storageCleared", origin: location.origin });
  } catch (e) {
    console.warn("Failed to send storageCleared:", e);
  }
}

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "clearStorage") {
    clearPageStorage();
  }
  // No return value: the result is reported via "storageCleared"
});