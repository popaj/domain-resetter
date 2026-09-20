document.addEventListener("DOMContentLoaded", () => {
  try {
    // Get hostname from URL parameter
    const params = new URLSearchParams(window.location.search);
    const hostname = params.get("hostname") || "unknown domain";
    document.getElementById("hostname").textContent = hostname;
    if (!/^[\w.-]+$/.test(hostname)) {
      console.error("Invalid hostname:", hostname);
      document.getElementById("hostname").textContent = "invalid domain";
      return;
    }

    // Confirm button
    document.getElementById("confirm").addEventListener("click", async () => {
      try {
        const dontAskAgain = document.getElementById("dontAskAgain").checked;
        if (dontAskAgain) {
          const settings = (await browser.storage.local.get("settings")).settings || {};
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
        browser.notifications.create({
          type: "basic",
          iconUrl: "/icons/icon-128.png",
          title: "Error",
          message: `Failed to process request: ${e.message}`
        });
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