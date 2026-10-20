import { useState, useMemo } from "react";
import { useTabela, numar, colatie } from "./hooks";
import { useStoc, cheieStoc } from "./stoc";
import { dataRo, fmtKg } from "./constante";

const r3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;
const azi = () => new Date().toISOString().slice(0, 10);
const PROCENTE = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Operatiuni de dezmembrare: alegi echipamente din stoc (o organizatie), rezulta fractii (cu ajutorul unei retete),
// iar totalul intrat trebuie sa fie egal cu totalul iesit ("balanta").
export default function Dezmembrare({ sb, G, ui, currentUser, logAction, confirmDel }) {
  const s = useStoc(sb);
  const retete = useTabela(sb, "deee_retete");
  const reteteL = useTabela(sb, "deee_retete_linii");
  const frac = useTabela(sb, "deee_fractii");
  const org = useTabela(sb, "deee_organizatii");

  const [q, setQ] = useState("");
  const [fOrg, setFOrg] = useState("");
  const [fEch, setFEch] = useState("");
  const [edit, setEdit] = useState(null); // { id|null, pas, f, ech:[{echipament,cod,kg,buc}], fr:[{fractie,cod,kg}] }
  const [eroare, setEroare] = useState("");
  const [info, setInfo] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);

  const organizatii = useMemo(() => org.rows.filter((o) => o.activ).map((o) => o.den).sort(colatie), [org.rows]);
  const echDe = useMemo(() => { const m = {}; s.dzE.rows.forEach((l) => { (m[l.dezm_id] = m[l.dezm_id] || []).push(l); }); Object.values(m).forEach((a) => a.sort((x, y) => (x.ord || 0) - (y.ord || 0))); return m; }, [s.dzE.rows]);
  const frDe = useMemo(() => { const m = {}; s.dzF.rows.forEach((l) => { (m[l.dezm_id] = m[l.dezm_id] || []).push(l); }); Object.values(m).forEach((a) => a.sort((x, y) => (x.ord || 0) - (y.ord || 0))); return m; }, [s.dzF.rows]);
  const liniiReteta = useMemo(() => { const m = {}; reteteL.rows.forEach((l) => { (m[l.reteta_id] = m[l.reteta_id] || []).push(l); }); return m; }, [reteteL.rows]);

  const echipamenteInOperatii = useMemo(() => [...new Set(s.dzE.rows.map((l) => l.echipament))].sort(colatie), [s.dzE.rows]);
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return s.dz.rows
      .filter((d) => (!fOrg || d.organizatie === fOrg) && (!fEch || (echDe[d.id] || []).some((l) => l.echipament === fEch))
        && (!t || `${d.nr_operatiune} ${d.observatii}`.toLowerCase().includes(t)))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)) || colatie(b.nr_operatiune, a.nr_operatiune));
  }, [s.dz.rows, q, fOrg, fEch, echDe]);

  const kgOperatie = (d) => r3((echDe[d.id] || []).reduce((x, l) => x + Number(l.kg), 0));
  const bucOperatie = (d) => (echDe[d.id] || []).reduce((x, l) => x + (l.buc || 0), 0);
  const totKg = r3(lista.reduce((x, d) => x + kgOperatie(d), 0));
  const totBuc = lista.reduce((x, d) => x + bucOperatie(d), 0);

  const urmatorulNr = () => {
    let max = 0;
    s.dz.rows.forEach((d) => { const m = String(d.nr_operatiune).match(/^GK-(\d+)$/i); if (m) max = Math.max(max, +m[1]); });
    return `GK-${max + 1}`;
  };

  const deschideNou = () => { setEroare(""); setInfo(""); setEdit({ id: null, pas: 1, f: { nr_operatiune: urmatorulNr(), data: azi(), organizatie: "", observatii: "" }, ech: [], fr: [] }); };
  const deschideEditare = (d) => {
    setEroare(""); setInfo("");
    setEdit({
      id: d.id, pas: 1,
      f: { nr_operatiune: d.nr_operatiune, data: d.data, organizatie: d.organizatie, observatii: d.observatii || "" },
      ech: (echDe[d.id] || []).map((l) => ({ echipament: l.echipament, cod: l.cod_ewc, kg: String(l.kg), buc: String(l.buc) })),
      fr: (frDe[d.id] || []).map((l) => ({ fractie: l.fractie, cod: l.cod, kg: String(l.kg) })),
    });
  };
  const setF = (patch) => setEdit((p) => ({ ...p, f: { ...p.f, ...patch } }));

  // Stocul disponibil pentru organizatia aleasa; la editare se adauga inapoi ce consuma deja aceasta operatiune.
  const propriu = useMemo(() => {
    const m = {};
    if (edit?.id) (echDe[edit.id] || []).forEach((l) => { const k = cheieStoc(l.echipament, l.cod_ewc, edit.f.organizatie); m[k] = { kg: (m[k]?.kg || 0) + Number(l.kg), buc: (m[k]?.buc || 0) + (l.buc || 0) }; });
    return m;
  }, [edit?.id, edit?.f.organizatie, echDe]);
  const stocOrg = useMemo(() => {
    if (!edit?.f.organizatie) return [];
    return s.stoc.echipamente
      .filter((r) => r.org === edit.f.organizatie)
      .map((r) => { const p = propriu[cheieStoc(r.den, r.cod, r.org)]; return { ...r, max: r3(r.disp + (p?.kg || 0)), maxBuc: r.bucDisp + (p?.buc || 0) }; })
      .filter((r) => r.max > 0.0005)
      .sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod));
  }, [s.stoc.echipamente, edit?.f.organizatie, propriu]);
  const maxLinie = (l) => stocOrg.find((r) => r.den === l.echipament && r.cod === l.cod);

  const adaugaDinStoc = (r) => setEdit((p) => (p.ech.some((l) => l.echipament === r.den && l.cod === r.cod) ? p : { ...p, ech: [...p.ech, { echipament: r.den, cod: r.cod, kg: String(r.max), buc: String(Math.max(r.maxBuc, 0)) }] }));
  const setEch = (i, patch) => setEdit((p) => ({ ...p, ech: p.ech.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const procent = (i, pr) => { const m = maxLinie(edit.ech[i]); if (m) setEch(i, { kg: String(r3((m.max * pr) / 100)), buc: String(Math.max(Math.round((m.maxBuc * pr) / 100), 0)) }); };
  const setFr = (i, patch) => setEdit((p) => ({ ...p, fr: p.fr.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  const totalEch = edit ? r3(edit.ech.reduce((x, l) => x + (numar(l.kg) || 0), 0)) : 0;
  const totalFr = edit ? r3(edit.fr.reduce((x, l) => x + (numar(l.kg) || 0), 0)) : 0;
  const diferenta = r3(totalEch - totalFr);
  const balanta = Math.abs(diferenta) <= 0.001;

  // Rețeta activa a fiecarui echipament → fractiile; kg-urile aceleiasi fractii se aduna. Restul de rotunjire intra in cea mai mare.
  const aplicaReteta = () => {
    const activa = (den) => retete.rows.find((r) => r.echipament === den && r.activ);
    const acc = new Map(); const faraReteta = []; let acoperit = 0;
    edit.ech.forEach((l) => {
      const kg = numar(l.kg) || 0; const r = activa(l.echipament);
      if (!r || !(liniiReteta[r.id] || []).length) { if (kg > 0) faraReteta.push(l.echipament); return; }
      acoperit += kg;
      (liniiReteta[r.id] || []).forEach((rl) => { const k = rl.fractie + "\u0001" + rl.cod; acc.set(k, (acc.get(k) || 0) + (kg * Number(rl.procent)) / 100); });
    });
    const rez = [...acc.entries()].map(([k, kg]) => { const [fractie, cod] = k.split("\u0001"); return { fractie, cod, kg: r3(kg) }; });
    if (rez.length) {
      const rest = r3(r3(acoperit) - rez.reduce((x, f) => x + f.kg, 0));
      if (Math.abs(rest) > 0) { const mare = rez.reduce((a, b) => (b.kg > a.kg ? b : a)); mare.kg = r3(mare.kg + rest); }
    }
    setEdit((p) => ({ ...p, fr: rez.map((f) => ({ ...f, kg: String(f.kg) })) }));
    setInfo(faraReteta.length ? `⚠️ Fără rețetă activă: ${[...new Set(faraReteta)].join(", ")}. Adaugă fracțiile lor manual (sau creează rețeta în Rețete).` : "✓ Rețeta a fost aplicată.");
  };

  const valideazaPas1 = () => {
    if (!edit.f.nr_operatiune.trim()) return "Completează numărul operațiunii.";
    if (!edit.f.data) return "Completează data.";
    if (!edit.f.organizatie) return "Alege organizația.";
    return "";
  };
  const valideazaPas2 = () => {
    if (!edit.ech.length) return "Alege cel puțin un echipament din stoc.";
    for (const l of edit.ech) {
      const kg = numar(l.kg); const m = maxLinie(l);
      if (!(kg > 0)) return `Greutatea pentru „${l.echipament}” trebuie să fie mai mare ca 0.`;
      if (!m) return `„${l.echipament}” (${l.cod || "fără cod"}) nu mai are stoc disponibil la ${edit.f.organizatie}.`;
      if (kg > m.max + 0.0005) return `„${l.echipament}”: ai cerut ${fmtKg(kg)} kg, dar în stoc sunt doar ${fmtKg(m.max)} kg.`;
      if (l.buc !== "" && !(Number.isInteger(numar(l.buc)) && numar(l.buc) >= 0)) return `Bucățile pentru „${l.echipament}” trebuie să fie un număr întreg.`;
    }
    if (!edit.fr.length) return "Adaugă fracțiile rezultate (poți folosi „Aplică rețetă”).";
    const vazute = new Set();
    for (const f of edit.fr) {
      if (!f.fractie) return "Alege fracția pe fiecare rând.";
      if (!(numar(f.kg) > 0)) return `Greutatea pentru fracția „${f.fractie}” trebuie să fie mai mare ca 0.`;
      const k = f.fractie + "|" + f.cod; if (vazute.has(k)) return `Fracția „${f.fractie}” (${f.cod || "fără cod"}) apare de două ori.`;
      vazute.add(k);
    }
    if (!balanta) return `Balanța nu e echilibrată: intrat ${fmtKg(totalEch)} kg, ieșit ${fmtKg(totalFr)} kg (diferență ${fmtKg(Math.abs(diferenta))} kg).`;
    return "";
  };

  const urmatorulPas = () => { const e = valideazaPas1(); if (e) { setEroare(e); return; } setEroare(""); setEdit((p) => ({ ...p, pas: 2 })); };

  const salveaza = async () => {
    const e1 = valideazaPas1(); if (e1) { setEroare(e1); setEdit((p) => ({ ...p, pas: 1 })); return; }
    const e2 = valideazaPas2(); if (e2) { setEroare(e2); return; }
    setSeSalveaza(true); setEroare("");
    try {
      const f = edit.f; const nr = f.nr_operatiune.trim();
      if (s.dz.rows.some((d) => d.id !== edit.id && d.nr_operatiune.toLowerCase() === nr.toLowerCase())) { setEroare("Există deja o operațiune cu acest număr."); return; }
      const rE = edit.ech.map((l, i) => ({ ord: i, echipament: l.echipament, cod_ewc: l.cod || "", kg: numar(l.kg), buc: l.buc === "" ? 0 : numar(l.buc) }));
      const rF = edit.fr.map((l, i) => ({ ord: i, fractie: l.fractie, cod: l.cod || "", kg: numar(l.kg) }));
      const rez = (a, c) => a.map((l) => c.map((k) => l[k]).join(":")).join("|");
      const antet = { nr_operatiune: nr, data: f.data, organizatie: f.organizatie, observatii: f.observatii.trim() };

      if (!edit.id) {
        const { data, error } = await sb.from("deee_dezmembrari").insert({ ...antet, status: "Finalizat", creat_de: currentUser || "" }).select();
        if (error) { setEroare(error.code === "23505" ? "Există deja o operațiune cu acest număr." : "Eroare: " + error.message); return; }
        const d = data[0];
        const a1 = await sb.from("deee_dezm_echipamente").insert(rE.map((l) => ({ ...l, dezm_id: d.id })));
        const a2 = a1.error ? a1 : await sb.from("deee_dezm_fractii").insert(rF.map((l) => ({ ...l, dezm_id: d.id })));
        if (a1.error || a2.error) { await sb.from("deee_dezmembrari").delete().eq("id", d.id); setEroare("Eroare la salvare: " + (a1.error || a2.error).message); return; }
        logAction("add", "deee_dezmembrari", d.id, { nr_operatiune: nr, data: f.data, organizatie: f.organizatie, kg: totalEch, echipamente: rE.length, fractii: rF.length });
      } else {
        const vechi = s.dz.rows.find((d) => d.id === edit.id);
        const eV = echDe[edit.id] || [], fV = frDe[edit.id] || [];
        // liniile noi se scriu INTAI; abia dupa ce au reusit se sterg cele vechi
        const i1 = await sb.from("deee_dezm_echipamente").insert(rE.map((l) => ({ ...l, dezm_id: edit.id }))).select();
        const i2 = i1.error ? i1 : await sb.from("deee_dezm_fractii").insert(rF.map((l) => ({ ...l, dezm_id: edit.id }))).select();
        if (i1.error || i2.error) {
          if (i1.data?.length) await sb.from("deee_dezm_echipamente").delete().in("id", i1.data.map((l) => l.id));
          setEroare("Eroare la salvare: " + (i1.error || i2.error).message); return;
        }
        const { error } = await sb.from("deee_dezmembrari").update(antet).eq("id", edit.id);
        if (error) {
          await sb.from("deee_dezm_echipamente").delete().in("id", i1.data.map((l) => l.id));
          await sb.from("deee_dezm_fractii").delete().in("id", i2.data.map((l) => l.id));
          setEroare(error.code === "23505" ? "Există deja o operațiune cu acest număr." : "Eroare: " + error.message); return;
        }
        if (eV.length) await sb.from("deee_dezm_echipamente").delete().in("id", eV.map((l) => l.id));
        if (fV.length) await sb.from("deee_dezm_fractii").delete().in("id", fV.map((l) => l.id));
        const sch = Object.keys(antet).filter((k) => String(vechi?.[k] ?? "") !== String(antet[k]));
        const eS = rez(eV.map((l) => ({ ...l, cod: l.cod_ewc })), ["echipament", "cod", "kg", "buc"]) !== rez(rE.map((l) => ({ ...l, cod: l.cod_ewc })), ["echipament", "cod", "kg", "buc"]);
        const fS = rez(fV, ["fractie", "cod", "kg"]) !== rez(rF, ["fractie", "cod", "kg"]);
        if (sch.length || eS || fS) {
          logAction("update", "deee_dezmembrari", edit.id, {
            nr_operatiune: nr, ...Object.fromEntries(sch.map((k) => [k, antet[k]])),
            ...(eS ? { echipamente: rez(rE.map((l) => ({ ...l, cod: l.cod_ewc })), ["echipament", "cod", "kg", "buc"]) } : {}), ...(fS ? { fractii: rez(rF, ["fractie", "cod", "kg"]) } : {}),
            _inainte: { ...Object.fromEntries(sch.map((k) => [k, vechi?.[k] ?? ""])), ...(eS ? { echipamente: rez(eV.map((l) => ({ ...l, cod: l.cod_ewc })), ["echipament", "cod", "kg", "buc"]) } : {}), ...(fS ? { fractii: rez(fV, ["fractie", "cod", "kg"]) } : {}) },
          });
        }
      }
      setEdit(null);
      await s.reloadAll();
    } finally { setSeSalveaza(false); }
  };

  const sterge = async (d) => {
    if (!confirmDel(`operațiunea ${d.nr_operatiune}`)) return;
    const snapshot = { operatiune: d, echipamente: echDe[d.id] || [], fractii: frDe[d.id] || [] };
    const { error } = await sb.from("deee_dezmembrari").delete().eq("id", d.id);
    if (error) { alert("Eroare: " + error.message); return; }
    logAction("delete", "deee_dezmembrari", d.id, { nr_operatiune: d.nr_operatiune, _sters: snapshot });
    await s.reloadAll();
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const card = (t, v, c) => (
    <div style={{ flex: "1 1 150px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 14px", boxShadow: "0 1px 2px rgba(15,23,42,.05)" }}>
      <div style={{ fontSize: 10, color: "#64748b" }}>{t}</div><div style={{ fontSize: 16, fontWeight: 800, color: c }}>{v}</div>
    </div>
  );
  const fractiiActive = frac.rows.filter((f) => f.activ).sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod));
  const lab = (t, req) => <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{t}{req ? " *" : ""}</label>;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {card("Operațiuni", lista.length, "#1e293b")}
        {card("Total greutate (kg)", fmtKg(totKg), "#047857")}
        {card("Total bucăți", totBuc.toLocaleString("ro-RO"), "#1565c0")}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <input style={{ ...inputSt, width: 220 }} placeholder="🔍 Nr. operațiune sau observații..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ ...inputSt, width: 150 }} value={fOrg} onChange={(e) => setFOrg(e.target.value)}><option value="">Organizația</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        <select style={{ ...inputSt, width: 220 }} value={fEch} onChange={(e) => setFEch(e.target.value)}><option value="">Echipament</option>{echipamenteInOperatii.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={deschideNou} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Operațiune nouă</button>
        </div>
      </div>

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 860 }}>
          <thead><tr>
            <th style={ui.th({ width: 90 })}>Data</th><th style={ui.th({ width: 100 })}>Nr. operațiune</th>
            <th style={ui.th({ textAlign: "left" })}>Echipamente</th><th style={ui.th({ width: 100 })}>Organizație</th>
            <th style={ui.th({ width: 150 })}>Total cantitate</th><th style={ui.th({ width: 80 })}>Status</th>
            <th style={ui.th({ textAlign: "left", width: 160 })}>Observații</th><th style={ui.th({ width: 70 })}></th>
          </tr></thead>
          <tbody>
            {!s.incarcat && <tr><td colSpan={8} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {s.incarcat && lista.length === 0 && <tr><td colSpan={8} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>{s.dz.rows.length ? "Nicio operațiune pentru filtrele alese." : "Nicio operațiune încă. Înainte de prima, verifică stocul în „Stocuri”."}</td></tr>}
            {lista.map((d) => {
              const ls = echDe[d.id] || [];
              return (
                <tr key={d.id}>
                  <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{dataRo(d.data)}</td>
                  <td style={ui.td({ textAlign: "center", fontWeight: 700, color: G })}>{d.nr_operatiune}</td>
                  <td style={ui.td({ fontSize: 11 })}>{ls.map((l) => <div key={l.id}>{l.echipament} — {fmtKg(l.kg)} kg, {l.buc} buc</div>)}</td>
                  <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{d.organizatie}</td>
                  <td style={ui.td({ textAlign: "right", fontWeight: 700 })}>{fmtKg(kgOperatie(d))} kg · {bucOperatie(d)} buc</td>
                  <td style={ui.td({ textAlign: "center" })}><span style={{ background: "#e8f5e9", color: "#047857", borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{d.status}</span></td>
                  <td style={ui.td({ fontSize: 11, color: "#64748b" })}>{d.observatii || "—"}</td>
                  <td style={ui.td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}>
                    <button onClick={() => deschideEditare(d)} title="Editează" style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>✏️</button>{" "}
                    <button onClick={() => sterge(d)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {edit && (
        <div onClick={() => !seSalveaza && setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(980px,100%)", maxHeight: "95vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{edit.id ? `Editare operațiune ${edit.f.nr_operatiune}` : "Operațiune nouă de dezmembrare"}</div>
              <div style={{ display: "flex", gap: 6, fontSize: 11, fontWeight: 700 }}>
                {[["1", "Informații operațiune"], ["2", "Echipamente & fracții"]].map(([n, t]) => (
                  <span key={n} style={{ padding: "3px 10px", borderRadius: 12, background: String(edit.pas) === n ? G : "#eef2f6", color: String(edit.pas) === n ? "#fff" : "#64748b" }}>{n}. {t}</span>
                ))}
              </div>
              <button onClick={() => !seSalveaza && setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <div style={{ padding: 20, overflowY: "auto" }}>
              {edit.pas === 1 && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 180px" }}>{lab("Nr. operațiune", true)}<input style={inputSt} value={edit.f.nr_operatiune} onChange={(e) => setF({ nr_operatiune: e.target.value })} /></div>
                  <div style={{ flex: "1 1 170px" }}>{lab("Data operațiune", true)}<input type="date" style={inputSt} value={edit.f.data} onChange={(e) => setF({ data: e.target.value })} /></div>
                  <div style={{ flex: "1 1 200px" }}>{lab("Organizație", true)}
                    <select style={inputSt} value={edit.f.organizatie} disabled={!!edit.id && edit.ech.length > 0} onChange={(e) => setEdit((p) => ({ ...p, f: { ...p.f, organizatie: e.target.value }, ech: [], fr: [] }))}>
                      <option value="">Alege organizația…</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Se dezmembrează doar din stocul acestei organizații.</div>
                  </div>
                  <div style={{ flex: "1 1 100%" }}>{lab("Observații")}<textarea style={{ ...inputSt, minHeight: 50, fontFamily: "inherit" }} value={edit.f.observatii} onChange={(e) => setF({ observatii: e.target.value })} /></div>
                </div>
              )}

              {edit.pas === 2 && (
                <div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ flex: "1 1 300px", minWidth: 280 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#334155" }}>Stoc disponibil — {edit.f.organizatie}</div>
                      <div style={{ ...ui.TBL, maxHeight: 250 }}>
                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                          <thead><tr><th style={ui.th({ textAlign: "left" })}>Echipament</th><th style={ui.th({ width: 62 })}>Cod</th><th style={ui.th({ width: 90 })}>Disp. kg</th><th style={ui.th({ width: 36 })}></th></tr></thead>
                          <tbody>
                            {stocOrg.length === 0 && <tr><td colSpan={4} style={ui.td({ textAlign: "center", padding: 14, color: "#94a3b8", fontSize: 11 })}>Nu există stoc de echipamente la această organizație. Adaugă achiziții sau „Stoc inițial” în Stocuri.</td></tr>}
                            {stocOrg.map((r) => {
                              const folosit = edit.ech.some((l) => l.echipament === r.den && l.cod === r.cod);
                              return (
                                <tr key={r.den + r.cod} style={{ opacity: folosit ? 0.5 : 1 }}>
                                  <td style={ui.td({ fontSize: 11, fontWeight: 600 })}>{r.den}</td>
                                  <td style={ui.td({ textAlign: "center", fontSize: 10 })}>{r.cod || "—"}</td>
                                  <td style={ui.td({ textAlign: "right", fontSize: 11 })}>{fmtKg(r.max)}</td>
                                  <td style={ui.td({ textAlign: "center", padding: 2 })}><button disabled={folosit} onClick={() => adaugaDinStoc(r)} title="Adaugă în operațiune" style={{ background: folosit ? "#e5e7eb" : G, color: "#fff", border: "none", borderRadius: 4, cursor: folosit ? "default" : "pointer", fontSize: 12, padding: "1px 8px" }}>+</button></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ flex: "1.4 1 380px", minWidth: 320 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#334155" }}>Echipamente selectate</div>
                      {edit.ech.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", padding: "10px 0" }}>Alege din stocul din stânga (butonul +).</div>}
                      {edit.ech.map((l, i) => {
                        const m = maxLinie(l);
                        return (
                          <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, marginBottom: 8, background: "#fafbfc" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                              <div style={{ fontWeight: 700, fontSize: 12 }}>{l.echipament} <span style={{ fontWeight: 500, color: "#64748b", fontSize: 11 }}>({l.cod || "fără cod"})</span></div>
                              <button onClick={() => setEdit((p) => ({ ...p, ech: p.ech.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }} title="Scoate">✕</button>
                            </div>
                            <div style={{ fontSize: 10, color: "#64748b", margin: "2px 0 6px" }}>Stoc disponibil: {m ? `${fmtKg(m.max)} kg, ${m.maxBuc} buc` : "— (epuizat)"}</div>
                            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 6 }}>
                              {PROCENTE.map((p) => <button key={p} onClick={() => procent(i, p)} style={{ background: "#fff", border: `1px solid ${G}66`, color: G, borderRadius: 5, padding: "1px 6px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{p}%</button>)}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <div style={{ flex: 2 }}>{lab("Greutate (kg)")}<input style={{ ...inputSt, textAlign: "right", fontWeight: 700 }} inputMode="decimal" value={l.kg} onChange={(e) => setEch(i, { kg: e.target.value })} /></div>
                              <div style={{ flex: 1 }}>{lab("Bucăți")}<input style={{ ...inputSt, textAlign: "right" }} inputMode="numeric" value={l.buc} onChange={(e) => setEch(i, { buc: e.target.value })} /></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#334155" }}>Fracții rezultate</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={aplicaReteta} disabled={!edit.ech.length} style={{ background: edit.ech.length ? "#6a1b9a" : "#9ca3af", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", cursor: edit.ech.length ? "pointer" : "default", fontSize: 12, fontWeight: 700 }}>🧪 Aplică rețetă</button>
                      <button onClick={() => setEdit((p) => ({ ...p, fr: [...p.fr, { fractie: "", cod: "", kg: diferenta > 0 ? String(diferenta) : "" }] }))} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Fracție</button>
                    </div>
                  </div>
                  {info && <div style={{ fontSize: 12, marginTop: 6, color: info.startsWith("⚠️") ? "#92400e" : "#047857" }}>{info}</div>}
                  {edit.fr.length > 0 && (
                    <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 8 }}>
                      <thead><tr><th style={ui.th({ textAlign: "left" })}>Fracție (cod EWC)</th><th style={ui.th({ width: 150 })}>Kg</th><th style={ui.th({ width: 80 })}>%</th><th style={ui.th({ width: 36 })}></th></tr></thead>
                      <tbody>
                        {edit.fr.map((f, i) => {
                          const idc = frac.rows.find((x) => x.den === f.fractie && x.cod === f.cod)?.id || "";
                          return (
                            <tr key={i}>
                              <td style={ui.td({ padding: 3 })}>
                                <select style={inputSt} value={idc} onChange={(e) => { const x = frac.rows.find((y) => y.id === e.target.value); setFr(i, x ? { fractie: x.den, cod: x.cod } : { fractie: "", cod: "" }); }}>
                                  <option value="">Alege fracția…</option>
                                  {fractiiActive.map((x) => <option key={x.id} value={x.id}>{x.den}{x.cod ? ` — ${x.cod}` : ""}</option>)}
                                  {f.fractie && !idc && <option value="" disabled>{f.fractie} — {f.cod} (inactivă)</option>}
                                </select>
                              </td>
                              <td style={ui.td({ padding: 3 })}><input style={{ ...inputSt, textAlign: "right", fontWeight: 700 }} inputMode="decimal" value={f.kg} onChange={(e) => setFr(i, { kg: e.target.value })} /></td>
                              <td style={ui.td({ textAlign: "right", fontSize: 11, color: "#64748b" })}>{totalFr > 0 ? ((numar(f.kg) || 0) / totalFr * 100).toFixed(1) : "—"}%</td>
                              <td style={ui.td({ textAlign: "center", padding: 2 })}><button onClick={() => setEdit((p) => ({ ...p, fr: p.fr.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: balanta && totalEch > 0 ? "#ecfdf5" : "#fff7ed", border: `1px solid ${balanta && totalEch > 0 ? "#6ee7b7" : "#fdba74"}`, display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13, fontWeight: 700 }}>
                    <span>Total intrat: {fmtKg(totalEch)} kg</span>
                    <span>Total ieșit (fracții): {fmtKg(totalFr)} kg</span>
                    <span style={{ color: balanta && totalEch > 0 ? "#047857" : "#c2410c" }}>{balanta && totalEch > 0 ? "Balanță OK ✓" : `Diferență: ${fmtKg(Math.abs(diferenta))} kg`}</span>
                  </div>
                </div>
              )}
              {eroare && <div style={{ marginTop: 12, color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button disabled={seSalveaza} onClick={() => setEdit(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <div style={{ display: "flex", gap: 8 }}>
                {edit.pas === 2 && <button disabled={seSalveaza} onClick={() => { setEroare(""); setEdit((p) => ({ ...p, pas: 1 })); }} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>← Pasul anterior</button>}
                {edit.pas === 1
                  ? <button onClick={urmatorulPas} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Selectare echipamente →</button>
                  : <button disabled={seSalveaza} onClick={salveaza} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: seSalveaza ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează operațiunea"}</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
