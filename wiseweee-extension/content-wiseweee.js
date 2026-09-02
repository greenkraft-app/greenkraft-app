// Ruleaza pe dash.wiseweee.com. La incarcarea paginii, verifica daca exista
// un transfer in asteptare (trimis din Greenkraft) si, daca da, deschide automat
// "Document Nou" -> "Completeaza manual" si completeaza campurile cunoscute.
//
// IMPORTANT — reguli de siguranta:
//  - Apasa automat "Urmatorul Pas" DOAR daca toate campurile s-au completat cu succes
//    (niciun camp negasit / neidentificat). Daca lipseste ceva, se lasa neapasat.
//  - Nu apasa NICIODATA "Salveaza" sau "Trimite in SIATD" — utilizatorul verifica
//    si continua manual pasul final.
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
  // Campul pe care l-am apasat (trigger) e chiar inputul de cautare in acest
  // formular — scriem direct in el. Nu cautam un input separat prin pagina:
  // un selector generic gen input[placeholder*="aut"] prinde din greseala si
  // bara de cautare din capul paginii (placeholder "Caută ..." contine "aut").
  if (trigger.tagName === "INPUT") {
    setNativeValue(trigger, cautare);
  } else {
    const input = document.activeElement && document.activeElement.tagName === "INPUT" ? document.activeElement : root.querySelector("input:focus");
    if (input) setNativeValue(input, cautare);
  }
  const target = normalizeDenumire(searchText);
  const targetCore = coreDenumire(searchText);
  // Rezultatele cautarii pot veni async (cerere catre server) — interogam
  // repetat pana la 3 secunde in loc sa asteptam o singura data un timp fix,
  // ca sa functionam corect si cand reteaua/serverul raspund mai greu.
  let match = null;
  for (let waited = 0; waited < 3000 && !match; waited += 200) {
    await sleep(200);
    // Site-ul (shadcn) randeaza optiunile ca <button> simple in dropdown, fara role="option" —
    // le prindem dupa clasele lor tipice, cu fallback pe role="option" daca structura se schimba.
    const dropdownButtons = Array.from(document.querySelectorAll("button")).filter((b) => {
      const cls = b.className || "";
      return typeof cls === "string" && cls.includes("hover:bg-accent") && cls.includes("justify-between");
    });
    const roleOptions = Array.from(document.querySelectorAll('[role="option"]'));
    const options = [...dropdownButtons, ...roleOptions].filter((o) => o.getBoundingClientRect().width > 0);
    match = options.find((o) => normalizeDenumire(o.textContent).startsWith(target))
      || options.find((o) => normalizeDenumire(o.textContent).startsWith(targetCore));
  }
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

// Unele campuri sunt input text simplu cand nu s-a ales inca un Transportator,
// dar devin dropdown ("Selecteaza...") cu doar valorile deja inregistrate la
// acel transportator, imediat ce Transportatorul e completat (ex: Sofer).
// Verificam tipul efectiv al campului si alegem metoda potrivita.
async function fillTextOrCombobox(root, labelStart, value) {
  if (!value) return "skip";
  const field = fieldByLabel(root, labelStart);
  if (!field) return "camp-negasit";
  if (field.tagName === "INPUT") return fillTextInput(root, labelStart, value);
  if (field.tagName === "BUTTON") return await fillSearchCombobox(root, labelStart, value);
  return "camp-negasit";
}

// Campul "Nr. Auto" e input text simplu cand nu s-a ales inca un Transportator
// cunoscut, dar devine dropdown "Masina (Nr. Auto)" cu doar vehiculele deja
// inregistrate la acel transportator, imediat ce Transportatorul e completat —
// eticheta lui se schimba, deci nu-l gaseste fillTextOrCombobox (care cauta
// aceeasi eticheta in ambele variante).
async function fillNrAuto(root, value) {
  if (!value) return "skip";
  const comboField = fieldByLabel(root, "Mașină");
  if (comboField && comboField.tagName === "BUTTON") return await fillSearchCombobox(root, "Mașină", value);
  return fillTextInput(root, "Nr. Auto", value);
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

// Bifeaza un checkbox (shadcn/Radix: <button role="checkbox" id="...">). Cauta
// intai dupa un id cunoscut (cel mai fiabil), apoi cade pe cautare dupa eticheta/text.
function checkCheckboxByText(root, textIncludes, knownId) {
  if (knownId) {
    const byId = (root.querySelector(`#${knownId}`) || document.querySelector(`#${knownId}`));
    if (byId) {
      const dejaBifat = byId.getAttribute("aria-checked") === "true" || byId.getAttribute("data-state") === "checked" || byId.checked === true;
      if (!dejaBifat) realClick(byId);
      return "ok";
    }
  }
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

// Cauta butonul "Urmatorul Pas" (verde, pasul final al formularului) si il apasa.
// Cautam dupa textul exact al butonului (fara diacritice), nu dupa culoare, ca sa
// nu depindem de clasele CSS ale site-ului. Intoarce true daca l-a gasit si apasat.
function clickUrmatorulPas(root) {
  const buttons = Array.from((root || document).querySelectorAll("button"));
  const btn = buttons.find((b) => normalizeTxt(b.textContent).replace(/\s+/g, " ").trim() === "urmatorul pas");
  if (!btn || btn.disabled) return false;
  realClick(btn);
  return true;
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
  // Ordinea conteaza: alegerea Transportatorului transforma campul Nr. Auto
  // intr-un dropdown cu doar vehiculele lui inregistrate, iar alegerea acolo
  // a unui vehicul transforma la randul ei campul Sofer intr-un dropdown cu
  // soferii acelui vehicul. Bifa "Fara licenta" o verificam ultima, dupa toate
  // aceste selectii in cascada, pentru ca alegerea Soferului o poate reseta.
  rezultate.push(["Transportator", await fillSearchCombobox(dialog, "Transportator", payload.transportator)]);
  rezultate.push(["Nr. Auto", await fillNrAuto(dialog, payload.nr_auto)]);
  rezultate.push(["Șofer", await fillTextOrCombobox(dialog, "Șofer", payload.sofer)]);
  if (payload.fara_licenta) {
    rezultate.push(["Fără licență transport", checkCheckboxByText(dialog, "fara licenta", "no-license-transport")]);
  }
  rezultate.push(["Observații", fillTextarea(dialog, "Observații", payload.observatii)]);

  const neaflate = rezultate.filter(([, r]) => r === "nu-s-a-gasit" || r === "camp-negasit");
  const completate = rezultate.filter(([, r]) => r === "ok");

  const linii = [`${completate.length} câmpuri completate automat.`];
  if (neaflate.length) {
    linii.push(`De verificat/completat manual: ${neaflate.map(([n]) => n).join(", ")}.`);
    showBanner(linii, true);
    return;
  }

  await sleep(200);
  const apasat = clickUrmatorulPas(dialog);
  linii.push(apasat
    ? "✅ Toate câmpurile s-au completat — am apăsat automat „Următorul Pas”."
    : "Toate câmpurile s-au completat, dar nu am găsit butonul „Următorul Pas” — apasă-l manual.");
  showBanner(linii, !apasat);
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
