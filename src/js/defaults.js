const DEFAULT_SETTINGS = Object.freeze({
  showConfirmation: true,
  dataTypes: {
    history: true,
    cookies: true,
    cache: true,
    localStorage: true,
    indexedDB: true, 
    cacheStorage: true,
    sessionStorage: true,
    serviceWorkers: true
  }
});

if (typeof window !== 'undefined') {
  window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
}