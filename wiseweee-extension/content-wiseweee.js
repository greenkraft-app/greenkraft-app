// Ruleaza pe dash.wiseweee.com. La incarcarea paginii, verifica daca exista
// un transfer in asteptare (trimis din Greenkraft) si, daca da, deschide automat
// "Document Nou" -> "Completeaza manual" si completeaza campurile cunoscute.
//
// IMPORTANT — reguli de siguranta:
//  - Nu apasa NICIODATA "Urmatorul Pas", "Salveaza" sau "Trimite in SIATD".
//  - Utilizatorul verifica intotdeauna datele si continua manual.
//  - Daca un camp nu poate fi gasit/completat, se noteaza clar in bannerul afisat,
//    nu se incearca ghicit sau fortat.

const MAX_VECHIME_MS = 10 * 60 * 1000; // ignoram un transfer mai vechi de 10 minute

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function setNativeValue(el, value) {
  const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function realClick(el) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
  ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((type) => {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }));
  });
}

// Converteste DD.MM.YYYY (format Greenkraft) -> YYYY-MM-DD (format input type=date)
function toIsoDate(dmy) {
  if (!dmy) return "";
  const m = String(dmy).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}

// Gaseste campul (input/select/button/textarea) asociat unei etichete <label>
// al carei text incepe cu labelStart. Cauta in interiorul label-ului, apoi in
// urmatoarele cateva elemente frate (acelasi tipar folosit de formularul WiseWeee).
function fieldByLabel(root, labelStart) {
  const labels = Array.from(root.querySelectorAll("label"));
  const lbl = labels.find((l) => l.textContent.trim().toLowerCase().startsWith(labelStart.toLowerCase()));
  if (!lbl) return null;
  let field = lbl.querySelector("input, select, textarea, button");
  if (!field) {
    let sib = lbl.nextElementSibling, hops = 0;
    while (sib && hops < 3 && !field) {
      field = sib.matches("input, select, textarea, button") ? sib : sib.querySelector("input, select, textarea, button");
      sib = sib.nextElementSibling;
      hops++;
    }
  }
  return field;
}

function getDialog() {
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"]'));
  return dialogs.find((d) => d.getBoundingClientRect().width > 0) || null;
}

