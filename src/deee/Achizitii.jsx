import { useState, useMemo } from "react";
import { useTabela, numar, colatie } from "./hooks";
import { COD_EWC, TIPURI_ANEXA, dataRo, roIso, lunaDin, numeLuna, fmtKg } from "./constante";
import { htmlNir } from "./nir";
import { useCoduriOrg, etichetaCod } from "./coduriOrg";

const rot = (n) => Math.round(n * 100) / 100;
const azi = () => new Date().toISOString().slice(0, 10);
const GOL = {
  data_colectare: "", furnizor: "", nr_document: "", tip_anexa: "Anexa 3", nr_anexa: "", data_anexa: "", organizatie: "NEALOCATE",
  nr_ticket: "", data_ticket: "", cod_hg856: "", greutate: "", fara_licenta: false, transportator: "", nr_auto: "", sofer: "", observatii: "",
};
const CAMPURI_DB = Object.keys(GOL);
const norm = (s) => String(s || "").trim().toLowerCase();
const rot4 = (n) => Math.round(n * 10000) / 10000;

// Documentele de colectare DEEE: furnizor + aviz + cod EWC + greutate, impartite pe echipamente (bucati si kg).
// Se pot completa pornind de la un tichet de cantar inchis (Intrare) din Greenkraft.
export default function Achizitii({ sb, G, ui, currentUser, logAction, confirmDel, ticheteList = [] }) {
  const ach = useTabela(sb, "deee_achizitii");
  const lin = useTabela(sb, "deee_achizitii_linii");
  const furn = useTabela(sb, "deee_furnizori");
  const transp = useTabela(sb, "deee_transportatori");
  const masini = useTabela(sb, "deee_masini");
  const soferi = useTabela(sb, "deee_soferi");
  const ech = useTabela(sb, "deee_echipamente");
  const org = useTabela(sb, "deee_organizatii");
  const co = useCoduriOrg(sb); // greutati medii si coduri implicite ale organizatiilor

  const [q, setQ] = useState("");
  const [luna, setLuna] = useState("");
  const [fOrg, setFOrg] = useState("");
  const [fCod, setFCod] = useState("");
  const [fVerif, setFVerif] = useState("");
  const [sel, setSel] = useState(() => new Set());
  const [orgMasa, setOrgMasa] = useState("");
  const [edit, setEdit] = useState(null); // { id|null, pas, f, linii:[{echipament,buc,kg}], tichet }
  const [eroare, setEroare] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);

  const liniiDe = useMemo(() => {
    const m = {};
    lin.rows.forEach((l) => { (m[l.achizitie_id] = m[l.achizitie_id] || []).push(l); });
    Object.values(m).forEach((a) => a.sort((x, y) => (x.ord || 0) - (y.ord || 0)));
    return m;
  }, [lin.rows]);

  const orgLinie = (l, r) => l.organizatie || r.organizatie;
  const orgDoc = (r) => { const ls = liniiDe[r.id] || []; return ls.length ? [...new Set(ls.map((l) => orgLinie(l, r)))] : [r.organizatie]; };
  const bucAuto = (den, kg) => (co.medii[den] > 0 && kg > 0 ? Math.round(kg / co.medii[den]) : null);

  const luniDisp = useMemo(() => [...new Set(ach.rows.map((r) => lunaDin(r.data_colectare)).filter(Boolean))].sort().reverse(), [ach.rows]);
  const coduriDisp = useMemo(() => [...new Set(ach.rows.map((r) => r.cod_hg856))].sort(), [ach.rows]);
  const organizatiiNume = useMemo(() => org.rows.filter((o) => o.activ).map((o) => o.den).sort(colatie), [org.rows]);

  const filtrate = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ach.rows
      .filter((r) => (!luna || lunaDin(r.data_colectare) === luna) && (!fOrg || orgDoc(r).includes(fOrg)) && (!fCod || r.cod_hg856 === fCod)
        && (!fVerif || (fVerif === "da") === !!r.verificat)
        && (!t || [r.furnizor, r.nr_document, r.nr_auto, r.cod_hg856, r.nr_ticket, r.transportator].some((x) => String(x || "").toLowerCase().includes(t))))
      .sort((a, b) => String(b.data_colectare).localeCompare(String(a.data_colectare)) || String(b.created_at).localeCompare(String(a.created_at)));
  }, [ach.rows, liniiDe, q, luna, fOrg, fCod, fVerif]);

  const totKg = rot(filtrate.reduce((s, r) => s + Number(r.greutate || 0), 0));
  const totBuc = filtrate.reduce((s, r) => s + (liniiDe[r.id] || []).reduce((x, l) => x + (l.buc || 0), 0), 0);
  const nrVerif = ach.rows.filter((r) => r.verificat).length;

  // ── tichete de cantar inchise (Intrare) care nu au inca un document DEEE ──
  const tichetePosibile = useMemo(() => {
    const legate = new Set(ach.rows.map((r) => String(r.tichet_id || "")).filter(Boolean));
    return ticheteList
      .filter((t) => t.status === "inchis" && t.tip === "Intrare" && !legate.has(String(t.id)))
      .sort((a, b) => (parseInt(b.nr_tichet) || 0) - (parseInt(a.nr_tichet) || 0))
      .slice(0, 80);
  }, [ticheteList, ach.rows]);

  const furnizorGasit = (nume) => furn.rows.find((f) => norm(f.den) === norm(nume));
  const transportatorGasit = (nume) => transp.rows.find((t) => norm(t.den) === norm(nume));

  const deschideNou = () => { setEroare(""); setEdit({ id: null, pas: 1, f: { ...GOL, data_colectare: azi() }, linii: [], tichet: "" }); };
  const deschideEditare = (r) => {
    setEroare("");
    setEdit({
      id: r.id, pas: 1, tichet: "",
      f: Object.fromEntries(CAMPURI_DB.map((k) => [k, k === "greutate" ? String(r[k]) : (r[k] ?? (typeof GOL[k] === "boolean" ? false : ""))])),
      linii: (liniiDe[r.id] || []).map((l) => ({ echipament: l.echipament, buc: String(l.buc), kg: String(l.kg), organizatie: orgLinie(l, r) })),
      tichet_id: r.tichet_id || null,
    });
  };
  const setF = (patch) => setEdit((p) => ({ ...p, f: { ...p.f, ...patch } }));

  const dinTichet = (id) => {
    const t = ticheteList.find((x) => String(x.id) === String(id));
    if (!t) { setEdit((p) => ({ ...p, tichet: "", tichet_id: null })); return; }
    const d = roIso(t.data);
    const fg = furnizorGasit(t.partener);
    setEdit((p) => ({
      ...p, tichet: String(t.id), tichet_id: String(t.id),
      f: {
        ...p.f, furnizor: fg ? fg.den : t.partener || "", nr_document: t.aviz || p.f.nr_document, nr_ticket: String(t.nr_tichet || ""),
        data_ticket: d, data_colectare: d || p.f.data_colectare, greutate: t.net != null ? String(t.net) : p.f.greutate,
        transportator: t.transportator || "", nr_auto: t.nr_masina || "", sofer: t.sofer || "",
      },
    }));
  };

  const validPas1 = () => {
    const f = edit.f;
    if (!f.data_colectare) return "Completează data colectării.";
    if (!f.furnizor.trim()) return "Completează furnizorul.";
    if (!f.nr_document.trim()) return "Completează numărul documentului (aviz).";
    if (!f.cod_hg856.trim()) return "Alege codul HG856.";
    if (!(numar(f.greutate) > 0)) return "Greutatea totală trebuie să fie mai mare ca 0.";
    if (!f.organizatie) return "Alege organizația (sau NEALOCATE).";
    return "";
  };
  const urmatorulPas = () => {
    const e = validPas1(); if (e) { setEroare(e); return; }
    setEroare("");
    setEdit((p) => ({ ...p, pas: 2, linii: p.linii.length ? p.linii : [{ echipament: "", buc: "", kg: String(numar(p.f.greutate)), organizatie: p.f.organizatie }] }));
  };

  const totalLinii = edit ? rot(edit.linii.reduce((s, l) => s + (numar(l.kg) || 0), 0)) : 0;
  const greutateEdit = edit ? numar(edit.f.greutate) : 0;
  const diferenta = rot(greutateEdit - totalLinii);

  // Bucatile se recalculeaza (kg / greutate medie) doar cand se schimba echipamentul sau procentul; la editarea kg se recalculeaza doar procentul.
  const setLinie = (i, patch) => setEdit((p) => ({ ...p, linii: p.linii.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  const alegeEchipament = (i, den) => {
    const kg = numar(edit.linii[i].kg);
    const b = bucAuto(den, kg);
    setLinie(i, { echipament: den, ...(b !== null ? { buc: String(b) } : {}) });
  };
  const schimbaProcent = (i, text) => {
    const pct = numar(text);
    if (!(pct >= 0) || !(greutateEdit > 0)) return;
    const kg = rot(pct / 100 * greutateEdit);
    const b = bucAuto(edit.linii[i].echipament, kg);
    setLinie(i, { kg: String(kg), ...(b !== null ? { buc: String(b) } : {}) });
  };
  const alocaToate = (o) => setEdit((p) => ({ ...p, f: { ...p.f, organizatie: o }, linii: p.linii.map((x) => ({ ...x, organizatie: o })) }));

  const validPas2 = () => {
    if (!edit.linii.length) return "Adaugă cel puțin un echipament.";
    for (const l of edit.linii) {
      if (!l.echipament) return "Alege echipamentul pe fiecare rând.";
      if (!(numar(l.kg) > 0)) return `Greutatea pentru „${l.echipament}” trebuie să fie mai mare ca 0.`;
      if (l.buc !== "" && !(Number.isInteger(numar(l.buc)) && numar(l.buc) >= 0)) return `Bucățile pentru „${l.echipament}” trebuie să fie un număr întreg.`;
    }
    for (const l of edit.linii) if (!l.organizatie) return `Alege organizația pentru „${l.echipament}”.`;
    if (edit.linii.some((l) => l.organizatie === "REDPOINT")) {
      const lipsa = [["Nr. auto", edit.f.nr_auto], ["Șofer", edit.f.sofer], ["Nr. ticket cântar", edit.f.nr_ticket]].filter(([, v]) => !String(v || "").trim()).map(([n]) => n);
      if (lipsa.length) return `Pentru REDPOINT sunt obligatorii: ${lipsa.join(", ")} (completează-le la pasul 1).`;
    }
    if (Math.abs(diferenta) > 0.01) return `Greutatea distribuită (${fmtKg(totalLinii)} kg) nu e egală cu cea a documentului (${fmtKg(greutateEdit)} kg).`;
    return "";
  };

  // daca nu s-a rulat inca supabase-deee-7-achizitii-pe-linie.sql, liniile se salveaza fara organizatie (ramane cea a documentului)
  const insereazaLinii = async (randuri) => {
    let r = await sb.from("deee_achizitii_linii").insert(randuri).select();
    if (r.error && /organizatie/i.test(r.error.message || "")) r = await sb.from("deee_achizitii_linii").insert(randuri.map(({ organizatie, ...x }) => x)).select();
    return r;
  };

  const salveaza = async () => {
    const e1 = validPas1(); if (e1) { setEroare(e1); setEdit((p) => ({ ...p, pas: 1 })); return; }
    const e2 = validPas2(); if (e2) { setEroare(e2); return; }
    setSeSalveaza(true); setEroare("");
    try {
      const f = edit.f;
      const fg = furnizorGasit(f.furnizor);
      const payload = {
        data_colectare: f.data_colectare, furnizor: fg ? fg.den : f.furnizor.trim(), furnizor_cui: fg ? fg.cui : "", nr_document: f.nr_document.trim(),
        tip_anexa: f.tip_anexa, nr_anexa: f.nr_anexa.trim(), data_anexa: f.data_anexa || null, organizatie: f.organizatie,
        nr_ticket: f.nr_ticket.trim(), data_ticket: f.data_ticket || null, cod_hg856: f.cod_hg856.trim(), greutate: numar(f.greutate),
        fara_licenta: !!f.fara_licenta, transportator: f.transportator.trim(), nr_auto: f.nr_auto.trim().toUpperCase(), sofer: f.sofer.trim(),
        observatii: f.observatii.trim(), tichet_id: edit.tichet_id || null,
      };
      const randuri = edit.linii.map((l, i) => ({ ord: i, echipament: l.echipament, buc: l.buc === "" ? 0 : numar(l.buc), kg: numar(l.kg), organizatie: l.organizatie }));
      // organizatia documentului = a liniei cu cea mai mare greutate (liniile sunt cele care conteaza la stoc)
      payload.organizatie = [...randuri].sort((a, b) => b.kg - a.kg)[0].organizatie;
      const existent = ach.rows.find((r) => r.id !== edit.id && r.furnizor === payload.furnizor && r.nr_document === payload.nr_document && r.cod_hg856 === payload.cod_hg856);
      if (existent) { setEroare("Există deja un document cu același furnizor, aviz și cod HG856."); return; }

      if (!edit.id) {
        const { data, error } = await sb.from("deee_achizitii").insert({ ...payload, creat_de: currentUser || "" }).select();
        if (error) { setEroare(error.code === "23505" ? "Există deja un document cu același furnizor, aviz și cod HG856." : "Eroare: " + error.message); return; }
        const nou = data[0];
        const { error: eL } = await insereazaLinii(randuri.map((l) => ({ ...l, achizitie_id: nou.id })));
        if (eL) { await sb.from("deee_achizitii").delete().eq("id", nou.id); setEroare("Eroare la salvarea echipamentelor: " + eL.message); return; }
        logAction("add", "deee_achizitii", nou.id, { furnizor: payload.furnizor, nr_document: payload.nr_document, cod: payload.cod_hg856, kg: payload.greutate, echipamente: randuri.length });
      } else {
        const vechi = ach.rows.find((r) => r.id === edit.id);
        const schimbat = CAMPURI_DB.concat("tichet_id").filter((k) => String(vechi?.[k] ?? "") !== String(payload[k] ?? ""));
        const liniiVechi = liniiDe[edit.id] || [];
        const rezumat = (a) => a.map((l) => `${l.echipament}:${l.buc}:${l.kg}:${l.organizatie || vechi?.organizatie}`).join("|");
        const liniiSchimbate = rezumat(liniiVechi) !== rezumat(randuri);
        // intai randurile noi, abia apoi se sterg cele vechi: o eroare la mijloc nu lasa documentul fara echipamente
        let noi = [];
        if (liniiSchimbate) {
          const { data: ins, error: eL } = await insereazaLinii(randuri.map((l) => ({ ...l, achizitie_id: edit.id })));
          if (eL) { setEroare("Eroare la salvarea echipamentelor: " + eL.message); return; }
          noi = ins;
        }
        const { error } = await sb.from("deee_achizitii").update(payload).eq("id", edit.id);
        if (error) {
          if (noi.length) await sb.from("deee_achizitii_linii").delete().in("id", noi.map((l) => l.id));
          setEroare(error.code === "23505" ? "Există deja un document cu același furnizor, aviz și cod HG856." : "Eroare: " + error.message); return;
        }
        if (liniiSchimbate && liniiVechi.length) await sb.from("deee_achizitii_linii").delete().in("id", liniiVechi.map((l) => l.id));
        if (schimbat.length || liniiSchimbate) {
          logAction("update", "deee_achizitii", edit.id, {
            furnizor: payload.furnizor, nr_document: payload.nr_document,
            ...Object.fromEntries(schimbat.map((k) => [k, payload[k]])), ...(liniiSchimbate ? { echipamente: rezumat(randuri) } : {}),
            _inainte: { ...Object.fromEntries(schimbat.map((k) => [k, vechi?.[k] ?? ""])), ...(liniiSchimbate ? { echipamente: rezumat(liniiVechi) } : {}) },
          });
        }
      }
      setEdit(null);
      await Promise.all([ach.reload(), lin.reload()]);
    } finally { setSeSalveaza(false); }
  };

  const sterge = async (r) => {
    if (!confirmDel(`documentul ${r.nr_document} (${r.furnizor})`)) return;
    const snapshot = { achizitie: r, linii: liniiDe[r.id] || [] };
    const { error } = await sb.from("deee_achizitii").delete().eq("id", r.id);
    if (error) { alert("Eroare: " + error.message); return; }
    logAction("delete", "deee_achizitii", r.id, { furnizor: r.furnizor, nr_document: r.nr_document, _sters: snapshot });
    setSel((p) => { const n = new Set(p); n.delete(r.id); return n; });
    await Promise.all([ach.reload(), lin.reload()]);
  };

  const comutaVerificat = async (r) => {
    const { error } = await sb.from("deee_achizitii").update({ verificat: !r.verificat }).eq("id", r.id);
    if (error) { alert("Eroare: " + error.message); return; }
    ach.setRows((p) => p.map((x) => (x.id === r.id ? { ...x, verificat: !r.verificat } : x)));
    logAction("update", "deee_achizitii", r.id, { verificat: !r.verificat, nr_document: r.nr_document, _inainte: { verificat: r.verificat } });
  };

  const aloca = async () => {
    const ids = [...sel].filter((id) => ach.rows.some((r) => r.id === id));
    if (!ids.length || !orgMasa) return;
    const inainte = Object.fromEntries(ids.map((id) => [id, orgDoc(ach.rows.find((r) => r.id === id) || {}).join(", ")]));
    const { error } = await sb.from("deee_achizitii").update({ organizatie: orgMasa }).in("id", ids);
    if (error) { alert("Eroare: " + error.message); return; }
    const { error: eL } = await sb.from("deee_achizitii_linii").update({ organizatie: orgMasa }).in("achizitie_id", ids);
    if (eL && !/organizatie/i.test(eL.message || "")) { alert("Eroare la linii: " + eL.message); await Promise.all([ach.reload(), lin.reload()]); return; }
    ach.setRows((p) => p.map((x) => (ids.includes(x.id) ? { ...x, organizatie: orgMasa } : x)));
    lin.setRows((p) => p.map((x) => (ids.includes(x.achizitie_id) ? { ...x, organizatie: orgMasa } : x)));
    logAction("update", "deee_achizitii", "", { organizatie: orgMasa, documente: ids.length, ids, _inainte: { organizatie: inainte } });
    setSel(new Set()); setOrgMasa("");
  };

  // ── NIR: numarul se formeaza din document (NIR-<aviz>-<an>), ca in WiseWeee; nu se numeroteaza separat ──
  const nrNir = (r) => `NIR-${r.nr_document}-${String(r.data_colectare).slice(0, 4)}`;
  const tiparesteNir = (r) => {
    const w = window.open("", "_blank");
    if (!w) { alert("Browserul a blocat fereastra de tipărire. Permite pop-up-urile pentru această pagină și încearcă din nou."); return; }
    const f = furn.rows.find((x) => norm(x.den) === norm(r.furnizor));
    w.document.open();
    w.document.write(htmlNir({ doc: r, linii: (liniiDe[r.id] || []).map((l) => { const o = orgLinie(l, r); const c = co.codPentru(l.echipament, o); return { ...l, organizatie: o, denOrg: c ? etichetaCod(o, c) : "", categorieOrg: c?.categorie || "" }; }), furnizorCui: r.furnizor_cui || f?.cui || "", nr: nrNir(r), data: r.data_colectare, gestionar: undefined }));
    w.document.close();
    logAction("Tipărire", "NIR", nrNir(r), { furnizor: r.furnizor, nr_document: r.nr_document, kg: r.greutate });
  };

  const exporta = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const cap = ["Data", "Luna", "Furnizor", "Aviz", "Nr. auto", "Cod HG856", "Echipament", "Buc", "Kg", "Organizatie", "Cod organizatie", "Greutate document (kg)", "Nr. ticket", "Transportator", "Sofer", "Verificat"];
    const linii = [cap.map(esc).join(";")];
    filtrate.forEach((r) => {
      const ls = liniiDe[r.id] || [{ echipament: "", buc: "", kg: r.greutate }];
      ls.forEach((l) => linii.push([dataRo(r.data_colectare), numeLuna(lunaDin(r.data_colectare)), r.furnizor, r.nr_document, r.nr_auto, r.cod_hg856, l.echipament, l.buc, String(l.kg).replace(".", ","), orgLinie(l, r), etichetaCod(orgLinie(l, r), co.codPentru(l.echipament, orgLinie(l, r))), String(r.greutate).replace(".", ","), r.nr_ticket, r.transportator, r.sofer, r.verificat ? "da" : "nu"].map(esc).join(";")));
    });
    const blob = new Blob(["﻿" + linii.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `achizitii-deee-${azi()}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const card = (eticheta, valoare, culoare) => (
    <div style={{ flex: "1 1 150px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 14px", boxShadow: "0 1px 2px rgba(15,23,42,.05)" }}>
      <div style={{ fontSize: 10, color: "#64748b" }}>{eticheta}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: culoare }}>{valoare}</div>
    </div>
  );
  const toateVizibileBifate = filtrate.length > 0 && filtrate.every((r) => sel.has(r.id));
  const colspan = 12;

  // sugestii pentru nr. auto / sofer, dupa transportatorul ales
  const tr = edit ? transportatorGasit(edit.f.transportator) : null;
  const masiniTr = tr ? masini.rows.filter((m) => m.transportator_id === tr.id) : [];
  const masinaGasita = edit ? masiniTr.find((m) => norm(m.nr_auto) === norm(edit.f.nr_auto)) : null;
  const soferiMasina = masinaGasita ? soferi.rows.filter((s) => s.masina_id === masinaGasita.id) : [];
  const furnizorNou = edit && edit.f.furnizor.trim() && !furnizorGasit(edit.f.furnizor);
  const echipamenteActive = ech.rows.filter((e) => e.activ).sort((a, b) => colatie(a.den, b.den));

  const lab = (t, req) => <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{t}{req ? " *" : ""}</label>;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {card("Documente", filtrate.length, "#1e293b")}
        {card("Total greutate (kg)", fmtKg(totKg), "#047857")}
        {card("Total bucăți", totBuc.toLocaleString("ro-RO"), "#1565c0")}
        {card("Verificate", `${nrVerif}/${ach.rows.length}`, nrVerif === ach.rows.length ? "#047857" : "#e65100")}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <input style={{ ...inputSt, width: 250 }} placeholder="🔍 Document, furnizor, cod sau nr. mașină..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ ...inputSt, width: 150 }} value={luna} onChange={(e) => setLuna(e.target.value)}>
          <option value="">Toate lunile</option>{luniDisp.map((l) => <option key={l} value={l}>{numeLuna(l)}</option>)}
        </select>
        <select style={{ ...inputSt, width: 140 }} value={fOrg} onChange={(e) => setFOrg(e.target.value)}>
          <option value="">Organizație</option>{organizatiiNume.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select style={{ ...inputSt, width: 120 }} value={fCod} onChange={(e) => setFCod(e.target.value)}>
          <option value="">Cod HG856</option>{coduriDisp.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={{ ...inputSt, width: 130 }} value={fVerif} onChange={(e) => setFVerif(e.target.value)}>
          <option value="">Verificat: toate</option><option value="da">Verificate</option><option value="nu">Neverificate</option>
        </select>
        {(q || luna || fOrg || fCod || fVerif) && <button onClick={() => { setQ(""); setLuna(""); setFOrg(""); setFCod(""); setFVerif(""); }} style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 11 }}>↺ Reset</button>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={exporta} disabled={!filtrate.length} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇️ Export Excel (CSV)</button>
          <button onClick={deschideNou} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Document nou</button>
        </div>
      </div>

      {sel.size > 0 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#ecfdf5", border: `1px solid ${G}55`, borderRadius: 10, padding: "8px 12px", marginBottom: 10, flexWrap: "wrap" }}>
          <b style={{ fontSize: 12 }}>{sel.size} documente selectate</b>
          <select style={{ ...inputSt, width: 160 }} value={orgMasa} onChange={(e) => setOrgMasa(e.target.value)}>
            <option value="">Alocă la organizația…</option>{organizatiiNume.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <button disabled={!orgMasa} onClick={aloca} style={{ background: orgMasa ? G : "#9ca3af", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: orgMasa ? "pointer" : "default", fontSize: 12, fontWeight: 700 }}>Alocă</button>
          <button onClick={() => setSel(new Set())} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 12 }}>Deselectează</button>
        </div>
      )}

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1110 }}>
          <thead>
            <tr>
              <th style={ui.th({ width: 30 })}><input type="checkbox" checked={toateVizibileBifate} onChange={(e) => setSel(e.target.checked ? new Set(filtrate.map((r) => r.id)) : new Set())} title="Selectează tot ce e afișat" /></th>
              <th style={ui.th({ width: 90 })}>Data</th>
              <th style={ui.th({ textAlign: "left" })}>Furnizor</th>
              <th style={ui.th({ width: 110 })}>Aviz</th>
              <th style={ui.th({ width: 95 })}>Nr. mașină</th>
              <th style={ui.th({ width: 80 })}>Cod</th>
              <th style={ui.th({ textAlign: "left", width: 220 })}>Echipamente</th>
              <th style={ui.th({ width: 100 })}>Kg</th>
              <th style={ui.th({ width: 110 })}>Org.</th>
              <th style={ui.th({ width: 50 })} title="Verificat">Verif.</th>
              <th style={ui.th({ width: 80 })} title="Nota de Intrare-Recepție">NIR</th>
              <th style={ui.th({ width: 70 })}></th>
            </tr>
          </thead>
          <tbody>
            {!ach.incarcat && <tr><td colSpan={colspan} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {ach.incarcat && filtrate.length === 0 && <tr><td colSpan={colspan} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>{ach.rows.length ? "Niciun document pentru filtrele alese." : "Niciun document încă. Apasă „+ Document nou”."}</td></tr>}
            {filtrate.map((r) => {
              const ls = liniiDe[r.id] || [];
              const orgs = orgDoc(r);
              const rezumat = ls.map((l) => `${l.echipament}${l.buc ? ` (${l.buc} buc)` : ""}${orgs.length > 1 ? ` → ${orgLinie(l, r)}` : ""}`).join(", ");
              return (
                <tr key={r.id} style={{ background: sel.has(r.id) ? "#ecfdf5" : undefined }}>
                  <td style={ui.td({ textAlign: "center" })}><input type="checkbox" checked={sel.has(r.id)} onChange={() => setSel((p) => { const n = new Set(p); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })} /></td>
                  <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{dataRo(r.data_colectare)}</td>
                  <td style={ui.td({ fontWeight: 600 })}>{r.furnizor}</td>
                  <td style={ui.td({ textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.nr_document}</td>
                  <td style={ui.td({ textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.nr_auto || "—"}</td>
                  <td style={ui.td({ textAlign: "center", fontSize: 11 })}>{r.cod_hg856}</td>
                  <td style={ui.td({ fontSize: 11 })} title={rezumat}><div style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rezumat || "—"}</div></td>
                  <td style={ui.td({ textAlign: "right", fontWeight: 700 })}>{fmtKg(r.greutate)}</td>
                  <td style={ui.td({ textAlign: "center", fontSize: 11, color: orgs.includes("NEALOCATE") ? "#92400e" : "#1e293b", background: orgs.includes("NEALOCATE") ? "#fffbeb" : undefined })} title={orgs.join(", ")}>{orgs.join(", ")}</td>
                  <td style={ui.td({ textAlign: "center" })}><input type="checkbox" checked={!!r.verificat} onChange={() => comutaVerificat(r)} title="Marchează ca verificat" /></td>
                  <td style={ui.td({ textAlign: "center", padding: 2 })}>
                    <button onClick={() => tiparesteNir(r)} title={`Tipărește ${nrNir(r)} (Nota de Intrare-Recepție)`} style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, cursor: "pointer", color: "#1565c0", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>🖨️ NIR</button>
                  </td>
                  <td style={ui.td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}>
                    <button onClick={() => deschideEditare(r)} title="Editează" style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>✏️</button>{" "}
                    <button onClick={() => sterge(r)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {edit && (
        <div onClick={() => !seSalveaza && setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(860px,100%)", maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{edit.id ? "Editare document" : "Document nou"}</div>
              <div style={{ display: "flex", gap: 6, fontSize: 11, fontWeight: 700 }}>
                {[["1", "Informații document"], ["2", "Distribuție echipamente"]].map(([n, t]) => (
                  <span key={n} style={{ padding: "3px 10px", borderRadius: 12, background: String(edit.pas) === n ? G : "#eef2f6", color: String(edit.pas) === n ? "#fff" : "#64748b" }}>{n}. {t}</span>
                ))}
              </div>
              <button onClick={() => !seSalveaza && setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <div style={{ padding: 20, overflowY: "auto" }}>
              {edit.pas === 1 && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 100%", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: 10 }}>
                    {lab("Completează din tichetul de cântar (opțional)")}
                    <select style={inputSt} value={edit.tichet} onChange={(e) => dinTichet(e.target.value)}>
                      <option value="">— fără tichet / completez manual —</option>
                      {tichetePosibile.map((t) => <option key={t.id} value={t.id}>TC #{t.nr_tichet} • {t.partener} • {t.data} • {Number(t.net || 0).toLocaleString("ro-RO")} kg{t.aviz ? ` • aviz ${t.aviz}` : ""}</option>)}
                    </select>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>Apar tichetele de intrare închise, care nu au încă un document DEEE.</div>
                  </div>

                  <div style={{ flex: "2 1 300px" }}>
                    {lab("Furnizor", true)}
                    <input list="deee-furnizori" style={inputSt} value={edit.f.furnizor} onChange={(e) => setF({ furnizor: e.target.value })} placeholder="Caută și alege furnizor…" />
                    <datalist id="deee-furnizori">{furn.rows.filter((f) => f.activ).map((f) => <option key={f.id} value={f.den} />)}</datalist>
                    {furnizorNou && <div style={{ fontSize: 10, color: "#92400e", marginTop: 2 }}>⚠️ Furnizor care nu e în lista DEEE — adaugă-l la Furnizori ca să fie complet.</div>}
                  </div>
                  <div style={{ flex: "1 1 180px" }}>{lab("Nr. Document (aviz)", true)}<input style={inputSt} value={edit.f.nr_document} onChange={(e) => setF({ nr_document: e.target.value })} placeholder="ex. WWE 2755" /></div>
                  <div style={{ flex: "1 1 150px" }}>{lab("Data colectare", true)}<input type="date" style={inputSt} value={edit.f.data_colectare} onChange={(e) => setF({ data_colectare: e.target.value })} /></div>

                  <div style={{ flex: "1 1 140px" }}>{lab("Tip anexă")}
                    <select style={inputSt} value={edit.f.tip_anexa} onChange={(e) => setF({ tip_anexa: e.target.value })}>{TIPURI_ANEXA.map((t) => <option key={t}>{t}</option>)}</select>
                  </div>
                  <div style={{ flex: "1 1 150px" }}>{lab("Nr. anexă (dacă diferă)")}<input style={inputSt} value={edit.f.nr_anexa} onChange={(e) => setF({ nr_anexa: e.target.value })} /></div>
                  <div style={{ flex: "1 1 150px" }}>{lab("Dată anexă")}<input type="date" style={inputSt} value={edit.f.data_anexa} onChange={(e) => setF({ data_anexa: e.target.value })} /></div>

                  <div style={{ flex: "1 1 170px" }}>{lab("Organizație (implicită pe linii)", true)}
                    <select style={inputSt} value={edit.f.organizatie} onChange={(e) => setF({ organizatie: e.target.value })}>
                      {organizatiiNume.map((o) => <option key={o} value={o}>{o}</option>)}
                      {edit.f.organizatie && !organizatiiNume.includes(edit.f.organizatie) && <option value={edit.f.organizatie}>{edit.f.organizatie}</option>}
                    </select>
                  </div>
                  <div style={{ flex: "1 1 130px" }}>{lab("Nr. ticket cântar")}<input style={inputSt} value={edit.f.nr_ticket} onChange={(e) => setF({ nr_ticket: e.target.value })} /></div>
                  <div style={{ flex: "1 1 150px" }}>{lab("Dată ticket")}<input type="date" style={inputSt} value={edit.f.data_ticket} onChange={(e) => setF({ data_ticket: e.target.value })} /></div>

                  <div style={{ flex: "1 1 150px" }}>{lab("Cod HG856", true)}
                    <input list="deee-coduri" style={inputSt} value={edit.f.cod_hg856} onChange={(e) => setF({ cod_hg856: e.target.value })} placeholder="ex. 20 01 36" />
                    <datalist id="deee-coduri">{COD_EWC.map((c) => <option key={c} value={c} />)}</datalist>
                  </div>
                  <div style={{ flex: "1 1 170px" }}>{lab("Greutate totală (kg)", true)}<input style={{ ...inputSt, textAlign: "right", fontWeight: 700 }} inputMode="decimal" value={edit.f.greutate} onChange={(e) => setF({ greutate: e.target.value })} /></div>

                  <div style={{ flex: "1 1 100%", borderTop: "1px solid #eef2f6", paddingTop: 10, fontWeight: 700, fontSize: 12, color: "#334155" }}>Transport</div>
                  <div style={{ flex: "1 1 100%" }}>
                    <label style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                      <input type="checkbox" checked={!!edit.f.fara_licenta} onChange={(e) => setF({ fara_licenta: e.target.checked })} /> Fără licență transport (sub 3,5 t)
                    </label>
                  </div>
                  <div style={{ flex: "1 1 240px" }}>{lab("Transportator")}
                    <input list="deee-transp" style={inputSt} value={edit.f.transportator} onChange={(e) => setF({ transportator: e.target.value })} />
                    <datalist id="deee-transp">{transp.rows.filter((t) => t.activ).map((t) => <option key={t.id} value={t.den} />)}</datalist>
                  </div>
                  <div style={{ flex: "1 1 150px" }}>{lab("Nr. auto")}
                    <input list="deee-masini" style={{ ...inputSt, textTransform: "uppercase" }} value={edit.f.nr_auto} onChange={(e) => setF({ nr_auto: e.target.value })} />
                    <datalist id="deee-masini">{masiniTr.map((m) => <option key={m.id} value={m.nr_auto} />)}</datalist>
                  </div>
                  <div style={{ flex: "1 1 200px" }}>{lab("Șofer")}
                    <input list="deee-soferi" style={inputSt} value={edit.f.sofer} onChange={(e) => setF({ sofer: e.target.value })} />
                    <datalist id="deee-soferi">{soferiMasina.map((s) => <option key={s.id} value={s.nume} />)}</datalist>
                  </div>
                  <div style={{ flex: "1 1 100%" }}>{lab("Observații")}<textarea style={{ ...inputSt, minHeight: 50, fontFamily: "inherit" }} value={edit.f.observatii} onChange={(e) => setF({ observatii: e.target.value })} /></div>
                </div>
              )}

              {edit.pas === 2 && (
                <div>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#334155", marginBottom: 12 }}>
                    <b>{edit.f.furnizor}</b> • aviz {edit.f.nr_document} • cod {edit.f.cod_hg856} • <b>{fmtKg(greutateEdit)} kg</b>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>Alocă toate liniile la:</span>
                    <select style={{ ...inputSt, width: 160 }} value="" onChange={(e) => e.target.value && alocaToate(e.target.value)}>
                      <option value="">Alege organizația…</option>{organizatiiNume.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 760 }}>
                    <thead><tr>
                      <th style={ui.th({ textAlign: "left" })}>Echipament</th>
                      <th style={ui.th({ width: 130 })}>Organizație</th>
                      <th style={ui.th({ textAlign: "left", width: 190 })}>Cod organizație</th>
                      <th style={ui.th({ width: 70 })} title="Se calculează din greutatea medie când alegi echipamentul sau procentul">Bucăți</th>
                      <th style={ui.th({ width: 100 })}>Kg</th>
                      <th style={ui.th({ width: 80 })}>% din total</th>
                      <th style={ui.th({ width: 36 })}></th>
                    </tr></thead>
                    <tbody>
                      {edit.linii.map((l, i) => {
                        const cod = co.codPentru(l.echipament, l.organizatie);
                        const kgL = numar(l.kg) || 0;
                        const pct = greutateEdit > 0 ? rot4(kgL / greutateEdit * 100) : "";
                        return (
                          <tr key={i}>
                            <td style={ui.td({ padding: 3 })}>
                              <select style={inputSt} value={l.echipament} onChange={(e) => alegeEchipament(i, e.target.value)}>
                                <option value="">Alege echipamentul…</option>
                                {echipamenteActive.map((e) => <option key={e.id} value={e.den}>{e.den}</option>)}
                                {l.echipament && !echipamenteActive.some((e) => e.den === l.echipament) && <option value={l.echipament}>{l.echipament}</option>}
                              </select>
                            </td>
                            <td style={ui.td({ padding: 3 })}>
                              <select style={inputSt} value={l.organizatie || ""} onChange={(e) => setLinie(i, { organizatie: e.target.value })}>
                                {organizatiiNume.map((o) => <option key={o} value={o}>{o}</option>)}
                                {l.organizatie && !organizatiiNume.includes(l.organizatie) && <option value={l.organizatie}>{l.organizatie}</option>}
                              </select>
                            </td>
                            <td style={ui.td({ fontSize: 11, color: cod ? "#334155" : "#cbd5e1" })} title={cod ? etichetaCod(l.organizatie, cod) : ""}>
                              <div style={{ maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cod ? etichetaCod(l.organizatie, cod) : l.organizatie === "NEALOCATE" || !l.echipament ? "—" : "fără cod"}</div>
                            </td>
                            <td style={ui.td({ padding: 3 })}><input style={{ ...inputSt, textAlign: "right" }} inputMode="numeric" value={l.buc} placeholder="0" onChange={(e) => setLinie(i, { buc: e.target.value })} /></td>
                            <td style={ui.td({ padding: 3 })}><input style={{ ...inputSt, textAlign: "right", fontWeight: 700 }} inputMode="decimal" value={l.kg} onChange={(e) => setLinie(i, { kg: e.target.value })} /></td>
                            <td style={ui.td({ padding: 3 })}>
                              <input key={`${i}-${l.kg}`} style={{ ...inputSt, textAlign: "right" }} inputMode="decimal" defaultValue={pct}
                                onBlur={(e) => { if (e.target.value !== String(pct)) schimbaProcent(i, e.target.value); }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
                            </td>
                            <td style={ui.td({ textAlign: "center", padding: 2 })}><button onClick={() => setEdit((p) => ({ ...p, linii: p.linii.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }} title="Scoate rândul">✕</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 8 }}>
                    <button onClick={() => setEdit((p) => ({ ...p, linii: [...p.linii, { echipament: "", buc: "", kg: diferenta > 0 ? String(diferenta) : "", organizatie: p.f.organizatie }] }))} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă echipament</button>
                    <div style={{ fontSize: 13, fontWeight: 700, color: Math.abs(diferenta) <= 0.01 ? G : "#c62828" }}>
                      Distribuit: {fmtKg(totalLinii)} / {fmtKg(greutateEdit)} kg {Math.abs(diferenta) <= 0.01 ? "✓" : `(${diferenta > 0 ? "mai rămân" : "în plus"} ${fmtKg(Math.abs(diferenta))} kg)`}
                    </div>
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
                  ? <button onClick={urmatorulPas} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Următorul Pas →</button>
                  : <button disabled={seSalveaza} onClick={salveaza} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: seSalveaza ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează documentul"}</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
