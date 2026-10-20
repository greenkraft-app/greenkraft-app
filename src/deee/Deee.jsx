import { useState, useEffect } from "react";
import { lipsaTabel } from "./hooks";
import Nomenclatoare from "./Nomenclatoare";
import Retete from "./Retete";
import Furnizori from "./Furnizori";
import Transportatori from "./Transportatori";
import Achizitii from "./Achizitii";
import Dezmembrare from "./Dezmembrare";
import Stocuri from "./Stocuri";

// Sectiunea ♻️ DEEE — evidenta echipamentelor electrice si electronice (achizitii, dezmembrare, stocuri, vanzari de fractii).
// Modulele marcate "in lucru" apar in meniu ca sa se vada planul complet; se activeaza pe masura ce sunt gata.
const MODULE = [
  { k: "achizitii", l: "🚛 Achiziții", gata: true, tabel: "deee_achizitii", sql: "supabase-deee-3-achizitii.sql" },
  { k: "dezmembrare", l: "🔧 Dezmembrare", gata: true, tabel: "deee_dezmembrari", sql: "supabase-deee-4-dezmembrare-stocuri.sql" },
  { k: "stocuri", l: "📦 Stocuri", gata: true, tabel: "deee_stoc_initial", sql: "supabase-deee-4-dezmembrare-stocuri.sql" },
  { k: "vanzari", l: "📤 Vânzări fracții", gata: false, ce: "Vânzări din stocul de fracții către clienți (aviz, kg, organizație) și procentele de reciclare/valorificare/eliminare." },
  { k: "furnizori", l: "🏢 Furnizori", gata: true, tabel: "deee_furnizori", sql: "supabase-deee-2-furnizori-transportatori.sql" },
  { k: "transportatori", l: "🚚 Transportatori", gata: true, tabel: "deee_transportatori", sql: "supabase-deee-2-furnizori-transportatori.sql" },
  { k: "retete", l: "🧪 Rețete", gata: true, tabel: "deee_retete", sql: "supabase-deee-1-nomenclatoare-retete.sql" },
  { k: "nomenclatoare", l: "🗂️ Nomenclatoare", gata: true, tabel: "deee_organizatii", sql: "supabase-deee-1-nomenclatoare-retete.sql" },
];

export default function Deee(props) {
  const { sb, G } = props;
  const [sub, setSub] = useState("retete");
  const [stare, setStare] = useState("verific"); // verific | ok | lipsa | eroare

  const modul = MODULE.find((m) => m.k === sub);

  // verificam daca tabelele modulului deschis exista (adica daca s-a rulat fisierul .sql al etapei respective)
  useEffect(() => {
    if (!modul.tabel) return;
    let activ = true;
    setStare("verific");
    sb.from(modul.tabel).select("id").limit(1).then(({ error }) => {
      if (!activ) return;
      setStare(!error ? "ok" : lipsaTabel(error) ? "lipsa" : "eroare");
    });
    return () => { activ = false; };
  }, [sb, modul.tabel]);
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
            Rulează o singură dată fișierul <b>{modul.sql}</b> din proiect: Supabase → <b>SQL Editor</b> → New query → lipești conținutul → <b>Run</b>. Apoi reîncarcă această pagină.
          </div>
        </div>
      )}
      {stare === "eroare" && modul.gata && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: 16, color: "#991b1b", fontSize: 13 }}>Nu am putut citi datele DEEE din Supabase. Verifică conexiunea și reîncarcă pagina.</div>
      )}

      {(stare === "ok" || stare === "verific") && modul.k === "retete" && <Retete {...props} />}
      {(stare === "ok" || stare === "verific") && modul.k === "nomenclatoare" && <Nomenclatoare {...props} />}
      {(stare === "ok" || stare === "verific") && modul.k === "achizitii" && <Achizitii {...props} />}
      {(stare === "ok" || stare === "verific") && modul.k === "dezmembrare" && <Dezmembrare {...props} />}
      {(stare === "ok" || stare === "verific") && modul.k === "stocuri" && <Stocuri {...props} />}
      {(stare === "ok" || stare === "verific") && modul.k === "furnizori" && <Furnizori {...props} />}
      {(stare === "ok" || stare === "verific") && modul.k === "transportatori" && <Transportatori {...props} />}

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
