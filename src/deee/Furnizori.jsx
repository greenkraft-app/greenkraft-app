import { useState, useMemo } from "react";
import { useTabela, colatie } from "./hooks";
import { JUDETE, TIPURI_FURNIZOR, numeJudet } from "./constante";

const GOL = { cui: "", den: "", tip: "", nr_reg_com: "", nr_aut_mediu: "", persoana_contact: "", telefon: "", email: "", judet: "", localitate: "", nr_auto: "", adresa: "" };
const CULORI_TIP = { COLECTOR: "#6a1b9a", PF: "#1565c0", PJ: "#047857", CLIENT: "#e65100", PARTENER: "#455a64" };
// campurile obligatorii in WiseWeee (necesare si la trimiterea in SIATD)
const lipsuri = (f) => ["cui", "den", "tip", "judet", "localitate"].filter((k) => !String(f[k] || "").trim());

export default function Furnizori({ sb, G, ui, logAction, confirmDel, pfList = [], pjList = [] }) {
  const { rows, setRows, incarcat, reload } = useTabela(sb, "deee_furnizori");
  const [filtru, setFiltru] = useState("");
  const [tip, setTip] = useState("");
  const [edit, setEdit] = useState(null); // { id|null, ...campuri }
  const [eroare, setEroare] = useState("");
  const [seSalveaza, setSeSalveaza] = useState(false);
  const [import_, setImport] = useState(null); // { de_importat, fara_cui } | { mesaj }

  const q = filtru.trim().toLowerCase();
  const afisate = useMemo(() => rows
    .filter((r) => (!tip || r.tip === tip) && (!q || [r.den, r.cui, r.localitate, r.judet, r.telefon].some((x) => String(x || "").toLowerCase().includes(q))))
    .sort((a, b) => colatie(a.den, b.den)), [rows, tip, q]);

  const incomplete = rows.filter((r) => lipsuri(r).length).length;

  const salveaza = async () => {
    const f = { ...edit };
    Object.keys(GOL).forEach((k) => { f[k] = String(f[k] ?? "").trim(); });
    const l = lipsuri(f);
    if (l.length) { setEroare("Completează: " + l.map((k) => ({ cui: "CUI", den: "Nume", tip: "Tip", judet: "Județ", localitate: "Localitate" }[k])).join(", ") + "."); return; }
    setSeSalveaza(true); setEroare("");
    try {
      const payload = Object.fromEntries(Object.keys(GOL).map((k) => [k, f[k]]));
      if (edit.id) {
        const vechi = rows.find((r) => r.id === edit.id);
        const { error } = await sb.from("deee_furnizori").update(payload).eq("id", edit.id);
        if (error) { setEroare(error.code === "23505" ? "Există deja un furnizor cu acest CUI." : "Eroare: " + error.message); return; }
        const schimbat = Object.keys(payload).filter((k) => String(vechi?.[k] ?? "") !== payload[k]);
        if (schimbat.length) logAction("update", "deee_furnizori", edit.id, { ...Object.fromEntries(schimbat.map((k) => [k, payload[k]])), _inainte: Object.fromEntries(schimbat.map((k) => [k, vechi?.[k] ?? ""])) });
        setRows((p) => p.map((r) => (r.id === edit.id ? { ...r, ...payload } : r)));
      } else {
        const { data, error } = await sb.from("deee_furnizori").insert(payload).select();
        if (error) { setEroare(error.code === "23505" ? "Există deja un furnizor cu acest CUI." : "Eroare: " + error.message); return; }
        setRows((p) => [...p, data[0]]);
        logAction("add", "deee_furnizori", data[0].id, { den: payload.den, cui: payload.cui, tip: payload.tip });
      }
      setEdit(null);
    } finally { setSeSalveaza(false); }
  };

  const sterge = async (r) => {
    if (!confirmDel(`furnizorul „${r.den}”`)) return;
    const { error } = await sb.from("deee_furnizori").delete().eq("id", r.id);
    if (error) { alert("Eroare: " + error.message); return; }
    setRows((p) => p.filter((x) => x.id !== r.id));
    logAction("delete", "deee_furnizori", r.id, { den: r.den, cui: r.cui, _sters: r });
  };

  // Furnizorii PF/PJ deja introdusi in Greenkraft (tab Variabile) pot fi copiati aici, fara sa-i scrii a doua oara.
  const pregatesteImport = () => {
    const existente = new Set(rows.map((r) => String(r.cui).trim().toUpperCase()));
    const surse = [...pjList.map((x) => ({ ...x, _tip: "PJ" })), ...pfList.map((x) => ({ ...x, _tip: "PF" }))];
    const vazute = new Set();
    const de_importat = []; let fara_cui = 0;
    surse.forEach((x) => {
      const cui = String(x.cod_fiscal || "").replace(/^RO/i, "").trim();
      const den = String(x.denumire || "").trim();
      if (!den) return;
      if (!cui) { fara_cui++; return; }
      const cheie = cui.toUpperCase();
      if (existente.has(cheie) || vazute.has(cheie)) return;
      vazute.add(cheie);
      de_importat.push({
        cui, den, tip: x._tip, nr_reg_com: x.reg_com || "", telefon: x.tel || "", judet: numeJudet(x.judet), adresa: x.adresa || "",
      });
    });
    setImport({ de_importat, fara_cui });
  };

  const importa = async () => {
    const lista = import_.de_importat;
    if (!lista.length) { setImport(null); return; }
    let facute = 0;
    for (let i = 0; i < lista.length; i += 100) {
      const lot = lista.slice(i, i + 100);
      const { data, error } = await sb.from("deee_furnizori").insert(lot).select();
      if (error) { alert(`Import oprit după ${facute} furnizori: ${error.message}`); break; }
      facute += data.length;
    }
    if (facute) logAction("import", "deee_furnizori", "", { din: "Greenkraft (PF/PJ)", count: facute });
    setImport(null);
    await reload();
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const camp = (cheie, eticheta, extra = {}) => (
    <div style={{ flex: extra.flex || "1 1 200px" }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{eticheta}{extra.req ? " *" : ""}</label>
      <input style={inputSt} value={edit[cheie]} placeholder={extra.ph || ""} onChange={(e) => setEdit((p) => ({ ...p, [cheie]: e.target.value }))} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input style={{ ...inputSt, width: 260 }} placeholder="🔍 Caută nume, CUI, localitate..." value={filtru} onChange={(e) => setFiltru(e.target.value)} />
        <select style={{ ...inputSt, width: 150 }} value={tip} onChange={(e) => setTip(e.target.value)}>
          <option value="">Toate tipurile</option>
          {TIPURI_FURNIZOR.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "#64748b" }}>{afisate.length} din {rows.length}{incomplete ? ` • ⚠️ ${incomplete} incompleți` : ""}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={pregatesteImport} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇️ Importă din Greenkraft</button>
          <button onClick={() => { setEroare(""); setEdit({ id: null, ...GOL }); }} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Furnizor nou</button>
        </div>
      </div>

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 760 }}>
          <thead>
            <tr>
              <th style={ui.th({ textAlign: "left" })}>Nume</th>
              <th style={ui.th({ width: 130 })}>CUI / CNP</th>
              <th style={ui.th({ width: 90 })}>Tip</th>
              <th style={ui.th({ width: 160 })}>Localitate</th>
              <th style={ui.th({ width: 110 })}>Județ</th>
              <th style={ui.th({ width: 110 })}>Telefon</th>
              <th style={ui.th({ width: 70 })}></th>
            </tr>
          </thead>
          <tbody>
            {!incarcat && <tr><td colSpan={7} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {incarcat && afisate.length === 0 && <tr><td colSpan={7} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Niciun furnizor. Apasă „+ Furnizor nou” sau „Importă din Greenkraft”.</td></tr>}
            {afisate.map((r) => {
              const l = lipsuri(r);
              return (
                <tr key={r.id} style={{ background: l.length ? "#fffbeb" : undefined }}>
                  <td style={ui.td({ fontWeight: 600 })}>{r.den}{l.length ? <span title={"Lipsesc: " + l.join(", ")} style={{ marginLeft: 6 }}>⚠️</span> : null}</td>
                  <td style={ui.td({ textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.cui}</td>
                  <td style={ui.td({ textAlign: "center" })}><span style={{ background: CULORI_TIP[r.tip] || "#64748b", color: "#fff", borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{r.tip}</span></td>
                  <td style={ui.td()}>{r.localitate || "—"}</td>
                  <td style={ui.td()}>{r.judet || "—"}</td>
                  <td style={ui.td({ fontSize: 11 })}>{r.telefon || "—"}</td>
                  <td style={ui.td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}>
                    <button onClick={() => { setEroare(""); setEdit({ id: r.id, ...Object.fromEntries(Object.keys(GOL).map((k) => [k, r[k] ?? ""])) }); }} title="Editează" style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>✏️</button>{" "}
                    <button onClick={() => sterge(r)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {edit && (
        <div onClick={() => !seSalveaza && setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(720px,100%)", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{edit.id ? "Editare furnizor" : "Furnizor nou"}</div>
              <button onClick={() => !seSalveaza && setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
              {camp("cui", "CUI / CNP", { req: true })}
              {camp("den", "Nume", { req: true, flex: "2 1 300px" })}
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Tip *</label>
                <select style={inputSt} value={edit.tip} onChange={(e) => setEdit((p) => ({ ...p, tip: e.target.value }))}>
                  <option value="">Alege tipul…</option>
                  {TIPURI_FURNIZOR.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {camp("nr_reg_com", "Nr. Registru Comerț")}
              {camp("nr_aut_mediu", "Nr. Autorizație Mediu")}
              {camp("persoana_contact", "Persoană contact")}
              {camp("telefon", "Telefon")}
              {camp("email", "Email")}
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Județ *</label>
                <select style={inputSt} value={edit.judet} onChange={(e) => setEdit((p) => ({ ...p, judet: e.target.value }))}>
                  <option value="">Alege județul…</option>
                  {JUDETE.map(([, n]) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {camp("localitate", "Localitate", { req: true })}
              {camp("nr_auto", "Nr. Auto (mai multe, separate cu virgulă)", { flex: "2 1 300px", ph: "IF55KFT, B123ABC" })}
              {camp("adresa", "Adresă", { flex: "1 1 100%" })}
              {eroare && <div style={{ flex: "1 1 100%", color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button disabled={seSalveaza} onClick={() => setEdit(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button disabled={seSalveaza} onClick={salveaza} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: seSalveaza ? "#9ca3af" : G, color: "#fff", cursor: seSalveaza ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>{seSalveaza ? "Se salvează…" : "Salvează"}</button>
            </div>
          </div>
        </div>
      )}

      {import_ && (
        <div onClick={() => setImport(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(520px,100%)", padding: 22, boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Import din Greenkraft</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              {import_.de_importat.length
                ? <>Se vor copia <b>{import_.de_importat.length}</b> furnizori (persoane fizice și juridice din Variabile) care nu sunt încă aici. Cei deja existenți (același CUI) nu se dublează.</>
                : <>Nu există furnizori noi de importat — toți cei din Greenkraft sunt deja aici.</>}
              {import_.fara_cui > 0 && <div style={{ marginTop: 8, color: "#92400e" }}>⚠️ {import_.fara_cui} furnizori din Greenkraft nu au CUI/CNP completat și au fost omiși.</div>}
              {import_.de_importat.length > 0 && <div style={{ marginTop: 8, color: "#64748b", fontSize: 12 }}>Județul se completează doar când se potrivește clar; localitatea și tipul „COLECTOR/CLIENT” le completezi apoi — furnizorii incompleți sunt marcați cu ⚠️.</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button onClick={() => setImport(null)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>{import_.de_importat.length ? "Anulează" : "Închide"}</button>
              {import_.de_importat.length > 0 && <button onClick={importa} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Importă {import_.de_importat.length}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
