import { useState, useMemo } from "react";
import { useTabela, numar, colatie } from "./hooks";
import { useStoc, cheieStoc, calculeazaStoc, problemeStoc } from "./stoc";
import { dataRo, fmtKg } from "./constante";
import { htmlPvFractii } from "./pv";

const r3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;
const azi = () => new Date().toISOString().slice(0, 10);
const GOL = { nr_operatiune: "", data: "", organizatie: "", tip: "Dezmembrare", observatii: "", cod_ced: "", tip_material: "", echipamente_utilizate: "", mentiuni: "" };

// Dezmembrarea fractiilor compuse in sub-fractii si concasarea (ca "Dezm. Fractii" din WiseWeee): fractii din stoc -> alte fractii,
// cu balanta intrat = iesit, proces-verbal propriu si efect asupra stocului de fractii.
export default function DezmFractii({ sb, G, ui, currentUser, logAction, confirmDel }) {
  const s = useStoc(sb);
  const frac = useTabela(sb, "deee_fractii");
  const org = useTabela(sb, "deee_organizatii");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null); // { id|null, f, intrari:[{fractie,cod,kg}], iesiri:[{fractie,cod,kg}] }
  const [eroare, setEroare] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);

  const organizatii = useMemo(() => org.rows.filter((o) => o.activ).map((o) => o.den).sort(colatie), [org.rows]);
  const intrariDe = useMemo(() => { const m = {}; s.dfI.rows.forEach((l) => { (m[l.dezm_id] = m[l.dezm_id] || []).push(l); }); Object.values(m).forEach((a) => a.sort((x, y) => (x.ord || 0) - (y.ord || 0))); return m; }, [s.dfI.rows]);
  const iesiriDe = useMemo(() => { const m = {}; s.dfO.rows.forEach((l) => { (m[l.dezm_id] = m[l.dezm_id] || []).push(l); }); Object.values(m).forEach((a) => a.sort((x, y) => (x.ord || 0) - (y.ord || 0))); return m; }, [s.dfO.rows]);
  const kgIn = (d) => r3((intrariDe[d.id] || []).reduce((x, l) => x + Number(l.kg), 0));

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return s.df.rows.filter((d) => !t || `${d.nr_operatiune} ${d.observatii} ${d.tip} ${(intrariDe[d.id] || []).map((l) => l.fractie).join(" ")}`.toLowerCase().includes(t))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)) || colatie(b.nr_operatiune, a.nr_operatiune));
  }, [s.df.rows, q, intrariDe]);
  const totKg = r3(lista.reduce((x, d) => x + kgIn(d), 0));
  const lipsa = s.df.eroare && (s.df.eroare.code === "42P01" || s.df.eroare.code === "PGRST205" || /does not exist|Could not find the table/i.test(s.df.eroare.message || ""));

  const urmatorulNr = () => { let max = 0; s.df.rows.forEach((d) => { const m = String(d.nr_operatiune).match(/^DF-(\d+)$/i); if (m) max = Math.max(max, +m[1]); }); return `DF-${max + 1}`; };
  const nou = () => { setEroare(""); setEdit({ id: null, f: { ...GOL, nr_operatiune: urmatorulNr(), data: azi() }, intrari: [{ fractie: "", cod: "", kg: "" }], iesiri: [{ fractie: "", cod: "", kg: "" }] }); };
  const editeaza = (d) => {
    setEroare("");
    setEdit({
      id: d.id, f: Object.fromEntries(Object.keys(GOL).map((k) => [k, d[k] ?? ""])),
      intrari: (intrariDe[d.id] || []).map((l) => ({ fractie: l.fractie, cod: l.cod, kg: String(l.kg) })),
      iesiri: (iesiriDe[d.id] || []).map((l) => ({ fractie: l.fractie, cod: l.cod, kg: String(l.kg) })),
    });
  };
  const setF = (patch) => setEdit((p) => ({ ...p, f: { ...p.f, ...patch } }));
  const setLin = (cheie, i, patch) => setEdit((p) => ({ ...p, [cheie]: p[cheie].map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  // fractiile din stoc la organizatia aleasa (la editare se adauga inapoi ce consuma deja operatiunea)
  const optiuni = useMemo(() => {
    if (!edit?.f.organizatie) return [];
    const prop = {};
    if (edit.id) (intrariDe[edit.id] || []).forEach((l) => { const k = cheieStoc(l.fractie, l.cod, edit.f.organizatie); prop[k] = (prop[k] || 0) + Number(l.kg); });
    return s.stoc.fractii.filter((r) => r.org === edit.f.organizatie)
      .map((r) => ({ ...r, key: cheieStoc(r.den, r.cod, r.org), max: r3(r.disp + (prop[cheieStoc(r.den, r.cod, r.org)] || 0)) }))
      .filter((r) => r.max > 0.0005).sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod));
  }, [s.stoc.fractii, edit?.f.organizatie, edit?.id, intrariDe]);

  const totalI = edit ? r3(edit.intrari.reduce((x, l) => x + (numar(l.kg) || 0), 0)) : 0;
  const totalO = edit ? r3(edit.iesiri.reduce((x, l) => x + (numar(l.kg) || 0), 0)) : 0;
  const diferenta = r3(totalI - totalO);
  const balanta = Math.abs(diferenta) <= 0.001 && totalI > 0;

  const valideaza = () => {
    const f = edit.f;
    if (!f.nr_operatiune.trim()) return "Completează numărul operațiunii.";
    if (!f.data) return "Completează data.";
    if (!f.organizatie) return "Alege organizația.";
    if (!edit.intrari.length || !edit.iesiri.length) return "Adaugă cel puțin o fracție intrată și una rezultată.";
    for (const [nume, ls] of [["intrată", edit.intrari], ["rezultată", edit.iesiri]]) {
      const vazute = new Set();
      for (const l of ls) {
        if (!l.fractie) return `Alege fracția pe fiecare rând (${nume}).`;
        if (!(numar(l.kg) > 0)) return `Greutatea pentru „${l.fractie}” trebuie să fie mai mare ca 0.`;
        const k = l.fractie + "|" + l.cod; if (vazute.has(k)) return `Fracția „${l.fractie}” (${l.cod || "fără cod"}) apare de două ori (${nume}).`; vazute.add(k);
      }
    }
    if (!balanta) return `Balanța nu e echilibrată: intrat ${fmtKg(totalI)} kg, rezultat ${fmtKg(totalO)} kg.`;
    return "";
  };

  // dupa salvare / stergere nicio fractie nu are voie sa ramana cu stoc negativ (nici cele consumate, nici cele deja vandute)
  const verificaStoc = (id, dfNou, dfINou, dfONou) => {
    const fara = (a) => a.filter((x) => x.dezm_id !== id && x.id !== id);
    return problemeStoc(s.stoc, calculeazaStoc({ ...s.baza, df: [...fara(s.df.rows), ...dfNou], dfI: [...fara(s.dfI.rows), ...dfINou], dfO: [...fara(s.dfO.rows), ...dfONou] }));
  };

  const salveaza = async () => {
    const e = valideaza(); if (e) { setEroare(e); return; }
    setSeSalveaza(true); setEroare("");
    try {
      const f = edit.f; const nr = f.nr_operatiune.trim();
      if (s.df.rows.some((d) => d.id !== edit.id && d.nr_operatiune.toLowerCase() === nr.toLowerCase())) { setEroare("Există deja o operațiune cu acest număr."); return; }
      const idSim = edit.id || "nou";
      const rI = edit.intrari.map((l, i) => ({ ord: i, fractie: l.fractie, cod: l.cod || "", kg: numar(l.kg) }));
      const rO = edit.iesiri.map((l, i) => ({ ord: i, fractie: l.fractie, cod: l.cod || "", kg: numar(l.kg) }));
      const antet = { nr_operatiune: nr, data: f.data, organizatie: f.organizatie, tip: f.tip, observatii: f.observatii.trim(), cod_ced: f.tip === "Concasare" ? f.cod_ced.trim() : "", tip_material: f.tip === "Concasare" ? f.tip_material.trim() : "", echipamente_utilizate: f.tip === "Concasare" ? f.echipamente_utilizate.trim() : "", mentiuni: f.tip === "Concasare" ? f.mentiuni.trim() : "" };
      const probleme = verificaStoc(idSim, [{ id: idSim, ...antet }], rI.map((l) => ({ ...l, dezm_id: idSim })), rO.map((l) => ({ ...l, dezm_id: idSim })));
      if (probleme.length) { setEroare(`Stocul nu ajunge / ar rămâne negativ: ${probleme.slice(0, 4).join("; ")}.`); return; }

      let id = edit.id;
      if (!id) {
        const { data, error } = await sb.from("deee_dezm_fr").insert({ ...antet, creat_de: currentUser || "" }).select();
        if (error) { setEroare(error.code === "23505" ? "Există deja o operațiune cu acest număr." : "Eroare: " + error.message); return; }
        id = data[0].id;
        const a1 = await sb.from("deee_dezm_fr_intrari").insert(rI.map((l) => ({ ...l, dezm_id: id })));
        const a2 = a1.error ? a1 : await sb.from("deee_dezm_fr_iesiri").insert(rO.map((l) => ({ ...l, dezm_id: id })));
        if (a1.error || a2.error) { await sb.from("deee_dezm_fr").delete().eq("id", id); setEroare("Eroare la salvare: " + (a1.error || a2.error).message); return; }
        logAction("add", "deee_dezm_fr", id, { nr_operatiune: nr, tip: f.tip, organizatie: f.organizatie, kg: totalI, intrari: rI.length, iesiri: rO.length });
      } else {
        const vechi = s.df.rows.find((d) => d.id === id); const iV = intrariDe[id] || [], oV = iesiriDe[id] || [];
        const i1 = await sb.from("deee_dezm_fr_intrari").insert(rI.map((l) => ({ ...l, dezm_id: id }))).select();
        const i2 = i1.error ? i1 : await sb.from("deee_dezm_fr_iesiri").insert(rO.map((l) => ({ ...l, dezm_id: id }))).select();
        if (i1.error || i2.error) { if (i1.data?.length) await sb.from("deee_dezm_fr_intrari").delete().in("id", i1.data.map((l) => l.id)); setEroare("Eroare la salvare: " + (i1.error || i2.error).message); return; }
        const { error } = await sb.from("deee_dezm_fr").update(antet).eq("id", id);
        if (error) { await sb.from("deee_dezm_fr_intrari").delete().in("id", i1.data.map((l) => l.id)); await sb.from("deee_dezm_fr_iesiri").delete().in("id", i2.data.map((l) => l.id)); setEroare("Eroare: " + error.message); return; }
        if (iV.length) await sb.from("deee_dezm_fr_intrari").delete().in("id", iV.map((l) => l.id));
        if (oV.length) await sb.from("deee_dezm_fr_iesiri").delete().in("id", oV.map((l) => l.id));
        const rez = (a) => a.map((l) => `${l.fractie}:${l.cod}:${l.kg}`).join("|");
        const sch = Object.keys(antet).filter((k) => String(vechi?.[k] ?? "") !== String(antet[k]));
        logAction("update", "deee_dezm_fr", id, { nr_operatiune: nr, ...Object.fromEntries(sch.map((k) => [k, antet[k]])), intrari: rez(rI), iesiri: rez(rO), _inainte: { ...Object.fromEntries(sch.map((k) => [k, vechi?.[k] ?? ""])), intrari: rez(iV), iesiri: rez(oV) } });
      }
      setEdit(null);
      await s.reloadAll();
    } finally { setSeSalveaza(false); }
  };

  const sterge = async (d) => {
    const probleme = verificaStoc(d.id, [], [], []);
    if (probleme.length) { alert(`Nu pot șterge ${d.nr_operatiune}: ${probleme.slice(0, 4).join("; ")}.\n\nȘterge sau modifică întâi vânzările / operațiunile care folosesc fracțiile rezultate.`); return; }
    if (!confirmDel(`operațiunea ${d.nr_operatiune}`)) return;
    const snapshot = { operatiune: d, intrari: intrariDe[d.id] || [], iesiri: iesiriDe[d.id] || [] };
    const { error } = await sb.from("deee_dezm_fr").delete().eq("id", d.id);
    if (error) { alert("Eroare: " + error.message); return; }
    logAction("delete", "deee_dezm_fr", d.id, { nr_operatiune: d.nr_operatiune, _sters: snapshot });
    await s.reloadAll();
  };

  const tipareste = (d) => {
    const w = window.open("", "_blank");
    if (!w) { alert("Browserul a blocat fereastra de tipărire. Permite pop-up-urile pentru această pagină și încearcă din nou."); return; }
    w.document.open(); w.document.write(htmlPvFractii({ op: d, intrari: intrariDe[d.id] || [], iesiri: iesiriDe[d.id] || [], nomenclator: frac.rows })); w.document.close();
    logAction("Tipărire", "PV dezmembrare fracții", d.nr_operatiune, { tip: d.tip, kg: kgIn(d) });
  };
  const exporta = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`; const nr = (n) => String(n).replace(".", ",");
    const linii = [["Sectiune", "Nr. operatiune", "Data", "Tip", "Organizatie", "Cod", "Fractie", "Kg"].map(esc).join(";")];
    lista.forEach((d) => {
      (intrariDe[d.id] || []).forEach((l) => linii.push(["--- INPUT – FRACȚII ---", d.nr_operatiune, dataRo(d.data), d.tip, d.organizatie, l.cod, l.fractie, nr(l.kg)].map(esc).join(";")));
      (iesiriDe[d.id] || []).forEach((l) => linii.push(["--- OUTPUT – FRACȚII REZULTATE ---", d.nr_operatiune, dataRo(d.data), d.tip, d.organizatie, l.cod, l.fractie, nr(l.kg)].map(esc).join(";")));
    });
    const blob = new Blob(["﻿" + linii.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `dezmembrari-fractii-${azi()}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const card = (t, v, c) => (<div style={{ flex: "1 1 150px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 14px" }}><div style={{ fontSize: 10, color: "#64748b" }}>{t}</div><div style={{ fontSize: 16, fontWeight: 800, color: c }}>{v}</div></div>);
  const lab = (t, req) => <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{t}{req ? " *" : ""}</label>;
  const fractiiActive = frac.rows.filter((f) => f.activ).sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod));
  const idFr = (l) => frac.rows.find((x) => x.den === l.fractie && x.cod === l.cod)?.id || "";

  if (lipsa) {
    return (
      <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: 18, maxWidth: 680, color: "#78350f", fontSize: 13, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 6 }}>Mai trebuie un pas: crearea tabelelor în Supabase</div>
        Rulează o singură dată fișierul <b>supabase-deee-12-dezmembrare-fractii.sql</b>: Supabase → <b>SQL Editor</b> → New query → lipești conținutul → <b>Run</b>. Apoi reîncarcă pagina.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {card("Operațiuni", lista.length, "#1e293b")}{card("Total input (kg)", fmtKg(totKg), "#047857")}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <input style={{ ...inputSt, width: 260 }} placeholder="🔍 Nr. operațiune, fracție, note…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={exporta} disabled={!lista.length} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇️ Export Excel (CSV)</button>
          <button onClick={nou} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Operațiune nouă</button>
        </div>
      </div>

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 840 }}>
          <thead><tr>
            <th style={ui.th({ width: 90 })}>Data</th><th style={ui.th({ width: 90 })}>Nr.</th><th style={ui.th({ width: 100 })}>Tip</th>
            <th style={ui.th({ textAlign: "left" })}>Fracții intrate → rezultate</th><th style={ui.th({ width: 100 })}>Organizație</th><th style={ui.th({ width: 100 })}>Input (kg)</th><th style={ui.th({ width: 120 })}></th>
          </tr></thead>
          <tbody>
            {!s.incarcat && <tr><td colSpan={7} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {s.incarcat && lista.length === 0 && <tr><td colSpan={7} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Nicio operațiune încă. (În WiseWeee, la GREEN KRAFT sunt 0.)</td></tr>}
            {lista.map((d) => (
              <tr key={d.id}>
                <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{dataRo(d.data)}</td>
                <td style={ui.td({ textAlign: "center", fontWeight: 700, color: G })}>{d.nr_operatiune}</td>
                <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{d.tip}</td>
                <td style={ui.td({ fontSize: 11 })}>{(intrariDe[d.id] || []).map((l) => `${l.fractie} ${fmtKg(l.kg)} kg`).join(", ")} → {(iesiriDe[d.id] || []).map((l) => l.fractie).join(", ")}</td>
                <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{d.organizatie}</td>
                <td style={ui.td({ textAlign: "right", fontWeight: 700 })}>{fmtKg(kgIn(d))}</td>
                <td style={ui.td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}>
                  <button onClick={() => tipareste(d)} title="Tipărește procesul-verbal" style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, cursor: "pointer", color: "#1565c0", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>🖨️ PV</button>{" "}
                  <button onClick={() => editeaza(d)} title="Editează" style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>✏️</button>{" "}
                  <button onClick={() => sterge(d)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div onClick={() => !seSalveaza && setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(900px,100%)", maxHeight: "95vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{edit.id ? `Editare ${edit.f.nr_operatiune}` : "Operațiune nouă: dezmembrare fracții / concasare"}</div>
              <button onClick={() => !seSalveaza && setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto" }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                <div style={{ flex: "1 1 130px" }}>{lab("Nr. operațiune", true)}<input style={inputSt} value={edit.f.nr_operatiune} onChange={(ev) => setF({ nr_operatiune: ev.target.value })} /></div>
                <div style={{ flex: "1 1 150px" }}>{lab("Data", true)}<input type="date" style={inputSt} value={edit.f.data} onChange={(ev) => setF({ data: ev.target.value })} /></div>
                <div style={{ flex: "1 1 160px" }}>{lab("Tip", true)}<select style={inputSt} value={edit.f.tip} onChange={(ev) => setF({ tip: ev.target.value })}><option>Dezmembrare</option><option>Concasare</option></select></div>
                <div style={{ flex: "1 1 170px" }}>{lab("Organizație", true)}
                  <select style={inputSt} value={edit.f.organizatie} disabled={!!edit.id} onChange={(ev) => setEdit((p) => ({ ...p, f: { ...p.f, organizatie: ev.target.value }, intrari: [{ fractie: "", cod: "", kg: "" }] }))}>
                    <option value="">Alege…</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {edit.f.tip === "Concasare" && (<>
                  <div style={{ flex: "1 1 150px" }}>{lab("Cod CED")}<input style={inputSt} value={edit.f.cod_ced} onChange={(ev) => setF({ cod_ced: ev.target.value })} /></div>
                  <div style={{ flex: "1 1 200px" }}>{lab("Tip material")}<input style={inputSt} value={edit.f.tip_material} onChange={(ev) => setF({ tip_material: ev.target.value })} /></div>
                  <div style={{ flex: "1 1 100%" }}>{lab("Echipamente utilizate")}<input style={inputSt} value={edit.f.echipamente_utilizate} onChange={(ev) => setF({ echipamente_utilizate: ev.target.value })} /></div>
                  <div style={{ flex: "1 1 100%" }}>{lab("Mențiuni")}<input style={inputSt} value={edit.f.mentiuni} onChange={(ev) => setF({ mentiuni: ev.target.value })} /></div>
                </>)}
                <div style={{ flex: "1 1 100%" }}>{lab("Observații")}<input style={inputSt} value={edit.f.observatii} onChange={(ev) => setF({ observatii: ev.target.value })} /></div>
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 380px" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#334155" }}>Fracții intrate (din stoc{edit.f.organizatie ? ` — ${edit.f.organizatie}` : ""})</div>
                  {!edit.f.organizatie && <div style={{ fontSize: 12, color: "#94a3b8" }}>Alege întâi organizația.</div>}
                  {edit.f.organizatie && edit.intrari.map((l, i) => {
                    const o = optiuni.find((x) => x.den === l.fractie && x.cod === l.cod);
                    return (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                        <select style={{ ...inputSt, flex: 3 }} value={o ? o.key : ""} onChange={(ev) => { const x = optiuni.find((y) => y.key === ev.target.value); setLin("intrari", i, x ? { fractie: x.den, cod: x.cod, kg: l.kg || String(x.max) } : { fractie: "", cod: "" }); }}>
                          <option value="">Alege fracția din stoc…</option>
                          {optiuni.map((x) => <option key={x.key} value={x.key}>{x.den}{x.cod ? ` — ${x.cod}` : ""} • disp. {fmtKg(x.max)} kg</option>)}
                        </select>
                        <input style={{ ...inputSt, flex: 1, textAlign: "right", fontWeight: 700 }} inputMode="decimal" placeholder="kg" value={l.kg} onChange={(ev) => setLin("intrari", i, { kg: ev.target.value })} />
                        <button onClick={() => setEdit((p) => ({ ...p, intrari: p.intrari.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                      </div>
                    );
                  })}
                  {edit.f.organizatie && <button onClick={() => setEdit((p) => ({ ...p, intrari: [...p.intrari, { fractie: "", cod: "", kg: "" }] }))} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Fracție intrată</button>}
                  {edit.f.organizatie && optiuni.length === 0 && <div style={{ fontSize: 11, color: "#92400e", marginTop: 4 }}>Nu există fracții în stoc la această organizație.</div>}
                </div>
                <div style={{ flex: "1 1 380px" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#334155" }}>{edit.f.tip === "Concasare" ? "Materiale rezultate" : "Fracții rezultate"}</div>
                  {edit.iesiri.map((l, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                      <select style={{ ...inputSt, flex: 3 }} value={idFr(l)} onChange={(ev) => { const x = frac.rows.find((y) => y.id === ev.target.value); setLin("iesiri", i, x ? { fractie: x.den, cod: x.cod } : { fractie: "", cod: "" }); }}>
                        <option value="">Alege fracția…</option>
                        {fractiiActive.map((x) => <option key={x.id} value={x.id}>{x.den}{x.cod ? ` — ${x.cod}` : ""}</option>)}
                      </select>
                      <input style={{ ...inputSt, flex: 1, textAlign: "right", fontWeight: 700 }} inputMode="decimal" placeholder="kg" value={l.kg} onChange={(ev) => setLin("iesiri", i, { kg: ev.target.value })} />
                      <button onClick={() => setEdit((p) => ({ ...p, iesiri: p.iesiri.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => setEdit((p) => ({ ...p, iesiri: [...p.iesiri, { fractie: "", cod: "", kg: diferenta > 0 ? String(diferenta) : "" }] }))} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Fracție rezultată</button>
                </div>
              </div>

              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: balanta ? "#ecfdf5" : "#fff7ed", border: `1px solid ${balanta ? "#6ee7b7" : "#fdba74"}`, display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13, fontWeight: 700 }}>
                <span>Total intrat: {fmtKg(totalI)} kg</span><span>Total rezultat: {fmtKg(totalO)} kg</span>
                <span style={{ color: balanta ? "#047857" : "#c2410c" }}>{balanta ? "Balanță OK ✓" : `Diferență: ${fmtKg(Math.abs(diferenta))} kg`}</span>
              </div>
              {eroare && <div style={{ marginTop: 12, color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button disabled={seSalveaza} onClick={() => setEdit(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button disabled={seSalveaza} onClick={salveaza} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează operațiunea"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
