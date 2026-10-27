import { useState } from "react";
import { ADMIN, SECTIUNI, NIVELE, ROLURI } from "./permisiuni";

// Permisiunile utilizatorilor pe sectiunile DEEE (doar Administratorul): rol de pornire (Administrator / Manager / Angajat / Responsabil tratare ...)
// si apoi nivel pe fiecare sectiune: complet, doar vizualizare sau fara acces.
export default function PermisiuniDeee({ sb, G, ui, currentUser, logAction, useri, perm }) {
  const [draft, setDraft] = useState({}); // user -> { rol, sectiuni }
  const [mesaj, setMesaj] = useState("");
  const conturi = (useri && useri.length ? useri : []).filter((u) => u !== ADMIN);

  const randDe = (u) => perm.rows.find((r) => r.user_name === u);
  const stare = (u) => draft[u] || { rol: randDe(u)?.rol || "", sectiuni: { ...Object.fromEntries(SECTIUNI.map((s) => [s.k, randDe(u)?.sectiuni?.[s.k] || "complet"])) } };
  const murdar = (u) => !!draft[u];
  const seteaza = (u, patch) => setDraft((p) => ({ ...p, [u]: { ...stare(u), ...patch } }));
  const aplicaRol = (u, rol) => { if (!rol) return; seteaza(u, { rol, sectiuni: { ...ROLURI[rol] } }); };
  const nivel = (u, k, v) => seteaza(u, { rol: stare(u).rol, sectiuni: { ...stare(u).sectiuni, [k]: v } });

  const salveaza = async (u) => {
    const st = stare(u);
    const { error } = await sb.from("deee_permisiuni").upsert({ user_name: u, rol: st.rol, sectiuni: st.sectiuni, modificat_de: currentUser, updated_at: new Date().toISOString() });
    if (error) { setMesaj("Eroare: " + error.message); return; }
    const inainte = randDe(u);
    setMesaj("");
    perm.setRows((p) => [...p.filter((r) => r.user_name !== u), { user_name: u, rol: st.rol, sectiuni: st.sectiuni, modificat_de: currentUser }]);
    setDraft((p) => { const n = { ...p }; delete n[u]; return n; });
    logAction("update", "deee_permisiuni", u, { utilizator: u, rol: st.rol || "personalizat", sectiuni: SECTIUNI.map((s) => `${s.l}: ${st.sectiuni[s.k]}`).join(", "), _inainte: { rol: inainte?.rol || "", sectiuni: inainte?.sectiuni || "toate complet" } });
  };

  const culoare = { complet: ["#047857", "#ecfdf5"], citire: ["#1e40af", "#eff6ff"], fara: ["#991b1b", "#fef2f2"] };
  const inputSt = { padding: "5px 6px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 11.5, boxSizing: "border-box", width: "100%" };

  if (perm.eroare) {
    return <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: 18, maxWidth: 680, color: "#78350f", fontSize: 13, lineHeight: 1.6 }}><b>Mai trebuie un pas:</b> rulează o singură dată <b>supabase-deee-15-permisiuni.sql</b> în Supabase (SQL Editor), apoi reîncarcă pagina.</div>;
  }
  return (
    <div>
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 10, lineHeight: 1.6 }}>
        Pentru fiecare utilizator alegi ce vede și ce poate modifica în fiecare secțiune DEEE. <b>Administrator ({ADMIN})</b> are mereu acces la tot. Fără nicio setare, un utilizator are acces complet.
        Schimbările se aplică la următoarea deschidere a secțiunii DEEE de către acel utilizator.
        <div style={{ color: "#92400e", marginTop: 4 }}>⚠️ Permisiunile restrâng ce vede și ce poate face un utilizator în aplicație; nu sunt o protecție împotriva cuiva care ar accesa direct baza de date.</div>
      </div>
      {mesaj && <div style={{ color: "#c62828", fontSize: 12, marginBottom: 8 }}>{mesaj}</div>}
      {conturi.length === 0 && <div style={{ color: "#94a3b8", fontSize: 13 }}>Nu există alți utilizatori.</div>}
      {conturi.map((u) => {
        const st = stare(u);
        return (
          <div key={u} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{u}</div>
              <select value="" onChange={(e) => aplicaRol(u, e.target.value)} style={{ ...inputSt, width: 190 }}>
                <option value="">Aplică rol de pornire…</option>{Object.keys(ROLURI).map((r) => <option key={r}>{r}</option>)}
              </select>
              {st.rol && <span style={{ fontSize: 11, color: "#64748b" }}>rol: <b>{st.rol}</b> (ajustat manual dacă ai schimbat ceva)</span>}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {murdar(u) && <button onClick={() => setDraft((p) => { const n = { ...p }; delete n[u]; return n; })} style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 12 }}>Anulează</button>}
                <button disabled={!murdar(u)} onClick={() => salveaza(u)} style={{ background: murdar(u) ? G : "#9ca3af", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", cursor: murdar(u) ? "pointer" : "default", fontSize: 12, fontWeight: 700 }}>Salvează</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 8 }}>
              {SECTIUNI.map((s) => {
                const v = st.sectiuni[s.k]; const [c, bg] = culoare[v];
                return (
                  <div key={s.k} style={{ background: bg, border: `1px solid ${c}33`, borderRadius: 8, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 3 }}>{s.l}</div>
                    <select value={v} onChange={(e) => nivel(u, s.k, e.target.value)} style={{ ...inputSt, color: c, fontWeight: 700 }}>
                      {NIVELE.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
