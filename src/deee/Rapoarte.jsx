import { useState, useMemo } from "react";
import { useTabela, colatie } from "./hooks";
import { useStoc } from "./stoc";
import { useCoduriOrg } from "./coduriOrg";
import { RAPOARTE, construiesteRaport, descarcaCsv } from "./exporturi";

const azi = () => new Date().toISOString().slice(0, 10);

// Rapoarte & Exporturi: cele cinci exporturi din WiseWeee, pe perioada si organizatia aleasa.
export default function Rapoarte({ sb, G, logAction }) {
  const s = useStoc(sb);
  const fractii = useTabela(sb, "deee_fractii");
  const org = useTabela(sb, "deee_organizatii");
  const { codPentru } = useCoduriOrg(sb);
  const [de, setDe] = useState("");
  const [pana, setPana] = useState("");
  const [fOrg, setFOrg] = useState("");
  const organizatii = useMemo(() => org.rows.filter((o) => o.activ).map((o) => o.den).sort(colatie), [org.rows]);

  const descarca = (r) => {
    const randuri = construiesteRaport(r.k, {
      ach: s.ach.rows, achL: s.achL.rows, dz: s.dz.rows, dzE: s.dzE.rows, dzF: s.dzF.rows, van: s.van.rows, fractii: fractii.rows, codPentru, de, pana, org: fOrg,
    });
    descarcaCsv(`${r.k}-${azi()}.csv`, randuri);
    logAction("Export", "Raport DEEE", r.k, { perioada: `${de || "început"} – ${pana || "azi"}`, organizatie: fOrg || "toate", randuri: randuri.length });
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box" };
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Alege perioada și, dacă vrei, o organizație; apoi descarcă raportul (fișier CSV, se deschide în Excel). Fără perioadă = tot istoricul.</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 4, alignItems: "center" }}>De la <input type="date" style={{ ...inputSt, width: 140 }} value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 4, alignItems: "center" }}>Până la <input type="date" style={{ ...inputSt, width: 140 }} value={pana} onChange={(e) => setPana(e.target.value)} /></label>
        <select style={{ ...inputSt, width: 170 }} value={fOrg} onChange={(e) => setFOrg(e.target.value)}><option value="">Toate organizațiile</option>{organizatii.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        {(de || pana || fOrg) && <button onClick={() => { setDe(""); setPana(""); setFOrg(""); }} style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 11 }}>↺ Resetează</button>}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {RAPOARTE.map((r) => (
          <div key={r.k} style={{ flex: "1 1 300px", maxWidth: 420, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, boxShadow: "0 1px 3px rgba(15,23,42,.05)" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{r.titlu}</div>
            <div style={{ fontSize: 12, color: "#64748b", margin: "4px 0 12px", minHeight: 34 }}>{r.descriere}</div>
            <button disabled={!s.incarcat} onClick={() => descarca(r)} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇️ Descarcă CSV</button>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 14 }}>Integrarea cu SIATD (trimiterea avizelor și a tratărilor) nu e inclusă: în WiseWeee se face prin extensii de browser care lucrează direct în contul SIATD.</div>
    </div>
  );
}
