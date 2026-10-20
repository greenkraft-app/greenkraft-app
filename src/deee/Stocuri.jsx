import { useState, useMemo } from "react";
import { useTabela, numar, colatie } from "./hooks";
import { useStoc } from "./stoc";
import { COD_EWC, dataRo, fmtKg } from "./constante";

const azi = () => new Date().toISOString().slice(0, 10);

// Stocurile de echipamente si de fractii, calculate din achizitii, dezmembrari si stocul initial.
// "Stoc initial / ajustare" acopera ce aveai inainte de aplicatie si corectiile (kg negative = scadere).
export default function Stocuri({ sb, G, ui, currentUser, logAction, confirmDel }) {
  const s = useStoc(sb);
  const ech = useTabela(sb, "deee_echipamente");
  const frac = useTabela(sb, "deee_fractii");
  const org = useTabela(sb, "deee_organizatii");
  const [tab, setTab] = useState("echipamente");
  const [fOrg, setFOrg] = useState("");
  const [q, setQ] = useState("");
  const [ascunde, setAscunde] = useState(false);
  const [edit, setEdit] = useState(null);
  const [eroare, setEroare] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);

  const organizatii = useMemo(() => org.rows.filter((o) => o.activ).map((o) => o.den).sort(colatie), [org.rows]);
  const randuri = (tab === "echipamente" ? s.stoc.echipamente : s.stoc.fractii)
    .filter((r) => (!fOrg || r.org === fOrg) && (!q || `${r.den} ${r.cod}`.toLowerCase().includes(q.trim().toLowerCase())) && (!ascunde || Math.abs(r.disp) > 0.0005))
    .sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod) || colatie(a.org, b.org));

  const sumar = randuri.reduce((x, r) => ({ total: x.total + r.total, scos: x.scos + r.scos, disp: x.disp + r.disp, buc: x.buc + r.bucDisp }), { total: 0, scos: 0, disp: 0, buc: 0 });
  const eticScos = tab === "echipamente" ? "Dezmembrat" : "Vândut/Consumat";

  const deschide = () => { setEroare(""); setEdit({ tip: tab === "echipamente" ? "echipament" : "fractie", den: "", cod: "", organizatie: "", kg: "", buc: "", data: azi(), motiv: "" }); };

  const salveaza = async () => {
    const kg = numar(edit.kg);
    if (!edit.den.trim()) { setEroare("Alege " + (edit.tip === "echipament" ? "echipamentul." : "fracția.")); return; }
    if (!edit.organizatie) { setEroare("Alege organizația."); return; }
    if (!Number.isFinite(kg) || kg === 0) { setEroare("Greutatea trebuie să fie un număr diferit de 0 (negativ = scădere)."); return; }
    if (edit.buc !== "" && !Number.isInteger(numar(edit.buc))) { setEroare("Bucățile trebuie să fie un număr întreg."); return; }
    if (!edit.motiv.trim()) { setEroare("Scrie motivul (ex. „stoc la începutul utilizării aplicației” sau „corecție inventar”)."); return; }
    setSeSalveaza(true); setEroare("");
    try {
      const row = { tip: edit.tip, den: edit.den.trim(), cod: edit.cod.trim(), organizatie: edit.organizatie, kg, buc: edit.buc === "" ? 0 : numar(edit.buc), data: edit.data || null, motiv: edit.motiv.trim(), creat_de: currentUser || "" };
      const { data, error } = await sb.from("deee_stoc_initial").insert(row).select();
      if (error) { setEroare("Eroare: " + error.message); return; }
      s.ini.setRows((p) => [...p, data[0]]);
      logAction("add", "deee_stoc_initial", data[0].id, { tip: row.tip, den: row.den, cod: row.cod, organizatie: row.organizatie, kg: row.kg, buc: row.buc, motiv: row.motiv });
      setEdit(null);
    } finally { setSeSalveaza(false); }
  };

  const stergeAjustare = async (r) => {
    if (!confirmDel(`ajustarea „${r.den}” ${fmtKg(r.kg)} kg`)) return;
    const { error } = await sb.from("deee_stoc_initial").delete().eq("id", r.id);
    if (error) { alert("Eroare: " + error.message); return; }
    s.ini.setRows((p) => p.filter((x) => x.id !== r.id));
    logAction("delete", "deee_stoc_initial", r.id, { den: r.den, kg: r.kg, _sters: r });
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const card = (t, v, c) => (
    <div style={{ flex: "1 1 150px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 14px", boxShadow: "0 1px 2px rgba(15,23,42,.05)" }}>
      <div style={{ fontSize: 10, color: "#64748b" }}>{t}</div><div style={{ fontSize: 16, fontWeight: 800, color: c }}>{v}</div>
    </div>
  );
  const subSt = (k) => ({ padding: "6px 16px", cursor: "pointer", border: "none", fontWeight: 700, fontSize: 12, borderRadius: 8, marginRight: 4, background: tab === k ? G : "#eef2f6", color: tab === k ? "#fff" : "#475569" });
  const ajustari = [...s.ini.rows].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 25);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {card(tab === "echipamente" ? "Total echipamente (kg)" : "Total fracții (kg)", fmtKg(sumar.total), "#1e293b")}
        {card(eticScos + " (kg)", fmtKg(sumar.scos), "#1565c0")}
        {card("Disponibil (kg)", fmtKg(sumar.disp), sumar.disp < -0.0005 ? "#c62828" : "#047857")}
        {tab === "echipamente" && card("Bucăți disponibile", sumar.buc.toLocaleString("ro-RO"), "#6a1b9a")}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <button style={subSt("echipamente")} onClick={() => setTab("echipamente")}>Echipamente ({s.stoc.echipamente.length})</button>
        <button style={subSt("fractii")} onClick={() => setTab("fractii")}>Fracții ({s.stoc.fractii.length})</button>
        <input style={{ ...inputSt, width: 220, marginLeft: 8 }} placeholder="🔍 Caută..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ ...inputSt, width: 150 }} value={fOrg} onChange={(e) => setFOrg(e.target.value)}>
          <option value="">Toate organizațiile</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <label style={{ fontSize: 12, display: "flex", gap: 5, alignItems: "center", cursor: "pointer", color: "#475569" }}><input type="checkbox" checked={ascunde} onChange={(e) => setAscunde(e.target.checked)} /> Ascunde stocul epuizat</label>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={deschide} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Stoc inițial / ajustare</button>
        </div>
      </div>

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 760 }}>
          <thead>
            <tr>
              <th style={ui.th({ textAlign: "left" })}>{tab === "echipamente" ? "Echipament" : "Fracție"}</th>
              <th style={ui.th({ width: 90 })}>Cod EWC</th>
              <th style={ui.th({ width: 110 })}>Organizație</th>
              <th style={ui.th({ width: 120 })}>Total (kg)</th>
              <th style={ui.th({ width: 120 })}>{eticScos} (kg)</th>
              <th style={ui.th({ width: 120 })}>Disponibil (kg)</th>
              {tab === "echipamente" && <th style={ui.th({ width: 80 })}>Buc disp.</th>}
            </tr>
          </thead>
          <tbody>
            {!s.incarcat && <tr><td colSpan={7} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {s.incarcat && randuri.length === 0 && <tr><td colSpan={7} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Nimic în stoc. Stocul apare din Achiziții, Dezmembrări sau „+ Stoc inițial”.</td></tr>}
            {randuri.map((r) => (
              <tr key={r.den + r.cod + r.org} style={{ opacity: Math.abs(r.disp) <= 0.0005 ? 0.55 : 1 }}>
                <td style={ui.td({ fontWeight: 600 })}>{r.den}</td>
                <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{r.cod || "—"}</td>
                <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{r.org}</td>
                <td style={ui.td({ textAlign: "right" })}>{fmtKg(r.total)}</td>
                <td style={ui.td({ textAlign: "right" })}>{fmtKg(r.scos)}</td>
                <td style={ui.td({ textAlign: "right", fontWeight: 800, color: r.disp < -0.0005 ? "#c62828" : "#047857" })}>{fmtKg(r.disp)}</td>
                {tab === "echipamente" && <td style={ui.td({ textAlign: "right" })}>{r.bucDisp}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tab === "fractii" && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>„Vândut/Consumat” vine din modulul Vânzări fracții.</div>}

      {ajustari.length > 0 && (
        <details style={{ marginTop: 18 }}>
          <summary style={{ cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#334155" }}>Stoc inițial și ajustări ({s.ini.rows.length})</summary>
          <div style={{ ...ui.TBL, marginTop: 8, maxHeight: 280 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
              <thead><tr>
                <th style={ui.th({ width: 90 })}>Data</th><th style={ui.th({ width: 90 })}>Tip</th><th style={ui.th({ textAlign: "left" })}>Denumire</th>
                <th style={ui.th({ width: 80 })}>Cod</th><th style={ui.th({ width: 100 })}>Org.</th><th style={ui.th({ width: 110 })}>Kg</th><th style={ui.th({ width: 60 })}>Buc</th>
                <th style={ui.th({ textAlign: "left" })}>Motiv</th><th style={ui.th({ width: 40 })}></th>
              </tr></thead>
              <tbody>
                {ajustari.map((r) => (
                  <tr key={r.id}>
                    <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{dataRo(r.data)}</td>
                    <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{r.tip}</td>
                    <td style={ui.td({ fontWeight: 600 })}>{r.den}</td>
                    <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{r.cod || "—"}</td>
                    <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{r.organizatie}</td>
                    <td style={ui.td({ textAlign: "right", fontWeight: 700, color: Number(r.kg) < 0 ? "#c62828" : "#047857" })}>{fmtKg(r.kg)}</td>
                    <td style={ui.td({ textAlign: "right" })}>{r.buc}</td>
                    <td style={ui.td({ fontSize: 11, color: "#64748b" })}>{r.motiv}{r.creat_de ? ` • ${r.creat_de}` : ""}</td>
                    <td style={ui.td({ textAlign: "center", padding: 2 })}><button onClick={() => stergeAjustare(r)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {edit && (
        <div onClick={() => !seSalveaza && setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(620px,100%)", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Stoc inițial / ajustare</div>
              <button onClick={() => !seSalveaza && setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 100%", fontSize: 12, color: "#64748b" }}>Adaugă ce aveai în stoc înainte de aplicație, sau corectează o diferență. Greutate negativă = scădere din stoc.</div>
              <div style={{ flex: "1 1 160px" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Tip *</label>
                <select style={inputSt} value={edit.tip} onChange={(e) => setEdit((p) => ({ ...p, tip: e.target.value, den: "", cod: "" }))}>
                  <option value="echipament">Echipament</option><option value="fractie">Fracție</option>
                </select>
              </div>
              <div style={{ flex: "2 1 260px" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{edit.tip === "echipament" ? "Echipament" : "Fracție (cod EWC)"} *</label>
                {edit.tip === "echipament" ? (
                  <select style={inputSt} value={edit.den} onChange={(e) => setEdit((p) => ({ ...p, den: e.target.value }))}>
                    <option value="">Alege echipamentul…</option>
                    {ech.rows.filter((e) => e.activ).sort((a, b) => colatie(a.den, b.den)).map((e) => <option key={e.id} value={e.den}>{e.den}</option>)}
                  </select>
                ) : (
                  <select style={inputSt} value={edit.den ? edit.den + "|" + edit.cod : ""} onChange={(e) => { const [den, cod] = e.target.value.split("|"); setEdit((p) => ({ ...p, den: den || "", cod: cod || "" })); }}>
                    <option value="">Alege fracția…</option>
                    {frac.rows.filter((f) => f.activ).sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod)).map((f) => <option key={f.id} value={f.den + "|" + f.cod}>{f.den}{f.cod ? ` — ${f.cod}` : ""}</option>)}
                  </select>
                )}
              </div>
              {edit.tip === "echipament" && (
                <div style={{ flex: "1 1 140px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Cod HG856</label>
                  <input list="deee-stoc-coduri" style={inputSt} value={edit.cod} onChange={(e) => setEdit((p) => ({ ...p, cod: e.target.value }))} placeholder="ex. 20 01 36" />
                  <datalist id="deee-stoc-coduri">{COD_EWC.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
              )}
              <div style={{ flex: "1 1 170px" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Organizație *</label>
                <select style={inputSt} value={edit.organizatie} onChange={(e) => setEdit((p) => ({ ...p, organizatie: e.target.value }))}>
                  <option value="">Alege…</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 130px" }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Kg *</label><input style={{ ...inputSt, textAlign: "right", fontWeight: 700 }} inputMode="decimal" value={edit.kg} onChange={(e) => setEdit((p) => ({ ...p, kg: e.target.value }))} placeholder="ex. 12500 sau -300" /></div>
              <div style={{ flex: "1 1 100px" }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Bucăți</label><input style={{ ...inputSt, textAlign: "right" }} inputMode="numeric" value={edit.buc} onChange={(e) => setEdit((p) => ({ ...p, buc: e.target.value }))} /></div>
              <div style={{ flex: "1 1 150px" }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Data</label><input type="date" style={inputSt} value={edit.data} onChange={(e) => setEdit((p) => ({ ...p, data: e.target.value }))} /></div>
              <div style={{ flex: "1 1 100%" }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Motiv *</label><input style={inputSt} value={edit.motiv} onChange={(e) => setEdit((p) => ({ ...p, motiv: e.target.value }))} placeholder="ex. stoc la începutul utilizării aplicației" /></div>
              {eroare && <div style={{ flex: "1 1 100%", color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button disabled={seSalveaza} onClick={() => setEdit(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button disabled={seSalveaza} onClick={salveaza} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: seSalveaza ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
