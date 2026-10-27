// Rate de reciclare si recuperare pe categorii WEEELABEX (CAT1–CAT6), ca in WiseWeee ("Rate R&R").
//   Input        = echipamentele dezmembrate (kg), pe categoria echipamentului
//   Output       = fractiile rezultate (kg); fiecare fractie e repartizata pe categorii proportional cu cat input a avut fiecare categorie
//                  in operatiunile din care provine
//   Reciclat     = partea de fractii clasificata "reciclare"; Valorificat = "valorificare"; Eliminat = "eliminare" (inclusiv pierderile)
//   Rata reciclare = reciclat / input;  Rata recuperare = (reciclat + valorificat) / input
// Clasificarea unei fractii: pentru ce s-a vandut, procentele R/D ale vanzarii (daca sunt completate), altfel clasificarea implicita
// a fractiei; pentru ce n-a fost vandut, clasificarea implicita.
export const FARA_CAT = "—";
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const aSet = (v) => v !== null && v !== undefined && v !== "";
const cheie = (den, cod) => `${String(den || "").trim()}\u0001${String(cod || "").trim()}`;

export const clasificareFractie = (f) =>
  f && (aSet(f.rd_reciclare) || aSet(f.rd_valorificare) || aSet(f.rd_eliminare))
    ? { r: Number(f.rd_reciclare) || 0, v: Number(f.rd_valorificare) || 0, e: Number(f.rd_eliminare) || 0 } : null;
const clasificareVanzare = (v) =>
  aSet(v.proc_reciclare) || aSet(v.proc_valorificare) || aSet(v.proc_eliminare)
    ? { r: Number(v.proc_reciclare) || 0, v: Number(v.proc_valorificare) || 0, e: Number(v.proc_eliminare) || 0 } : null;

