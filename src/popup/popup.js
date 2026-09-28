document.addEventListener("DOMContentLoaded", () => {
  try {
    // Get hostname from URL parameter
    const params = new URLSearchParams(window.location.search);
    const hostname = params.get("hostname") || "unknown domain";
    document.getElementById("hostname").textContent = hostname;

    // Calculate and set parent domain (tld+1)
    let parentDomain = null;
    try {
      if (hostname.includes('.') && !/^\d+(\.\d+)*$/.test(hostname)) {
        const parts = hostname.split('.');
        if (parts.length > 2) {
          // e.g., de.aliexpress.com → aliexpress.com
          parentDomain = parts.slice(-2).join('.');
        }
      }
    } catch (e) {}

    // Load defaults for fallback & consistency
    const DEFAULTS = window.DEFAULT_SETTINGS;

    if (!/^[\w.-]+$/.test(hostname)) {
      console.error("Invalid hostname:", hostname);
      document.getElementById("hostname").textContent = "invalid domain";
      return;
    }

    // Confirm button
    if (parentDomain && parentDomain !== hostname) {
      document.getElementById("parent-domain").textContent = `${parentDomain}`;
    } else {
      document.getElementById("parent-domain").textContent = "the parent domain";
    }

    document.getElementById("confirm").addEventListener("click", async () => {
      try {
        const dontAskAgain = document.getElementById("dontAskAgain").checked;
        if (dontAskAgain) {
          // Merge saved + defaults: prioritize user's choices
          const saved = await browser.storage.local.get("settings");
          const settings = {
            ...DEFAULTS,
            ...(saved.settings || {})
          };

          settings.showConfirmation = false;
          await browser.storage.local.set({ settings });
          console.log("Confirmation popup disabled");
        }
        // Send message to background to delete history
        await browser.runtime.sendMessage({
          action: "deleteHistory",
          hostname,
          clearInCurrentTab: true
        }).then(() => {
          window.close();
        }).catch(e => {
          // show error
        });
        console.log(`Sent deleteHistory message for ${hostname}`);
        window.close();
      } catch (e) {
        console.error("Error in confirm action:", e);
        // popup uses relative paths, not leading "/"
        try {
          await browser.notifications.create({
            type: "basic",
            iconUrl: "icons/icon-128.png",  // relative to popup origin
            title: "Error",
            message: `Failed: ${e.message}`
          });
        } catch (notifyErr) {
          console.warn("Notification failed:", notifyErr);
        }
      }
    });

    // Cancel button
    document.getElementById("cancel").addEventListener("click", () => {
      console.log("Cancel clicked");
      window.close();
    });
  } catch (e) {
    console.error("Error initializing popup:", e);
  }
});

// Listen for messages from background (for debugging)
browser.runtime.onMessage.addListener((message) => {
  console.log("Popup received message:", message);
});