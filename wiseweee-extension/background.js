// Primeste payload-ul de la content-greenkraft.js, il salveaza temporar,
// apoi deschide (sau focalizeaza, daca e deja deschis) tab-ul WiseWeee.
// content-wiseweee.js va prelua payload-ul de acolo si va completa formularul.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "GK_TO_WISEWEEE") return;

  chrome.storage.local.set({ gkPendingTransfer: { ...msg.payload, ts: Date.now() } }, () => {
    chrome.tabs.query({ url: "https://dash.wiseweee.com/*" }, (tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        chrome.tabs.update(tab.id, { active: true, url: "https://dash.wiseweee.com/acquisitions" });
        chrome.windows.update(tab.windowId, { focused: true });
      } else {
        chrome.tabs.create({ url: "https://dash.wiseweee.com/acquisitions" });
      }
    });
  });

  sendResponse({ ok: true });
  return true;
});
