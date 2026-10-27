import { useState } from "react";
import { useTabela, lipsaTabel, colatie } from "./hooks";
import Echipamente from "./Echipamente";

// Panou generic pentru o lista simpla (organizatii, echipamente, fractii): adaugare, redenumire pe loc,
// activ/inactiv si stergere. Fiecare modificare ajunge in Istoric, cu valoarea veche.
function Nomenclator({ titlu, descriere, tabel, campuri, sb, G, ui, logAction, confirmDel }) {
  const { rows, setRows, eroare, incarcat, reload } = useTabela(sb, tabel);
  const [nou, setNou] = useState({});
  const [mesaj, setMesaj] = useState("");
  const [filtru, setFiltru] = useState("");

  if (eroare) return null; // eroarea (ex. lipsa tabelelor) o arata containerul

  const eroareDb = (error) => (error.code === "23505" ? "Există deja o intrare cu aceeași valoare." : "Eroare: " + error.message);

  const adauga = async () => {
    const row = {};
    campuri.forEach((c) => { row[c.k] = (nou[c.k] || "").trim(); });
    if (!row[campuri[0].k]) { setMesaj(`Completează ${campuri[0].label.toLowerCase()}.`); return; }
    const { data, error } = await sb.from(tabel).insert(row).select();
    if (error) { setMesaj(eroareDb(error)); return; }
    setRows((p) => [...p, data[0]]);
    setNou({}); setMesaj("");
    logAction("add", tabel, data[0].id, row);
  };

  const salveaza = async (r, camp, valoare) => {
    const v = valoare.trim();
    if (v === (r[camp] ?? "")) return;
    if (camp === campuri[0].k && !v) { setMesaj("Denumirea nu poate fi goală."); reload(); return; }
    const { error } = await sb.from(tabel).update({ [camp]: v }).eq("id", r.id);
    if (error) { setMesaj(eroareDb(error)); reload(); return; }
    setMesaj("");
    setRows((p) => p.map((x) => (x.id === r.id ? { ...x, [camp]: v } : x)));
    logAction("update", tabel, r.id, { [camp]: v, _inainte: { [camp]: r[camp] ?? "" } });
  };

  const comuta = async (r) => {
    const { error } = await sb.from(tabel).update({ activ: !r.activ }).eq("id", r.id);
    if (error) { setMesaj(eroareDb(error)); return; }
    setRows((p) => p.map((x) => (x.id === r.id ? { ...x, activ: !r.activ } : x)));
    logAction("update", tabel, r.id, { activ: !r.activ, _inainte: { activ: r.activ } });
  };

  const sterge = async (r) => {
    if (!confirmDel(`„${r[campuri[0].k]}"`)) return;
    const { error } = await sb.from(tabel).delete().eq("id", r.id);
    if (error) { setMesaj(eroareDb(error)); return; }
    setRows((p) => p.filter((x) => x.id !== r.id));
    logAction("delete", tabel, r.id, { _sters: r });
  };

  const q = filtru.trim().toLowerCase();
  const afisate = [...rows]
    .filter((r) => !q || campuri.some((c) => String(r[c.k] || "").toLowerCase().includes(q)))
    .sort((a, b) => campuri.reduce((acc, c) => acc || colatie(a[c.k], b[c.k]), 0));

  const inputSt = { padding: "6px 8px", border: "1px solid #d5dbe1", borderRadius: 6, fontSize: 12, boxSizing: "border-box", width: "100%" };

  return (
    <div style={{ flex: "1 1 340px", minWidth: 300, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, boxShadow: "0 1px 3px rgba(15,23,42,.05)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{titlu} <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: 12 }}>({rows.length})</span></div>
      </div>
      <div style={{ fontSize: 11, color: "#64748b", margin: "2px 0 10px" }}>{descriere}</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {campuri.map((c) => (
          <input key={c.k} style={{ ...inputSt, flex: c.flex || 1, minWidth: c.min || 90 }} placeholder={c.label} value={nou[c.k] || ""}
            onChange={(e) => setNou((p) => ({ ...p, [c.k]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") adauga(); }} />
        ))}
        <button onClick={adauga} style={{ background: G, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Adaugă</button>
      </div>
      {mesaj && <div style={{ color: "#c62828", fontSize: 11, marginBottom: 6 }}>{mesaj}</div>}
      {rows.length > 8 && <input style={{ ...inputSt, marginBottom: 8 }} placeholder="🔍 Caută..." value={filtru} onChange={(e) => setFiltru(e.target.value)} />}

      <div style={{ maxHeight: 420, overflowY: "auto", border: "1px solid #eef2f6", borderRadius: 8 }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {campuri.map((c) => <th key={c.k} style={ui.th({ textAlign: "left", background: "#1f4d42" })}>{c.label}</th>)}
              <th style={ui.th({ width: 52, background: "#1f4d42" })}>Activ</th>
              <th style={ui.th({ width: 36, background: "#1f4d42" })}></th>
            </tr>
          </thead>
          <tbody>
            {!incarcat && <tr><td colSpan={campuri.length + 2} style={ui.td({ textAlign: "center", color: "#94a3b8", padding: 14 })}>Se încarcă…</td></tr>}
            {incarcat && afisate.length === 0 && <tr><td colSpan={campuri.length + 2} style={ui.td({ textAlign: "center", color: "#94a3b8", padding: 14 })}>Nimic încă.</td></tr>}
            {afisate.map((r) => (
              <tr key={r.id} style={{ opacity: r.activ ? 1 : 0.5 }}>
                {campuri.map((c) => (
                  <td key={c.k} style={ui.td({ padding: 2 })}>
                    <input key={r.id + String(r[c.k])} defaultValue={r[c.k] ?? ""} style={{ ...inputSt, border: "1px solid transparent", background: "transparent" }}
                      onBlur={(e) => salveaza(r, c.k, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
                  </td>
                ))}
                <td style={ui.td({ textAlign: "center" })}><input type="checkbox" checked={!!r.activ} onChange={() => comuta(r)} title="Inactiv = nu mai apare în liste noi" /></td>
                <td style={ui.td({ textAlign: "center", padding: 2 })}><button onClick={() => sterge(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }} title="Șterge">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Nomenclatoare(props) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
        Listele din care se aleg valorile în Achiziții, Dezmembrare, Rețete și Vânzări. Un element <b>inactiv</b> nu mai apare în listele noi, dar rămâne în documentele vechi.
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Nomenclator {...props} titlu="Organizații" descriere="Organizațiile către care se raportează (CNREE, RLG, NEALOCATE…)." tabel="deee_organizatii"
          campuri={[{ k: "den", label: "Denumire" }]} />
        <Nomenclator {...props} titlu="Fracții" descriere="Fracțiile rezultate din dezmembrare, cu codul EWC (aceeași fracție poate avea mai multe coduri)." tabel="deee_fractii"
          campuri={[{ k: "den", label: "Denumire", flex: 2 }, { k: "cod", label: "Cod EWC", flex: 1, min: 70 }]} />
      </div>
      <div style={{ marginTop: 14 }}><Echipamente {...props} /></div>
    </div>
  );
}

export { lipsaTabel };
