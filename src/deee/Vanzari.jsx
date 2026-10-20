import { useState, useMemo } from "react";
import { useTabela, numar, colatie } from "./hooks";
import { useStoc, cheieStoc } from "./stoc";
import { dataRo, fmtKg } from "./constante";

const r3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;
const azi = () => new Date().toISOString().slice(0, 10);
const norm = (s) => String(s || "").trim().toLowerCase();
const aSet = (v) => v !== null && v !== undefined && v !== "";
const textProc = (r) => (aSet(r.proc_reciclare) || aSet(r.proc_valorificare) || aSet(r.proc_eliminare)
  ? `R ${Number(r.proc_reciclare) || 0} / V ${Number(r.proc_valorificare) || 0} / E ${Number(r.proc_eliminare) || 0}` : "—");

// Vanzari de fractii din stocul rezultat din dezmembrari (cate un rand pe fractie; un aviz poate avea mai multe randuri).
export default function Vanzari({ sb, G, ui, currentUser, logAction, confirmDel }) {
  const s = useStoc(sb);
  const furn = useTabela(sb, "deee_furnizori");
  const [fAn, setFAn] = useState("");
  const [fClient, setFClient] = useState("");
  const [fOrg, setFOrg] = useState("");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null); // { id|null, f:{data,client,nr_aviz,optiune,kg,observatii} }
  const [eroare, setEroare] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);
  const [pr, setPr] = useState(null); // dialog procente R/D

  const rows = s.van.rows;
  const ani = useMemo(() => [...new Set(rows.map((r) => String(r.data).slice(0, 4)))].sort().reverse(), [rows]);
  const clienti = useMemo(() => [...new Set(rows.map((r) => r.client))].sort(colatie), [rows]);
  const organizatii = useMemo(() => [...new Set(rows.map((r) => r.organizatie))].sort(colatie), [rows]);

  const filtrate = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows
      .filter((r) => (!fAn || String(r.data).startsWith(fAn)) && (!fClient || r.client === fClient) && (!fOrg || r.organizatie === fOrg)
        && (!t || `${r.nr_aviz} ${r.fractie} ${r.client} ${r.cod}`.toLowerCase().includes(t)))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.created_at).localeCompare(String(a.created_at)));
  }, [rows, fAn, fClient, fOrg, q]);
  const totKg = r3(filtrate.reduce((x, r) => x + Number(r.kg), 0));
  const pePeOrg = useMemo(() => { const m = {}; filtrate.forEach((r) => { m[r.organizatie] = r3((m[r.organizatie] || 0) + Number(r.kg)); }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [filtrate]);

  // ── stoc de fractii disponibil (la editare se adauga inapoi ce vinde deja randul editat) ──
  const optiuni = useMemo(() => {
    const prop = {};
    if (edit?.id) { const r = rows.find((x) => x.id === edit.id); if (r) prop[cheieStoc(r.fractie, r.cod, r.organizatie)] = Number(r.kg); }
    return s.stoc.fractii
      .map((r) => ({ ...r, key: cheieStoc(r.den, r.cod, r.org), max: r3(r.disp + (prop[cheieStoc(r.den, r.cod, r.org)] || 0)) }))
      .filter((r) => r.max > 0.0005)
      .sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod) || colatie(a.org, b.org));
  }, [s.stoc.fractii, edit?.id, rows]);
  const optiuneAleasa = edit ? optiuni.find((o) => o.key === edit.f.optiune) : null;

  const clientGasit = (nume) => furn.rows.find((f) => norm(f.den) === norm(nume));

  const deschideNou = (pastreaza) => {
    setEroare("");
    setEdit({ id: null, f: { data: pastreaza?.data || azi(), client: pastreaza?.client || "", nr_aviz: pastreaza?.nr_aviz || "", optiune: "", kg: "", observatii: "" } });
  };
  const deschideEditare = (r) => {
    setEroare("");
    setEdit({ id: r.id, f: { data: r.data, client: r.client, nr_aviz: r.nr_aviz || "", optiune: cheieStoc(r.fractie, r.cod, r.organizatie), kg: String(r.kg), observatii: r.observatii || "" } });
  };
  const setF = (patch) => setEdit((p) => ({ ...p, f: { ...p.f, ...patch } }));

  const valideaza = () => {
    const f = edit.f;
    if (!f.client.trim()) return "Completează clientul.";
    if (!f.data) return "Completează data vânzării.";
    if (!optiuneAleasa) return "Alege fracția din stoc.";
    const kg = numar(f.kg);
    if (!(kg > 0)) return "Greutatea trebuie să fie mai mare ca 0.";
    if (kg > optiuneAleasa.max + 0.0005) return `În stoc sunt doar ${fmtKg(optiuneAleasa.max)} kg de ${optiuneAleasa.den} (${optiuneAleasa.org}).`;
    return "";
  };

  const salveaza = async (alta) => {
    const e = valideaza(); if (e) { setEroare(e); return; }
    setSeSalveaza(true); setEroare("");
    try {
      const f = edit.f; const o = optiuneAleasa; const cg = clientGasit(f.client);
      const payload = { data: f.data, client: cg ? cg.den : f.client.trim(), client_cui: cg ? cg.cui : "", nr_aviz: f.nr_aviz.trim(), fractie: o.den, cod: o.cod, organizatie: o.org, kg: numar(f.kg), observatii: f.observatii.trim() };
      if (!edit.id) {
        const { data, error } = await sb.from("deee_vanzari").insert({ ...payload, creat_de: currentUser || "" }).select();
        if (error) { setEroare("Eroare: " + error.message); return; }
        s.van.setRows((p) => [...p, data[0]]);
        logAction("add", "deee_vanzari", data[0].id, { client: payload.client, nr_aviz: payload.nr_aviz, fractie: payload.fractie, cod: payload.cod, organizatie: payload.organizatie, kg: payload.kg });
        if (alta) { deschideNou({ data: payload.data, client: payload.client, nr_aviz: payload.nr_aviz }); return; }
      } else {
        const vechi = rows.find((r) => r.id === edit.id);
        const { error } = await sb.from("deee_vanzari").update(payload).eq("id", edit.id);
        if (error) { setEroare("Eroare: " + error.message); return; }
        const sch = Object.keys(payload).filter((k) => String(vechi?.[k] ?? "") !== String(payload[k]));
        s.van.setRows((p) => p.map((r) => (r.id === edit.id ? { ...r, ...payload } : r)));
        if (sch.length) logAction("update", "deee_vanzari", edit.id, { client: payload.client, nr_aviz: payload.nr_aviz, ...Object.fromEntries(sch.map((k) => [k, payload[k]])), _inainte: Object.fromEntries(sch.map((k) => [k, vechi?.[k] ?? ""])) });
      }
      setEdit(null);
    } finally { setSeSalveaza(false); }
  };

  const sterge = async (r) => {
    if (!confirmDel(`vânzarea ${r.fractie} ${fmtKg(r.kg)} kg către ${r.client}`)) return;
    const { error } = await sb.from("deee_vanzari").delete().eq("id", r.id);
    if (error) { alert("Eroare: " + error.message); return; }
    s.van.setRows((p) => p.filter((x) => x.id !== r.id));
    logAction("delete", "deee_vanzari", r.id, { client: r.client, nr_aviz: r.nr_aviz, fractie: r.fractie, kg: r.kg, _sters: r });
  };

  // ── Procente reciclare / valorificare / eliminare, per grup (client + cod + fractie) ──
  const deschideProcente = () => {
    const grupuri = new Map();
    rows.forEach((r) => {
      const k = [r.client, r.cod, r.fractie].join("\u0001");
      const g = grupuri.get(k) || { k, client: r.client, cod: r.cod, fractie: r.fractie, kg: 0, ids: [], rec: "", val: "", eli: "", rd: "" };
      g.kg += Number(r.kg); g.ids.push(r.id);
      if (!g.rec && aSet(r.proc_reciclare)) g.rec = String(r.proc_reciclare);
      if (!g.val && aSet(r.proc_valorificare)) g.val = String(r.proc_valorificare);
      if (!g.eli && aSet(r.proc_eliminare)) g.eli = String(r.proc_eliminare);
      if (!g.rd && r.cod_rd) g.rd = r.cod_rd;
      grupuri.set(k, g);
    });
    const lista = [...grupuri.values()].sort((a, b) => colatie(a.client, b.client) || colatie(a.cod, b.cod) || colatie(a.fractie, b.fractie));
    setPr({ an: "", client: "", grupuri: lista.map((g) => ({ ...g, kg: r3(g.kg), initial: JSON.stringify([g.rec, g.val, g.eli, g.rd]) })), eroare: "", seSalveaza: false });
  };
  const setG = (k, patch) => setPr((p) => ({ ...p, grupuri: p.grupuri.map((g) => (g.k === k ? { ...g, ...patch } : g)) }));
  const murdar = (g) => JSON.stringify([g.rec, g.val, g.eli, g.rd]) !== g.initial;
  const totalG = (g) => r3((numar(g.rec) || 0) + (numar(g.val) || 0) + (numar(g.eli) || 0));
  const completat = (g) => g.rec !== "" || g.val !== "" || g.eli !== "";

  const salveazaProcente = async () => {
    const dirty = pr.grupuri.filter(murdar);
    if (!dirty.length) { setPr(null); return; }
    for (const g of dirty) {
      if (completat(g) && Math.abs(totalG(g) - 100) > 0.01) { setPr((p) => ({ ...p, eroare: `${g.client} / ${g.fractie} (${g.cod}): procentele însumează ${totalG(g)}%, trebuie 100%.` })); return; }
    }
    setPr((p) => ({ ...p, seSalveaza: true, eroare: "" }));
    const inainte = [], dupa = [];
    for (const g of dirty) {
      const val = completat(g)
        ? { proc_reciclare: numar(g.rec) || 0, proc_valorificare: numar(g.val) || 0, proc_eliminare: numar(g.eli) || 0, cod_rd: g.rd.trim() }
        : { proc_reciclare: null, proc_valorificare: null, proc_eliminare: null, cod_rd: g.rd.trim() };
      const { error } = await sb.from("deee_vanzari").update(val).in("id", g.ids);
      if (error) { setPr((p) => ({ ...p, seSalveaza: false, eroare: "Eroare: " + error.message })); return; }
      inainte.push({ client: g.client, cod: g.cod, fractie: g.fractie, valoare: JSON.parse(g.initial) });
      dupa.push({ client: g.client, cod: g.cod, fractie: g.fractie, ...val });
      s.van.setRows((p) => p.map((r) => (g.ids.includes(r.id) ? { ...r, ...val } : r)));
    }
    logAction("update", "deee_vanzari", "", { procente_RD: dupa.length, grupuri: dupa, _inainte: { procente_RD: inainte } });
    setPr(null);
  };

  const exporta = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const cap = ["Data", "Client", "CUI client", "Nr. aviz", "Cod fractie", "Fractie", "Organizatie", "Kg", "Reciclare %", "Valorificare %", "Eliminare %", "Cod R/D", "Observatii"];
    const linii = [cap.map(esc).join(";")];
    filtrate.forEach((r) => linii.push([dataRo(r.data), r.client, r.client_cui, r.nr_aviz, r.cod, r.fractie, r.organizatie, String(r.kg).replace(".", ","), r.proc_reciclare ?? "", r.proc_valorificare ?? "", r.proc_eliminare ?? "", r.cod_rd, r.observatii].map(esc).join(";")));
    const blob = new Blob(["﻿" + linii.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `vanzari-fractii-${azi()}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const card = (t, v, c) => (
    <div style={{ flex: "1 1 150px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 14px", boxShadow: "0 1px 2px rgba(15,23,42,.05)" }}>
      <div style={{ fontSize: 10, color: "#64748b" }}>{t}</div><div style={{ fontSize: 16, fontWeight: 800, color: c }}>{v}</div>
    </div>
  );
  const lab = (t, req) => <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{t}{req ? " *" : ""}</label>;
  const grupuriVizibile = pr ? pr.grupuri.filter((g) => !pr.client || g.client === pr.client) : [];
  const nrCompletate = pr ? pr.grupuri.filter(completat).length : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {card("Vânzări", filtrate.length, "#1e293b")}
        {card("Total cantitate (kg)", fmtKg(totKg), "#047857")}
        {card("Clienți unici", new Set(filtrate.map((r) => r.client)).size, "#1565c0")}
        <div style={{ flex: "2 1 260px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 14px" }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>Pe organizație</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, fontWeight: 700 }}>
            {pePeOrg.length === 0 ? <span style={{ color: "#94a3b8", fontWeight: 500 }}>—</span> : pePeOrg.map(([o, kg]) => <span key={o}>{o}: <span style={{ color: "#047857" }}>{fmtKg(kg)} kg</span></span>)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <input style={{ ...inputSt, width: 220 }} placeholder="🔍 Aviz, fracție, client..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ ...inputSt, width: 100 }} value={fAn} onChange={(e) => setFAn(e.target.value)}><option value="">Toți anii</option>{ani.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        <select style={{ ...inputSt, width: 200 }} value={fClient} onChange={(e) => setFClient(e.target.value)}><option value="">Toți clienții</option>{clienti.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <select style={{ ...inputSt, width: 150 }} value={fOrg} onChange={(e) => setFOrg(e.target.value)}><option value="">Toate organizațiile</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        {(q || fAn || fClient || fOrg) && <button onClick={() => { setQ(""); setFAn(""); setFClient(""); setFOrg(""); }} style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 11 }}>↺ Reset</button>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={deschideProcente} disabled={!rows.length} style={{ background: "#fff", color: "#6a1b9a", border: "1px solid #6a1b9a", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>% Procente R/D</button>
          <button onClick={exporta} disabled={!filtrate.length} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇️ Export Excel (CSV)</button>
          <button onClick={() => deschideNou()} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Vânzare nouă</button>
        </div>
      </div>

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
          <thead><tr>
            <th style={ui.th({ width: 90 })}>Data</th><th style={ui.th({ textAlign: "left" })}>Client</th><th style={ui.th({ width: 110 })}>Nr. aviz</th>
            <th style={ui.th({ width: 80 })}>Cod</th><th style={ui.th({ textAlign: "left", width: 190 })}>Fracție</th><th style={ui.th({ width: 100 })}>Organizație</th>
            <th style={ui.th({ width: 110 })}>Kg</th><th style={ui.th({ width: 130 })} title="Reciclare / Valorificare / Eliminare">R / V / E %</th><th style={ui.th({ width: 70 })}></th>
          </tr></thead>
          <tbody>
            {!s.incarcat && <tr><td colSpan={9} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {s.incarcat && filtrate.length === 0 && <tr><td colSpan={9} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>{rows.length ? "Nicio vânzare pentru filtrele alese." : "Nicio vânzare încă. Fracțiile apar în stoc după o dezmembrare."}</td></tr>}
            {filtrate.map((r) => (
              <tr key={r.id}>
                <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{dataRo(r.data)}</td>
                <td style={ui.td({ fontWeight: 600 })}>{r.client}</td>
                <td style={ui.td({ textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.nr_aviz || "—"}</td>
                <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{r.cod}</td>
                <td style={ui.td()}>{r.fractie}</td>
                <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{r.organizatie}</td>
                <td style={ui.td({ textAlign: "right", fontWeight: 700 })}>{fmtKg(r.kg)}</td>
                <td style={ui.td({ textAlign: "center", fontSize: 10, color: textProc(r) === "—" ? "#94a3b8" : "#334155" })}>{textProc(r)}</td>
                <td style={ui.td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}>
                  <button onClick={() => deschideEditare(r)} title="Editează" style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>✏️</button>{" "}
                  <button onClick={() => sterge(r)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div onClick={() => !seSalveaza && setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(620px,100%)", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{edit.id ? "Editare vânzare" : "Vânzare nouă"}</div>
              <button onClick={() => !seSalveaza && setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "2 1 280px" }}>{lab("Client", true)}
                <input list="deee-clienti" style={inputSt} value={edit.f.client} onChange={(e) => setF({ client: e.target.value })} placeholder="Caută sau scrie clientul…" />
                <datalist id="deee-clienti">{furn.rows.filter((f) => f.activ).map((f) => <option key={f.id} value={f.den} />)}</datalist>
                {edit.f.client.trim() && !clientGasit(edit.f.client) && <div style={{ fontSize: 10, color: "#92400e", marginTop: 2 }}>⚠️ Client care nu e în lista DEEE — poți să-l adaugi la Furnizori (tip CLIENT).</div>}
              </div>
              <div style={{ flex: "1 1 160px" }}>{lab("Nr. document (aviz)")}<input style={inputSt} value={edit.f.nr_aviz} onChange={(e) => setF({ nr_aviz: e.target.value })} placeholder="ex. GKF 9040" /></div>
              <div style={{ flex: "1 1 150px" }}>{lab("Data vânzării", true)}<input type="date" style={inputSt} value={edit.f.data} onChange={(e) => setF({ data: e.target.value })} /></div>
              <div style={{ flex: "1 1 100%" }}>{lab("Fracție din stoc", true)}
                <select style={inputSt} value={edit.f.optiune} onChange={(e) => setF({ optiune: e.target.value })}>
                  <option value="">Selectează fracția…</option>
                  {optiuni.map((o) => <option key={o.key} value={o.key}>{o.den}{o.cod ? ` — ${o.cod}` : ""} • {o.org} • disponibil {fmtKg(o.max)} kg</option>)}
                </select>
                {optiuni.length === 0 && <div style={{ fontSize: 11, color: "#92400e", marginTop: 3 }}>Nu există fracții în stoc. Fracțiile apar după o dezmembrare (sau „Stoc inițial” în Stocuri).</div>}
              </div>
              <div style={{ flex: "1 1 180px" }}>{lab("Greutate (kg)", true)}<input style={{ ...inputSt, textAlign: "right", fontWeight: 700 }} inputMode="decimal" value={edit.f.kg} onChange={(e) => setF({ kg: e.target.value })} />
                {optiuneAleasa && <button onClick={() => setF({ kg: String(optiuneAleasa.max) })} style={{ background: "none", border: "none", color: G, cursor: "pointer", fontSize: 11, padding: 0, marginTop: 2 }}>toată cantitatea ({fmtKg(optiuneAleasa.max)} kg)</button>}
              </div>
              <div style={{ flex: "2 1 260px" }}>{lab("Observații")}<input style={inputSt} value={edit.f.observatii} onChange={(e) => setF({ observatii: e.target.value })} /></div>
              {eroare && <div style={{ flex: "1 1 100%", color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <button disabled={seSalveaza} onClick={() => setEdit(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {!edit.id && <button disabled={seSalveaza} onClick={() => salveaza(true)} style={{ padding: "8px 14px", border: `1px solid ${G}`, borderRadius: 8, background: "#fff", color: G, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Salvează + altă fracție pe același aviz</button>}
                <button disabled={seSalveaza} onClick={() => salveaza(false)} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: seSalveaza ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pr && (
        <div onClick={() => !pr.seSalveaza && setPr(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(1000px,100%)", maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Procente Reciclare / Valorificare / Eliminare</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{nrCompletate} din {pr.grupuri.length} grupuri completate</div>
              <button onClick={() => !pr.seSalveaza && setPr(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 16, overflowY: "auto" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                <select style={{ ...inputSt, width: 240 }} value={pr.client} onChange={(e) => setPr((p) => ({ ...p, client: e.target.value }))}><option value="">Toți clienții</option>{clienti.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                <span style={{ fontSize: 11, color: "#64748b" }}>Cele nelăsate goale trebuie să însumeze 100%. Goale = se folosește clasificarea implicită.</span>
              </div>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead><tr>
                  <th style={ui.th({ textAlign: "left" })}>Client</th><th style={ui.th({ width: 80 })}>Cod</th><th style={ui.th({ textAlign: "left" })}>Fracție</th><th style={ui.th({ width: 100 })}>Kg</th>
                  <th style={ui.th({ width: 80 })}>Reciclare %</th><th style={ui.th({ width: 80 })}>Valorif. %</th><th style={ui.th({ width: 80 })}>Elimin. %</th><th style={ui.th({ width: 60 })}>Total</th><th style={ui.th({ width: 80 })}>Cod R/D</th>
                </tr></thead>
                <tbody>
                  {grupuriVizibile.map((g) => {
                    const tot = totalG(g); const ok = !completat(g) || Math.abs(tot - 100) <= 0.01;
                    const celula = (camp) => <td style={ui.td({ padding: 2 })}><input style={{ ...inputSt, textAlign: "right", padding: "4px 6px" }} inputMode="decimal" value={g[camp]} onChange={(e) => setG(g.k, { [camp]: e.target.value })} /></td>;
                    return (
                      <tr key={g.k} style={{ background: murdar(g) ? "#fffbeb" : undefined }}>
                        <td style={ui.td({ fontSize: 11, fontWeight: 600 })}>{g.client}</td>
                        <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{g.cod}</td>
                        <td style={ui.td({ fontSize: 11 })}>{g.fractie}</td>
                        <td style={ui.td({ textAlign: "right", fontSize: 11 })}>{fmtKg(g.kg)}</td>
                        {celula("rec")}{celula("val")}{celula("eli")}
                        <td style={ui.td({ textAlign: "center", fontSize: 11, fontWeight: 700, color: ok ? (completat(g) ? "#047857" : "#94a3b8") : "#c62828" })}>{completat(g) ? `${tot}%` : "—"}</td>
                        <td style={ui.td({ padding: 2 })}><input style={{ ...inputSt, padding: "4px 6px" }} value={g.rd} onChange={(e) => setG(g.k, { rd: e.target.value })} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {pr.eroare && <div style={{ marginTop: 10, color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {pr.eroare}</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button disabled={pr.seSalveaza} onClick={() => setPr(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button disabled={pr.seSalveaza} onClick={salveazaProcente} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: pr.seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{pr.seSalveaza ? "Se salvează…" : `Salvează (${pr.grupuri.filter(murdar).length})`}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
