export default async function handler(req, res) {
  const cui = String(req.query.cui || "").replace(/\D/g, "");
  if (!cui) return res.status(400).json({ error: "CUI lipsă" });

  const data = new Date().toISOString().slice(0, 10);

  try {
    const response = await fetch("https://webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ cui: parseInt(cui, 10), data }]),
    });

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Răspuns invalid de la ANAF" });
    }

    const found = json?.found?.[0];
    if (!found) return res.status(404).json({ error: "CUI negăsit la ANAF" });

    const dg = found.date_generale || {};
    return res.status(200).json({
      cui: dg.cui,
      denumire: dg.denumire || "",
      adresa: dg.adresa || "",
      nrRegCom: dg.nrRegCom || "",
      telefon: dg.telefon || "",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
