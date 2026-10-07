// Ruleaza pe www.fgo.ro/v4/* (lista de facturi/avize).
// Pune un buton "GK" pe fiecare rand de aviz; la apasare ia documentul intreg
// din API-ul intern al FGO si il trimite in Greenkraft, unde se completeaza Anexa 3.
//
// Nu scrie nimic in FGO — doar citeste (GET), cu sesiunea deja deschisa a utilizatorului.

const API = "/v4-api/api/v1/facturi";
const CAMPURI_DETALIU = [
  "id", "serie", "numar", "data_emitere",
  "id_client", "denumire_client", "cod_unic_client",
  "articole", "info1", "info2",
];

const qs = (campuri) => campuri.map((c) => "campuri=" + encodeURIComponent(c)).join("&");

// Randul din tabel nu contine id-ul documentului, doar "GKF-9004".
// Il cautam dupa serie+numar, exact cum filtreaza si interfata FGO.
async function idDupaSerieNumar(serie, numar) {
  const url = `${API}?${qs(["id", "serie", "numar", "tip_factura_cod"])}&serie=${encodeURIComponent(serie)}&numar=${encodeURIComponent(numar)}&limita=5`;
  const r = await fetch(url, { headers: { Accept: "application/json" }, credentials: "same-origin" });
  if (!r.ok) throw new Error("FGO a raspuns cu " + r.status);
  const lista = await r.json();
  const doc = (Array.isArray(lista) ? lista : []).find(
    (x) => String(x.numar) === String(numar) && String(x.serie).toUpperCase() === String(serie).toUpperCase()
  );
  if (!doc) throw new Error(`Nu am gasit documentul ${serie} ${numar} in FGO`);
  return doc.id;
}

async function iaAvizul(id) {
  const r = await fetch(`${API}/${id}?${qs(CAMPURI_DETALIU)}`, { headers: { Accept: "application/json" }, credentials: "same-origin" });
  if (!r.ok) throw new Error("FGO a raspuns cu " + r.status);
  const d = await r.json();

  // Delegatul vine intr-un singur camp, pe randuri: nume / serie+nr CI / nr auto.
  // Un rand poate avea doua numere de inmatriculare (cap tractor + remorca),
  // de aceea le cautam in interiorul randului, nu ca rand intreg.
  const randuri = String(d.info1 || "").split(/[\r\n]+/).map((s) => s.replace(/\t/g, " ").trim()).filter(Boolean);
  const RE_AUTO = /\b[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}\b/gi;
  const RE_CI = /^[A-Z]{2}\s?\d{5,6}$/i;
  const randAuto = randuri.find((s) => (s.match(RE_AUTO) || []).length > 0) || "";
  const auto = ((randAuto.match(RE_AUTO) || []).map((x) => x.replace(/\s+/g, "").toUpperCase())).join(" ");
  const ci = randuri.find((s) => s !== randAuto && RE_CI.test(s.replace(/\s+/g, " ").trim())) || "";
  const nume = randuri.find((s) => s !== randAuto && s !== ci) || "";

  const data = d.data_emitere ? String(d.data_emitere).slice(0, 10).split("-").reverse().join(".") : "";

  return {
    aviz_serie: d.serie || "",
    aviz_numar: String(d.numar || ""),
    data,
    client: { denumire: d.denumire_client || "", cui: d.cod_unic_client || "" },
    delegat: { nume, ci, auto },
    linii: (d.articole || []).map((a) => ({
      denumire: a.nume_produs || "",
      um: a.factura_continut_um_ro || a.factura_continut_um || "",
      cantitate: a.cantitate,
    })),
  };
}

// "GKF-9004" → { serie: "GKF", numar: "9004" }
function serieNumarDinRand(tr) {
  const celule = [...tr.children].map((c) => c.innerText.trim());
  const tip = celule.find((t) => t === "A"); // coloana TIP: A = aviz
  const sn = celule.map((t) => t.match(/^([A-Z]{1,6})[-\s](\d+)$/i)).find(Boolean);
  if (!tip || !sn) return null;
  return { serie: sn[1], numar: sn[2] };
}

function faButon(tr, sn) {
  const b = document.createElement("button");
  b.textContent = "GK";
  b.title = `Trimite avizul ${sn.serie} ${sn.numar} în Greenkraft (Anexa 3)`;
  b.className = "gk-fgo-btn";
  b.style.cssText =
    "margin-left:6px;padding:1px 7px;font-size:11px;font-weight:700;line-height:1.5;" +
    "background:#2e7d32;color:#fff;border:none;border-radius:4px;cursor:pointer;vertical-align:middle;";
  b.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation(); // randul e clickabil in FGO — nu vrem sa deschidem documentul
    const textInitial = b.textContent;
    b.disabled = true;
    b.textContent = "...";
    try {
      const id = await idDupaSerieNumar(sn.serie, sn.numar);
      const payload = await iaAvizul(id);
      chrome.runtime.sendMessage({ type: "FGO_TO_GK", payload }, () => {
        if (chrome.runtime.lastError) {
          alert("Nu am putut contacta extensia Greenkraft: " + chrome.runtime.lastError.message);
          b.disabled = false;
          b.textContent = textInitial;
          return;
        }
        b.textContent = "✔";
        setTimeout(() => { b.disabled = false; b.textContent = textInitial; }, 2500);
      });
    } catch (err) {
      alert("Nu am putut citi avizul din FGO: " + err.message);
      b.disabled = false;
      b.textContent = textInitial;
    }
  });
  return b;
}

// Lista FGO se re-randeaza des (React), asa ca verificam periodic randurile noi.
function adaugaButoane() {
  document.querySelectorAll("tr").forEach((tr) => {
    if (tr.querySelector(".gk-fgo-btn")) return;
    const sn = serieNumarDinRand(tr);
    if (!sn) return;
    const celula = [...tr.children].find((c) => /^[A-Z]{1,6}[-\s]\d+$/i.test(c.innerText.trim()));
    if (celula) celula.appendChild(faButon(tr, sn));
  });
}

if (location.pathname.startsWith("/v4/")) {
  adaugaButoane();
  setInterval(adaugaButoane, 1200);
}
