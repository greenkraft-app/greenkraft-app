import { useMemo } from "react";
import { useTabela } from "./hooks";

// Cum se afiseaza un cod al unei organizatii in liste si exporturi (la fel ca in WiseWeee):
//   ECOTIC "{cod} - {denumire}", ECOPOSITIVE "{categorie} {denumire}", restul "{cod} - {denumire}".
export function etichetaCod(org, c) {
  if (!c) return "";
  if (org === "ECOPOSITIVE") return `${c.categorie} ${c.denumire}`.trim();
  return `${c.cod} - ${c.denumire}`;
}

// Codul implicit al unui echipament la o organizatie (alegerea se face in Nomenclatoare -> Echipamente).
// Daca nu s-a ales niciunul implicit, se ia primul cod legat. NEALOCATE si organizatiile fara cod -> null.
export function useCoduriOrg(sb) {
  const ech = useTabela(sb, "deee_echipamente");
  const coduri = useTabela(sb, "deee_coduri_org");
  const leg = useTabela(sb, "deee_echipament_cod");
  const { medii, coduriPe } = useMemo(() => {
    const cod = Object.fromEntries(coduri.rows.map((c) => [c.id, c]));
    const idDupaDen = Object.fromEntries(ech.rows.map((e) => [e.den, e.id]));
    const pe = {}; // `${echipament_id}|${organizatie}` -> cod
    leg.rows.forEach((l) => {
      const c = cod[l.cod_id]; if (!c) return;
      const k = `${l.echipament_id}|${c.organizatie}`;
      if (!pe[k] || (l.implicit && !pe[k].implicit)) pe[k] = { ...c, implicit: l.implicit };
    });
    return {
      medii: Object.fromEntries(ech.rows.filter((e) => Number(e.greutate_medie) > 0).map((e) => [e.den, Number(e.greutate_medie)])),
      coduriPe: (den, org) => pe[`${idDupaDen[den]}|${org}`] || null,
    };
  }, [ech.rows, coduri.rows, leg.rows]);
  return { medii, codPentru: coduriPe, incarcat: ech.incarcat && coduri.incarcat && leg.incarcat };
}
