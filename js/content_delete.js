// Clear localStorage and sessionStorage for the current origin
try {
  if (window.localStorage) window.localStorage.clear();
} catch (e) {}
try {
  if (window.sessionStorage) window.sessionStorage.clear();
} catch (e) {}

// Send confirmation back to background
browser.runtime.sendMessage({ action: "storageCleared", origin: location.origin });