// Scoate punctuatia (S.A. -> SA, S.R.L. -> SRL) si spatiile duble, pentru
// comparatii care nu trebuie sa depinda de cum e scrisa forma juridica.
function normalizeDenumire(s) {
  return (s || "").replace(/[.,]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

// Scoate si forma juridica de la final (SA, SRL, PFA, II, IF...) pentru a obtine
// un termen de cautare mai permisiv, care sa gaseasca firma chiar daca WiseWeee
// are alt format de scriere a formei juridice (ex. "S.A." vs "SA").
function coreDenumire(s) {
  return normalizeDenumire(s).replace(/\s+(sa|srl|snc|scs|pfa|ii|if|ong)$/i, "").trim();
}

// Deschide un combobox de tip "cauta si alege", scrie textul de cautare si
// selecteaza prima optiune al carei text incepe cu acel text. Intoarce true/false.
async function fillSearchCombobox(root, labelStart, searchText) {
  if (!searchText) return "skip";
  const trigger = fieldByLabel(root, labelStart);
  if (!trigger) return "camp-negasit";
  realClick(trigger);
  await sleep(350);

  const cautare = coreDenumire(searchText) || searchText;
  const input = document.activeElement && document.activeElement.tagName === "INPUT" ? document.activeElement : document.querySelector('input[placeholder*="aut"], input[placeholder*="Cauta"], input:focus');
  if (input) {
    setNativeValue(input, cautare);
    await sleep(600);
  }
  const options = Array.from(document.querySelectorAll('[role="option"]')).filter((o) => o.getBoundingClientRect().width > 0);
  const target = normalizeDenumire(searchText);
  const targetCore = coreDenumire(searchText);
  const match = options.find((o) => normalizeDenumire(o.textContent).startsWith(target))
    || options.find((o) => normalizeDenumire(o.textContent).startsWith(targetCore));
  if (match) {
    realClick(match);
    await sleep(150);
    return "ok";
  }
  document.body.click(); // inchidem dropdown-ul, lasam campul necompletat
  return "nu-s-a-gasit";
}

function fillTextInput(root, labelStart, value) {
  if (!value) return "skip";
  const field = fieldByLabel(root, labelStart);
  if (!field || field.tagName !== "INPUT") return "camp-negasit";
  setNativeValue(field, value);
  return "ok";
}

function fillDateInput(root, labelStart, dmyValue) {
  const iso = toIsoDate(dmyValue);
  if (!iso) return "skip";
  const field = fieldByLabel(root, labelStart);
  if (!field) return "camp-negasit";
  setNativeValue(field, iso);
  return "ok";
}

function fillTextarea(root, labelStart, value) {
  if (!value) return "skip";
  const field = fieldByLabel(root, labelStart);
  if (!field || field.tagName !== "TEXTAREA") return "camp-negasit";
  setNativeValue(field, value);
  return "ok";
}

function normalizeTxt(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Bifeaza un checkbox/switch a carui eticheta (sau textul din apropiere) contine
// un anumit fragment de text, insensibil la diacritice si majuscule.
function checkCheckboxByText(root, textIncludes) {
  const target = normalizeTxt(textIncludes);
  const labels = Array.from(root.querySelectorAll("label"));
  let container = labels.find((l) => normalizeTxt(l.textContent).includes(target));
  if (!container) {
    const leaf = Array.from(root.querySelectorAll("span, div, p")).find((el) => el.children.length === 0 && normalizeTxt(el.textContent).includes(target));
    container = leaf?.closest("label, div, li") || leaf;
  }
  if (!container) return "camp-negasit";
  const input = container.querySelector('input[type="checkbox"], [role="checkbox"], [role="switch"], button[role="switch"]')
    || container.parentElement?.querySelector('input[type="checkbox"], [role="checkbox"], [role="switch"], button[role="switch"]');
  if (!input) return "camp-negasit";
  const dejaBifat = input.checked === true || input.getAttribute("aria-checked") === "true" || input.getAttribute("data-state") === "checked";
  if (!dejaBifat) realClick(input);
  return "ok";
}

function showBanner(lines, isError) {
  const old = document.getElementById("gk-transfer-banner");
  if (old) old.remove();
  const div = document.createElement("div");
  div.id = "gk-transfer-banner";
  div.style.cssText = `position:fixed;top:16px;right:16px;z-index:999999;background:${isError ? "#fff3e0" : "#e8f5e9"};border:2px solid ${isError ? "#fb8c00" : "#43a047"};border-radius:10px;padding:14px 18px;max-width:340px;font-family:Arial,sans-serif;font-size:13px;color:#222;box-shadow:0 4px 20px rgba(0,0,0,.2);`;
  div.innerHTML = `<div style="font-weight:700;margin-bottom:6px;">${isError ? "⚠️" : "✅"} Greenkraft → WiseWeee</div>` +
    lines.map((l) => `<div style="margin:2px 0;">${l}</div>`).join("") +
    `<div style="margin-top:8px;font-size:11px;color:#666;">Verifică toate câmpurile înainte de a continua.</div>` +
    `<button id="gk-banner-close" style="margin-top:8px;padding:4px 10px;border:1px solid #999;background:#fff;border-radius:5px;cursor:pointer;font-size:11px;">Închide</button>`;
  document.body.appendChild(div);
  document.getElementById("gk-banner-close").onclick = () => div.remove();
}

async function runTransfer(payload) {
  // 1. Deschide "Document Nou"
  const newDocBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Document Nou");
  if (!newDocBtn) { showBanner(["Nu am găsit butonul 'Document Nou' pe pagină. Deschide-l manual."], true); return; }
  realClick(newDocBtn);
  await sleep(500);

  // 2. Alege "Completează manual"
  const manualBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim().startsWith("Completează manual"));
  if (manualBtn) { realClick(manualBtn); await sleep(500); }

  const dialog = getDialog();
  if (!dialog) { showBanner(["Nu am găsit formularul. Completează manual."], true); return; }

  const rezultate = [];
  rezultate.push(["Furnizor", await fillSearchCombobox(dialog, "Furnizor", payload.furnizor)]);
  rezultate.push(["Nr. Document", fillTextInput(dialog, "Nr. Document", payload.nr_document)]);
  rezultate.push(["Nr. Anexa", fillTextInput(dialog, "Nr. Anex", payload.nr_document)]);
  rezultate.push(["Organizație alocată", await fillSearchCombobox(dialog, "Organiza", "NEALOCATE")]);
  rezultate.push(["Nr. Ticket Cântar", fillTextInput(dialog, "Nr. Ticket Cântar", payload.nr_ticket_cantar)]);
  rezultate.push(["Cod HG856", await fillSearchCombobox(dialog, "Cod HG856", payload.cod_hg856)]);
  rezultate.push(["Greutate Totală", fillTextInput(dialog, "Greutate Totală", payload.greutate_kg)]);
  rezultate.push(["Data Colectare", fillDateInput(dialog, "Data Colectare", payload.data_colectare)]);
  rezultate.push(["Transportator", await fillSearchCombobox(dialog, "Transportator", payload.transportator)]);
  if (payload.fara_licenta) {
    rezultate.push(["Fără licență transport", checkCheckboxByText(dialog, "fara licenta")]);
  }
  rezultate.push(["Nr. Auto", fillTextInput(dialog, "Nr. Auto", payload.nr_auto)]);
  rezultate.push(["Șofer", fillTextInput(dialog, "Șofer", payload.sofer)]);
  rezultate.push(["Observații", fillTextarea(dialog, "Observații", payload.observatii)]);

  const neaflate = rezultate.filter(([, r]) => r === "nu-s-a-gasit" || r === "camp-negasit");
  const completate = rezultate.filter(([, r]) => r === "ok");

  const linii = [`${completate.length} câmpuri completate automat.`];
  if (neaflate.length) {
    linii.push(`De verificat/completat manual: ${neaflate.map(([n]) => n).join(", ")}.`);
  }
  showBanner(linii, neaflate.length > 0);
}

async function checkPendingTransfer() {
  chrome.storage.local.get("gkPendingTransfer", async (result) => {
    const pending = result.gkPendingTransfer;
    if (!pending) return;
    if (Date.now() - pending.ts > MAX_VECHIME_MS) {
      chrome.storage.local.remove("gkPendingTransfer");
      return;
    }
    chrome.storage.local.remove("gkPendingTransfer"); // il consumam o singura data
    await sleep(800); // lasam pagina sa se stabilizeze
    runTransfer(pending);
  });
}

checkPendingTransfer();
