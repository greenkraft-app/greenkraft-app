import { useState, useEffect } from "react";
import { FIRMA } from "./constante";

const CAMPURI = [
  ["den", "Nume companie"], ["cui", "CUI"], ["email", "Email"], ["telefon", "Telefon"], ["nr_autorizatie", "Nr. autorizație de mediu"],
  ["nr_reg_com", "Nr. Registrul Comerțului"], ["adresa", "Adresă sediu social"], ["punct_lucru", "Punct de lucru"], ["gestionar", "Gestionar (pe NIR) / responsabil tratare (pe PV)"],
];

// Aplica datele companiei pe documentele tiparite (NIR, PV, registre): ele citesc obiectul FIRMA.
export const aplicaFirma = (r) => {
  if (!r) return;
  Object.assign(FIRMA, { den: r.den || FIRMA.den, cui: r.cui || FIRMA.cui, adresa: r.adresa || FIRMA.adresa, punctLucru: r.punct_lucru || FIRMA.punctLucru, gestionar: r.gestionar || FIRMA.gestionar });
};

// "Compania Mea": datele firmei, editabile; apar pe NIR, procesele-verbale si registrele tiparite.
export default function CompanieMea({ sb, G, logAction }) {
  const [rand, setRand] = useState(null);
  const [form, setForm] = useState(null);
  const [lipsa, setLipsa] = useState(false);
  const [mesaj, setMesaj] = useState("");

  const incarca = async () => {
    const { data, error } = await sb.from("deee_companie").select("*").eq("id", 1);
    if (error) { setLipsa(true); return; }
    const r = data?.[0] || { id: 1 };
    setRand(r); setForm(null); aplicaFirma(r);
  };
  useEffect(() => { incarca(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const salveaza = async () => {
    if (!form.den.trim()) { setMesaj("Completează numele companiei."); return; }
    const upd = Object.fromEntries(CAMPURI.map(([k]) => [k, String(form[k] ?? "").trim()]));
    const { error } = await sb.from("deee_companie").upsert({ id: 1, ...upd, updated_at: new Date().toISOString() });
    if (error) { setMesaj("Eroare: " + error.message); return; }
    const schimbat = CAMPURI.map(([k]) => k).filter((k) => String(rand?.[k] ?? "") !== upd[k]);
    if (schimbat.length) logAction("update", "deee_companie", "1", { ...Object.fromEntries(schimbat.map((k) => [k, upd[k]])), _inainte: Object.fromEntries(schimbat.map((k) => [k, rand?.[k] ?? ""])) });
    setMesaj(""); await incarca();
  };

  const inputSt = { padding: "7px 9px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 13, boxSizing: "border-box", width: "100%" };
  if (lipsa) return <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: 18, maxWidth: 680, color: "#78350f", fontSize: 13 }}><b>Mai trebuie un pas:</b> rulează o singură dată <b>supabase-deee-13-compania.sql</b> în Supabase (SQL Editor), apoi reîncarcă pagina.</div>;
  if (!rand) return <div style={{ color: "#94a3b8", fontSize: 13 }}>Se încarcă…</div>;

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>Compania mea</div>
        {!form && <button onClick={() => { setMesaj(""); setForm({ ...Object.fromEntries(CAMPURI.map(([k]) => [k, rand[k] ?? ""])) }); }} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✏️ Editează</button>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {CAMPURI.map(([k, et]) => (
          <div key={k} style={{ flex: k === "adresa" || k === "punct_lucru" || k === "gestionar" ? "1 1 100%" : "1 1 280px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 2 }}>{et}</div>
            {form ? <input style={inputSt} value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} /> : <div style={{ fontSize: 13, color: rand[k] ? "#1e293b" : "#94a3b8" }}>{rand[k] || "—"}</div>}
          </div>
        ))}
      </div>
      {form && (
        <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={salveaza} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Salvează</button>
          <button onClick={() => { setForm(null); setMesaj(""); }} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
          {mesaj && <span style={{ color: "#c62828", fontSize: 12 }}>{mesaj}</span>}
        </div>
      )}
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 14 }}>Aceste date apar pe NIR, procesele-verbale și registrele tipărite.</div>
    </div>
  );
}
