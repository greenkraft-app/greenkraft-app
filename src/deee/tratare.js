// Monitorizarea zilnica a marfii tratate.
//   bazin   = marfa intrata la tratare si inca netratata
//   lot     = o intrare (data, kg, echipament); PV-urile de tratare consuma loturile in ordinea intrarii (FIFO), deci se vede cat de veche e marfa ramasa
//   un PV din ziua D poate trata doar marfa intrata pana in ziua D; ce depaseste se numara ca "tratat peste ce a intrat" (deficit)
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ms = (iso) => new Date(`${String(iso).slice(0, 10)}T00:00:00`).getTime();
export const zileIntre = (a, b) => Math.round((ms(b) - ms(a)) / 86400000);
const faraDiacr = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/\s+/g, " ").trim();
const esteZiLucratoare = (iso) => { const d = new Date(`${iso}T00:00:00`).getDay(); return d !== 0 && d !== 6; };
const adaugaZile = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + n);
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; // data locala, nu UTC
};

// "Ion Popescu, Maria Ionescu" -> ["Ion Popescu", "Maria Ionescu"]
export const numeleOamenilor = (text) => String(text || "").split(/[,;\/\n]| și | si /i).map((x) => x.trim()).filter(Boolean);

export function calculeazaTratare({ intrari, pv, marfa, fractii, azi }) {
  const dupaData = (a, b) => String(a.data).localeCompare(String(b.data)) || String(a.created_at).localeCompare(String(b.created_at));
  const loturi = [...intrari].sort(dupaData).map((i) => ({ id: i.id, data: i.data, echipament: i.echipament || "", kg: Number(i.kg) || 0, ramas: Number(i.kg) || 0, nr_tichet: i.nr_tichet || "", observatii: i.observatii || "" }));
  const pvSortate = [...pv].sort(dupaData);
  const marfaPv = {}; marfa.forEach((l) => { (marfaPv[l.pv_id] = marfaPv[l.pv_id] || []).push(l); });
  const fractiiPv = {}; fractii.forEach((l) => { (fractiiPv[l.pv_id] = fractiiPv[l.pv_id] || []).push(l); });

  // ── consum FIFO ──
  let deficit = 0; const deficitPv = {};
  const consuma = (kg, data, potrivit) => {
    let de_luat = kg;
    for (const lot of loturi) {
      if (de_luat <= 0.0005) break;
      if (lot.data > data || lot.ramas <= 0.0005 || !potrivit(lot)) continue;
      const x = Math.min(lot.ramas, de_luat); lot.ramas -= x; de_luat -= x;
    }
    return de_luat;
  };
  pvSortate.forEach((p) => {
    [...(marfaPv[p.id] || [])].sort((a, b) => (a.ord || 0) - (b.ord || 0)).forEach((l) => {
      const kg = Number(l.kg) || 0; let ramas = kg;
      if (l.echipament) {
        ramas = consuma(ramas, p.data, (lot) => lot.echipament === l.echipament);   // intai marfa de acelasi tip
        ramas = consuma(ramas, p.data, (lot) => !lot.echipament);                    // apoi marfa amestecata
      } else ramas = consuma(ramas, p.data, () => true);
      if (ramas > 0.0005) { deficit += ramas; deficitPv[p.id] = (deficitPv[p.id] || 0) + ramas; }
    });
  });

  // ── pe zile ──
  const zile = new Map();
  const zi = (d) => { let x = zile.get(d); if (!x) { x = { data: d, intrat: 0, tratat: 0, fractiiKg: 0, pv: [], intrari: [] }; zile.set(d, x); } return x; };
  intrari.forEach((i) => { const x = zi(i.data); x.intrat += Number(i.kg) || 0; x.intrari.push(i); });
  pvSortate.forEach((p) => {
    const x = zi(p.data);
    const m = marfaPv[p.id] || [], f = fractiiPv[p.id] || [];
    const kgT = m.reduce((s, l) => s + Number(l.kg), 0), kgF = f.reduce((s, l) => s + Number(l.kg), 0);
    x.tratat += kgT; x.fractiiKg += kgF;
    x.pv.push({ ...p, marfa: m.sort((a, b) => (a.ord || 0) - (b.ord || 0)), fractii: f.sort((a, b) => (a.ord || 0) - (b.ord || 0)), kgTratat: r2(kgT), kgFractii: r2(kgF), deficit: r2(deficitPv[p.id] || 0) });
  });
  const crescator = [...zile.values()].sort((a, b) => a.data.localeCompare(b.data));
  let cumul = 0;
  crescator.forEach((z) => { cumul += z.intrat - z.tratat; z.bazinSfarsit = r2(cumul); z.intrat = r2(z.intrat); z.tratat = r2(z.tratat); z.fractiiKg = r2(z.fractiiKg); z.randament = z.tratat > 0 ? (z.fractiiKg / z.tratat) * 100 : null; });

  // ── zile lucratoare cu marfa in bazin si fara PV ──
  const zileFaraPv = []; let bazinInainte = 0;
  if (crescator.length) {
    const toate = new Map(crescator.map((z) => [z.data, z]));
    for (let d = crescator[0].data, n = 0; d <= azi && n < 1100; d = adaugaZile(d, 1), n++) {
      const z = toate.get(d);
      if (esteZiLucratoare(d) && (!z || !z.pv.length) && (bazinInainte > 0.5 || (z && z.intrat > 0)) && d < azi) zileFaraPv.push(d);
      if (z) bazinInainte = z.bazinSfarsit;
    }
  }

  // ── loturi ramase (bazinul acum) ──
  const ramase = loturi.filter((l) => l.ramas > 0.0005).map((l) => ({ ...l, ramas: r2(l.ramas), zile: Math.max(zileIntre(l.data, azi), 0) }));
  const bazin = r2(ramase.reduce((s, l) => s + l.ramas, 0));
  const vechimeMax = ramase.length ? Math.max(...ramase.map((l) => l.zile)) : 0;

  // ── pe tip de echipament (bazin) si pe persoana (tratat) ──
  const peTip = new Map(); ramase.forEach((l) => peTip.set(l.echipament || "Amestec", (peTip.get(l.echipament || "Amestec") || 0) + l.ramas));
  const oameni = new Map();
  pvSortate.forEach((p) => {
    const nume = numeleOamenilor(p.tratat_de); if (!nume.length) return;
    const kg = (marfaPv[p.id] || []).reduce((s, l) => s + Number(l.kg), 0) / nume.length;
    nume.forEach((n) => { const k = faraDiacr(n); let o = oameni.get(k); if (!o) { o = { nume: n, kg: 0, pv: 0, zile: new Set() }; oameni.set(k, o); } o.kg += kg; o.pv += 1; o.zile.add(p.data); });
  });

  const totIntrat = r2(intrari.reduce((s, i) => s + Number(i.kg), 0)), totTratat = r2(marfa.filter((l) => pv.some((p) => p.id === l.pv_id)).reduce((s, l) => s + Number(l.kg), 0));
  return {
    zile: [...crescator].reverse(), loturi: ramase, bazin, vechimeMax, deficit: r2(deficit), zileFaraPv: zileFaraPv.reverse(),
    bazinPeTip: [...peTip.entries()].map(([echipament, kg]) => ({ echipament, kg: r2(kg) })).sort((a, b) => b.kg - a.kg),
    oameni: [...oameni.values()].map((o) => ({ nume: o.nume, kg: r2(o.kg), pv: o.pv, zile: o.zile.size, kgPeZi: o.zile.size ? r2(o.kg / o.zile.size) : 0 })).sort((a, b) => b.kg - a.kg),
    totIntrat, totTratat,
  };
}
