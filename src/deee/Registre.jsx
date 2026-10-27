import { useState, useMemo, useRef, useEffect } from "react";
import { useTabela } from "./hooks";
import { useStoc } from "./stoc";
import { dataRo, lunaDin } from "./constante";
import { GRUPE, TOATE, htmlTabel, registruGenerat, textCamp, numeLuna } from "./registreDef";

const azi = () => new Date().toISOString().slice(0, 10);

// Semnatura desenata cu mouse-ul / degetul; se pastreaza ca imagine PNG (data URL).
function Semnatura({ valoare, onChange }) {
  const ref = useRef(null);
  const deseneaza = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); ctx.clearRect(0, 0, c.width, c.height);
    if (valoare) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height); img.src = valoare; }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const poz = (ev) => { const c = ref.current, r = c.getBoundingClientRect(); const p = ev.touches ? ev.touches[0] : ev; return [((p.clientX - r.left) / r.width) * c.width, ((p.clientY - r.top) / r.height) * c.height]; };
  const start = (ev) => { ev.preventDefault(); deseneaza.current = true; const ctx = ref.current.getContext("2d"); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#111"; const [x, y] = poz(ev); ctx.beginPath(); ctx.moveTo(x, y); };
  const mut = (ev) => { if (!deseneaza.current) return; ev.preventDefault(); const ctx = ref.current.getContext("2d"); const [x, y] = poz(ev); ctx.lineTo(x, y); ctx.stroke(); };
  const stop = () => { if (!deseneaza.current) return; deseneaza.current = false; onChange(ref.current.toDataURL("image/png")); };
  const sterge = () => { const c = ref.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); onChange(""); };
  return (
    <div>
      <canvas ref={ref} width={360} height={110} style={{ width: "100%", maxWidth: 360, height: 110, border: "1px dashed #94a3b8", borderRadius: 8, background: "#fff", touchAction: "none", cursor: "crosshair" }}
        onMouseDown={start} onMouseMove={mut} onMouseUp={stop} onMouseLeave={stop} onTouchStart={start} onTouchMove={mut} onTouchEnd={stop} />
      <button type="button" onClick={sterge} style={{ background: "none", border: "none", color: "#e53935", cursor: "pointer", fontSize: 11, padding: 0 }}>Șterge semnătura</button>
    </div>
  );
}

