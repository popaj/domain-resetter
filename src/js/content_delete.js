// Clear for the current origin
try {
  // Clear localStorage
  if (window.localStorage) window.localStorage.clear();
} catch (e) {
  console.warn("Failed to clear localStorage:", e);
}

try {
  // Clear sessionStorage
  if (window.sessionStorage) window.sessionStorage.clear();
} catch (e) {
  console.warn("Failed to clear sessionStorage:", e);
}

try {
  // Clear Cache Storage
  if (window.caches) {
    window.caches.keys().then(names => {
      names.forEach(name => {
        window.caches.delete(name).catch(e => console.warn("Failed to delete cache:", e));
      });
    });
  }
} catch (e) {
  console.warn("Failed to clear Cache Storage:", e);
}

try {
  // Clear IndexedDB (this requires more complex handling in background)
  if ('indexedDB' in window) {
    browser.runtime.sendMessage({
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
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) {
        const wasRegistered = !!reg.active || !!reg.installing || !!reg.waiting;
        if (wasRegistered) {
          reg.unregister().then(success => {
            console.log(success ? `✅ Unregistered SW: ${reg.scriptURL}` : `⚠️ Failed to unregister SW`);
          }).catch(e => {
            console.warn(`Failed to unregister SW ${reg.scriptURL}:`, e);
          });
        }
      }
    }).catch(e => {
      console.warn("Failed to get SW registrations:", e);
    });
  } catch (e) {
    console.warn("Failed to unregister service workers:", e);
  }
}

// Send confirmation back to background
browser.runtime.sendMessage({ action: "storageCleared", origin: location.origin });
