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
