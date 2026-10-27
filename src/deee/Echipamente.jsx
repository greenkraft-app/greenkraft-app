import { useState } from "react";
import { useTabela, lipsaTabel, numar, colatie } from "./hooks";

// Nomenclatorul de echipamente: greutate medie (din ea se calculeaza bucatile), categorie WEEELABEX si codul
// pe care echipamentul il are la fiecare organizatie (ECOTIC, CNREE…). Fiecare modificare ajunge in Istoric.
export default function Echipamente({ sb, G, ui, logAction, confirmDel }) {
  const ech = useTabela(sb, "deee_echipamente");
  const cat = useTabela(sb, "deee_categorii");
  const coduri = useTabela(sb, "deee_coduri_org");
  const leg = useTabela(sb, "deee_echipament_cod");
  const [nou, setNou] = useState({ den: "", greutate: "", categorie: "" });
  const [mesaj, setMesaj] = useState("");
  const [filtru, setFiltru] = useState("");
  const [deschis, setDeschis] = useState(null);

  const eroare = ech.eroare || cat.eroare || coduri.eroare || leg.eroare;
  if (eroare && lipsaTabel(eroare)) {
    return (
      <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: 18, maxWidth: 680, color: "#78350f", fontSize: 13, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 6 }}>Mai trebuie un pas: nomenclatorul complet de echipamente</div>
        Rulează o singură dată fișierul <b>supabase-deee-6-nomenclator-complet.sql</b>: Supabase → <b>SQL Editor</b> → New query → lipești conținutul → <b>Run</b>. Apoi reîncarcă pagina.
      </div>
    );
  }
  if (eroare) return <div style={{ color: "#991b1b", fontSize: 13 }}>Nu am putut citi echipamentele: {eroare.message}</div>;

  const eroareDb = (error) => (error.code === "23505" ? "Există deja un echipament cu această denumire." : "Eroare: " + error.message);
  const codPe = Object.fromEntries(coduri.rows.map((c) => [c.id, c]));
  const legaturiPe = (id) => leg.rows.filter((l) => l.echipament_id === id && codPe[l.cod_id]);
  const organizatii = [...new Set(coduri.rows.map((c) => c.organizatie))].sort(colatie);

  const adauga = async () => {
    const den = nou.den.trim();
    if (!den) { setMesaj("Completează denumirea."); return; }
    const g = nou.greutate.trim() === "" ? null : numar(nou.greutate);
    if (g !== null && !(g > 0)) { setMesaj("Greutatea medie trebuie să fie un număr pozitiv."); return; }
    const row = { den, greutate_medie: g, categorie: nou.categorie || null };
    const { data, error } = await sb.from("deee_echipamente").insert(row).select();
    if (error) { setMesaj(eroareDb(error)); return; }
    ech.setRows((p) => [...p, data[0]]);
    setNou({ den: "", greutate: "", categorie: "" }); setMesaj("");
    logAction("add", "deee_echipamente", data[0].id, row);
  };

  const salveaza = async (r, camp, valoare) => {
    let v = valoare;
    if (camp === "den") { v = valoare.trim(); if (!v) { setMesaj("Denumirea nu poate fi goală."); ech.reload(); return; } }
    if (camp === "greutate_medie") {
      if (String(valoare).trim() === "") v = null;
      else { v = numar(valoare); if (!(v > 0)) { setMesaj("Greutatea medie trebuie să fie un număr pozitiv."); ech.reload(); return; } }
    }
    if (camp === "categorie") v = valoare || null;
    if (v === (r[camp] ?? null)) return;
    const { error } = await sb.from("deee_echipamente").update({ [camp]: v }).eq("id", r.id);
    if (error) { setMesaj(eroareDb(error)); ech.reload(); return; }
    setMesaj("");
    ech.setRows((p) => p.map((x) => (x.id === r.id ? { ...x, [camp]: v } : x)));
    logAction("update", "deee_echipamente", r.id, { den: r.den, [camp]: v, _inainte: { [camp]: r[camp] ?? null } });
  };

  const comuta = async (r) => {
    const { error } = await sb.from("deee_echipamente").update({ activ: !r.activ }).eq("id", r.id);
    if (error) { setMesaj(eroareDb(error)); return; }
    ech.setRows((p) => p.map((x) => (x.id === r.id ? { ...x, activ: !r.activ } : x)));
    logAction("update", "deee_echipamente", r.id, { den: r.den, activ: !r.activ, _inainte: { activ: r.activ } });
  };

  const sterge = async (r) => {
    if (!confirmDel(`„${r.den}"`)) return;
    const { error } = await sb.from("deee_echipamente").delete().eq("id", r.id);
    if (error) { setMesaj(eroareDb(error)); return; }
    ech.setRows((p) => p.filter((x) => x.id !== r.id));
    leg.setRows((p) => p.filter((l) => l.echipament_id !== r.id));
    logAction("delete", "deee_echipamente", r.id, { _sters: r });
  };

  const leaga = async (r, codId) => {
    if (!codId) return;
    const c = codPe[codId];
    const areAlt = legaturiPe(r.id).some((l) => codPe[l.cod_id].organizatie === c.organizatie);
    const row = { echipament_id: r.id, cod_id: codId, implicit: !areAlt };
    const { data, error } = await sb.from("deee_echipament_cod").insert(row).select();
    if (error) { setMesaj(error.code === "23505" ? "Codul este deja legat de acest echipament." : "Eroare: " + error.message); return; }
    leg.setRows((p) => [...p, data[0]]);
    logAction("add", "deee_echipament_cod", data[0].id, { echipament: r.den, organizatie: c.organizatie, cod: c.cod, denumire: c.denumire });
  };

  const dezleaga = async (r, l) => {
    const c = codPe[l.cod_id];
    const { error } = await sb.from("deee_echipament_cod").delete().eq("id", l.id);
    if (error) { setMesaj("Eroare: " + error.message); return; }
    let ramase = leg.rows.filter((x) => x.id !== l.id);
    // daca am scos codul implicit, urmatorul cod al aceleiasi organizatii devine implicit
    if (l.implicit) {
      const urm = ramase.find((x) => x.echipament_id === r.id && codPe[x.cod_id]?.organizatie === c.organizatie);
      if (urm) {
        await sb.from("deee_echipament_cod").update({ implicit: true }).eq("id", urm.id);
        ramase = ramase.map((x) => (x.id === urm.id ? { ...x, implicit: true } : x));
      }
    }
    leg.setRows(ramase);
    logAction("delete", "deee_echipament_cod", l.id, { echipament: r.den, _sters: { organizatie: c.organizatie, cod: c.cod, denumire: c.denumire } });
  };

  const faImplicit = async (r, l) => {
    const c = codPe[l.cod_id];
    const frati = leg.rows.filter((x) => x.echipament_id === r.id && codPe[x.cod_id]?.organizatie === c.organizatie);
    for (const f of frati) {
      const { error } = await sb.from("deee_echipament_cod").update({ implicit: f.id === l.id }).eq("id", f.id);
      if (error) { setMesaj("Eroare: " + error.message); leg.reload(); return; }
    }
    leg.setRows((p) => p.map((x) => (frati.some((f) => f.id === x.id) ? { ...x, implicit: x.id === l.id } : x)));
    logAction("update", "deee_echipament_cod", l.id, { echipament: r.den, organizatie: c.organizatie, implicit: c.cod });
  };

  const salveazaTinta = async (c, camp, valoare) => {
    const v = numar(valoare);
    if (!(v >= 0 && v <= 100)) { setMesaj("Ținta trebuie să fie între 0 și 100."); cat.reload(); return; }
    if (v === Number(c[camp])) return;
    const { error } = await sb.from("deee_categorii").update({ [camp]: v }).eq("cat", c.cat);
    if (error) { setMesaj("Eroare: " + error.message); cat.reload(); return; }
    setMesaj("");
    cat.setRows((p) => p.map((x) => (x.cat === c.cat ? { ...x, [camp]: v } : x)));
    logAction("update", "deee_categorii", c.cat, { [camp]: v, _inainte: { [camp]: Number(c[camp]) } });
  };

  const q = filtru.trim().toLowerCase();
  const afisate = [...ech.rows]
    .filter((r) => !q || r.den.toLowerCase().includes(q) || (r.categorie || "").toLowerCase().includes(q))
    .sort((a, b) => colatie(a.den, b.den));
  const categorii = [...cat.rows].sort((a, b) => colatie(a.cat, b.cat));

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const eticheta = (c) => `${c.cod} — ${c.denumire}`;

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, boxShadow: "0 1px 3px rgba(15,23,42,.05)" }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>Echipamente <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: 12 }}>({ech.rows.length})</span></div>
      <div style={{ fontSize: 11, color: "#64748b", margin: "2px 0 10px" }}>
        Greutatea medie se folosește la calculul bucăților (kg ÷ greutate medie). Deschide un echipament (▸) ca să alegi codul lui la fiecare organizație.
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <input style={{ ...inputSt, flex: 3, minWidth: 180 }} placeholder="Denumire" value={nou.den} onChange={(e) => setNou((p) => ({ ...p, den: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") adauga(); }} />
        <input style={{ ...inputSt, flex: 1, minWidth: 90 }} placeholder="Greutate medie (kg)" inputMode="decimal" value={nou.greutate} onChange={(e) => setNou((p) => ({ ...p, greutate: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") adauga(); }} />
        <select style={{ ...inputSt, flex: 1, minWidth: 110 }} value={nou.categorie} onChange={(e) => setNou((p) => ({ ...p, categorie: e.target.value }))}>
          <option value="">Categorie…</option>
          {categorii.map((c) => <option key={c.cat} value={c.cat}>{c.cat} — {c.denumire}</option>)}
        </select>
        <button onClick={adauga} style={{ background: G, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Adaugă</button>
      </div>
      {mesaj && <div style={{ color: "#c62828", fontSize: 11, marginBottom: 6 }}>{mesaj}</div>}
      <input style={{ ...inputSt, marginBottom: 8 }} placeholder="🔍 Caută după denumire sau categorie…" value={filtru} onChange={(e) => setFiltru(e.target.value)} />

      <div style={{ maxHeight: 520, overflowY: "auto", border: "1px solid #eef2f6", borderRadius: 8 }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={ui.th({ width: 28, background: "#1f4d42" })}></th>
              <th style={ui.th({ textAlign: "left", background: "#1f4d42" })}>Denumire</th>
              <th style={ui.th({ width: 110, background: "#1f4d42" })}>Greutate medie (kg)</th>
              <th style={ui.th({ width: 100, background: "#1f4d42" })}>Categorie</th>
              <th style={ui.th({ width: 70, background: "#1f4d42" })}>Coduri org.</th>
              <th style={ui.th({ width: 52, background: "#1f4d42" })}>Activ</th>
              <th style={ui.th({ width: 36, background: "#1f4d42" })}></th>
            </tr>
          </thead>
          <tbody>
            {!ech.incarcat && <tr><td colSpan={7} style={ui.td({ textAlign: "center", color: "#94a3b8", padding: 14 })}>Se încarcă…</td></tr>}
            {ech.incarcat && afisate.length === 0 && <tr><td colSpan={7} style={ui.td({ textAlign: "center", color: "#94a3b8", padding: 14 })}>Nimic încă.</td></tr>}
            {afisate.map((r) => {
              const ls = legaturiPe(r.id);
              const desch = deschis === r.id;
              return [
                <tr key={r.id} style={{ opacity: r.activ ? 1 : 0.5 }}>
                  <td style={ui.td({ textAlign: "center", padding: 2 })}>
                    <button onClick={() => setDeschis(desch ? null : r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 12 }} title="Coduri la organizații">{desch ? "▾" : "▸"}</button>
                  </td>
                  <td style={ui.td({ padding: 2 })}>
                    <input key={r.id + r.den} defaultValue={r.den} style={{ ...inputSt, border: "1px solid transparent", background: "transparent" }}
                      onBlur={(e) => salveaza(r, "den", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
                  </td>
                  <td style={ui.td({ padding: 2 })}>
                    <input key={r.id + String(r.greutate_medie)} defaultValue={r.greutate_medie ?? ""} inputMode="decimal" style={{ ...inputSt, border: "1px solid transparent", background: "transparent", textAlign: "right" }}
                      onBlur={(e) => salveaza(r, "greutate_medie", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
                  </td>
                  <td style={ui.td({ padding: 2 })}>
                    <select value={r.categorie || ""} onChange={(e) => salveaza(r, "categorie", e.target.value)} style={{ ...inputSt, border: "1px solid transparent", background: "transparent" }}>
                      <option value="">—</option>
                      {categorii.map((c) => <option key={c.cat} value={c.cat}>{c.cat}</option>)}
                    </select>
                  </td>
                  <td style={ui.td({ textAlign: "center", color: ls.length ? "#334155" : "#cbd5e1" })}>{ls.length}</td>
                  <td style={ui.td({ textAlign: "center" })}><input type="checkbox" checked={!!r.activ} onChange={() => comuta(r)} title="Inactiv = nu mai apare în liste noi" /></td>
                  <td style={ui.td({ textAlign: "center", padding: 2 })}><button onClick={() => sterge(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }} title="Șterge">✕</button></td>
                </tr>,
                desch && (
                  <tr key={r.id + "-cod"}>
                    <td colSpan={7} style={ui.td({ background: "#f8fafc", padding: "8px 12px" })}>
                      {organizatii.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8" }}>Nu există coduri de organizații.</div>}
                      {organizatii.map((org) => {
                        const ale = ls.filter((l) => codPe[l.cod_id].organizatie === org);
                        const disponibile = coduri.rows.filter((c) => c.organizatie === org && !ale.some((l) => l.cod_id === c.id)).sort((a, b) => colatie(a.cod, b.cod));
                        return (
                          <div key={org} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap" }}>
                            <div style={{ width: 100, fontSize: 11, fontWeight: 700, color: "#334155", paddingTop: 5 }}>{org}</div>
                            <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 3 }}>
                              {ale.length === 0 && <div style={{ fontSize: 11, color: "#94a3b8", paddingTop: 5 }}>fără cod</div>}
                              {ale.map((l) => (
                                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                                  <button onClick={() => !l.implicit && faImplicit(r, l)} title={l.implicit ? "Cod implicit" : "Fă-l implicit"} style={{ background: "none", border: "none", cursor: l.implicit ? "default" : "pointer", color: l.implicit ? "#f59e0b" : "#cbd5e1", fontSize: 13, padding: 0 }}>★</button>
                                  <span style={{ flex: 1 }}>{eticheta(codPe[l.cod_id])}</span>
                                  <button onClick={() => dezleaga(r, l)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 12 }} title="Scoate codul">✕</button>
                                </div>
                              ))}
                            </div>
                            <select value="" onChange={(e) => leaga(r, e.target.value)} style={{ ...inputSt, width: 190, flex: "0 0 190px" }}>
                              <option value="">+ cod {org}…</option>
                              {disponibile.map((c) => <option key={c.id} value={c.id}>{eticheta(c)}</option>)}
                            </select>
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>

      <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", margin: "16px 0 4px" }}>Categorii și ținte WEEELABEX</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Țintele (în %) cu care se compară ratele de reciclare și valorificare.</div>
      <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 560 }}>
        <thead>
          <tr>
            <th style={ui.th({ width: 60, background: "#1f4d42" })}>Cat.</th>
            <th style={ui.th({ textAlign: "left", background: "#1f4d42" })}>Denumire</th>
            <th style={ui.th({ width: 110, background: "#1f4d42" })}>Țintă reciclare %</th>
            <th style={ui.th({ width: 110, background: "#1f4d42" })}>Țintă valorificare %</th>
          </tr>
        </thead>
        <tbody>
          {categorii.map((c) => (
            <tr key={c.cat}>
              <td style={ui.td({ textAlign: "center", fontWeight: 700 })}>{c.cat}</td>
              <td style={ui.td()}>{c.denumire}</td>
              {["tinta_reciclare", "tinta_valorificare"].map((camp) => (
                <td key={camp} style={ui.td({ padding: 2 })}>
                  <input key={c.cat + camp + c[camp]} defaultValue={c[camp]} inputMode="decimal" style={{ ...inputSt, border: "1px solid transparent", background: "transparent", textAlign: "right" }}
                    onBlur={(e) => salveazaTinta(c, camp, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
