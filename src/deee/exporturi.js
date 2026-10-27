import { dataRo, lunaDin, numeLuna } from "./constante";
import { etichetaCod } from "./coduriOrg";
import { denContabilitate } from "./pv";

// Cele cinci rapoarte / exporturi din WiseWeee ("Rapoarte & Exporturi"), ca fisiere CSV (se deschid in Excel; sectiunile sunt separate prin rand gol).
// Fiecare constructor intoarce o lista de randuri (liste de celule).
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const colat = (a, b) => String(a ?? "").localeCompare(String(b ?? ""), "ro", { sensitivity: "base", numeric: true });
const aduna = (m, k, init, f) => { let x = m.get(k); if (!x) { x = init(); m.set(k, x); } f(x); };

export const RAPOARTE = [
  { k: "totalizare", titlu: "Totalizare Echipamente + Fracții", descriere: "Per organizație: echipamentele primite (cu codul organizației) și fracțiile obținute / vândute." },
  { k: "pv", titlu: "Proces Verbal Tratare", descriere: "Fiecare operațiune de dezmembrare: echipamentele intrate și fracțiile rezultate, cu procente." },
  { k: "trasabilitate", titlu: "Trasabilitate Fracții", descriere: "Pe cod HG856, echipament și organizație: primit → dezmembrat; pe fracție: obținut → vândut → rămas." },
  { k: "contabilitate", titlu: "Contabilitate", descriere: "INPUT (achiziții) față de OUTPUT (fracții, vânzări cu valoare) și bilanțul tratării." },
  { k: "lunar", titlu: "Per Organizație per Lună", descriere: "Raport lunar pe organizație; ECOTIC și ECOPOSITIVE separat, cu codurile echipamentelor." },
];

