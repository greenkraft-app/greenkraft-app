import { useState, useMemo } from "react";
import { useTabela, numar, colatie } from "./hooks";
import { useStoc } from "./stoc";
import { calculeazaRate, clasificareFractie, FARA_CAT } from "./rate";
import { fmtKg } from "./constante";

const pct = (n) => `${(Number(n) || 0).toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const aSet = (v) => v !== null && v !== undefined && v !== "";

// Rata de reciclare / recuperare pe categorii WEEELABEX, comparata cu tintele (Rate R&R din WiseWeee).
export default function RateRR({ sb, G, ui, logAction }) {
  const s = useStoc(sb);
  const ech = useTabela(sb, "deee_echipamente");
  const frac = useTabela(sb, "deee_fractii");
  const cat = useTabela(sb, "deee_categorii");
  const org = useTabela(sb, "deee_organizatii");
  const [an, setAn] = useState("");
  const [fOrg, setFOrg] = useState("");
  const [doarVanzari, setDoarVanzari] = useState(false);
  const [diagrama, setDiagrama] = useState(true);
  const [mesaj, setMesaj] = useState("");

  const ani = useMemo(() => [...new Set([...s.dz.rows.map((d) => d.data), ...s.van.rows.map((v) => v.data)].map((d) => String(d).slice(0, 4)).filter(Boolean))].sort().reverse(), [s.dz.rows, s.van.rows]);
  const organizatii = useMemo(() => org.rows.filter((o) => o.activ).map((o) => o.den).sort(colatie), [org.rows]);
  const lipsaColoane = frac.rows.length > 0 && !("rd_reciclare" in frac.rows[0]);

  const rez = useMemo(() => calculeazaRate({
    dz: s.dz.rows, dzE: s.dzE.rows, dzF: s.dzF.rows, van: s.van.rows, ech: ech.rows, fractii: frac.rows, categorii: cat.rows, an, org: fOrg, doarVanzari,
  }), [s.dz.rows, s.dzE.rows, s.dzF.rows, s.van.rows, ech.rows, frac.rows, cat.rows, an, fOrg, doarVanzari]);

  const denCat = Object.fromEntries(cat.rows.map((c) => [c.cat, c.denumire]));

  const card = (t, v, c, sub) => (
    <div style={{ flex: "1 1 170px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 14px", boxShadow: "0 1px 2px rgba(15,23,42,.05)" }}>
      <div style={{ fontSize: 10, color: "#64748b" }}>{t}</div><div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
      {sub && <div style={{ fontSize: 10, color: "#64748b" }}>{sub}</div>}
    </div>
  );
  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box" };
  const stare = (ok) => ok === null ? "—" : ok ? <span style={{ color: "#047857", fontWeight: 700 }}>✓</span> : <span style={{ color: "#c62828", fontWeight: 700 }}>✗</span>;

  return (
    <div>
      {lipsaColoane && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 13, color: "#78350f" }}>
          <b>Mai trebuie un pas:</b> rulează o singură dată fișierul <b>supabase-deee-10-rate-clasificare.sql</b> în Supabase (SQL Editor), apoi reîncarcă pagina. Până atunci fracțiile nevândute nu au clasificare.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {card("Total input (kg)", fmtKg(rez.total.input), "#1e293b", `${rez.nrOperatiuni} operațiuni`)}
        {card("Total reciclat (kg)", fmtKg(rez.total.R), "#047857")}
        {card("Rata reciclare", pct(rez.total.rataR), rez.total.rataR + 0.005 >= rez.total.tintaR ? "#047857" : "#c62828", `țintă ponderată ${pct(rez.total.tintaR)}`)}
        {card("Rata recuperare", pct(rez.total.rataV), rez.total.rataV + 0.005 >= rez.total.tintaV ? "#047857" : "#c62828", `țintă ponderată ${pct(rez.total.tintaV)}`)}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <select style={{ ...inputSt, width: 110 }} value={an} onChange={(e) => setAn(e.target.value)}><option value="">Toți anii</option>{ani.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        <select style={{ ...inputSt, width: 160 }} value={fOrg} onChange={(e) => setFOrg(e.target.value)}><option value="">Toate organizațiile</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        <div style={{ display: "flex", border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden" }}>
          {[[false, "Total"], [true, "Doar vânzări"]].map(([v, t]) => (
            <button key={t} onClick={() => setDoarVanzari(v)} style={{ border: "none", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, background: doarVanzari === v ? G : "#fff", color: doarVanzari === v ? "#fff" : "#475569" }}>{t}</button>
          ))}
        </div>
        <label style={{ fontSize: 12, color: "#475569", display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}><input type="checkbox" checked={diagrama} onChange={(e) => setDiagrama(e.target.checked)} /> Diagramă</label>
      </div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>
        {doarVanzari
          ? "Doar vânzări: input-ul rămâne cel al echipamentelor dezmembrate, iar output-ul și ratele se calculează numai din fracțiile vândute care au procente R/D (sau clasificare implicită)."
          : "Total: baza e cantitatea de echipamente dezmembrate; fracțiile vândute folosesc procentele R/D ale vânzării, cele nevândute clasificarea implicită."}
      </div>

      {(rez.faraClasificare.length > 0 || rez.vanzariFaraProcente > 0) && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "#78350f" }}>
          {rez.faraClasificare.length > 0 && <div>⚠️ {rez.faraClasificare.length} fracții nu au nici procente din vânzări, nici clasificare implicită (nu se numără ca reciclat/valorificat): {rez.faraClasificare.slice(0, 5).map((f) => `${f.den} (${f.cod}) ${fmtKg(f.kg)} kg`).join("; ")}{rez.faraClasificare.length > 5 ? "…" : ""}. Completează-le mai jos, la „Clasificare implicită”.</div>}
          {rez.vanzariFaraProcente > 0 && <div>ℹ️ {rez.vanzariFaraProcente} vânzări nu au procente R/D completate — se folosește clasificarea implicită (Vânzări fracții → „% Procente R/D”).</div>}
        </div>
      )}

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
          <thead><tr>
            <th style={ui.th({ textAlign: "left" })}>Categorie</th><th style={ui.th({ width: 100 })}>Input (kg)</th><th style={ui.th({ width: 100 })}>Output (kg)</th>
            <th style={ui.th({ width: 80 })} title="(Input − Output) / Input">Pierderi</th><th style={ui.th({ width: 85 })}>Rata reciclare</th><th style={ui.th({ width: 65 })}>Țintă</th>
            <th style={ui.th({ width: 85 })}>Rata recuperare</th><th style={ui.th({ width: 65 })}>Țintă</th><th style={ui.th({ width: 80 })}>Status</th>
          </tr></thead>
          <tbody>
            {!s.incarcat && <tr><td colSpan={9} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {s.incarcat && rez.randuri.length === 0 && <tr><td colSpan={9} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Nicio dezmembrare în perioada aleasă.</td></tr>}
            {rez.randuri.map((r) => {
              const ok = r.okR !== false && r.okV !== false;
              return (
                <tr key={r.cat}>
                  <td style={ui.td({ fontWeight: 600 })}>{r.cat === FARA_CAT ? "Fără categorie" : `${r.cat} ${denCat[r.cat] || ""}`}{r.cat === FARA_CAT && <span style={{ fontSize: 10, color: "#92400e" }}> — alege categoria în Nomenclatoare → Echipamente</span>}</td>
                  <td style={ui.td({ textAlign: "right" })}>{fmtKg(r.input)}</td>
                  <td style={ui.td({ textAlign: "right" })}>{fmtKg(r.output)}</td>
                  <td style={ui.td({ textAlign: "right", color: "#92400e" })}>{pct(r.pierderiPct)}</td>
                  <td style={ui.td({ textAlign: "right", fontWeight: 700 })}>{pct(r.rataR)} {stare(r.okR)}</td>
                  <td style={ui.td({ textAlign: "right", color: "#64748b" })}>{r.tintaR === null ? "—" : pct(r.tintaR)}</td>
                  <td style={ui.td({ textAlign: "right", fontWeight: 700 })}>{pct(r.rataV)} {stare(r.okV)}</td>
                  <td style={ui.td({ textAlign: "right", color: "#64748b" })}>{r.tintaV === null ? "—" : pct(r.tintaV)}</td>
                  <td style={ui.td({ textAlign: "center" })}><span style={{ background: ok ? "#e8f5e9" : "#fef2f2", color: ok ? "#047857" : "#c62828", borderRadius: 4, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>{ok ? "Peste țintă" : "Sub țintă"}</span></td>
                </tr>
              );
            })}
            {rez.randuri.length > 0 && (
              <tr style={{ background: "#f8fafc" }}>
                <td style={ui.td({ fontWeight: 800 })}>TOTAL</td>
                <td style={ui.td({ textAlign: "right", fontWeight: 800 })}>{fmtKg(rez.total.input)}</td><td style={ui.td()}></td><td style={ui.td()}></td>
                <td style={ui.td({ textAlign: "right", fontWeight: 800 })}>{pct(rez.total.rataR)}</td><td style={ui.td({ textAlign: "right", color: "#64748b" })}>{pct(rez.total.tintaR)}</td>
                <td style={ui.td({ textAlign: "right", fontWeight: 800 })}>{pct(rez.total.rataV)}</td><td style={ui.td({ textAlign: "right", color: "#64748b" })}>{pct(rez.total.tintaV)}</td><td style={ui.td()}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {diagrama && rez.randuri.length > 0 && (
        <div style={{ marginTop: 14, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Rata reciclare / recuperare față de țintă</div>
          {rez.randuri.map((r) => (
            <div key={r.cat} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{r.cat}</div>
              {[["Reciclare", r.rataR, r.tintaR, "#2e7d32"], ["Recuperare", r.rataV, r.tintaV, "#1565c0"]].map(([t, v, tinta, c]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ width: 70, fontSize: 10, color: "#64748b" }}>{t}</div>
                  <div style={{ position: "relative", flex: 1, height: 12, background: "#eef2f6", borderRadius: 6 }}>
                    <div style={{ width: `${Math.min(v, 100)}%`, height: "100%", background: c, borderRadius: 6 }} />
                    {tinta !== null && <div title={`țintă ${tinta}%`} style={{ position: "absolute", left: `${Math.min(tinta, 100)}%`, top: -2, bottom: -2, width: 2, background: "#c62828" }} />}
                  </div>
                  <div style={{ width: 60, fontSize: 10, textAlign: "right" }}>{pct(v)}</div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize: 10, color: "#64748b" }}>Linia roșie = ținta categoriei.</div>
        </div>
      )}

      <Clasificare {...{ sb, G, ui, logAction, frac, inputSt, setMesaj }} />
      {mesaj && <div style={{ color: "#c62828", fontSize: 12, marginTop: 6 }}>{mesaj}</div>}
    </div>
  );
}

// Clasificarea implicita a fiecarei fractii: cat se recicleaza / valorifica / elimina (insumeaza 100 sau toate goale).
function Clasificare({ sb, G, ui, logAction, frac, inputSt, setMesaj }) {
  const [filtru, setFiltru] = useState("");
  const [locale, setLocale] = useState({}); // id -> { r, v, e } doar pentru randurile modificate
  const q = filtru.trim().toLowerCase();
  const randuri = frac.rows.filter((f) => f.activ && (!q || `${f.den} ${f.cod}`.toLowerCase().includes(q))).sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod));
  const val = (f) => locale[f.id] || { r: aSet(f.rd_reciclare) ? String(f.rd_reciclare) : "", v: aSet(f.rd_valorificare) ? String(f.rd_valorificare) : "", e: aSet(f.rd_eliminare) ? String(f.rd_eliminare) : "" };
  const seteaza = (f, camp, v) => setLocale((p) => ({ ...p, [f.id]: { ...val(f), [camp]: v } }));
  const total = (x) => Math.round(((numar(x.r) || 0) + (numar(x.v) || 0) + (numar(x.e) || 0)) * 100) / 100;
  const gol = (x) => x.r === "" && x.v === "" && x.e === "";

  const salveaza = async (f) => {
    const x = val(f);
    if (!gol(x) && Math.abs(total(x) - 100) > 0.01) { setMesaj(`${f.den} (${f.cod}): procentele însumează ${total(x)}%, trebuie 100%.`); return; }
    const upd = gol(x) ? { rd_reciclare: null, rd_valorificare: null, rd_eliminare: null } : { rd_reciclare: numar(x.r) || 0, rd_valorificare: numar(x.v) || 0, rd_eliminare: numar(x.e) || 0 };
    const { error } = await sb.from("deee_fractii").update(upd).eq("id", f.id);
    if (error) { setMesaj("Eroare: " + error.message); return; }
    setMesaj("");
    frac.setRows((p) => p.map((r) => (r.id === f.id ? { ...r, ...upd } : r)));
    setLocale((p) => { const n = { ...p }; delete n[f.id]; return n; });
    logAction("update", "deee_fractii", f.id, { fractie: f.den, cod: f.cod, ...upd, _inainte: { rd_reciclare: f.rd_reciclare ?? null, rd_valorificare: f.rd_valorificare ?? null, rd_eliminare: f.rd_eliminare ?? null } });
  };

  const nefacute = frac.rows.filter((f) => f.activ && !clasificareFractie(f)).length;
  return (
    <details style={{ marginTop: 16 }}>
      <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#334155" }}>Clasificare implicită a fracțiilor {nefacute > 0 && <span style={{ color: "#92400e", fontWeight: 600 }}>({nefacute} necompletate)</span>}</summary>
      <div style={{ fontSize: 11, color: "#64748b", margin: "6px 0" }}>Cât din fiecare fracție se reciclează, se valorifică (alt fel decât reciclare) sau se elimină. Se folosește pentru fracțiile nevândute sau vândute fără procente R/D. Valorile pre-completate sunt orientative — verifică-le.</div>
      <input style={{ ...inputSt, width: 240, marginBottom: 8 }} placeholder="🔍 Caută fracție..." value={filtru} onChange={(e) => setFiltru(e.target.value)} />
      <div style={{ ...ui.TBL, maxHeight: 420 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
          <thead><tr>
            <th style={ui.th({ textAlign: "left" })}>Fracție</th><th style={ui.th({ width: 80 })}>Cod</th>
            <th style={ui.th({ width: 90 })}>Reciclare %</th><th style={ui.th({ width: 90 })}>Valorif. %</th><th style={ui.th({ width: 90 })}>Elimin. %</th><th style={ui.th({ width: 60 })}>Total</th><th style={ui.th({ width: 80 })}></th>
          </tr></thead>
          <tbody>
            {randuri.map((f) => {
              const x = val(f); const murdar = !!locale[f.id]; const t = total(x);
              const celula = (camp) => <td style={ui.td({ padding: 2 })}><input style={{ ...inputSt, width: "100%", textAlign: "right", padding: "4px 6px" }} inputMode="decimal" value={x[camp]} onChange={(e) => seteaza(f, camp, e.target.value)} /></td>;
              return (
                <tr key={f.id} style={{ background: murdar ? "#fffbeb" : undefined }}>
                  <td style={ui.td({ fontSize: 12, fontWeight: 600 })}>{f.den}</td><td style={ui.td({ textAlign: "center", fontSize: 11 })}>{f.cod}</td>
                  {celula("r")}{celula("v")}{celula("e")}
                  <td style={ui.td({ textAlign: "center", fontSize: 11, fontWeight: 700, color: gol(x) ? "#94a3b8" : Math.abs(t - 100) <= 0.01 ? "#047857" : "#c62828" })}>{gol(x) ? "—" : `${t}%`}</td>
                  <td style={ui.td({ textAlign: "center", padding: 2 })}>{murdar && <button onClick={() => salveaza(f)} style={{ background: G, color: "#fff", border: "none", borderRadius: 5, padding: "3px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Salvează</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
