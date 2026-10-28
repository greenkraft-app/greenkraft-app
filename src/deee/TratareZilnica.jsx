import { useState, useMemo } from "react";
import { useTabela, numar, colatie } from "./hooks";
import { useFisiere, stergeFisiere } from "./stocareFisiere";
import PanouFisiere from "./PanouFisiere";
import { calculeazaTratare } from "./tratare";
import { etichetaReteta, tipulRetetei } from "./Retete";
import { dataRo, fmtKg } from "./constante";

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const azi = () => { const d = new Date(); const p = (x) => String(x).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const PRAGURI = [1, 2, 3, 5, 7, 14];
const citestePrag = () => { try { const v = Number(localStorage.getItem("deee_tr_prag")); return PRAGURI.includes(v) ? v : 3; } catch { return 3; } };

// Tratare zilnica: bazinul de marfa intrata la tratare si inca netratata, PV-ul zilnic de tratare (ce s-a tratat, ce fractii au rezultat,
// cine a tratat), vechimea marfii ramase, zilele fara PV si cat a tratat fiecare om.
export default function TratareZilnica({ sb, G, ui, currentUser, logAction, confirmDel }) {
  const intr = useTabela(sb, "deee_tr_intrari");
  const pv = useTabela(sb, "deee_tr_pv");
  const marfa = useTabela(sb, "deee_tr_pv_marfa");
  const frT = useTabela(sb, "deee_tr_pv_fractii");
  const ech = useTabela(sb, "deee_echipamente");
  const frac = useTabela(sb, "deee_fractii");
  const retete = useTabela(sb, "deee_retete");
  const reteteL = useTabela(sb, "deee_retete_linii");
  const fis = useFisiere(sb);
  const [tab, setTab] = useState("zile");
  const [deschis, setDeschis] = useState(null);
  const [prag, setPrag] = useState(citestePrag);
  const [eI, setEI] = useState(null);   // modal intrare
  const [eP, setEP] = useState(null);   // modal PV
  const [eroare, setEroare] = useState("");
  const [info, setInfo] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);
  const [panou, setPanou] = useState(null);

  const lipsa = [intr, pv, marfa, frT].some((t) => t.eroare && (t.eroare.code === "42P01" || t.eroare.code === "PGRST205" || /does not exist|Could not find the table/i.test(t.eroare.message || "")));
  const incarcat = [intr, pv, marfa, frT].every((t) => t.incarcat);
  const C = useMemo(() => calculeazaTratare({ intrari: intr.rows, pv: pv.rows, marfa: marfa.rows, fractii: frT.rows, azi: azi() }), [intr.rows, pv.rows, marfa.rows, frT.rows]);
  const luna = azi().slice(0, 7);
  const luniCard = useMemo(() => ({
    intrat: r2(intr.rows.filter((i) => String(i.data).startsWith(luna)).reduce((s, i) => s + Number(i.kg), 0)),
    tratat: r2(C.zile.filter((z) => z.data.startsWith(luna)).reduce((s, z) => s + z.tratat, 0)),
  }), [intr.rows, C.zile, luna]);
  const ziAzi = C.zile.find((z) => z.data === azi());
  const echipamenteActive = ech.rows.filter((e) => e.activ).sort((a, b) => colatie(a.den, b.den));
  const fractiiActive = frac.rows.filter((f) => f.activ).sort((a, b) => colatie(a.den, b.den) || colatie(a.cod, b.cod));
  const liniiReteta = useMemo(() => { const m = {}; reteteL.rows.forEach((l) => { (m[l.reteta_id] = m[l.reteta_id] || []).push(l); }); return m; }, [reteteL.rows]);
  const bazinTip = (den) => C.bazinPeTip.find((x) => x.echipament === den)?.kg || 0;

  const schimbaPrag = (v) => { setPrag(v); try { localStorage.setItem("deee_tr_prag", String(v)); } catch { /* fara stocare locala */ } };

  // ── intrari de marfa ──
  const intrareNoua = () => { setEroare(""); setEI({ id: null, data: azi(), kg: "", echipament: "", nr_tichet: "", observatii: "" }); };
  const intrareEdit = (i) => { setEroare(""); setEI({ id: i.id, data: i.data, kg: String(i.kg), echipament: i.echipament || "", nr_tichet: i.nr_tichet || "", observatii: i.observatii || "" }); };
  const salveazaIntrare = async () => {
    if (!eI.data) { setEroare("Completează data."); return; }
    if (!(numar(eI.kg) > 0)) { setEroare("Cantitatea trebuie să fie mai mare ca 0."); return; }
    setSeSalveaza(true); setEroare("");
    try {
      const row = { data: eI.data, kg: numar(eI.kg), echipament: eI.echipament, nr_tichet: eI.nr_tichet.trim(), observatii: eI.observatii.trim() };
      if (!eI.id) {
        const { data, error } = await sb.from("deee_tr_intrari").insert({ ...row, creat_de: currentUser || "" }).select();
        if (error) { setEroare("Eroare: " + error.message); return; }
        intr.setRows((p) => [...p, data[0]]);
        logAction("add", "deee_tr_intrari", data[0].id, row);
      } else {
        const vechi = intr.rows.find((x) => x.id === eI.id);
        const { error } = await sb.from("deee_tr_intrari").update(row).eq("id", eI.id);
        if (error) { setEroare("Eroare: " + error.message); return; }
        intr.setRows((p) => p.map((x) => (x.id === eI.id ? { ...x, ...row } : x)));
        const sch = Object.keys(row).filter((k) => String(vechi?.[k] ?? "") !== String(row[k]));
        if (sch.length) logAction("update", "deee_tr_intrari", eI.id, { ...Object.fromEntries(sch.map((k) => [k, row[k]])), _inainte: Object.fromEntries(sch.map((k) => [k, vechi?.[k] ?? ""])) });
      }
      setEI(null);
    } finally { setSeSalveaza(false); }
  };
  const stergeIntrare = async (i) => {
    if (!confirmDel(`intrarea de ${fmtKg(i.kg)} kg din ${dataRo(i.data)}`)) return;
    const { error } = await sb.from("deee_tr_intrari").delete().eq("id", i.id);
    if (error) { alert("Eroare: " + error.message); return; }
    intr.setRows((p) => p.filter((x) => x.id !== i.id));
    logAction("delete", "deee_tr_intrari", i.id, { data: i.data, kg: i.kg, _sters: i });
  };

  // ── PV de tratare ──
  const pvNou = () => { setEroare(""); setInfo(""); setEP({ id: null, f: { data: azi(), nr_pv: "", tratat_de: "", ora_inceput: "", ora_sfarsit: "", observatii: "" }, marfa: [{ echipament: "", kg: "", buc: "" }], fr: [] }); };
  const pvEdit = (p) => {
    setEroare(""); setInfo("");
    setEP({
      id: p.id, f: { data: p.data, nr_pv: p.nr_pv || "", tratat_de: p.tratat_de || "", ora_inceput: p.ora_inceput || "", ora_sfarsit: p.ora_sfarsit || "", observatii: p.observatii || "" },
      marfa: p.marfa.map((l) => ({ echipament: l.echipament || "", kg: String(l.kg), buc: l.buc ? String(l.buc) : "" })), fr: p.fractii.map((l) => ({ fractie: l.fractie, cod: l.cod, kg: String(l.kg) })),
    });
  };
  const setF = (patch) => setEP((p) => ({ ...p, f: { ...p.f, ...patch } }));
  const setL = (cheie, i, patch) => setEP((p) => ({ ...p, [cheie]: p[cheie].map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const totalM = eP ? r2(eP.marfa.reduce((s, l) => s + (numar(l.kg) || 0), 0)) : 0;
  const totalF = eP ? r2(eP.fr.reduce((s, l) => s + (numar(l.kg) || 0), 0)) : 0;
  const diferenta = r2(totalM - totalF);
  const balanta = totalM > 0 && Math.abs(diferenta) <= 0.01;

  // reteta activa a companiei (altfel cea globala) pe fiecare echipament tratat; marfa "amestec" nu are reteta
  const aplicaReteta = () => {
    const activa = (den) => { const a = retete.rows.filter((r) => r.echipament === den && r.activ); return a.find((r) => tipulRetetei(r) === "Companie") || a[0]; };
    const acc = new Map(); const faraReteta = []; const folosite = []; let acoperit = 0;
    eP.marfa.forEach((l) => {
      const kg = numar(l.kg) || 0; if (!(kg > 0)) return;
      const r = l.echipament ? activa(l.echipament) : null;
      if (!r || !(liniiReteta[r.id] || []).length) { faraReteta.push(l.echipament || "Amestec"); return; }
      acoperit += kg; if (!folosite.includes(etichetaReteta(r))) folosite.push(etichetaReteta(r));
      liniiReteta[r.id].forEach((rl) => { const k = rl.fractie + "\u0001" + rl.cod; acc.set(k, (acc.get(k) || 0) + (kg * Number(rl.procent)) / 100); });
    });
    const rez = [...acc.entries()].map(([k, kg]) => { const [fractie, cod] = k.split("\u0001"); return { fractie, cod, kg: r2(kg) }; });
    if (rez.length) { const rest = r2(r2(acoperit) - rez.reduce((x, f) => x + f.kg, 0)); if (rest) { const mare = rez.reduce((a, b) => (b.kg > a.kg ? b : a)); mare.kg = r2(mare.kg + rest); } }
    setEP((p) => ({ ...p, fr: [...p.fr.filter((f) => !rez.some((x) => x.fractie === f.fractie && x.cod === f.cod)), ...rez.map((f) => ({ ...f, kg: String(f.kg) }))] }));
    setInfo((faraReteta.length ? `⚠️ Fără rețetă (adaugă fracțiile manual): ${[...new Set(faraReteta)].join(", ")}. ` : "") + (folosite.length ? `✓ Rețete aplicate: ${folosite.join(", ")}.` : ""));
  };
  const adaugaPierderi = () => {
    if (!(diferenta > 0)) return;
    const f = fractiiActive.find((x) => x.den === "Pierderi tehnologice") || { den: "Pierderi tehnologice", cod: "99 99 99" };
    setEP((p) => {
      const ex = p.fr.findIndex((x) => x.fractie === f.den && x.cod === f.cod);
      if (ex >= 0) return { ...p, fr: p.fr.map((x, j) => (j === ex ? { ...x, kg: String(r2((numar(x.kg) || 0) + diferenta)) } : x)) };
      return { ...p, fr: [...p.fr, { fractie: f.den, cod: f.cod, kg: String(diferenta) }] };
    });
  };

  const valideazaPv = () => {
    if (!eP.f.data) return "Completează data.";
    if (!eP.f.tratat_de.trim()) return "Completează cine a tratat (numele; mai multe, separate prin virgulă).";
    if (!eP.marfa.length) return "Adaugă marfa tratată.";
    for (const l of eP.marfa) if (!(numar(l.kg) > 0)) return `Cantitatea pentru „${l.echipament || "Amestec"}” trebuie să fie mai mare ca 0.`;
    for (const l of eP.marfa) if (l.buc !== "" && !(Number.isInteger(numar(l.buc)) && numar(l.buc) >= 0)) return "Bucățile trebuie să fie un număr întreg.";
    if (!eP.fr.length) return "Adaugă fracțiile rezultate (poți folosi „Aplică rețetă”).";
    const vazute = new Set();
    for (const f of eP.fr) {
      if (!f.fractie) return "Alege fracția pe fiecare rând.";
      if (!(numar(f.kg) > 0)) return `Cantitatea pentru fracția „${f.fractie}” trebuie să fie mai mare ca 0.`;
      const k = f.fractie + "|" + f.cod; if (vazute.has(k)) return `Fracția „${f.fractie}” (${f.cod || "fără cod"}) apare de două ori.`; vazute.add(k);
    }
    if (!balanta) return `Balanța nu e echilibrată: tratat ${fmtKg(totalM)} kg, fracții ${fmtKg(totalF)} kg (diferență ${fmtKg(Math.abs(diferenta))} kg).`;
    return "";
  };

  const salveazaPv = async () => {
    const e = valideazaPv(); if (e) { setEroare(e); return; }
    // avertizare (nu blocare): se trateaza mai mult decat a intrat in bazin pana in acea zi
    const alt = { intrari: intr.rows, pv: eP.id ? pv.rows.filter((p) => p.id !== eP.id) : pv.rows, marfa: eP.id ? marfa.rows.filter((m) => m.pv_id !== eP.id) : marfa.rows, fractii: frT.rows };
    const simulat = calculeazaTratare({
      ...alt, pv: [...alt.pv, { id: "_nou", created_at: "9", data: eP.f.data, tratat_de: eP.f.tratat_de }],
      marfa: [...alt.marfa, ...eP.marfa.map((l, i) => ({ pv_id: "_nou", ord: i, echipament: l.echipament, kg: numar(l.kg) }))], azi: azi(),
    });
    const nou = simulat.deficit - C.deficit + (eP.id ? (C.zile.flatMap((z) => z.pv).find((p) => p.id === eP.id)?.deficit || 0) : 0);
    if (nou > 0.5 && !window.confirm(`Ai trecut la tratare cu ${fmtKg(nou)} kg mai mult decât a intrat în bazin până la ${dataRo(eP.f.data)}.\n\nSalvezi oricum? (Poate lipsește o intrare de marfă.)`)) return;
    setSeSalveaza(true); setEroare("");
    try {
      const f = eP.f;
      const antet = { data: f.data, nr_pv: f.nr_pv.trim(), tratat_de: f.tratat_de.trim(), ora_inceput: f.ora_inceput, ora_sfarsit: f.ora_sfarsit, observatii: f.observatii.trim() };
      const rM = eP.marfa.map((l, i) => ({ ord: i, echipament: l.echipament, kg: numar(l.kg), buc: l.buc === "" ? 0 : numar(l.buc) }));
      const rF = eP.fr.map((l, i) => ({ ord: i, fractie: l.fractie, cod: l.cod || "", kg: numar(l.kg) }));
      let id = eP.id;
      if (!id) {
        const { data, error } = await sb.from("deee_tr_pv").insert({ ...antet, creat_de: currentUser || "" }).select();
        if (error) { setEroare("Eroare: " + error.message); return; }
        id = data[0].id;
        const a1 = await sb.from("deee_tr_pv_marfa").insert(rM.map((l) => ({ ...l, pv_id: id })));
        const a2 = a1.error ? a1 : await sb.from("deee_tr_pv_fractii").insert(rF.map((l) => ({ ...l, pv_id: id })));
        if (a1.error || a2.error) { await sb.from("deee_tr_pv").delete().eq("id", id); setEroare("Eroare la salvare: " + (a1.error || a2.error).message); return; }
        logAction("add", "deee_tr_pv", id, { ...antet, tratat_kg: totalM, fractii: rF.length });
      } else {
        const vechi = pv.rows.find((p) => p.id === id); const mV = marfa.rows.filter((l) => l.pv_id === id), fV = frT.rows.filter((l) => l.pv_id === id);
        const i1 = await sb.from("deee_tr_pv_marfa").insert(rM.map((l) => ({ ...l, pv_id: id }))).select();
        const i2 = i1.error ? i1 : await sb.from("deee_tr_pv_fractii").insert(rF.map((l) => ({ ...l, pv_id: id }))).select();
        if (i1.error || i2.error) { if (i1.data?.length) await sb.from("deee_tr_pv_marfa").delete().in("id", i1.data.map((l) => l.id)); setEroare("Eroare la salvare: " + (i1.error || i2.error).message); return; }
        const { error } = await sb.from("deee_tr_pv").update(antet).eq("id", id);
        if (error) { await sb.from("deee_tr_pv_marfa").delete().in("id", i1.data.map((l) => l.id)); await sb.from("deee_tr_pv_fractii").delete().in("id", i2.data.map((l) => l.id)); setEroare("Eroare: " + error.message); return; }
        if (mV.length) await sb.from("deee_tr_pv_marfa").delete().in("id", mV.map((l) => l.id));
        if (fV.length) await sb.from("deee_tr_pv_fractii").delete().in("id", fV.map((l) => l.id));
        const rez = (a, c) => a.map((l) => c.map((k) => l[k]).join(":")).join("|");
        const sch = Object.keys(antet).filter((k) => String(vechi?.[k] ?? "") !== String(antet[k]));
        logAction("update", "deee_tr_pv", id, { ...Object.fromEntries(sch.map((k) => [k, antet[k]])), marfa: rez(rM, ["echipament", "kg"]), fractii: rez(rF, ["fractie", "cod", "kg"]), _inainte: { ...Object.fromEntries(sch.map((k) => [k, vechi?.[k] ?? ""])), marfa: rez(mV, ["echipament", "kg"]), fractii: rez(fV, ["fractie", "cod", "kg"]) } });
      }
      setEP(null);
      await Promise.all([pv.reload(), marfa.reload(), frT.reload()]);
    } finally { setSeSalveaza(false); }
  };
  const stergePv = async (p) => {
    if (!confirmDel(`PV-ul din ${dataRo(p.data)} (${fmtKg(p.kgTratat)} kg, ${p.tratat_de})`)) return;
    const snapshot = { pv: { ...p, marfa: undefined, fractii: undefined }, marfa: p.marfa, fractii: p.fractii, fisiere: fis.pe("tratare", p.id).map((f) => ({ nume: f.nume, cale: f.cale })) };
    const faraFisiere = await stergeFisiere(sb, fis.pe("tratare", p.id));
    if (faraFisiere) { alert("Nu am putut șterge fișierele atașate: " + faraFisiere); return; }
    const { error } = await sb.from("deee_tr_pv").delete().eq("id", p.id);
    if (error) { alert("Eroare: " + error.message); return; }
    logAction("delete", "deee_tr_pv", p.id, { data: p.data, tratat_de: p.tratat_de, _sters: snapshot });
    await Promise.all([pv.reload(), marfa.reload(), frT.reload(), fis.reload()]);
  };

  const exporta = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`; const nr = (n) => String(n).replace(".", ",");
    const linii = [["Data", "Intrat (kg)", "Tratat (kg)", "Fractii (kg)", "Randament %", "Bazin la sfarsit de zi (kg)", "Cine a tratat", "Nr. PV"].map(esc).join(";")];
    [...C.zile].reverse().forEach((z) => linii.push([dataRo(z.data), nr(z.intrat), nr(z.tratat), nr(z.fractiiKg), z.randament === null ? "" : nr(Math.round(z.randament * 10) / 10), nr(z.bazinSfarsit), z.pv.map((p) => p.tratat_de).join(" | "), z.pv.map((p) => p.nr_pv).filter(Boolean).join(" | ")].map(esc).join(";")));
    linii.push("", ["BAZIN ACUM", "Data intrarii", "Echipament", "Kg initial", "Kg ramas", "Zile in asteptare"].map(esc).join(";"));
    C.loturi.forEach((l) => linii.push(["", dataRo(l.data), l.echipament || "Amestec", nr(l.kg), nr(l.ramas), l.zile].map(esc).join(";")));
    const blob = new Blob(["﻿" + linii.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tratare-zilnica-${azi()}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const lab = (t, req) => <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{t}{req ? " *" : ""}</label>;
  const card = (t, v, c, sub) => (
    <div style={{ flex: "1 1 160px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 14px", boxShadow: "0 1px 2px rgba(15,23,42,.05)" }}>
      <div style={{ fontSize: 10, color: "#64748b" }}>{t}</div><div style={{ fontSize: 17, fontWeight: 800, color: c }}>{v}</div>{sub && <div style={{ fontSize: 10, color: "#64748b" }}>{sub}</div>}
    </div>
  );
  const subSt = (k) => ({ padding: "6px 16px", cursor: "pointer", border: "none", fontWeight: 700, fontSize: 12, borderRadius: 8, marginRight: 4, background: tab === k ? G : "#eef2f6", color: tab === k ? "#fff" : "#475569" });
  const culoareVechime = (z) => (z >= prag * 2 ? "#c62828" : z >= prag ? "#e65100" : "#047857");
  const btnMic = (c, bg, bd) => ({ background: bg, border: `1px solid ${bd}`, borderRadius: 4, cursor: "pointer", color: c, fontSize: 11, fontWeight: 700, padding: "2px 8px" });

  if (lipsa) {
    return (
      <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: 18, maxWidth: 680, color: "#78350f", fontSize: 13, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 6 }}>Mai trebuie un pas: crearea tabelelor în Supabase</div>
        Rulează o singură dată fișierul <b>supabase-deee-17-tratare-zilnica.sql</b>: Supabase → <b>SQL Editor</b> → New query → lipești conținutul → <b>Run</b>. Apoi reîncarcă pagina.
      </div>
    );
  }

  const alerte = [];
  if (C.vechimeMax >= prag) alerte.push(`Marfă netratată de ${C.vechimeMax} zile în bazin (prag: ${prag} zile).`);
  if (C.zileFaraPv.length) alerte.push(`Zile lucrătoare cu marfă în bazin și fără PV: ${C.zileFaraPv.slice(0, 6).map(dataRo).join(", ")}${C.zileFaraPv.length > 6 ? ` (+${C.zileFaraPv.length - 6})` : ""}.`);
  if (C.deficit > 0.5) alerte.push(`S-au tratat ${fmtKg(C.deficit)} kg mai mult decât a intrat în bazin — verifică dacă lipsește o intrare de marfă.`);
  if (C.bazin > 0 && !ziAzi?.pv.length) alerte.push("Pentru astăzi nu există încă un PV de tratare.");

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {card("Marfă în bazin (netratată)", `${fmtKg(C.bazin)} kg`, C.bazin > 0 ? culoareVechime(C.vechimeMax) : "#047857", C.bazin > 0 ? `cea mai veche: ${C.vechimeMax} zile` : "nimic în așteptare")}
        {card("Intrat azi", `${fmtKg(ziAzi?.intrat || 0)} kg`, "#1565c0")}
        {card("Tratat azi", `${fmtKg(ziAzi?.tratat || 0)} kg`, "#047857", ziAzi?.tratat ? `fracții: ${fmtKg(ziAzi.fractiiKg)} kg` : "")}
        {card("Luna aceasta", `${fmtKg(luniCard.tratat)} / ${fmtKg(luniCard.intrat)} kg`, "#6a1b9a", "tratat / intrat")}
      </div>

      {alerte.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#78350f" }}>
          {alerte.map((a, i) => <div key={i}>⚠️ {a}</div>)}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <button style={subSt("zile")} onClick={() => setTab("zile")}>Pe zile</button>
        <button style={subSt("bazin")} onClick={() => setTab("bazin")}>Bazin ({C.loturi.length})</button>
        <button style={subSt("oameni")} onClick={() => setTab("oameni")}>Oameni ({C.oameni.length})</button>
        <label style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 4, alignItems: "center", marginLeft: 8 }} title="De la câte zile de așteptare marfa e semnalată">
          Avertizez după <select style={{ ...inputSt, width: 70 }} value={prag} onChange={(e) => schimbaPrag(Number(e.target.value))}>{PRAGURI.map((p) => <option key={p} value={p}>{p} zile</option>)}</select>
        </label>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={exporta} disabled={!C.zile.length} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇️ Export Excel (CSV)</button>
          <button onClick={intrareNoua} style={{ background: "#fff", color: "#1565c0", border: "1px solid #1565c0", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Intrare marfă</button>
          <button onClick={pvNou} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ PV tratare</button>
        </div>
      </div>

      {tab === "zile" && (
        <div style={ui.TBL}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800 }}>
            <thead><tr>
              <th style={ui.th({ width: 28 })}></th><th style={ui.th({ width: 95 })}>Data</th><th style={ui.th({ width: 100 })}>Intrat (kg)</th><th style={ui.th({ width: 100 })}>Tratat (kg)</th>
              <th style={ui.th({ width: 100 })}>Fracții (kg)</th><th style={ui.th({ width: 80 })} title="Fracții / tratat">Randament</th><th style={ui.th({ width: 120 })}>Bazin la sfârșit de zi</th><th style={ui.th({ textAlign: "left" })}>Cine a tratat</th>
            </tr></thead>
            <tbody>
              {!incarcat && <tr><td colSpan={8} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
              {incarcat && C.zile.length === 0 && <tr><td colSpan={8} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Nimic încă. Începe cu „+ Intrare marfă” (ce s-a cântărit pentru tratare), apoi „+ PV tratare” la sfârșitul programului.</td></tr>}
              {C.zile.map((z) => {
                const desch = deschis === z.data;
                return [
                  <tr key={z.data} style={{ cursor: "pointer" }} onClick={() => setDeschis(desch ? null : z.data)}>
                    <td style={ui.td({ textAlign: "center", padding: 2 })}>{desch ? "▾" : "▸"}</td>
                    <td style={ui.td({ textAlign: "center", fontWeight: 700 })}>{dataRo(z.data)}</td>
                    <td style={ui.td({ textAlign: "right", color: z.intrat ? "#1565c0" : "#cbd5e1" })}>{z.intrat ? fmtKg(z.intrat) : "—"}</td>
                    <td style={ui.td({ textAlign: "right", fontWeight: 700, color: z.tratat ? "#047857" : "#cbd5e1" })}>{z.tratat ? fmtKg(z.tratat) : "—"}</td>
                    <td style={ui.td({ textAlign: "right" })}>{z.fractiiKg ? fmtKg(z.fractiiKg) : "—"}</td>
                    <td style={ui.td({ textAlign: "right", fontSize: 11, color: "#64748b" })}>{z.randament === null ? "—" : `${z.randament.toFixed(1)}%`}</td>
                    <td style={ui.td({ textAlign: "right", fontWeight: 700, color: z.bazinSfarsit < -0.5 ? "#c62828" : z.bazinSfarsit > 0.5 ? "#e65100" : "#047857" })}>{fmtKg(z.bazinSfarsit)}</td>
                    <td style={ui.td({ fontSize: 11 })}>{z.pv.map((p) => p.tratat_de).join(" • ") || <span style={{ color: "#cbd5e1" }}>fără PV</span>}</td>
                  </tr>,
                  desch && (
                    <tr key={z.data + "-d"}>
                      <td colSpan={8} style={ui.td({ background: "#f8fafc", padding: "10px 16px" })}>
                        {z.intrari.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Intrări de marfă</div>
                            {z.intrari.map((i) => (
                              <div key={i.id} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, padding: "2px 0" }}>
                                <span style={{ fontWeight: 700, minWidth: 90, textAlign: "right" }}>{fmtKg(i.kg)} kg</span><span style={{ minWidth: 160 }}>{i.echipament || "Amestec"}</span>
                                <span style={{ color: "#64748b", flex: 1 }}>{[i.nr_tichet && `tichet ${i.nr_tichet}`, i.observatii].filter(Boolean).join(" • ")}</span>
                                <button onClick={() => intrareEdit(i)} title="Editează" style={btnMic("#e65100", "#fff8e1", "#ffd54f")}>✏️</button>
                                <button onClick={() => stergeIntrare(i)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                        {z.pv.map((p) => (
                          <div key={p.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff", marginBottom: 8 }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                              <b style={{ fontSize: 12 }}>PV{p.nr_pv ? ` ${p.nr_pv}` : ""} • {p.tratat_de}</b>
                              <span style={{ fontSize: 11, color: "#64748b" }}>{[p.ora_inceput && p.ora_sfarsit ? `${p.ora_inceput}–${p.ora_sfarsit}` : "", `tratat ${fmtKg(p.kgTratat)} kg`, `fracții ${fmtKg(p.kgFractii)} kg`].filter(Boolean).join(" • ")}</span>
                              {p.deficit > 0.5 && <span style={{ fontSize: 11, color: "#c62828", fontWeight: 700 }}>⚠️ {fmtKg(p.deficit)} kg peste ce intrase</span>}
                              <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                                <button onClick={() => setPanou(p)} title="Poza / PDF-ul PV-ului semnat" style={btnMic(fis.pe("tratare", p.id).length ? "#047857" : "#64748b", fis.pe("tratare", p.id).length ? "#e8f5e9" : "#f1f5f9", fis.pe("tratare", p.id).length ? "#a5d6a7" : "#cbd5e1")}>📎 {fis.pe("tratare", p.id).length || "+"}</button>
                                <button onClick={() => pvEdit(p)} title="Editează" style={btnMic("#e65100", "#fff8e1", "#ffd54f")}>✏️</button>
                                <button onClick={() => stergePv(p)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 11 }}>
                              <div><div style={{ fontWeight: 700, color: "#334155" }}>Marfă tratată</div>{p.marfa.map((l) => <div key={l.id}>{l.echipament || "Amestec"} — {fmtKg(l.kg)} kg{l.buc ? `, ${l.buc} buc` : ""}</div>)}</div>
                              <div><div style={{ fontWeight: 700, color: "#334155" }}>Fracții rezultate</div>{p.fractii.map((l) => <div key={l.id}>{l.fractie} {l.cod && <span style={{ color: "#94a3b8" }}>({l.cod})</span>} — {fmtKg(l.kg)} kg</div>)}</div>
                              {p.observatii && <div><div style={{ fontWeight: 700, color: "#334155" }}>Observații</div>{p.observatii}</div>}
                            </div>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "bazin" && (
        <div>
          {C.bazinPeTip.length > 0 && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              {C.bazinPeTip.map((t) => <span key={t.echipament}>{t.echipament}: <span style={{ color: "#e65100" }}>{fmtKg(t.kg)} kg</span></span>)}
            </div>
          )}
          <div style={ui.TBL}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
              <thead><tr><th style={ui.th({ width: 95 })}>Intrat la</th><th style={ui.th({ textAlign: "left" })}>Echipament</th><th style={ui.th({ width: 110 })}>Kg inițial</th><th style={ui.th({ width: 110 })}>Kg rămas</th><th style={ui.th({ width: 100 })}>În așteptare</th><th style={ui.th({ textAlign: "left" })}>Tichet / note</th></tr></thead>
              <tbody>
                {C.loturi.length === 0 && <tr><td colSpan={6} style={ui.td({ textAlign: "center", padding: 18, color: "#047857" })}>✓ Toată marfa intrată a fost tratată.</td></tr>}
                {C.loturi.map((l) => (
                  <tr key={l.id}>
                    <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{dataRo(l.data)}</td><td style={ui.td({ fontWeight: 600 })}>{l.echipament || "Amestec"}</td>
                    <td style={ui.td({ textAlign: "right", color: "#64748b" })}>{fmtKg(l.kg)}</td><td style={ui.td({ textAlign: "right", fontWeight: 800 })}>{fmtKg(l.ramas)}</td>
                    <td style={ui.td({ textAlign: "center", fontWeight: 700, color: culoareVechime(l.zile) })}>{l.zile === 0 ? "azi" : `${l.zile} ${l.zile === 1 ? "zi" : "zile"}`}</td>
                    <td style={ui.td({ fontSize: 11, color: "#64748b" })}>{[l.nr_tichet && `tichet ${l.nr_tichet}`, l.observatii].filter(Boolean).join(" • ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Ce se tratează scade întâi din cea mai veche marfă (FIFO); la o linie cu tip de echipament se consumă întâi marfa de același tip, apoi cea amestecată.</div>
        </div>
      )}

      {tab === "oameni" && (
        <div>
          <div style={ui.TBL}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
              <thead><tr><th style={ui.th({ textAlign: "left" })}>Persoana</th><th style={ui.th({ width: 120 })}>Tratat (kg)</th><th style={ui.th({ width: 90 })}>PV-uri</th><th style={ui.th({ width: 90 })}>Zile</th><th style={ui.th({ width: 130 })}>Medie kg / zi</th></tr></thead>
              <tbody>
                {C.oameni.length === 0 && <tr><td colSpan={5} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Apar după primul PV cu „cine a tratat”.</td></tr>}
                {C.oameni.map((o) => (
                  <tr key={o.nume}><td style={ui.td({ fontWeight: 600 })}>{o.nume}</td><td style={ui.td({ textAlign: "right", fontWeight: 800, color: "#047857" })}>{fmtKg(o.kg)}</td><td style={ui.td({ textAlign: "center" })}>{o.pv}</td><td style={ui.td({ textAlign: "center" })}>{o.zile}</td><td style={ui.td({ textAlign: "right" })}>{fmtKg(o.kgPeZi)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Când pe același PV sunt trecuți mai mulți oameni, cantitatea se împarte egal între ei. Numele sunt cele scrise la „cine a tratat”; mai târziu le legăm de lista de angajați.</div>
        </div>
      )}

      {eI && (
        <div onClick={() => !seSalveaza && setEI(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(560px,100%)", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{eI.id ? "Editare intrare marfă" : "Intrare marfă la tratare"}</div>
              <button onClick={() => !seSalveaza && setEI(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 150px" }}>{lab("Data", true)}<input type="date" style={inputSt} value={eI.data} onChange={(e) => setEI((p) => ({ ...p, data: e.target.value }))} /></div>
              <div style={{ flex: "1 1 150px" }}>{lab("Cantitate cântărită (kg)", true)}<input style={{ ...inputSt, textAlign: "right", fontWeight: 700 }} inputMode="decimal" value={eI.kg} onChange={(e) => setEI((p) => ({ ...p, kg: e.target.value }))} autoFocus /></div>
              <div style={{ flex: "1 1 100%" }}>{lab("Tip echipament")}
                <select style={inputSt} value={eI.echipament} onChange={(e) => setEI((p) => ({ ...p, echipament: e.target.value }))}>
                  <option value="">Amestec / nespecificat</option>{echipamenteActive.map((x) => <option key={x.id} value={x.den}>{x.den}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 150px" }}>{lab("Nr. tichet cântar")}<input style={inputSt} value={eI.nr_tichet} onChange={(e) => setEI((p) => ({ ...p, nr_tichet: e.target.value }))} /></div>
              <div style={{ flex: "2 1 220px" }}>{lab("Observații")}<input style={inputSt} value={eI.observatii} onChange={(e) => setEI((p) => ({ ...p, observatii: e.target.value }))} /></div>
              {eroare && <div style={{ flex: "1 1 100%", color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button disabled={seSalveaza} onClick={() => setEI(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button disabled={seSalveaza} onClick={salveazaIntrare} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează"}</button>
            </div>
          </div>
        </div>
      )}

      {eP && (
        <div onClick={() => !seSalveaza && setEP(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(900px,100%)", maxHeight: "95vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{eP.id ? "Editare PV de tratare" : "PV de tratare (sfârșit de program)"}</div>
              <button onClick={() => !seSalveaza && setEP(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto" }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                <div style={{ flex: "1 1 150px" }}>{lab("Data", true)}<input type="date" style={inputSt} value={eP.f.data} onChange={(e) => setF({ data: e.target.value })} /></div>
                <div style={{ flex: "1 1 130px" }}>{lab("Nr. PV")}<input style={inputSt} value={eP.f.nr_pv} onChange={(e) => setF({ nr_pv: e.target.value })} /></div>
                <div style={{ flex: "2 1 260px" }}>{lab("Cine a tratat", true)}<input style={inputSt} value={eP.f.tratat_de} placeholder="Nume (mai mulți, separați prin virgulă)" onChange={(e) => setF({ tratat_de: e.target.value })} /></div>
                <div style={{ flex: "1 1 110px" }}>{lab("De la ora")}<input type="time" style={inputSt} value={eP.f.ora_inceput} onChange={(e) => setF({ ora_inceput: e.target.value })} /></div>
                <div style={{ flex: "1 1 110px" }}>{lab("Până la ora")}<input type="time" style={inputSt} value={eP.f.ora_sfarsit} onChange={(e) => setF({ ora_sfarsit: e.target.value })} /></div>
                <div style={{ flex: "1 1 100%" }}>{lab("Observații")}<input style={inputSt} value={eP.f.observatii} onChange={(e) => setF({ observatii: e.target.value })} /></div>
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 380px" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#334155" }}>Marfă tratată <span style={{ fontWeight: 500, color: "#64748b" }}>(în bazin: {fmtKg(C.bazin)} kg)</span></div>
                  {eP.marfa.map((l, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                      <select style={{ ...inputSt, flex: 3 }} value={l.echipament} onChange={(e) => setL("marfa", i, { echipament: e.target.value })}>
                        <option value="">Amestec / nespecificat</option>{echipamenteActive.map((x) => <option key={x.id} value={x.den}>{x.den}{bazinTip(x.den) ? ` • în bazin ${fmtKg(bazinTip(x.den))} kg` : ""}</option>)}
                      </select>
                      <input style={{ ...inputSt, flex: 1.2, textAlign: "right", fontWeight: 700 }} inputMode="decimal" placeholder="kg" value={l.kg} onChange={(e) => setL("marfa", i, { kg: e.target.value })} />
                      <input style={{ ...inputSt, flex: 0.8, textAlign: "right" }} inputMode="numeric" placeholder="buc" value={l.buc} onChange={(e) => setL("marfa", i, { buc: e.target.value })} />
                      <button onClick={() => setEP((p) => ({ ...p, marfa: p.marfa.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => setEP((p) => ({ ...p, marfa: [...p.marfa, { echipament: "", kg: "", buc: "" }] }))} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Încă un tip</button>
                    {C.bazin > 0 && <button onClick={() => setEP((p) => ({ ...p, marfa: [{ echipament: "", kg: String(C.bazin), buc: "" }] }))} style={{ background: "#fff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>Tot din bazin ({fmtKg(C.bazin)} kg)</button>}
                  </div>
                </div>

                <div style={{ flex: "1 1 380px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#334155" }}>Fracții rezultate</div>
                    <button onClick={aplicaReteta} disabled={!eP.marfa.some((l) => l.echipament && numar(l.kg) > 0)} style={{ background: eP.marfa.some((l) => l.echipament && numar(l.kg) > 0) ? "#6a1b9a" : "#9ca3af", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🧪 Aplică rețetă</button>
                  </div>
                  {info && <div style={{ fontSize: 11, marginBottom: 6, color: info.startsWith("⚠️") ? "#92400e" : "#047857" }}>{info}</div>}
                  {eP.fr.map((f, i) => {
                    const idc = frac.rows.find((x) => x.den === f.fractie && x.cod === f.cod)?.id || "";
                    return (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                        <select style={{ ...inputSt, flex: 3 }} value={idc} onChange={(e) => { const x = frac.rows.find((y) => y.id === e.target.value); setL("fr", i, x ? { fractie: x.den, cod: x.cod } : { fractie: "", cod: "" }); }}>
                          <option value="">Alege fracția…</option>{fractiiActive.map((x) => <option key={x.id} value={x.id}>{x.den}{x.cod ? ` — ${x.cod}` : ""}</option>)}
                        </select>
                        <input style={{ ...inputSt, flex: 1, textAlign: "right", fontWeight: 700 }} inputMode="decimal" placeholder="kg" value={f.kg} onChange={(e) => setL("fr", i, { kg: e.target.value })} />
                        <button onClick={() => setEP((p) => ({ ...p, fr: p.fr.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => setEP((p) => ({ ...p, fr: [...p.fr, { fractie: "", cod: "", kg: diferenta > 0 ? String(diferenta) : "" }] }))} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Fracție</button>
                    {diferenta > 0.01 && <button onClick={adaugaPierderi} style={{ background: "#fff", color: "#92400e", border: "1px solid #fcd34d", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>Diferența ({fmtKg(diferenta)} kg) → Pierderi tehnologice</button>}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: balanta ? "#ecfdf5" : "#fff7ed", border: `1px solid ${balanta ? "#6ee7b7" : "#fdba74"}`, display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13, fontWeight: 700 }}>
                <span>Tratat: {fmtKg(totalM)} kg</span><span>Fracții: {fmtKg(totalF)} kg</span>
                <span style={{ color: balanta ? "#047857" : "#c2410c" }}>{balanta ? "Balanță OK ✓" : `Diferență: ${fmtKg(Math.abs(diferenta))} kg`}</span>
              </div>
              {eroare && <div style={{ marginTop: 12, color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
              <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>Poza sau PDF-ul PV-ului semnat se atașează după salvare, din ziua respectivă („📎”).</div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button disabled={seSalveaza} onClick={() => setEP(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button disabled={seSalveaza} onClick={salveazaPv} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează PV-ul"}</button>
            </div>
          </div>
        </div>
      )}

      {panou && <PanouFisiere sb={sb} G={G} user={currentUser} logAction={logAction} fis={fis} sursa={{ tip: "tratare", id: panou.id, titlu: `PV ${panou.nr_pv || ""} • ${dataRo(panou.data)} • ${panou.tratat_de}` }} onClose={() => setPanou(null)} />}
    </div>
  );
}
