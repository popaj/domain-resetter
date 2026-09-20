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
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "deleteHistory" && message.hostname) {
    deleteHistoryForDomain(message.hostname);
  }
});

// Function to delete history for a domain
async function deleteHistoryForDomain(hostname) {
  try {
    const settings = (await browser.storage.local.get("settings")).settings;
    const dataTypes = settings.dataTypes || {
      history: true,
      cookies: true,
      cache: true,
      localStorage: true
    };

    // Delete browsing history
    if (dataTypes.history) {
      const historyItems = await browser.history.search({ text: hostname });
      for (const item of historyItems) {
        if (new URL(item.url).hostname === hostname) {
          await browser.history.deleteUrl({ url: item.url });
        }
      }
      console.log(`Deleted history for ${hostname}`);
    }

    // Delete cookies, cache, localStorage
    const removalOptions = { hostnames: [hostname] };
    if (dataTypes.cookies) {
      await browser.browsingData.removeCookies(removalOptions);
      console.log(`Deleted cookies for ${hostname}`);
    }
    if (dataTypes.cache) {
      await browser.browsingData.removeCache(removalOptions);
      console.log(`Deleted cache for ${hostname}`);
    }
    if (dataTypes.localStorage) {
      await browser.browsingData.removeLocalStorage(removalOptions);
      console.log(`Deleted localStorage for ${hostname}`);
    }

    // Show success notification
    browser.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-128.png",
      title: "History Cleared",
      message: `All selected history for ${hostname} has been cleared.`
    });
  } catch (e) {
    console.error("Error deleting history:", e);
    browser.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-128.png",
      title: "Error",
      message: `Failed to clear history for ${hostname}: ${e.message}`
    });
  }
}