import { useState, useEffect } from "react";
import { lipsaTabel } from "./hooks";
import Nomenclatoare from "./Nomenclatoare";
import Retete from "./Retete";

// Sectiunea ♻️ DEEE — evidenta echipamentelor electrice si electronice (achizitii, dezmembrare, stocuri, vanzari de fractii).
// Modulele marcate "in lucru" apar in meniu ca sa se vada planul complet; se activeaza pe masura ce sunt gata.
const MODULE = [
  { k: "achizitii", l: "🚛 Achiziții", gata: false, ce: "Documente de colectare: furnizor, aviz, organizație, cod EWC, transport, echipamente cu bucăți și kg (legate de tichetele de cântar)." },
  { k: "dezmembrare", l: "🔧 Dezmembrare", gata: false, ce: "Operațiuni de dezmembrare: alegi echipamentele din stoc, aplici rețeta, iese lista de fracții; verificare total intrat = total ieșit." },
  { k: "stocuri", l: "📦 Stocuri", gata: false, ce: "Stoc de echipamente și stoc de fracții, calculate automat din achiziții, dezmembrări și vânzări." },
  { k: "vanzari", l: "📤 Vânzări fracții", gata: false, ce: "Vânzări din stocul de fracții către clienți (aviz, kg, organizație) și procentele de reciclare/valorificare/eliminare." },
  { k: "furnizori", l: "🏢 Furnizori", gata: false, ce: "Furnizori și clienți DEEE, cu autorizație de mediu, contact și județ/localitate." },
  { k: "transportatori", l: "🚚 Transportatori", gata: false, ce: "Transportatori cu mașinile lor (licență, expirare) și șoferii fiecărei mașini." },
  { k: "retete", l: "🧪 Rețete", gata: true },
  { k: "nomenclatoare", l: "🗂️ Nomenclatoare", gata: true },
];

export default function Deee(props) {
  const { sb, G } = props;
  const [sub, setSub] = useState("retete");
  const [stare, setStare] = useState("verific"); // verific | ok | lipsa | eroare

  useEffect(() => {
    let activ = true;
    sb.from("deee_organizatii").select("id").limit(1).then(({ error }) => {
      if (!activ) return;
      setStare(!error ? "ok" : lipsaTabel(error) ? "lipsa" : "eroare");
    });
    return () => { activ = false; };
  }, [sb]);

  const modul = MODULE.find((m) => m.k === sub);
  const subSt = (k) => ({ padding: "7px 14px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderRadius: 8, marginRight: 4, whiteSpace: "nowrap", background: sub === k ? "#ecfdf5" : "transparent", color: sub === k ? G : "#475569", boxShadow: sub === k ? `inset 0 0 0 1.5px ${G}55` : "none" });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>♻️ DEEE</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>Gestionare echipamente electrice și electronice — în construcție</div>
      </div>

      <div style={{ display: "flex", overflowX: "auto", paddingBottom: 6, marginBottom: 14, borderBottom: "1px solid #eef2f6" }}>
        {MODULE.map((m) => (
          <button key={m.k} style={subSt(m.k)} onClick={() => setSub(m.k)}>
            {m.l}{!m.gata && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "1px 6px" }}>în lucru</span>}
          </button>
        ))}
      </div>

      {stare === "lipsa" && modul.gata && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: 18, maxWidth: 680 }}>
          <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 6 }}>Mai trebuie un pas: crearea tabelelor în Supabase</div>
          <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
            Rulează o singură dată fișierul <b>supabase-deee-1-nomenclatoare-retete.sql</b> din proiect: Supabase → <b>SQL Editor</b> → New query → lipești conținutul → <b>Run</b>. Apoi reîncarcă această pagină.
          </div>
        </div>
      )}
      {stare === "eroare" && modul.gata && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: 16, color: "#991b1b", fontSize: 13 }}>Nu am putut citi datele DEEE din Supabase. Verifică conexiunea și reîncarcă pagina.</div>
      )}

      {(stare === "ok" || stare === "verific") && modul.k === "retete" && <Retete {...props} />}
      {(stare === "ok" || stare === "verific") && modul.k === "nomenclatoare" && <Nomenclatoare {...props} />}

      {!modul.gata && (
        <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 22, maxWidth: 680 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{modul.l} — urmează</div>
          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{modul.ce}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 10 }}>Planul complet: wiseweee-analiza.md</div>
        </div>
      )}
    </div>
  );
}