// Registrele WEEELABEX / EN 50625-1 / GDPR: inregistrari cu semnatura, cautare, perioada si export PDF (tiparire);
// cele de trasabilitate se genereaza din achizitii, dezmembrari si vanzari.
export default function Registre({ sb, G, ui, currentUser, logAction, confirmDel }) {
  const reg = useTabela(sb, "deee_registre");
  const s = useStoc(sb);
  const [k, setK] = useState("vizitatori");
  const [q, setQ] = useState("");
  const [de, setDe] = useState("");
  const [pana, setPana] = useState("");
  const [edit, setEdit] = useState(null); // { id|null, data, d:{}, sem, sem2 }
  const [eroare, setEroare] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);
  const [gAn, setGAn] = useState(String(new Date().getFullYear()));
  const [gLuna, setGLuna] = useState("");

  const def = TOATE.find((r) => r.k === k);
  const dataEt = def.dataEt || "Data";
  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };

  const randuri = useMemo(() => {
    if (!def.camp) return [];
    const t = q.trim().toLowerCase();
    return reg.rows.filter((r) => r.registru === k && (!de || r.data >= de) && (!pana || r.data <= pana)
      && (!t || JSON.stringify(r.date || {}).toLowerCase().includes(t)))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.created_at).localeCompare(String(a.created_at)));
  }, [reg.rows, k, q, de, pana, def]);

  const camp = (c) => def.camp.find((x) => x.k === c);
  const nou = () => { setEroare(""); setEdit({ id: null, data: azi(), d: Object.fromEntries(def.camp.map((c) => [c.k, c.t === "b" ? false : c.t === "m" ? [] : ""])), sem: "", sem2: "" }); };
  const editeaza = (r) => { setEroare(""); setEdit({ id: r.id, data: r.data, d: { ...Object.fromEntries(def.camp.map((c) => [c.k, c.t === "b" ? false : c.t === "m" ? [] : ""])), ...(r.date || {}) }, sem: r.semnatura || "", sem2: r.semnatura2 || "" }); };
  const setD = (c, v) => setEdit((p) => ({ ...p, d: { ...p.d, [c]: v } }));

  const salveaza = async () => {
    if (!edit.data) { setEroare(`Completează „${dataEt}”.`); return; }
    for (const c of def.camp) if (c.req && !String(edit.d[c.k] ?? "").trim()) { setEroare(`Completează „${c.l}”.`); return; }
    if (def.k === "neconformitati" && edit.d.termen && edit.data) {
      const lim = new Date(edit.data); lim.setMonth(lim.getMonth() + 3);
      if (edit.d.termen > lim.toISOString().slice(0, 10)) { setEroare("Termenul limită depășește 3 luni de la data constatării."); return; }
    }
    setSeSalveaza(true); setEroare("");
    try {
      const row = { registru: k, data: edit.data, date: edit.d, semnatura: edit.sem || null, semnatura2: edit.sem2 || null };
      if (!edit.id) {
        const { data, error } = await sb.from("deee_registre").insert({ ...row, creat_de: currentUser || "" }).select();
        if (error) { setEroare("Eroare: " + error.message); return; }
        reg.setRows((p) => [...p, data[0]]);
        logAction("add", "deee_registre", data[0].id, { registru: def.l, data: row.data, ...edit.d });
      } else {
        const vechi = reg.rows.find((r) => r.id === edit.id);
        const { error } = await sb.from("deee_registre").update(row).eq("id", edit.id);
        if (error) { setEroare("Eroare: " + error.message); return; }
        reg.setRows((p) => p.map((r) => (r.id === edit.id ? { ...r, ...row } : r)));
        logAction("update", "deee_registre", edit.id, { registru: def.l, data: row.data, ...edit.d, _inainte: { data: vechi?.data, ...(vechi?.date || {}) } });
      }
      setEdit(null);
    } finally { setSeSalveaza(false); }
  };

  const sterge = async (r) => {
    if (!confirmDel(`înregistrarea din ${dataRo(r.data)} (${def.l})`)) return;
    const { error } = await sb.from("deee_registre").delete().eq("id", r.id);
    if (error) { alert("Eroare: " + error.message); return; }
    reg.setRows((p) => p.filter((x) => x.id !== r.id));
    logAction("delete", "deee_registre", r.id, { registru: def.l, data: r.data, _sters: r });
  };

  const tipareste = (html) => {
    const w = window.open("", "_blank");
    if (!w) { alert("Browserul a blocat fereastra de tipărire. Permite pop-up-urile pentru această pagină și încearcă din nou."); return; }
    w.document.open(); w.document.write(html); w.document.close();
  };
  const perioada = `${de ? dataRo(de) : "început"} – ${pana ? dataRo(pana) : "azi"}`;
  const exportPdf = () => {
    const cols = [dataEt, ...def.camp.map((c) => c.l), ...(def.sem ? ["Semnătură"] : []), ...(def.sem > 1 ? ["Semnătură 2"] : [])];
    const rows = randuri.map((r) => [dataRo(r.data), ...def.camp.map((c) => textCamp(c, r.date?.[c.k])), ...(def.sem ? [r.semnatura ? { img: r.semnatura } : ""] : []), ...(def.sem > 1 ? [r.semnatura2 ? { img: r.semnatura2 } : ""] : [])]);
    tipareste(htmlTabel({ titlu: def.l, subtitlu: perioada, cols, rows, nota: def.info }));
    logAction("Tipărire", "Registru DEEE", def.l, { inregistrari: rows.length });
  };

  // registre generate
  const luniDisp = useMemo(() => {
    if (!def.generat) return [];
    const surse = def.generat === "receptie" ? s.ach.rows.map((a) => a.data_colectare) : def.generat === "downstream" ? s.van.rows.map((v) => v.data) : s.dz.rows.map((d) => d.data);
    return [...new Set(surse.map(lunaDin).filter((x) => x.startsWith(gAn)))].sort();
  }, [def, s.ach.rows, s.van.rows, s.dz.rows, gAn]);
  const ani = useMemo(() => [...new Set([...s.ach.rows.map((a) => a.data_colectare), ...s.dz.rows.map((d) => d.data), ...s.van.rows.map((v) => v.data), azi()].map((d) => String(d).slice(0, 4)))].sort().reverse(), [s.ach.rows, s.dz.rows, s.van.rows]);
  const generat = useMemo(() => (def.generat ? registruGenerat(def.generat, { ach: s.ach.rows, achL: s.achL.rows, dz: s.dz.rows, dzE: s.dzE.rows, dzF: s.dzF.rows, van: s.van.rows, an: gAn, luna: gLuna }) : null),
    [def, s.ach.rows, s.achL.rows, s.dz.rows, s.dzE.rows, s.dzF.rows, s.van.rows, gAn, gLuna]);

  const chip = (r) => (
    <button key={r.k} disabled={r.soon} onClick={() => { setK(r.k); setQ(""); setGLuna(""); }} style={{ padding: "5px 11px", border: "none", borderRadius: 14, fontSize: 11.5, fontWeight: 600, cursor: r.soon ? "default" : "pointer", marginRight: 4, marginBottom: 4,
      background: k === r.k ? G : r.soon ? "#f1f5f9" : "#eef2f6", color: k === r.k ? "#fff" : r.soon ? "#94a3b8" : "#334155" }}>
      {r.l}{r.soon && <span style={{ marginLeft: 5, fontSize: 9, background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "0 5px" }}>în curând</span>}
    </button>
  );

  return (
    <div>
      {GRUPE.map((g) => (
        <div key={g.titlu} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 3 }}>{g.titlu}</div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>{g.registre.map(chip)}</div>
        </div>
      ))}

      <div style={{ borderTop: "1px solid #eef2f6", margin: "10px 0 12px", paddingTop: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{def.l}</div>
        {def.info && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{def.info}</div>}
      </div>

      {def.camp && (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
            <input style={{ ...inputSt, width: 220 }} placeholder="🔍 Caută…" value={q} onChange={(e) => setQ(e.target.value)} />
            <label style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 4, alignItems: "center" }}>De la <input type="date" style={{ ...inputSt, width: 140 }} value={de} onChange={(e) => setDe(e.target.value)} /></label>
            <label style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 4, alignItems: "center" }}>Până la <input type="date" style={{ ...inputSt, width: 140 }} value={pana} onChange={(e) => setPana(e.target.value)} /></label>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={exportPdf} disabled={!randuri.length} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🖨️ Export PDF</button>
              <button onClick={nou} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Înregistrare nouă</button>
            </div>
          </div>
          <div style={ui.TBL}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
              <thead><tr>
                <th style={ui.th({ width: 90 })}>{dataEt}</th>
                {def.lista.map((c) => <th key={c} style={ui.th({ textAlign: "left" })}>{camp(c).l}</th>)}
                {def.sem > 0 && <th style={ui.th({ width: 70 })}>Semnat</th>}
                <th style={ui.th({ width: 80 })}></th>
              </tr></thead>
              <tbody>
                {!reg.incarcat && <tr><td colSpan={def.lista.length + 3} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
                {reg.incarcat && randuri.length === 0 && <tr><td colSpan={def.lista.length + 3} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Nicio înregistrare. Apasă „+ Înregistrare nouă”.</td></tr>}
                {randuri.map((r) => (
                  <tr key={r.id}>
                    <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{dataRo(r.data)}</td>
                    {def.lista.map((c) => <td key={c} style={ui.td({ fontSize: 12 })}>{textCamp(camp(c), r.date?.[c]) || "—"}</td>)}
                    {def.sem > 0 && <td style={ui.td({ textAlign: "center", fontSize: 11, color: r.semnatura ? "#047857" : "#94a3b8" })}>{r.semnatura ? "✓" : "—"}</td>}
                    <td style={ui.td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}>
                      <button onClick={() => editeaza(r)} title="Editează" style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>✏️</button>{" "}
                      <button onClick={() => sterge(r)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {def.generat && generat && (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
            <select style={{ ...inputSt, width: 100 }} value={gAn} onChange={(e) => { setGAn(e.target.value); setGLuna(""); }}>{ani.map((a) => <option key={a} value={a}>{a}</option>)}</select>
            <select style={{ ...inputSt, width: 170 }} value={gLuna} onChange={(e) => setGLuna(e.target.value)}><option value="">Tot anul</option>{luniDisp.map((l) => <option key={l} value={l}>{numeLuna(l)}</option>)}</select>
            <span style={{ fontSize: 11, color: "#64748b" }}>Generat automat din date ({generat.rows.length} rânduri).</span>
            <div style={{ marginLeft: "auto" }}>
              <button disabled={!generat.rows.length} onClick={() => { tipareste(htmlTabel({ titlu: def.l, subtitlu: gLuna ? numeLuna(gLuna) : `anul ${gAn}`, cols: generat.cols, rows: generat.rows })); logAction("Tipărire", "Registru DEEE", def.l, { rânduri: generat.rows.length }); }}
                style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🖨️ Generează PDF</button>
            </div>
          </div>
          <div style={{ ...ui.TBL, maxHeight: 460 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
              <thead><tr>{generat.cols.map((c) => <th key={c} style={ui.th({ textAlign: "left" })}>{c}</th>)}</tr></thead>
              <tbody>
                {generat.rows.length === 0 && <tr><td colSpan={generat.cols.length} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Nimic în perioada aleasă.</td></tr>}
                {generat.rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j} style={ui.td({ fontSize: 11 })}>{v}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}

      {edit && def.camp && (
        <div onClick={() => !seSalveaza && setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(760px,100%)", maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{def.l} — {edit.id ? "editare" : "înregistrare nouă"}</div>
              <button onClick={() => !seSalveaza && setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{dataEt} *</label><input type="date" style={inputSt} value={edit.data} onChange={(ev) => setEdit((p) => ({ ...p, data: ev.target.value }))} /></div>
              {def.camp.map((c) => (
                <div key={c.k} style={{ flex: c.t === "a" || c.t === "m" ? "1 1 100%" : "1 1 200px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{c.l}{c.req ? " *" : ""}</label>
                  {c.t === "a" ? <textarea style={{ ...inputSt, minHeight: 56, fontFamily: "inherit" }} value={edit.d[c.k]} onChange={(ev) => setD(c.k, ev.target.value)} />
                    : c.t === "s" ? <select style={inputSt} value={edit.d[c.k]} onChange={(ev) => setD(c.k, ev.target.value)}><option value="">—</option>{c.opt.map((o) => <option key={o}>{o}</option>)}</select>
                    : c.t === "b" ? <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, height: 30 }}><input type="checkbox" checked={!!edit.d[c.k]} onChange={(ev) => setD(c.k, ev.target.checked)} /> Da</label>
                    : c.t === "m" ? <div style={{ display: "flex", gap: 14, height: 30, alignItems: "center" }}>{c.opt.map((o) => <label key={o} style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 12 }}><input type="checkbox" checked={edit.d[c.k].includes(o)} onChange={(ev) => setD(c.k, ev.target.checked ? [...edit.d[c.k], o] : edit.d[c.k].filter((x) => x !== o))} />{o}</label>)}</div>
                    : <input type={c.t === "d" ? "date" : c.t === "h" ? "time" : "text"} inputMode={c.t === "n" ? "decimal" : undefined} style={inputSt} value={edit.d[c.k]} onChange={(ev) => setD(c.k, ev.target.value)} />}
                </div>
              ))}
              {def.sem > 0 && <div style={{ flex: "1 1 340px" }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Semnătură{def.sem > 1 ? " 1" : ""}</label><Semnatura valoare={edit.sem} onChange={(v) => setEdit((p) => ({ ...p, sem: v }))} /></div>}
              {def.sem > 1 && <div style={{ flex: "1 1 340px" }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Semnătură 2</label><Semnatura valoare={edit.sem2} onChange={(v) => setEdit((p) => ({ ...p, sem2: v }))} /></div>}
              {eroare && <div style={{ flex: "1 1 100%", color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button disabled={seSalveaza} onClick={() => setEdit(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button disabled={seSalveaza} onClick={salveaza} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