export function calculeazaRate({ dz, dzE, dzF, van, ech, fractii, categorii, an = "", org = "", doarVanzari = false }) {
  const catDe = Object.fromEntries(ech.map((e) => [e.den, e.categorie || FARA_CAT]));
  const clasDe = new Map(fractii.map((f) => [cheie(f.den, f.cod), clasificareFractie(f)]));
  const inAn = (d) => !an || String(d).startsWith(an);
  const ops = dz.filter((d) => inAn(d.data) && (!org || d.organizatie === org));
  const idOps = new Set(ops.map((d) => d.id));

  const inputCat = new Map();           // categorie -> kg
  const prod = new Map();               // fractie -> { den, cod, total, perCat: Map }
  const adauga = (m, k, v) => m.set(k, (m.get(k) || 0) + v);
  const inputOp = {};                   // op -> Map(categorie -> kg)
  dzE.filter((l) => idOps.has(l.dezm_id)).forEach((l) => {
    const c = catDe[l.echipament] || FARA_CAT; const kg = Number(l.kg) || 0;
    adauga(inputCat, c, kg);
    inputOp[l.dezm_id] = inputOp[l.dezm_id] || new Map(); adauga(inputOp[l.dezm_id], c, kg);
  });
  dzF.filter((l) => idOps.has(l.dezm_id)).forEach((l) => {
    const k = cheie(l.fractie, l.cod); const kg = Number(l.kg) || 0;
    let p = prod.get(k); if (!p) { p = { den: l.fractie, cod: l.cod, total: 0, perCat: new Map() }; prod.set(k, p); }
    p.total += kg;
    const inp = inputOp[l.dezm_id]; const tot = inp ? [...inp.values()].reduce((a, b) => a + b, 0) : 0;
    if (tot > 0) inp.forEach((ikg, c) => adauga(p.perCat, c, (kg * ikg) / tot)); else adauga(p.perCat, FARA_CAT, kg);
  });

  // vanzari pe fractie (in perioada / organizatia aleasa)
  const vandut = new Map();             // fractie -> { R, V, E, nec, kg }
  van.filter((v) => inAn(v.data) && (!org || v.organizatie === org)).forEach((v) => {
    const k = cheie(v.fractie, v.cod); const kg = Number(v.kg) || 0;
    const cl = clasificareVanzare(v) || clasDe.get(k) || null;
    let s = vandut.get(k); if (!s) { s = { R: 0, V: 0, E: 0, nec: 0, kg: 0, faraProc: 0 }; vandut.set(k, s); }
    s.kg += kg;
    if (!clasificareVanzare(v)) s.faraProc += 1;
    if (cl) { s.R += (kg * cl.r) / 100; s.V += (kg * cl.v) / 100; s.E += (kg * cl.e) / 100; } else s.nec += kg;
  });

  const rez = new Map();                // categorie -> { input, output, R, V, E, nec }
  const cat = (c) => { let r = rez.get(c); if (!r) { r = { cat: c, input: 0, output: 0, R: 0, V: 0, E: 0, nec: 0 }; rez.set(c, r); } return r; };
  const faraClasificare = new Map();    // fractie -> kg nec
  let vanzariFaraProcente = 0;

  prod.forEach((p, k) => {
    const s = vandut.get(k) || { R: 0, V: 0, E: 0, nec: 0, kg: 0, faraProc: 0 };
    const vandutKg = Math.min(s.kg, p.total);               // ce s-a vandut peste ce s-a produs nu se pune la socoteala
    const factor = s.kg > 0 ? vandutKg / s.kg : 0;
    const clas = clasDe.get(k);
    const nerestKg = Math.max(p.total - vandutKg, 0);
    let R = s.R * factor, V = s.V * factor, E = s.E * factor, nec = s.nec * factor;
    if (!doarVanzari) {
      if (clas) { R += (nerestKg * clas.r) / 100; V += (nerestKg * clas.v) / 100; E += (nerestKg * clas.e) / 100; } else nec += nerestKg;
    }
    const baza = doarVanzari ? vandutKg : p.total;
    if (nec > 0.0005) faraClasificare.set(k, { den: p.den, cod: p.cod, kg: nec });
    if (baza <= 0) return;
    p.perCat.forEach((ckg, c) => {
      const sh = p.total > 0 ? ckg / p.total : 0; const r = cat(c);
      r.output += baza * sh; r.R += R * sh; r.V += V * sh; r.E += E * sh; r.nec += nec * sh;
    });
  });
  // input-ul categoriilor; in modul "doar vanzari" baza ratei e cantitatea vanduta, deci input = output
  inputCat.forEach((kg, c) => { cat(c).input = doarVanzari ? 0 : kg; });
  if (doarVanzari) rez.forEach((r) => { r.input = r.output; });
  vandut.forEach((s) => { vanzariFaraProcente += s.faraProc; });

  const tinta = Object.fromEntries(categorii.map((c) => [c.cat, c]));
  const randuri = [...rez.values()]
    .filter((r) => r.input > 0.0005 || r.output > 0.0005)
    .sort((a, b) => String(a.cat).localeCompare(String(b.cat)))
    .map((r) => {
      const t = tinta[r.cat];
      const rataR = r.input > 0 ? (r.R / r.input) * 100 : 0;
      const rataV = r.input > 0 ? ((r.R + r.V) / r.input) * 100 : 0;
      const tR = t ? Number(t.tinta_reciclare) : null, tV = t ? Number(t.tinta_valorificare) : null;
      return {
        ...r, input: r2(r.input), output: r2(r.output), R: r2(r.R), V: r2(r.V), E: r2(r.E), nec: r2(r.nec),
        pierderi: r2(Math.max(r.input - r.output, 0) + r.E), rataR, rataV, tintaR: tR, tintaV: tV,
        okR: tR === null ? null : rataR + 0.005 >= tR, okV: tV === null ? null : rataV + 0.005 >= tV,
      };
    });
  const input = randuri.reduce((s, r) => s + r.input, 0);
  const pond = (camp) => (input > 0 ? randuri.reduce((s, r) => s + (r[camp] ?? 0) * r.input, 0) / input : 0);
  const R = randuri.reduce((s, r) => s + r.R, 0), V = randuri.reduce((s, r) => s + r.V, 0);
  const total = {
    input: r2(input), R: r2(R), V: r2(V), rataR: input > 0 ? (R / input) * 100 : 0, rataV: input > 0 ? ((R + V) / input) * 100 : 0,
    tintaR: pond("tintaR"), tintaV: pond("tintaV"),
  };
  return { randuri, total, faraClasificare: [...faraClasificare.values()], vanzariFaraProcente, nrOperatiuni: ops.length };
}
