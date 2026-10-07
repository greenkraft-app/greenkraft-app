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
        // Daca tab-ul era deja pe aceasta adresa, nu se reincarca si content script-ul
        // nu porneste din nou — il anuntam noi. Daca s-a reincarcat, el porneste singur,
        // iar mesajul asta nu face nimic (transferul se ia o singura data).
        setTimeout(() => chrome.tabs.sendMessage(tab.id, { type: "GK_TRANSFER_NOU" }, () => chrome.runtime.lastError), 1500);
      } else {
        chrome.tabs.create({ url: "https://dash.wiseweee.com/acquisitions" });
      }
    });
  });

  sendResponse({ ok: true });
  return true;
});

// Sensul invers: avizul citit de content-fgo.js din FGO este dus in Greenkraft,
// unde content-greenkraft.js il preda paginii pentru completarea Anexei 3.
const GK_URLS = ["https://greenkraft-app.vercel.app/*", "http://localhost:5173/*"];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "FGO_TO_GK") return;

  chrome.storage.local.set({ gkPendingAviz: { ...msg.payload, ts: Date.now() } }, () => {
    chrome.tabs.query({ url: GK_URLS }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
        // tab-ul e deja deschis, deci content script-ul ruleaza de mult:
        // il anuntam ca are un aviz de preluat
        chrome.tabs.sendMessage(tabs[0].id, { type: "GK_AVIZ_NOU" }, () => chrome.runtime.lastError);
      } else {
        chrome.tabs.create({ url: "https://greenkraft-app.vercel.app/" });
      }
    });
  });

  sendResponse({ ok: true });
  return true;
});
