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

function getSettings(savedSettings) {
  return {
    ...DEFAULT_SETTINGS,
    ...(savedSettings || {}),
    dataTypes: {
      ...DEFAULT_SETTINGS.dataTypes,
      ...(savedSettings?.dataTypes || {})
    }
  };
}