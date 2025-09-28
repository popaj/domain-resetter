# Domain Resetter

**Domain Resetter** is a Firefox extension that allows you to quickly clear browsing data for the current domain, including history, cookies, cache, and local storage.

## Features

- Clear browsing history for the active domain.
- Optionally clear cookies, cache, and local storage data.
- Configurable confirmation popup before clearing data.
- Simple popup interface to confirm domain-specific data deletion.
- Settings page to customize what data types to delete and confirmation behavior.
- Browser notifications for success or error feedback.

## Installation

1. Download or clone this repository.
2. Open `about:debugging#/runtime/domain-resetter` in Firefox.
3. Click **Load Temporary Add-on** and select the `manifest.json` file.
4. The extension will be loaded and ready to use.

## Usage

- Navigate to any webpage.
- Click the extension icon in the address bar.
- A popup will appear asking to confirm deletion of browsing data for the current domain (unless disabled).
- Confirm to clear the selected data types for that domain.

## Settings

Go to the extension options page to:

- Enable or disable the confirmation popup.
- Choose which data types to clear (history, cookies, cache, local storage).

## Permissions

- `activeTab`, `tabs` — Access the current tab and URL.
- `history` — Read and delete browsing history.
- `browsingData` — Clear cookies, cache, and local storage.
- `storage` — Store user settings.
- `notifications` — Show notifications after clearing data.

## License

MIT License