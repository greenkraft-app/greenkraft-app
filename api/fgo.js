import crypto from "crypto";

// Proxy catre API-ul FGO (facturare). Cheia privata sta DOAR aici, in variabilele de mediu
// de pe Vercel — nu ajunge niciodata in browser. Clientul trimite doar datele documentului.
//
// Variabile de mediu necesare (Vercel → Settings → Environment Variables):
//   FGO_COD_UNIC        CUI-ul firmei din contul FGO (ex: 36191378)
//   FGO_CHEIE_PRIVATA   cheia/token-ul privat din FGO → Setari → API
//   FGO_PLATFORMA_URL   (opt.) URL-ul aplicatiei, trimis ca PlatformaUrl
//   FGO_BASE_URL        (opt.) implicit https://api.fgo.ro/v1 ; pentru teste https://api-testuat.fgo.ro/v1

const BASE = (process.env.FGO_BASE_URL || "https://api.fgo.ro/v1").replace(/\/+$/, "");
const TIMEOUT_MS = 20000; // FGO are timeout de 15s pe emitere

const sha1Upper = (s) => crypto.createHash("sha1").update(s, "utf8").digest("hex").toUpperCase();

const fetchJson = async (url, init) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await r.text();
    try {
      return { status: r.status, json: JSON.parse(text) };
    } catch {
      return { status: 502, json: { Success: false, Message: "Raspuns invalid de la FGO: " + text.slice(0, 300) } };
    }
  } finally {
    clearTimeout(t);
  }
};

export default async function handler(req, res) {
  const codUnic = process.env.FGO_COD_UNIC || "";
  const cheie = process.env.FGO_CHEIE_PRIVATA || "";
  const platformaUrl = process.env.FGO_PLATFORMA_URL || "https://greenkraft-app.vercel.app";

  // GET /api/fgo              → spune daca integrarea e configurata (fara sa expuna cheia)
  // GET /api/fgo?nomenclator=judet → liste de valori valide (judete, tari, tva...)
  if (req.method === "GET") {
    const nom = String(req.query.nomenclator || "");
    if (nom) {
      if (!/^[a-z]+$/.test(nom)) return res.status(400).json({ Success: false, Message: "Nomenclator invalid" });
      try {
        const { status, json } = await fetchJson(`${BASE}/nomenclator/${nom}`, { method: "GET" });
        return res.status(status).json(json);
      } catch (e) {
        return res.status(502).json({ Success: false, Message: e.message });
      }
    }
    return res.status(200).json({ configurat: !!(codUnic && cheie), codUnic, base: BASE, platformaUrl });
  }

  if (req.method !== "POST") return res.status(405).json({ Success: false, Message: "Method not allowed" });
  if (!codUnic || !cheie) {
    return res.status(500).json({ Success: false, Message: "FGO nu e configurat: lipsesc FGO_COD_UNIC / FGO_CHEIE_PRIVATA pe server." });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ Success: false, Message: "JSON invalid" });
  }

  const action = String(body.action || "");

  try {
    // ── Emitere document (aviz, factura, proforma...) ───────────────────────
    // Hash = SHA1(CodUnic + CheiePrivata + DenumireClient), cu majuscule.
    if (action === "emitere") {
      const client = body.client || {};
      const continut = Array.isArray(body.continut) ? body.continut : [];
      if (!client.Denumire) return res.status(400).json({ Success: false, Message: "Lipseste denumirea clientului" });
      if (!continut.length) return res.status(400).json({ Success: false, Message: "Documentul nu are nicio linie" });

      const payload = {
        CodUnic: codUnic,
        Hash: sha1Upper(codUnic + cheie + client.Denumire),
        Serie: body.serie || "",
        Valuta: body.valuta || "RON",
        TipFactura: body.tipFactura || "Aviz",
        PlatformaUrl: platformaUrl,
        Client: client,
        Continut: continut,
      };
      if (body.numar) payload.Numar = String(body.numar);
      if (body.dataEmitere) payload.DataEmitere = body.dataEmitere;
      if (body.text) payload.Text = String(body.text).slice(0, 2000);
      if (body.explicatii) payload.Explicatii = String(body.explicatii).slice(0, 2000);
      // IdExtern + VerificareDuplicat: daca butonul e apasat de doua ori, FGO intoarce
      // documentul deja emis in loc sa creeze un duplicat.
      if (body.idExtern) {
        payload.IdExtern = String(body.idExtern).slice(0, 36);
        payload.VerificareDuplicat = true;
      }

      const { status, json } = await fetchJson(`${BASE}/factura/emitere`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.status(status).json(json);
    }

    // ── Print / Status — Hash = SHA1(CodUnic + CheiePrivata + Numar) ────────
    if (action === "print" || action === "status") {
      const numar = String(body.numar || "");
      const serie = String(body.serie || "");
      if (!numar) return res.status(400).json({ Success: false, Message: "Lipseste numarul documentului" });
      const payload = {
        CodUnic: codUnic,
        Hash: sha1Upper(codUnic + cheie + numar),
        Numar: numar,
        Serie: serie,
        PlatformaUrl: platformaUrl,
      };
      const path = action === "print" ? "/factura/print" : "/factura/getstatus";
      const { status, json } = await fetchJson(BASE + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.status(status).json(json);
    }

    return res.status(400).json({ Success: false, Message: "Actiune necunoscuta: " + action });
  } catch (e) {
    const msg = e.name === "AbortError" ? "FGO nu a raspuns in 20 de secunde" : e.message;
    return res.status(502).json({ Success: false, Message: msg });
  }
}
