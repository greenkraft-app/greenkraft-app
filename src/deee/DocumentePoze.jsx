import { useState, useMemo } from "react";
import { useTabela, colatie } from "./hooks";
import { useFisiere, stergeFisiere, linkuri, esteImagine, fmtMarime } from "./stocareFisiere";
import { dataRo, lunaDin, numeLuna } from "./constante";
import { Previzualizare } from "./PanouFisiere";

const azi = () => new Date().toISOString().slice(0, 10);

// Documente / Poze: toate fisierele atasate achizitiilor si vanzarilor, pe luna, cu filtre, descarcare ZIP (poze / documente) si stergere.
export default function DocumentePoze({ sb, G, ui, logAction }) {
  const fis = useFisiere(sb);
  const ach = useTabela(sb, "deee_achizitii");
  const achL = useTabela(sb, "deee_achizitii_linii");
  const van = useTabela(sb, "deee_vanzari");
  const [an, setAn] = useState("");
  const [luna, setLuna] = useState("");
  const [partener, setPartener] = useState("");
  const [tip, setTip] = useState("");
  const [fOrg, setFOrg] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(() => new Set());
  const [lucru, setLucru] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [vezi, setVezi] = useState(null); // { f, url }

  // fiecare fisier cu datele documentului lui
  const randuri = useMemo(() => {
    const A = Object.fromEntries(ach.rows.map((a) => [a.id, a]));
    const V = Object.fromEntries(van.rows.map((v) => [v.id, v]));
    const orgsA = {}; achL.rows.forEach((l) => { (orgsA[l.achizitie_id] = orgsA[l.achizitie_id] || new Set()).add(l.organizatie || A[l.achizitie_id]?.organizatie); });
    return fis.rows.map((f) => {
      const a = f.achizitie_id ? A[f.achizitie_id] : null, v = f.vanzare_id ? V[f.vanzare_id] : null;
      return {
        f, sursa: a ? "Achiziție" : "Vânzare", data: (a ? a.data_colectare : v?.data) || "", partener: (a ? a.furnizor : v?.client) || "", aviz: (a ? a.nr_document : v?.nr_aviz) || "",
        orgs: a ? [...(orgsA[a.id] || [a.organizatie])].filter(Boolean) : v ? [v.organizatie] : [],
      };
    }).sort((x, y) => String(y.data).localeCompare(String(x.data)) || String(y.f.created_at).localeCompare(String(x.f.created_at)));
  }, [fis.rows, ach.rows, achL.rows, van.rows]);

  const ani = useMemo(() => [...new Set(randuri.map((r) => String(r.data).slice(0, 4)).filter(Boolean))].sort().reverse(), [randuri]);
  const luni = useMemo(() => [...new Set(randuri.filter((r) => !an || String(r.data).startsWith(an)).map((r) => lunaDin(r.data)).filter(Boolean))].sort().reverse(), [randuri, an]);
  const parteneri = useMemo(() => [...new Set(randuri.map((r) => r.partener).filter(Boolean))].sort(colatie), [randuri]);
  const organizatii = useMemo(() => [...new Set(randuri.flatMap((r) => r.orgs))].sort(colatie), [randuri]);

  const filtrate = useMemo(() => {
    const t = q.trim().toLowerCase();
    return randuri.filter((r) => (!an || String(r.data).startsWith(an)) && (!luna || lunaDin(r.data) === luna) && (!partener || r.partener === partener)
      && (!tip || (tip === "poze") === esteImagine(r.f)) && (!fOrg || r.orgs.includes(fOrg))
      && (!t || `${r.aviz} ${r.partener} ${r.f.nume}`.toLowerCase().includes(t)));
  }, [randuri, an, luna, partener, tip, fOrg, q]);
  const pePrima = useMemo(() => { const m = new Map(); filtrate.forEach((r) => { const k = lunaDin(r.data) || "—"; (m.get(k) || m.set(k, []).get(k)).push(r); }); return [...m.entries()]; }, [filtrate]);
  const selectate = filtrate.filter((r) => sel.has(r.f.id));
  const nrPoze = filtrate.filter((r) => esteImagine(r.f)).length;

  const deschide = async (r) => { setVezi({ f: r.f, url: "" }); const m = await linkuri(sb, [r.f]); setVezi({ f: r.f, url: m[r.f.cale] || "" }); };

  // ZIP cu fisierele selectate (sau cu toate pozele / documentele afisate, daca nimic nu e selectat)
  const descarcaZip = async (categorie) => {
    const lista = (selectate.length ? selectate : filtrate).filter((r) => esteImagine(r.f) === (categorie === "poze"));
    if (!lista.length) { setMesaj(`Nu există ${categorie} de descărcat.`); return; }
    setMesaj(""); setLucru(`Pregătesc arhiva (${lista.length} fișiere)…`);
    try {
      const { default: JSZip } = await import("jszip");
      const m = await linkuri(sb, lista.map((r) => r.f));
      const zip = new JSZip(); const folosite = new Set();
      for (const r of lista) {
        const resp = await fetch(m[r.f.cale]); if (!resp.ok) throw new Error(`Nu am putut citi „${r.f.nume}”.`);
        let nume = `${lunaDin(r.data) || "fara-data"}/${String(r.aviz || "fara-aviz").replace(/[\\/:*?"<>|]+/g, "_")}_${r.f.nume}`;
        while (folosite.has(nume)) nume = nume.replace(/(\.[^.]*)?$/, (x) => `_${folosite.size}${x}`);
        folosite.add(nume); zip.file(nume, await resp.blob());
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `deee-${categorie}-${azi()}.zip`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      logAction("Descărcare", "Fișiere DEEE", categorie, { fisiere: lista.length });
    } catch (e) { setMesaj("Eroare la arhivă: " + e.message); } finally { setLucru(""); }
  };

  const stergeSel = async () => {
    if (!selectate.length || !window.confirm(`Ștergi ${selectate.length} fișiere? Nu se poate anula.`)) return;
    setLucru("Se șterg…");
    const er = await stergeFisiere(sb, selectate.map((r) => r.f));
    setLucru("");
    if (er) { setMesaj("Eroare: " + er); await fis.reload(); return; }
    const ids = new Set(selectate.map((r) => r.f.id));
    fis.setRows((p) => p.filter((x) => !ids.has(x.id))); setSel(new Set());
    logAction("delete", "deee_fisiere", "", { fisiere: selectate.length, _sters: selectate.map((r) => ({ nume: r.f.nume, document: `${r.sursa} ${r.aviz}`, cale: r.f.cale })) });
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box" };
  const btn = (extra) => ({ border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, ...extra });
  const toateBifate = filtrate.length > 0 && filtrate.every((r) => sel.has(r.f.id));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <input style={{ ...inputSt, width: 230 }} placeholder="🔍 Aviz, furnizor / client, nume fișier…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ ...inputSt, width: 90 }} value={an} onChange={(e) => { setAn(e.target.value); setLuna(""); }}><option value="">Toți anii</option>{ani.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        <select style={{ ...inputSt, width: 150 }} value={luna} onChange={(e) => setLuna(e.target.value)}><option value="">Toate lunile</option>{luni.map((l) => <option key={l} value={l}>{numeLuna(l)}</option>)}</select>
        <select style={{ ...inputSt, width: 180 }} value={partener} onChange={(e) => setPartener(e.target.value)}><option value="">Furnizor / client</option>{parteneri.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <select style={{ ...inputSt, width: 120 }} value={tip} onChange={(e) => setTip(e.target.value)}><option value="">Toate tipurile</option><option value="poze">Poze</option><option value="documente">Documente</option></select>
        <select style={{ ...inputSt, width: 130 }} value={fOrg} onChange={(e) => setFOrg(e.target.value)}><option value="">Organizație</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        {(q || an || luna || partener || tip || fOrg) && <button onClick={() => { setQ(""); setAn(""); setLuna(""); setPartener(""); setTip(""); setFOrg(""); }} style={{ ...inputSt, cursor: "pointer", background: "#fff" }}>↺ Reset</button>}
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#475569" }}>{filtrate.length} fișiere</span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <label style={{ fontSize: 12, display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}><input type="checkbox" checked={toateBifate} onChange={(e) => setSel(e.target.checked ? new Set(filtrate.map((r) => r.f.id)) : new Set())} /> Selectează tot</label>
        <button disabled={!!lucru} onClick={() => descarcaZip("poze")} style={btn({ background: "#fff", color: G, border: `1px solid ${G}` })}>⬇️ Descarcă pozele (ZIP)</button>
        <button disabled={!!lucru} onClick={() => descarcaZip("documente")} style={btn({ background: "#fff", color: G, border: `1px solid ${G}` })}>⬇️ Descarcă documentele (ZIP)</button>
        <button disabled={!selectate.length || !!lucru} onClick={stergeSel} style={btn({ background: selectate.length ? "#e53935" : "#e5e7eb", color: "#fff" })}>🗑️ Șterge selectate{selectate.length ? ` (${selectate.length})` : ""}</button>
        {lucru && <span style={{ fontSize: 12, color: "#475569" }}>{lucru}</span>}
        {mesaj && <span style={{ fontSize: 12, color: "#c62828" }}>{mesaj}</span>}
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{nrPoze} poze • {filtrate.length - nrPoze} documente{selectate.length ? " — ZIP-ul ia doar selecția" : ""}</span>
      </div>

      {!fis.incarcat && <div style={{ color: "#94a3b8", fontSize: 13 }}>Se încarcă…</div>}
      {fis.incarcat && filtrate.length === 0 && <div style={{ color: "#94a3b8", fontSize: 13, padding: "20px 0" }}>{randuri.length ? "Niciun fișier pentru filtrele alese." : "Niciun fișier încărcat încă. Adaugă-le din Achiziții sau Vânzări fracții, cu butonul 📎 de pe fiecare document."}</div>}
      {pePrima.map(([l, rs]) => (
        <div key={l} style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b", margin: "6px 0" }}>{l === "—" ? "Fără dată" : numeLuna(l)} <span style={{ fontWeight: 600, color: "#94a3b8", fontSize: 11 }}>({rs.length})</span></div>
          <div style={ui.TBL}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 760 }}>
              <tbody>
                {rs.map((r) => (
                  <tr key={r.f.id} style={{ background: sel.has(r.f.id) ? "#ecfdf5" : undefined }}>
                    <td style={ui.td({ width: 30, textAlign: "center" })}><input type="checkbox" checked={sel.has(r.f.id)} onChange={() => setSel((p) => { const n = new Set(p); n.has(r.f.id) ? n.delete(r.f.id) : n.add(r.f.id); return n; })} /></td>
                    <td style={ui.td({ width: 30, textAlign: "center" })}>{esteImagine(r.f) ? "🖼️" : r.f.mime === "application/pdf" ? "📕" : "📄"}</td>
                    <td style={ui.td({ fontWeight: 600 })}><button onClick={() => deschide(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#1565c0", fontSize: 12, padding: 0, textAlign: "left" }}>{r.f.nume}</button></td>
                    <td style={ui.td({ width: 80, textAlign: "center", fontSize: 11 })}>{dataRo(r.data)}</td>
                    <td style={ui.td({ width: 80, fontSize: 10, color: "#64748b", textAlign: "center" })}>{r.sursa}</td>
                    <td style={ui.td({ fontSize: 11 })}>{r.partener}</td>
                    <td style={ui.td({ width: 110, fontSize: 11, textAlign: "center", fontFamily: "monospace" })}>{r.aviz || "—"}</td>
                    <td style={ui.td({ width: 110, fontSize: 11, textAlign: "center" })}>{r.orgs.join(", ")}</td>
                    <td style={ui.td({ width: 70, fontSize: 10, color: "#64748b", textAlign: "right" })}>{fmtMarime(r.f.marime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {vezi && (
        <div onClick={() => setVezi(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: "min(900px,100%)", maxHeight: "96vh", overflow: "auto", padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><b style={{ fontSize: 13 }}>{vezi.f.nume}</b><button onClick={() => setVezi(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button></div>
            <Previzualizare f={vezi.f} url={vezi.url} inaltime={680} />
          </div>
        </div>
      )}
    </div>
  );
}
