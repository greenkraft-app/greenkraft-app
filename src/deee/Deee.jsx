import { useState, useEffect, useMemo } from "react";
import { lipsaTabel, useTabela } from "./hooks";
import { ADMIN, nivelDe, bazaDoarCitire } from "./permisiuni";
import ZonaCitire from "./ZonaCitire";
import PermisiuniDeee from "./PermisiuniDeee";
import Nomenclatoare from "./Nomenclatoare";
import Retete from "./Retete";
import Furnizori from "./Furnizori";
import Transportatori from "./Transportatori";
import Achizitii from "./Achizitii";
import Dezmembrare from "./Dezmembrare";
import DezmFractii from "./DezmFractii";
import Stocuri from "./Stocuri";
import Vanzari from "./Vanzari";
import RateRR from "./RateRR";
import Rapoarte from "./Rapoarte";
import Registre from "./Registre";
import DocumentePoze from "./DocumentePoze";
import CompanieMea, { aplicaFirma } from "./CompanieMea";

// Sectiunea ♻️ DEEE — evidenta echipamentelor electrice si electronice (achizitii, dezmembrare, stocuri, vanzari de fractii).
// Modulele marcate "in lucru" apar in meniu ca sa se vada planul complet; se activeaza pe masura ce sunt gata.
const MODULE = [
  { k: "achizitii", l: "🚛 Achiziții", gata: true, tabel: "deee_achizitii", sql: "supabase-deee-3-achizitii.sql" },
  { k: "documente", l: "📎 Documente / Poze", gata: true, tabel: "deee_fisiere", sql: "supabase-deee-14-fisiere.sql" },
  { k: "dezmembrare", l: "🔧 Dezmembrare", gata: true, tabel: "deee_dezmembrari", sql: "supabase-deee-4-dezmembrare-stocuri.sql" },
  { k: "dezmfr", l: "🔩 Dezm. fracții", gata: true, tabel: "deee_dezm_fr", sql: "supabase-deee-12-dezmembrare-fractii.sql" },
  { k: "stocuri", l: "📦 Stocuri", gata: true, tabel: "deee_stoc_initial", sql: "supabase-deee-4-dezmembrare-stocuri.sql" },
  { k: "vanzari", l: "📤 Vânzări fracții", gata: true, tabel: "deee_vanzari", sql: "supabase-deee-5-vanzari-fractii.sql" },
  { k: "rate", l: "📈 Rate R&R", gata: true, tabel: "deee_categorii", sql: "supabase-deee-6-nomenclator-complet.sql" },
  { k: "rapoarte", l: "📑 Rapoarte", gata: true, tabel: "deee_dezmembrari", sql: "supabase-deee-4-dezmembrare-stocuri.sql" },
  { k: "registre", l: "📒 Registre", gata: true, tabel: "deee_registre", sql: "supabase-deee-11-registre.sql" },
  { k: "furnizori", l: "🏢 Furnizori", gata: true, tabel: "deee_furnizori", sql: "supabase-deee-2-furnizori-transportatori.sql" },
  { k: "transportatori", l: "🚚 Transportatori", gata: true, tabel: "deee_transportatori", sql: "supabase-deee-2-furnizori-transportatori.sql" },
  { k: "retete", l: "🧪 Rețete", gata: true, tabel: "deee_retete", sql: "supabase-deee-1-nomenclatoare-retete.sql" },
  { k: "companie", l: "🏭 Compania mea", gata: true },
  { k: "nomenclatoare", l: "🗂️ Nomenclatoare", gata: true, tabel: "deee_organizatii", sql: "supabase-deee-1-nomenclatoare-retete.sql" },
  { k: "permisiuni", l: "🔑 Permisiuni", gata: true, adminOnly: true },
];

export default function Deee(props) {
  const { sb, G, currentUser } = props;
  const [sub, setSub] = useState("retete");
  const [stare, setStare] = useState("verific"); // verific | ok | lipsa | eroare

  // permisiuni pe sectiuni (fara randuri salvate sau fara tabel => acces complet, ca pana acum); sectiunea Permisiuni doar pentru administrator
  const perm = useTabela(sb, "deee_permisiuni", "updated_at"); // tabelul nu are created_at
  const esteAdmin = currentUser === ADMIN;
  const vizibile = MODULE.filter((m) => (m.adminOnly ? esteAdmin : nivelDe(perm.rows, currentUser, m.k) !== "fara"));
  const modul = vizibile.find((m) => m.k === sub) || vizibile[0] || MODULE[0];
  const citire = !modul.adminOnly && nivelDe(perm.rows, currentUser, modul.k) === "citire";
  const sbModul = useMemo(() => (citire ? bazaDoarCitire(sb) : sb), [sb, citire]);
  const p = { ...props, sb: sbModul };

  // datele companiei (din "Compania mea") se aplica pe documentele tiparite de la prima deschidere a sectiunii DEEE
  useEffect(() => { sb.from("deee_companie").select("*").eq("id", 1).then(({ data }) => aplicaFirma(data?.[0])); }, [sb]);

  // verificam daca tabelele modulului deschis exista (adica daca s-a rulat fisierul .sql al etapei respective)
  useEffect(() => {
    if (!modul.tabel) { setStare("ok"); return; }
    let activ = true;
    setStare("verific");
    sb.from(modul.tabel).select("id").limit(1).then(({ error }) => {
      if (!activ) return;
      setStare(!error ? "ok" : lipsaTabel(error) ? "lipsa" : "eroare");
    });
    return () => { activ = false; };
  }, [sb, modul.tabel]);
  const subSt = (k) => ({ padding: "7px 14px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderRadius: 8, marginRight: 4, whiteSpace: "nowrap", background: modul.k === k ? "#ecfdf5" : "transparent", color: modul.k === k ? G : "#475569", boxShadow: modul.k === k ? `inset 0 0 0 1.5px ${G}55` : "none" });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>♻️ DEEE</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>Gestionare echipamente electrice și electronice</div>
      </div>

      <div style={{ display: "flex", overflowX: "auto", paddingBottom: 6, marginBottom: 14, borderBottom: "1px solid #eef2f6" }}>
        {vizibile.map((m) => (
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

      {vizibile.length > 0 && <ZonaCitire activ={citire} key={modul.k}>
        {(stare === "ok" || stare === "verific") && modul.k === "retete" && <Retete {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "nomenclatoare" && <Nomenclatoare {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "achizitii" && <Achizitii {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "documente" && <DocumentePoze {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "dezmembrare" && <Dezmembrare {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "dezmfr" && <DezmFractii {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "stocuri" && <Stocuri {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "vanzari" && <Vanzari {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "rate" && <RateRR {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "rapoarte" && <Rapoarte {...p} />}
        {modul.k === "companie" && <CompanieMea {...p} />}
        {modul.k === "permisiuni" && esteAdmin && <PermisiuniDeee {...props} perm={perm} useri={props.useri} />}
        {(stare === "ok" || stare === "verific") && modul.k === "registre" && <Registre {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "furnizori" && <Furnizori {...p} />}
        {(stare === "ok" || stare === "verific") && modul.k === "transportatori" && <Transportatori {...p} />}
      </ZonaCitire>}

      {vizibile.length === 0 && <div style={{ color: "#94a3b8", fontSize: 13 }}>Nu ai acces la nicio secțiune DEEE. Cere-i administratorului să-ți dea acces.</div>}

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