export function construiesteRaport(tip, c) {
  const { ach, achL, dz, dzE, dzF, van, fractii, codPentru, de, pana, org } = c;
  const inP = (d) => (!de || String(d) >= de) && (!pana || String(d) <= pana);
  const perioada = `${de ? dataRo(de) : "început"} – ${pana ? dataRo(pana) : "azi"}${org ? ` • organizația ${org}` : ""}`;
  const achF = ach.filter((a) => inP(a.data_colectare));
  const achId = Object.fromEntries(achF.map((a) => [a.id, a]));
  const orgL = (l) => l.organizatie || achId[l.achizitie_id]?.organizatie || "";
  const linii = achL.filter((l) => achId[l.achizitie_id] && (!org || orgL(l) === org));
  const ops = dz.filter((d) => inP(d.data) && (!org || d.organizatie === org));
  const opId = Object.fromEntries(ops.map((d) => [d.id, d]));
  const opE = dzE.filter((l) => opId[l.dezm_id]);
  const opF = dzF.filter((l) => opId[l.dezm_id]);
  const vanz = van.filter((v) => inP(v.data) && (!org || v.organizatie === org));
  const hgDe = (l) => achId[l.achizitie_id]?.cod_hg856 || "";
  const dc = (fr, cod) => denContabilitate(fr, cod, fractii);
  const cod = (den, o) => etichetaCod(o, codPentru(den, o));

  // ── fractii: obtinut / vandut per (organizatie, fractie, cod) ──
  const fractiiPe = () => {
    const m = new Map();
    const k = (o, f, cd) => `${o}\u0001${f}\u0001${cd}`;
    const ia = (o, f, cd) => { let x = m.get(k(o, f, cd)); if (!x) { x = { org: o, fractie: f, cod: cd, produs: 0, vandut: 0 }; m.set(k(o, f, cd), x); } return x; };
    opF.forEach((l) => { ia(opId[l.dezm_id].organizatie, l.fractie, l.cod).produs += Number(l.kg) || 0; });
    vanz.forEach((v) => { ia(v.organizatie, v.fractie, v.cod).vandut += Number(v.kg) || 0; });
    return [...m.values()].sort((a, b) => colat(a.org, b.org) || colat(a.fractie, b.fractie) || colat(a.cod, b.cod));
  };

  if (tip === "totalizare") {
    const out = [["TOTALIZARE ECHIPAMENTE + FRACȚII"], [perioada], [], ["ECHIPAMENTE PRIMITE (achiziții)"], ["Organizație", "Cod organizație", "Echipament", "Cod HG856", "Buc", "Kg"]];
    const m = new Map();
    linii.forEach((l) => aduna(m, `${orgL(l)}\u0001${l.echipament}\u0001${hgDe(l)}`, () => ({ org: orgL(l), den: l.echipament, hg: hgDe(l), buc: 0, kg: 0 }), (x) => { x.buc += l.buc || 0; x.kg += Number(l.kg) || 0; }));
    let org0 = null, sb = 0, sk = 0, tb = 0, tk = 0;
    const subtotal = () => { if (org0 !== null) out.push([`TOTAL ${org0}`, "", "", "", sb, r2(sk)]); sb = 0; sk = 0; };
    [...m.values()].sort((a, b) => colat(a.org, b.org) || colat(a.den, b.den) || colat(a.hg, b.hg)).forEach((x) => {
      if (x.org !== org0) { subtotal(); org0 = x.org; }
      out.push([x.org, cod(x.den, x.org), x.den, x.hg, x.buc, r2(x.kg)]); sb += x.buc; sk += x.kg; tb += x.buc; tk += x.kg;
    });
    subtotal(); out.push(["TOTAL GENERAL", "", "", "", tb, r2(tk)], [], ["FRACȚII (din dezmembrări)"], ["Organizație", "Cod", "Fracție", "Denumire contabilitate", "Obținut (kg)", "Vândut (kg)", "Rămas (kg)"]);
    let po = 0, pv = 0;
    fractiiPe().forEach((x) => { out.push([x.org, x.cod, x.fractie, dc(x.fractie, x.cod), r2(x.produs), r2(x.vandut), r2(x.produs - x.vandut)]); po += x.produs; pv += x.vandut; });
    out.push(["TOTAL GENERAL", "", "", "", r2(po), r2(pv), r2(po - pv)]);
    return out;
  }

  if (tip === "pv") {
    const out = [["PROCES VERBAL TRATARE"], [perioada], [], ["Nr. operațiune", "Data", "Organizație", "Secțiune", "Cod", "Denumire", "Denumire contabilitate", "Kg", "Buc", "% din total"]];
    [...ops].sort((a, b) => String(a.data).localeCompare(String(b.data)) || colat(a.nr_operatiune, b.nr_operatiune)).forEach((d) => {
      const e = opE.filter((l) => l.dezm_id === d.id).sort((a, b) => (a.ord || 0) - (b.ord || 0));
      const f = opF.filter((l) => l.dezm_id === d.id).sort((a, b) => (a.ord || 0) - (b.ord || 0));
      const te = e.reduce((s, l) => s + Number(l.kg), 0), tf = f.reduce((s, l) => s + Number(l.kg), 0);
      e.forEach((l) => out.push([d.nr_operatiune, dataRo(d.data), d.organizatie, "INTRARE", l.cod_ewc, l.echipament, "", r2(l.kg), l.buc, te > 0 ? r2((Number(l.kg) / te) * 100) : ""]));
      f.forEach((l) => out.push([d.nr_operatiune, dataRo(d.data), d.organizatie, "FRACȚIE", l.cod, l.fractie, dc(l.fractie, l.cod), r2(l.kg), "", tf > 0 ? r2((Number(l.kg) / tf) * 100) : ""]));
      out.push([d.nr_operatiune, dataRo(d.data), d.organizatie, "TOTAL INTRAT / IEȘIT", "", "", "", `${r2(te)} / ${r2(tf)}`, e.reduce((s, l) => s + (l.buc || 0), 0), ""], []);
    });
    return out;
  }

  if (tip === "trasabilitate") {
    const m = new Map();
    const ia = (hg, den, o) => { const k = `${hg}\u0001${den}\u0001${o}`; let x = m.get(k); if (!x) { x = { hg, den, org: o, kg: 0, buc: 0, dkg: 0, dbuc: 0 }; m.set(k, x); } return x; };
    linii.forEach((l) => { const x = ia(hgDe(l), l.echipament, orgL(l)); x.kg += Number(l.kg) || 0; x.buc += l.buc || 0; });
    opE.forEach((l) => { const x = ia(l.cod_ewc, l.echipament, opId[l.dezm_id].organizatie); x.dkg += Number(l.kg) || 0; x.dbuc += l.buc || 0; });
    const out = [["TRASABILITATE FRACȚII"], [perioada], [], ["ECHIPAMENTE: primit → dezmembrat"], ["Cod HG856", "Echipament", "Organizație", "Primit (kg)", "Primit (buc)", "Dezmembrat (kg)", "Dezmembrat (buc)", "Rămas (kg)"]];
    [...m.values()].sort((a, b) => colat(a.hg, b.hg) || colat(a.den, b.den) || colat(a.org, b.org)).forEach((x) => out.push([x.hg, x.den, x.org, r2(x.kg), x.buc, r2(x.dkg), x.dbuc, r2(x.kg - x.dkg)]));
    out.push([], ["FRACȚII: obținut → vândut"], ["Organizație", "Cod", "Fracție", "Obținut (kg)", "Vândut (kg)", "Rămas (kg)"]);
    fractiiPe().forEach((x) => out.push([x.org, x.cod, x.fractie, r2(x.produs), r2(x.vandut), r2(x.produs - x.vandut)]));
    out.push([], ["VÂNZĂRI"], ["Data", "Client", "Nr. aviz", "Organizație", "Cod", "Fracție", "Kg"]);
    [...vanz].sort((a, b) => String(a.data).localeCompare(String(b.data))).forEach((v) => out.push([dataRo(v.data), v.client, v.nr_aviz, v.organizatie, v.cod, v.fractie, r2(v.kg)]));
    return out;
  }

  if (tip === "contabilitate") {
    const out = [["CONTABILITATE — INPUT vs OUTPUT"], [perioada], [], ["INPUT — ACHIZIȚII"], ["Data", "Furnizor", "Aviz", "Cod HG856", "Echipament", "Organizație", "Kg", "Buc"]];
    let ti = 0;
    [...linii].sort((a, b) => String(achId[a.achizitie_id].data_colectare).localeCompare(String(achId[b.achizitie_id].data_colectare))).forEach((l) => {
      const a = achId[l.achizitie_id]; ti += Number(l.kg) || 0;
      out.push([dataRo(a.data_colectare), a.furnizor, a.nr_document, a.cod_hg856, l.echipament, orgL(l), r2(l.kg), l.buc]);
    });
    out.push(["TOTAL INPUT", "", "", "", "", "", r2(ti), ""], [], ["OUTPUT — FRACȚII OBȚINUTE (denumire contabilitate)"], ["Denumire contabilitate", "Cod", "Kg"]);
    const fr = new Map();
    opF.forEach((l) => aduna(fr, `${l.fractie}\u0001${l.cod}`, () => ({ f: l.fractie, cod: l.cod, kg: 0 }), (x) => { x.kg += Number(l.kg) || 0; }));
    let to = 0;
    [...fr.values()].sort((a, b) => colat(dc(a.f, a.cod), dc(b.f, b.cod))).forEach((x) => { to += x.kg; out.push([dc(x.f, x.cod), x.cod, r2(x.kg)]); });
    out.push(["TOTAL FRACȚII OBȚINUTE", "", r2(to)], [], ["OUTPUT — VÂNZĂRI"], ["Data", "Client", "Aviz", "Denumire contabilitate", "Kg", "Preț/kg (lei)", "Valoare (lei)"]);
    let tv = 0, tl = 0;
    [...vanz].sort((a, b) => String(a.data).localeCompare(String(b.data))).forEach((v) => { tv += Number(v.kg) || 0; tl += Number(v.valoare) || 0; out.push([dataRo(v.data), v.client, v.nr_aviz, dc(v.fractie, v.cod), r2(v.kg), v.pret_kg ?? "", v.valoare ?? ""]); });
    const ted = opE.reduce((s, l) => s + Number(l.kg), 0);
    out.push(["TOTAL VÂNZĂRI", "", "", "", r2(tv), "", r2(tl)], [], ["BILANȚ TRATARE"], ["Intrat prin achiziții (kg)", r2(ti)], ["Echipamente dezmembrate (kg)", r2(ted)], ["Echipamente rămase nedezmembrate (kg)", r2(ti - ted)], ["Fracții obținute (kg)", r2(to)], ["Fracții vândute (kg)", r2(tv)], ["Fracții rămase în stoc (kg)", r2(to - tv)], ["Valoare vânzări (lei)", r2(tl)]);
    return out;
  }

  // lunar
  const luni = new Map();
  const ia = (luna, o) => { const k = `${luna}\u0001${o}`; let x = luni.get(k); if (!x) { x = { luna, org: o, aKg: 0, aBuc: 0, dKg: 0, fKg: 0, vKg: 0, vLei: 0 }; luni.set(k, x); } return x; };
  linii.forEach((l) => { const x = ia(lunaDin(achId[l.achizitie_id].data_colectare), orgL(l)); x.aKg += Number(l.kg) || 0; x.aBuc += l.buc || 0; });
  opE.forEach((l) => { ia(lunaDin(opId[l.dezm_id].data), opId[l.dezm_id].organizatie).dKg += Number(l.kg) || 0; });
  opF.forEach((l) => { ia(lunaDin(opId[l.dezm_id].data), opId[l.dezm_id].organizatie).fKg += Number(l.kg) || 0; });
  vanz.forEach((v) => { const x = ia(lunaDin(v.data), v.organizatie); x.vKg += Number(v.kg) || 0; x.vLei += Number(v.valoare) || 0; });
  const out = [["RAPORT PER ORGANIZAȚIE PER LUNĂ"], [perioada], [], ["Luna", "Organizație", "Achiziții (kg)", "Achiziții (buc)", "Dezmembrat (kg)", "Fracții obținute (kg)", "Vândut (kg)", "Valoare vânzări (lei)"]];
  [...luni.values()].sort((a, b) => colat(a.luna, b.luna) || colat(a.org, b.org)).forEach((x) => out.push([numeLuna(x.luna), x.org, r2(x.aKg), x.aBuc, r2(x.dKg), r2(x.fKg), r2(x.vKg), r2(x.vLei)]));
  ["ECOTIC", "ECOPOSITIVE"].filter((o) => !org || org === o).forEach((o) => {
    const m = new Map();
    linii.filter((l) => orgL(l) === o).forEach((l) => aduna(m, `${lunaDin(achId[l.achizitie_id].data_colectare)}\u0001${l.echipament}`, () => ({ luna: lunaDin(achId[l.achizitie_id].data_colectare), den: l.echipament, buc: 0, kg: 0 }), (x) => { x.buc += l.buc || 0; x.kg += Number(l.kg) || 0; }));
    if (!m.size) return;
    out.push([], [`${o} — echipamente primite pe lună`], ["Luna", "Cod " + o, "Echipament", "Buc", "Kg"]);
    [...m.values()].sort((a, b) => colat(a.luna, b.luna) || colat(a.den, b.den)).forEach((x) => out.push([numeLuna(x.luna), cod(x.den, o), x.den, x.buc, r2(x.kg)]));
  });
  return out;
}

// randuri -> fisier CSV (separator ;, zecimale cu virgula, BOM ca sa se deschida corect in Excel)
export function descarcaCsv(nume, randuri) {
  const celula = (v) => { const t = typeof v === "number" ? String(v).replace(".", ",") : String(v ?? ""); return `"${t.replace(/"/g, '""')}"`; };
  const blob = new Blob(["﻿" + randuri.map((r) => r.map(celula).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = nume; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
