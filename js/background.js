// Initialize default settings if not set
browser.storage.local.get("settings").then((data) => {
  if (!data.settings) {
    browser.storage.local.set({
      settings: {
        showConfirmation: true,
        dataTypes: {
          history: true,
          cookies: true,
          cache: true,
          localStorage: true
        }
      }
    });
    console.log("Initialized default settings");
  }
});

// Update page action visibility and title
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      const url = new URL(tab.url);
      if (url.protocol === "http:" || url.protocol === "https:") {
        browser.pageAction.setTitle({
          tabId: tabId,
          title: `Clear history for ${url.hostname}`
        });
        browser.pageAction.show(tabId);
        console.log(`Page action shown for ${url.hostname}`);
      } else {
        browser.pageAction.hide(tabId);
        console.log("Page action hidden for non-http(s) URL");
      }
    } catch (e) {
      browser.pageAction.hide(tabId);
      console.error("Error updating page action:", e);
    }
  }
});

// Handle page action click
browser.pageAction.onClicked.addListener((tab) => {
  try {
    const url = new URL(tab.url);
    const hostname = url.hostname;
    browser.storage.local.get("settings").then((data) => {
      const settings = data.settings || { showConfirmation: true };
      if (settings.showConfirmation) {
        // Get screen dimensions
        browser.windows.getCurrent().then((windowInfo) => {
          const screenHeight = window.screen.height;
          const popupWidth = 400;
          const popupHeight = 200;
          const left = Math.round(windowInfo.left + (windowInfo.width - popupWidth) / 2);
          const top = Math.round(windowInfo.top + (windowInfo.height - popupHeight) / 2);

          // Open confirmation popup
          browser.windows.create({
            url: `popup/popup.html?hostname=${encodeURIComponent(hostname)}`,
            type: "popup",
            width: popupWidth,
            height: popupHeight,
            left: left,
            top: top,
            focused: true
          }).then(() => {
            console.log(`Opened popup for ${hostname} at position left=${left}, top=${top}`);
          }).catch((e) => {
            console.error("Error opening popup:", e);
          });
        });
      } else {
        // Delete history immediately
        deleteHistoryForDomain(hostname);
      }
    });
  } catch (e) {
    console.error("Error processing page action click:", e);
  }
});

// Handle messages from popup
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "deleteHistory" && message.hostname) {
    // only for safe protocols http(s), avoid for chrome://, file://, about:, etc.
    let shouldClearStorage = false;
    
    try {
      const url = new URL(sender.tab?.url || "");
      shouldClearStorage = (
        message.clearInCurrentTab &&
        (url.protocol === "http:" || url.protocol === "https:")
      );
    } catch (e) {
      shouldClearStorage = false;
    }

    if (shouldClearStorage && sender.tab?.id) {
      browser.tabs.sendMessage(sender.tab.id, { action: "clearStorage" }).catch(() => {});
    }

    deleteHistoryForDomain(message.hostname);
  } else if (message.action === "storageCleared") {
    console.log(`Content script cleared storage for ${message.origin}`);
  }
});

// Function to delete history for a domain
async function deleteHistoryForDomain(hostname) {
  try {
    const settings = (await browser.storage.local.get("settings")).settings;
    const types = settings.dataTypes || {
      history: true,
      cookies: true,
      cache: true,
      localStorage: true
    };

    // ✅ 1. Clear cookies/cache/localStorage (once, correctly)
    const dataToRemove = {};
    if (types.cookies)   dataToRemove.cookies = true;
    if (types.cache)     dataToRemove.cache = true;
    if (types.localStorage) dataToRemove.localStorage = true;

    if (Object.keys(dataToRemove).length > 0) {
      try {
        await browser.browsingData.remove({
          hostnames: [hostname],
          since: 0
        }, dataToRemove);
        console.log(`✅ Cleared cookies/cache/LS for ${hostname}`);
      } catch (e) {
        console.warn("Hostname clearance failed, falling back to full clear:", e.message);
        if (types.cache)     await browser.browsingData.removeCache({ since: 0 });
        if (types.cookies)   await browser.browsingData.removeCookies({ since: 0 });
      }
    }

    // ✅ 2. Clear history (only if requested)
    if (types.history) {
      try {
        const now = Date.now();
        const pastMonth = now - 30 * 24 * 60 * 60 * 1000;

        const historyItems = await browser.history.search({
          text: hostname,
          startTime: pastMonth,
          maxResults: 500
        });

        console.log(`Found ${historyItems.length} history items matching "${hostname}"`);

        let deletedCount = 0;
        for (const item of historyItems) {
          try {
            const urlObj = new URL(item.url);
            if (urlObj.hostname.toLowerCase() === hostname.toLowerCase()) {
              await browser.history.deleteUrl({ url: item.url });
              console.log(`✅ Deleted history for ${item.url}`);
              deletedCount++;
            } else {
              console.warn(`Skipped: "${item.title}" (${item.url}) — hostname mismatch`);
            }
          } catch (e) {
            console.warn(`Skipping malformed URL: ${item.url}`, e);
          }
        }

        // ✅ FIXED: Log/notify AFTER loop, not during
        console.log(`✅ Deleted ${deletedCount} history entries for ${hostname}`);
        
        if (deletedCount === 0 && historyItems.length > 0) {
          console.warn(`⚠️ Found ${historyItems.length} items, but none matched hostname "${hostname}"`);
          browser.notifications.create({
            type: "basic",
            iconUrl: "icons/icon-128.png",
            title: "No Matching History",
            message: `Found ${historyItems.length} items, but none matched "${hostname}". Try visiting first!`
          });
        } else if (deletedCount === 0) {
          console.warn("No history items found at all.");
        }

      } catch (e) {
        console.error("History search failed:", e);
        throw new Error(`Failed to clear history: ${e.message}`);
      }
    }

    // ✅ 3. Final notification (success or partial success)
    if (!types.cookies && !types.cache && !types.localStorage && !types.history) {
      console.warn("No data types selected — nothing to clear.");
    } else {
      browser.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-128.png",
        title: "Clearing Complete",
        message: `Cleared for ${hostname}: history (${types.history ? '✅' : '❌'}), cookies/cache/LS (${types.cookies || types.cache || types.localStorage ? '✅' : '❌'})`
      });
    }

  } catch (e) {
    console.error("Error deleting history/data:", e);
    browser.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-128.png",
      title: "Error",
      message: `Failed to clear history for ${hostname}: ${e.message}`
    });
  }
}