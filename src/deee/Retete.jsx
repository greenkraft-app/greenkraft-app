import { useState, useMemo } from "react";
import { useTabela, numar, colatie } from "./hooks";

const rotunjit = (n) => Math.round(n * 1000) / 1000;

// Retete de dezmembrare: pentru fiecare echipament, in ce fractii (si ce procent) se imparte.
// O modificare creeaza o VERSIUNE NOUA; cea veche ramane in istoric, ca dezmembrarile deja facute sa nu se schimbe.
export default function Retete({ sb, G, ui, currentUser, logAction, confirmDel }) {
  const retete = useTabela(sb, "deee_retete");
  const linii = useTabela(sb, "deee_retete_linii");
  const ech = useTabela(sb, "deee_echipamente");
  const frac = useTabela(sb, "deee_fractii");
  const [arataVechi, setArataVechi] = useState(false);
  const [filtru, setFiltru] = useState("");
  const [edit, setEdit] = useState(null); // { id|null, echipament, ref_kg, versiune, linii:[{fractie,cod,procent}] }
  const [eroare, setEroare] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);

  const liniiPeReteta = useMemo(() => {
    const m = {};
    linii.rows.forEach((l) => { (m[l.reteta_id] = m[l.reteta_id] || []).push(l); });
    Object.values(m).forEach((a) => a.sort((x, y) => (x.ord || 0) - (y.ord || 0)));
    return m;
  }, [linii.rows]);

  const q = filtru.trim().toLowerCase();
  const afisate = useMemo(() => retete.rows
    .filter((r) => (arataVechi || r.activ) && (!q || r.echipament.toLowerCase().includes(q)))
    .sort((a, b) => colatie(a.echipament, b.echipament) || b.versiune - a.versiune),
  [retete.rows, arataVechi, q]);

  const total = (ls) => rotunjit(ls.reduce((s, l) => s + (numar(l.procent) || 0), 0));

  const deschideNoua = () => { setEroare(""); setEdit({ id: null, echipament: "", ref_kg: "", versiune: 1, linii: [{ fractie: "", cod: "", procent: "" }] }); };
  const deschideEditare = (r) => {
    setEroare("");
    setEdit({
      id: r.id, echipament: r.echipament, ref_kg: r.ref_kg ?? "", versiune: r.versiune,
      linii: (liniiPeReteta[r.id] || []).map((l) => ({ fractie: l.fractie, cod: l.cod, procent: String(l.procent) })),
    });
  };

  const setLinie = (i, patch) => setEdit((p) => ({ ...p, linii: p.linii.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const alegeFractie = (i, valoare) => {
    const f = frac.rows.find((x) => x.id === valoare);
    setLinie(i, f ? { fractie: f.den, cod: f.cod } : { fractie: "", cod: "" });
  };

  const valideaza = () => {
    if (!edit.echipament) return "Alege echipamentul.";
    if (!edit.linii.length) return "Adaugă cel puțin o fracție.";
    const vazute = new Set();
    for (const l of edit.linii) {
      if (!l.fractie) return "Alege fracția pe fiecare rând.";
      const p = numar(l.procent);
      if (!(p > 0)) return `Procentul pentru „${l.fractie}” trebuie să fie mai mare ca 0.`;
      const cheie = l.fractie + "|" + l.cod;
      if (vazute.has(cheie)) return `Fracția „${l.fractie}” (${l.cod || "fără cod"}) apare de două ori.`;
      vazute.add(cheie);
    }
    const t = total(edit.linii);
    if (Math.abs(t - 100) > 0.05) return `Procentele însumează ${t}%, trebuie să fie exact 100%.`;
    if (edit.ref_kg !== "" && !(numar(edit.ref_kg) > 0)) return "Greutatea de referință trebuie să fie un număr pozitiv sau goală.";
    return "";
  };

  const salveaza = async () => {
    const err = valideaza();
    if (err) { setEroare(err); return; }
    setSeSalveaza(true); setEroare("");
    try {
      const existente = retete.rows.filter((r) => r.echipament === edit.echipament);
      if (!edit.id && existente.length) { setEroare("Există deja o rețetă pentru acest echipament. Deschide-o și salveaz-o ca versiune nouă."); return; }
      const versiune = existente.length ? Math.max(...existente.map((r) => r.versiune)) + 1 : 1;
      const refKg = edit.ref_kg === "" ? null : numar(edit.ref_kg);
      const { data, error } = await sb.from("deee_retete").insert({ echipament: edit.echipament, versiune, ref_kg: refKg, activ: true, creat_de: currentUser || "" }).select();
      if (error) { setEroare("Eroare la salvare: " + error.message); return; }
      const nou = data[0];
      const randuri = edit.linii.map((l, i) => ({ reteta_id: nou.id, ord: i, fractie: l.fractie, cod: l.cod || "", procent: numar(l.procent) }));
      const { error: eL } = await sb.from("deee_retete_linii").insert(randuri);
      if (eL) {
        await sb.from("deee_retete").delete().eq("id", nou.id); // nu lasam o reteta fara fractii
        setEroare("Eroare la salvarea fracțiilor: " + eL.message);
        return;
      }
      // versiunile mai vechi raman in istoric, dar nu mai sunt cele active
      const vechi = existente.filter((r) => r.activ).map((r) => r.id);
      if (vechi.length) await sb.from("deee_retete").update({ activ: false }).in("id", vechi);
      logAction(edit.id ? "update" : "add", "deee_retete", nou.id, { echipament: edit.echipament, versiune, fractii: randuri.length, ...(edit.id ? { _inainte: { versiune: edit.versiune } } : {}) });
      setEdit(null);
      await Promise.all([retete.reload(), linii.reload()]);
    } finally { setSeSalveaza(false); }
  };

  const sterge = async (r) => {
    if (!confirmDel(`rețeta „${r.echipament}” v${r.versiune}`)) return;
    const snapshot = { reteta: r, linii: liniiPeReteta[r.id] || [] };
    const { error } = await sb.from("deee_retete").delete().eq("id", r.id);
    if (error) { alert("Eroare: " + error.message); return; }
    logAction("delete", "deee_retete", r.id, { echipament: r.echipament, versiune: r.versiune, _sters: snapshot });
    // daca s-a sters versiunea activa, cea mai recenta ramasa redevine activa
    const ramase = retete.rows.filter((x) => x.echipament === r.echipament && x.id !== r.id);
    if (r.activ && ramase.length && !ramase.some((x) => x.activ)) {
      const ultima = ramase.sort((a, b) => b.versiune - a.versiune)[0];
      await sb.from("deee_retete").update({ activ: true }).eq("id", ultima.id);
    }
    await Promise.all([retete.reload(), linii.reload()]);
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box" };
  const echipamenteActive = ech.rows.filter((e) => e.activ).sort((a, b) => colatie(a.den, b.den));
  const fractiiActive = frac.rows.filter((f) => f.activ).sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod));
  const totalEdit = edit ? total(edit.linii) : 0;
  const totalOk = Math.abs(totalEdit - 100) <= 0.05;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input style={{ ...inputSt, width: 240 }} placeholder="🔍 Caută echipament..." value={filtru} onChange={(e) => setFiltru(e.target.value)} />
        <label style={{ fontSize: 12, color: "#475569", display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}>
          <input type="checkbox" checked={arataVechi} onChange={(e) => setArataVechi(e.target.checked)} /> Arată și versiunile vechi
        </label>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={deschideNoua} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Rețetă nouă</button>
        </div>
      </div>

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={ui.th({ textAlign: "left" })}>Echipament</th>
              <th style={ui.th({ width: 70 })}>Versiune</th>
              <th style={ui.th({ width: 80 })}>Fracții</th>
              <th style={ui.th({ width: 80 })}>Total %</th>
              <th style={ui.th({ width: 90 })}>Ref. kg</th>
              <th style={ui.th({ width: 130 })}>Creată</th>
              <th style={ui.th({ width: 80 })}></th>
            </tr>
          </thead>
          <tbody>
            {!retete.incarcat && <tr><td colSpan={7} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {retete.incarcat && afisate.length === 0 && <tr><td colSpan={7} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Nicio rețetă. Apasă „+ Rețetă nouă”.</td></tr>}
            {afisate.map((r) => {
              const ls = liniiPeReteta[r.id] || [];
              const t = total(ls);
              return (
                <tr key={r.id} style={{ opacity: r.activ ? 1 : 0.55 }}>
                  <td style={ui.td({ fontWeight: 600 })}>{r.echipament}</td>
                  <td style={ui.td({ textAlign: "center" })}>v{r.versiune}{r.activ ? "" : " (veche)"}</td>
                  <td style={ui.td({ textAlign: "center" })}>{ls.length}</td>
                  <td style={ui.td({ textAlign: "center", fontWeight: 700, color: Math.abs(t - 100) <= 0.05 ? G : "#c62828" })}>{t}%</td>
                  <td style={ui.td({ textAlign: "right" })}>{r.ref_kg ?? "—"}</td>
                  <td style={ui.td({ textAlign: "center", fontSize: 11, color: "#64748b" })}>{new Date(r.created_at).toLocaleDateString("ro-RO")}{r.creat_de ? ` • ${r.creat_de}` : ""}</td>
                  <td style={ui.td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}>
                    <button onClick={() => deschideEditare(r)} title="Editează (se salvează ca versiune nouă)" style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>✏️</button>{" "}
                    <button onClick={() => sterge(r)} title="Șterge versiunea" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {edit && (
        <div onClick={() => !seSalveaza && setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(720px,100%)", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {edit.id ? `Editare rețetă — se salvează ca versiunea v${edit.versiune + 1}` : "Rețetă nouă"}
              </div>
              <button onClick={() => !seSalveaza && setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto" }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                <div style={{ flex: "2 1 260px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Echipament *</label>
                  <select disabled={!!edit.id} value={edit.echipament} onChange={(e) => setEdit((p) => ({ ...p, echipament: e.target.value }))} style={{ ...inputSt, width: "100%" }}>
                    <option value="">Alege echipamentul…</option>
                    {echipamenteActive.map((e) => <option key={e.id} value={e.den}>{e.den}</option>)}
                    {edit.echipament && !echipamenteActive.some((e) => e.den === edit.echipament) && <option value={edit.echipament}>{edit.echipament}</option>}
                  </select>
                </div>
                <div style={{ flex: "1 1 140px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }} title="Greutatea medie de referință a echipamentului">Ref. kg (opțional)</label>
                  <input style={{ ...inputSt, width: "100%", textAlign: "right" }} inputMode="decimal" value={edit.ref_kg} onChange={(e) => setEdit((p) => ({ ...p, ref_kg: e.target.value }))} placeholder="ex. 45,5" />
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#334155" }}>Fracții</div>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={ui.th({ textAlign: "left" })}>Fracție (cod EWC)</th>
                    <th style={ui.th({ width: 110 })}>Procent %</th>
                    <th style={ui.th({ width: 36 })}></th>
                  </tr>
                </thead>
                <tbody>
                  {edit.linii.map((l, i) => {
                    const idCurent = frac.rows.find((f) => f.den === l.fractie && f.cod === l.cod)?.id || "";
                    return (
                      <tr key={i}>
                        <td style={ui.td({ padding: 3 })}>
                          <select value={idCurent} onChange={(e) => alegeFractie(i, e.target.value)} style={{ ...inputSt, width: "100%" }}>
                            <option value="">Alege fracția…</option>
                            {fractiiActive.map((f) => <option key={f.id} value={f.id}>{f.den}{f.cod ? ` — ${f.cod}` : ""}</option>)}
                            {l.fractie && !idCurent && <option value="" disabled>{l.fractie} — {l.cod} (inactivă)</option>}
                          </select>
                        </td>
                        <td style={ui.td({ padding: 3 })}>
                          <input style={{ ...inputSt, width: "100%", textAlign: "right" }} inputMode="decimal" value={l.procent} onChange={(e) => setLinie(i, { procent: e.target.value })} placeholder="0" />
                        </td>
                        <td style={ui.td({ textAlign: "center", padding: 2 })}>
                          <button onClick={() => setEdit((p) => ({ ...p, linii: p.linii.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }} title="Scoate rândul">✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <button onClick={() => setEdit((p) => ({ ...p, linii: [...p.linii, { fractie: "", cod: "", procent: "" }] }))} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă fracție</button>
                <div style={{ fontWeight: 700, fontSize: 13, color: totalOk ? G : "#c62828" }}>Total: {totalEdit}% {totalOk ? "✓" : "(trebuie 100%)"}</div>
              </div>
              {eroare && <div style={{ marginTop: 10, color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
              {edit.id && <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>💡 Versiunea veche (v{edit.versiune}) rămâne păstrată în istoric; dezmembrările deja făcute nu se schimbă.</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button disabled={seSalveaza} onClick={() => setEdit(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button disabled={seSalveaza} onClick={salveaza} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: seSalveaza ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
                {seSalveaza ? "Se salvează…" : edit.id ? `Salvează ca versiune nouă (v${edit.versiune + 1})` : "Salvează"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
