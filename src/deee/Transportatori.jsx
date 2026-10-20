import { useState, useMemo } from "react";
import { useTabela, colatie } from "./hooks";
import { zilePanaLa } from "./constante";

const fmtData = (d) => { const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : "—"; };

// Starea licentei unei masini, pentru culoare/avertisment
function stareLicenta(m) {
  if (m.fara_licenta) return { text: "fără licență (sub 3,5 t)", culoare: "#64748b" };
  const z = zilePanaLa(m.data_expirare);
  if (z === null) return { text: m.nr_licenta ? "fără dată de expirare" : "licență necompletată", culoare: "#92400e" };
  if (z < 0) return { text: `expirată de ${-z} zile`, culoare: "#c62828" };
  if (z <= 30) return { text: `expiră în ${z} zile`, culoare: "#e65100" };
  return { text: `valabilă până la ${fmtData(m.data_expirare)}`, culoare: "#047857" };
}

export default function Transportatori({ sb, G, ui, logAction, confirmDel }) {
  const transp = useTabela(sb, "deee_transportatori");
  const masini = useTabela(sb, "deee_masini");
  const soferi = useTabela(sb, "deee_soferi");
  const [filtru, setFiltru] = useState("");
  const [edit, setEdit] = useState(null); // { id|null, den, tip, cui }
  const [eroare, setEroare] = useState("");
  const [mesajMasina, setMesajMasina] = useState("");
  const [nrNou, setNrNou] = useState("");
  const [soferNou, setSoferNou] = useState({}); // masina_id -> text

  const masiniDe = useMemo(() => {
    const m = {};
    masini.rows.forEach((x) => { (m[x.transportator_id] = m[x.transportator_id] || []).push(x); });
    Object.values(m).forEach((a) => a.sort((x, y) => colatie(x.nr_auto, y.nr_auto)));
    return m;
  }, [masini.rows]);
  const soferiDe = useMemo(() => {
    const m = {};
    soferi.rows.forEach((x) => { (m[x.masina_id] = m[x.masina_id] || []).push(x); });
    return m;
  }, [soferi.rows]);

  const q = filtru.trim().toLowerCase();
  const afisate = transp.rows
    .filter((r) => !q || r.den.toLowerCase().includes(q) || String(r.cui).toLowerCase().includes(q)
      || (masiniDe[r.id] || []).some((m) => m.nr_auto.toLowerCase().includes(q)))
    .sort((a, b) => colatie(a.den, b.den));

  const eroareDb = (error, ce) => (error.code === "23505" ? `Există deja ${ce}.` : "Eroare: " + error.message);

  // ── transportator ──
  const salveazaTransportator = async () => {
    const den = edit.den.trim(), cui = edit.cui.trim();
    if (!den) { setEroare("Completează numele."); return; }
    setEroare("");
    if (edit.id) {
      const vechi = transp.rows.find((r) => r.id === edit.id);
      const { error } = await sb.from("deee_transportatori").update({ den, tip: edit.tip, cui }).eq("id", edit.id);
      if (error) { setEroare(eroareDb(error, "un transportator cu acest nume")); return; }
      const ch = {}; const inainte = {};
      [["den", den], ["tip", edit.tip], ["cui", cui]].forEach(([k, v]) => { if ((vechi?.[k] ?? "") !== v) { ch[k] = v; inainte[k] = vechi?.[k] ?? ""; } });
      if (Object.keys(ch).length) logAction("update", "deee_transportatori", edit.id, { ...ch, _inainte: inainte });
      transp.setRows((p) => p.map((r) => (r.id === edit.id ? { ...r, den, tip: edit.tip, cui } : r)));
    } else {
      const { data, error } = await sb.from("deee_transportatori").insert({ den, tip: edit.tip, cui }).select();
      if (error) { setEroare(eroareDb(error, "un transportator cu acest nume")); return; }
      transp.setRows((p) => [...p, data[0]]);
      logAction("add", "deee_transportatori", data[0].id, { den, tip: edit.tip, cui });
      setEdit({ id: data[0].id, den, tip: edit.tip, cui }); // ramane deschis, ca sa adaugi masini
    }
  };

  const stergeTransportator = async (r) => {
    const nm = (masiniDe[r.id] || []).length;
    if (!confirmDel(`transportatorul „${r.den}”${nm ? ` (și cele ${nm} mașini ale lui, cu șoferii)` : ""}`)) return;
    const snapshot = { transportator: r, masini: masiniDe[r.id] || [], soferi: (masiniDe[r.id] || []).flatMap((m) => soferiDe[m.id] || []) };
    const { error } = await sb.from("deee_transportatori").delete().eq("id", r.id);
    if (error) { alert("Eroare: " + error.message); return; }
    logAction("delete", "deee_transportatori", r.id, { den: r.den, _sters: snapshot });
    if (edit?.id === r.id) setEdit(null);
    await Promise.all([transp.reload(), masini.reload(), soferi.reload()]);
  };

  // ── masini ──
  const adaugaMasina = async () => {
    const nr = nrNou.trim().toUpperCase().replace(/\s+/g, "");
    if (!nr) { setMesajMasina("Scrie numărul de înmatriculare."); return; }
    const { data, error } = await sb.from("deee_masini").insert({ transportator_id: edit.id, nr_auto: nr }).select();
    if (error) { setMesajMasina(eroareDb(error, "o mașină cu acest număr la acest transportator")); return; }
    masini.setRows((p) => [...p, data[0]]);
    logAction("add", "deee_masini", data[0].id, { transportator: edit.den, nr_auto: nr });
    setNrNou(""); setMesajMasina("");
  };
  const salveazaMasina = async (m, camp, valoare) => {
    let v = valoare;
    if (camp === "nr_auto") v = String(valoare).trim().toUpperCase().replace(/\s+/g, "");
    else if (camp === "nr_licenta") v = String(valoare).trim();
    else if (camp.startsWith("data_")) v = valoare || null;
    if ((m[camp] ?? (camp.startsWith("data_") ? null : "")) === v) return;
    if (camp === "nr_auto" && !v) { setMesajMasina("Numărul mașinii nu poate fi gol."); masini.reload(); return; }
    const { error } = await sb.from("deee_masini").update({ [camp]: v }).eq("id", m.id);
    if (error) { setMesajMasina(eroareDb(error, "o mașină cu acest număr la acest transportator")); masini.reload(); return; }
    setMesajMasina("");
    masini.setRows((p) => p.map((x) => (x.id === m.id ? { ...x, [camp]: v } : x)));
    logAction("update", "deee_masini", m.id, { [camp]: v, nr_auto: m.nr_auto, _inainte: { [camp]: m[camp] ?? "" } });
  };
  const stergeMasina = async (m) => {
    const sf = soferiDe[m.id] || [];
    if (!confirmDel(`mașina ${m.nr_auto}${sf.length ? ` (și cei ${sf.length} șoferi ai ei)` : ""}`)) return;
    const { error } = await sb.from("deee_masini").delete().eq("id", m.id);
    if (error) { alert("Eroare: " + error.message); return; }
    logAction("delete", "deee_masini", m.id, { nr_auto: m.nr_auto, _sters: { masina: m, soferi: sf } });
    await Promise.all([masini.reload(), soferi.reload()]);
  };

  // ── soferi ──
  const adaugaSofer = async (m) => {
    const nume = String(soferNou[m.id] || "").trim();
    if (!nume) return;
    const { data, error } = await sb.from("deee_soferi").insert({ masina_id: m.id, nume }).select();
    if (error) { setMesajMasina(eroareDb(error, "acest șofer la această mașină")); return; }
    soferi.setRows((p) => [...p, data[0]]);
    logAction("add", "deee_soferi", data[0].id, { masina: m.nr_auto, nume });
    setSoferNou((p) => ({ ...p, [m.id]: "" })); setMesajMasina("");
  };
  const stergeSofer = async (s, m) => {
    const { error } = await sb.from("deee_soferi").delete().eq("id", s.id);
    if (error) { alert("Eroare: " + error.message); return; }
    soferi.setRows((p) => p.filter((x) => x.id !== s.id));
    logAction("delete", "deee_soferi", s.id, { masina: m.nr_auto, nume: s.nume, _sters: s });
  };

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };
  const masiniEdit = edit?.id ? masiniDe[edit.id] || [] : [];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input style={{ ...inputSt, width: 280 }} placeholder="🔍 Caută nume, CUI sau nr. auto..." value={filtru} onChange={(e) => setFiltru(e.target.value)} />
        <span style={{ fontSize: 12, color: "#64748b" }}>{afisate.length} din {transp.rows.length} • {masini.rows.length} mașini</span>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={() => { setEroare(""); setMesajMasina(""); setEdit({ id: null, den: "", tip: "PJ", cui: "" }); }} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Transportator nou</button>
        </div>
      </div>

      <div style={ui.TBL}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
          <thead>
            <tr>
              <th style={ui.th({ textAlign: "left" })}>Nume</th>
              <th style={ui.th({ width: 70 })}>Tip</th>
              <th style={ui.th({ width: 130 })}>CUI / CNP</th>
              <th style={ui.th({ width: 80 })}>Mașini</th>
              <th style={ui.th({ width: 190 })}>Licențe</th>
              <th style={ui.th({ width: 70 })}></th>
            </tr>
          </thead>
          <tbody>
            {!transp.incarcat && <tr><td colSpan={6} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Se încarcă…</td></tr>}
            {transp.incarcat && afisate.length === 0 && <tr><td colSpan={6} style={ui.td({ textAlign: "center", padding: 18, color: "#94a3b8" })}>Niciun transportator. Apasă „+ Transportator nou”.</td></tr>}
            {afisate.map((r) => {
              const ms = masiniDe[r.id] || [];
              const probleme = ms.map((m) => ({ m, s: stareLicenta(m) })).filter((x) => x.s.culoare === "#c62828" || x.s.culoare === "#e65100");
              return (
                <tr key={r.id}>
                  <td style={ui.td({ fontWeight: 600 })}>{r.den}</td>
                  <td style={ui.td({ textAlign: "center" })}>{r.tip}</td>
                  <td style={ui.td({ textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.cui || "—"}</td>
                  <td style={ui.td({ textAlign: "center" })}>{ms.length}</td>
                  <td style={ui.td({ fontSize: 11 })}>
                    {probleme.length
                      ? probleme.map(({ m, s }) => <div key={m.id} style={{ color: s.culoare, fontWeight: 600 }}>{m.nr_auto}: {s.text}</div>)
                      : <span style={{ color: "#94a3b8" }}>{ms.length ? "în regulă" : "—"}</span>}
                  </td>
                  <td style={ui.td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}>
                    <button onClick={() => { setEroare(""); setMesajMasina(""); setEdit({ id: r.id, den: r.den, tip: r.tip, cui: r.cui || "" }); }} title="Editează, mașini și șoferi" style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>✏️</button>{" "}
                    <button onClick={() => stergeTransportator(r)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {edit && (
        <div onClick={() => setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(820px,100%)", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{edit.id ? "Editare transportator" : "Transportator nou"}</div>
              <button onClick={() => setEdit(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto" }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: "2 1 260px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Nume *</label>
                  <input style={inputSt} value={edit.den} onChange={(e) => setEdit((p) => ({ ...p, den: e.target.value }))} />
                </div>
                <div style={{ flex: "1 1 140px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Tip</label>
                  <select style={inputSt} value={edit.tip} onChange={(e) => setEdit((p) => ({ ...p, tip: e.target.value }))}>
                    <option value="PJ">PJ (Persoană Juridică)</option>
                    <option value="PF">PF (Persoană Fizică)</option>
                  </select>
                </div>
                <div style={{ flex: "1 1 160px" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>CUI / CNP</label>
                  <input style={inputSt} value={edit.cui} onChange={(e) => setEdit((p) => ({ ...p, cui: e.target.value }))} />
                </div>
                <button onClick={salveazaTransportator} style={{ padding: "7px 16px", border: "none", borderRadius: 8, background: G, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{edit.id ? "Actualizează" : "Creează"}</button>
              </div>
              {eroare && <div style={{ marginTop: 8, color: "#c62828", fontSize: 12, fontWeight: 600 }}>⚠️ {eroare}</div>}

              <div style={{ marginTop: 20, fontWeight: 700, fontSize: 13, color: "#334155" }}>Mașini și șoferi</div>
              {!edit.id && <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>Salvează transportatorul ca să poți adăuga mașini și șoferi.</div>}
              {edit.id && (
                <>
                  <div style={{ display: "flex", gap: 8, margin: "8px 0 10px", flexWrap: "wrap" }}>
                    <input style={{ ...inputSt, width: 200, textTransform: "uppercase" }} placeholder="Nr. auto, ex. IF55KFT" value={nrNou} onChange={(e) => setNrNou(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") adaugaMasina(); }} />
                    <button onClick={adaugaMasina} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Adaugă mașină</button>
                  </div>
                  {mesajMasina && <div style={{ color: "#c62828", fontSize: 12, marginBottom: 8 }}>⚠️ {mesajMasina}</div>}
                  {masiniEdit.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8" }}>Nicio mașină încă.</div>}
                  {masiniEdit.map((m) => {
                    const st = stareLicenta(m);
                    const sf = soferiDe[m.id] || [];
                    return (
                      <div key={m.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, marginBottom: 10, background: "#fafbfc" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input key={m.id + m.nr_auto} defaultValue={m.nr_auto} style={{ ...inputSt, width: 130, fontWeight: 700, fontFamily: "monospace" }} onBlur={(e) => salveazaMasina(m, "nr_auto", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
                          <label style={{ fontSize: 12, display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}>
                            <input type="checkbox" checked={!!m.fara_licenta} onChange={(e) => salveazaMasina(m, "fara_licenta", e.target.checked)} /> Fără licență (sub 3,5 t)
                          </label>
                          <span style={{ fontSize: 11, fontWeight: 600, color: st.culoare }}>{st.text}</span>
                          <button onClick={() => stergeMasina(m)} title="Șterge mașina" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕ Șterge</button>
                        </div>
                        {!m.fara_licenta && (
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                            <div style={{ flex: "1 1 160px" }}>
                              <label style={{ fontSize: 11, color: "#475569" }}>Număr licență</label>
                              <input key={m.id + "nl" + m.nr_licenta} defaultValue={m.nr_licenta} style={inputSt} onBlur={(e) => salveazaMasina(m, "nr_licenta", e.target.value)} />
                            </div>
                            <div style={{ flex: "1 1 140px" }}>
                              <label style={{ fontSize: 11, color: "#475569" }}>Dată licență</label>
                              <input type="date" key={m.id + "dl" + m.data_licenta} defaultValue={m.data_licenta || ""} style={inputSt} onBlur={(e) => salveazaMasina(m, "data_licenta", e.target.value)} />
                            </div>
                            <div style={{ flex: "1 1 140px" }}>
                              <label style={{ fontSize: 11, color: "#475569" }}>Dată expirare</label>
                              <input type="date" key={m.id + "de" + m.data_expirare} defaultValue={m.data_expirare || ""} style={inputSt} onBlur={(e) => salveazaMasina(m, "data_expirare", e.target.value)} />
                            </div>
                          </div>
                        )}
                        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Șoferi:</span>
                          {sf.length === 0 && <span style={{ fontSize: 11, color: "#94a3b8" }}>niciunul</span>}
                          {sf.map((s) => (
                            <span key={s.id} style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 14, padding: "2px 4px 2px 10px", fontSize: 12, display: "inline-flex", gap: 4, alignItems: "center" }}>
                              {s.nume}<button onClick={() => stergeSofer(s, m)} title="Scoate șoferul" style={{ background: "none", border: "none", cursor: "pointer", color: "#c62828", fontSize: 12, padding: "0 4px" }}>✕</button>
                            </span>
                          ))}
                          <input style={{ ...inputSt, width: 160 }} placeholder="nume șofer" value={soferNou[m.id] || ""} onChange={(e) => setSoferNou((p) => ({ ...p, [m.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") adaugaSofer(m); }} />
                          <button onClick={() => adaugaSofer(m)} style={{ background: "#fff", color: G, border: `1px solid ${G}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Adaugă</button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f6", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setEdit(null)} style={{ padding: "8px 18px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Închide</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
