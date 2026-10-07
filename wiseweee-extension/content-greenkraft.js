// Ruleaza pe greenkraft-app.vercel.app (si localhost:5173 pentru testare).
// Nu modifica nimic in pagina — doar asculta mesajele trimise de butonul
// "📤" din tabelul Achizitii (window.postMessage) si le transmite mai departe
// catre service worker-ul extensiei, care se ocupa de deschiderea WiseWeee.

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.type !== "GK_TO_WISEWEEE") return;

  chrome.runtime.sendMessage({ type: "GK_TO_WISEWEEE", payload: event.data.payload }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn("[Greenkraft→WiseWeee] Nu am putut contacta extensia:", chrome.runtime.lastError.message);
    }
  });
});

// Sensul invers: un aviz trimis din FGO. Il scoatem din storage si il predam
// paginii, care completeaza singura formularul de Anexa 3.
const predaAvizul = () => {
  chrome.storage.local.get("gkPendingAviz", (res) => {
    const aviz = res && res.gkPendingAviz;
    if (!aviz) return;
    // un aviz ramas de mult in storage nu mai e "proaspat trimis"
    if (Date.now() - (aviz.ts || 0) > 5 * 60 * 1000) {
      chrome.storage.local.remove("gkPendingAviz");
      return;
    }
    chrome.storage.local.remove("gkPendingAviz", () => {
      window.postMessage({ type: "FGO_AVIZ", payload: aviz }, window.location.origin);
    });
  });
};

// pagina poate sa nu fie gata in momentul livrarii — mai incercam de cateva ori
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "GK_AVIZ_NOU") predaAvizul();
});
[0, 800, 2000, 4000].forEach((ms) => setTimeout(predaAvizul, ms));
