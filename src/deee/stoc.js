import { useMemo } from "react";
import { useTabela } from "./hooks";

const r3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;
export const cheieStoc = (den, cod, org) => [den, cod, org].map((x) => String(x ?? "").trim()).join("\u0001");

// Stocul se CALCULEAZA, nu se introduce:
//   echipamente: + achizitii (pe echipament / cod HG856 / organizatie) + stoc initial  − dezmembrari
//   fractii:     + fractiile rezultate din dezmembrari + stoc initial                   − vanzari (etapa urmatoare)
export function calculeazaStoc({ ach, achL, dz, dzE, dzF, ini, vanzari = [] }) {
  const achId = Object.fromEntries(ach.map((a) => [a.id, a]));
  const dzId = Object.fromEntries(dz.map((d) => [d.id, d]));
  const E = new Map(), F = new Map();
  const ia = (M, den, cod, org) => {
    const k = cheieStoc(den, cod, org);
    let r = M.get(k);
    if (!r) { r = { den: String(den || "").trim(), cod: String(cod || "").trim(), org: String(org || "").trim(), total: 0, scos: 0, buc: 0, bucScos: 0 }; M.set(k, r); }
    return r;
  };
  achL.forEach((l) => { const a = achId[l.achizitie_id]; if (!a) return; const r = ia(E, l.echipament, a.cod_hg856, l.organizatie || a.organizatie); r.total += Number(l.kg) || 0; r.buc += l.buc || 0; });
  ini.forEach((i) => { const r = ia(i.tip === "echipament" ? E : F, i.den, i.cod, i.organizatie); r.total += Number(i.kg) || 0; r.buc += i.buc || 0; });
  dzE.forEach((l) => { const d = dzId[l.dezm_id]; if (!d) return; const r = ia(E, l.echipament, l.cod_ewc, d.organizatie); r.scos += Number(l.kg) || 0; r.bucScos += l.buc || 0; });
  dzF.forEach((l) => { const d = dzId[l.dezm_id]; if (!d) return; const r = ia(F, l.fractie, l.cod, d.organizatie); r.total += Number(l.kg) || 0; });
  vanzari.forEach((v) => { const r = ia(F, v.fractie, v.cod, v.organizatie); r.scos += Number(v.kg) || 0; });
  const fin = (M) => [...M.values()].map((r) => ({ ...r, total: r3(r.total), scos: r3(r.scos), disp: r3(r.total - r.scos), bucDisp: r.buc - r.bucScos }));
  return { echipamente: fin(E), fractii: fin(F) };
}

// Incarca tabelele din care se calculeaza stocul si il tine la zi.
export function useStoc(sb) {
  const ach = useTabela(sb, "deee_achizitii");
  const achL = useTabela(sb, "deee_achizitii_linii");
  const dz = useTabela(sb, "deee_dezmembrari");
  const dzE = useTabela(sb, "deee_dezm_echipamente");
  const dzF = useTabela(sb, "deee_dezm_fractii");
  const ini = useTabela(sb, "deee_stoc_initial");
  const van = useTabela(sb, "deee_vanzari"); // inca inexistent pana se ruleaza etapa 5 -> ramane gol, stocul merge ca pana acum
  const stoc = useMemo(
    () => calculeazaStoc({ ach: ach.rows, achL: achL.rows, dz: dz.rows, dzE: dzE.rows, dzF: dzF.rows, ini: ini.rows, vanzari: van.rows }),
    [ach.rows, achL.rows, dz.rows, dzE.rows, dzF.rows, ini.rows, van.rows],
  );
  const incarcat = [ach, achL, dz, dzE, dzF, ini, van].every((t) => t.incarcat);
  const reloadAll = () => Promise.all([ach, achL, dz, dzE, dzF, ini, van].map((t) => t.reload()));
  return { ach, achL, dz, dzE, dzF, ini, van, stoc, incarcat, reloadAll };
}
