import { useState, useEffect } from "react";
import { ACCEPT, incarcaFisier, stergeFisiere, linkuri, esteImagine, fmtMarime } from "./stocareFisiere";

// Previzualizare: imagine sau PDF; alt tip de fisier se deschide intr-o fila noua
export function Previzualizare({ f, url, inaltime = 420 }) {
  if (!url) return <div style={{ color: "#94a3b8", fontSize: 12, padding: 20 }}>Se încarcă…</div>;
  if (esteImagine(f)) return <img src={url} alt={f.nume} style={{ maxWidth: "100%", maxHeight: inaltime, objectFit: "contain", display: "block", margin: "0 auto" }} />;
  if (f.mime === "application/pdf") return <iframe title={f.nume} src={url} style={{ width: "100%", height: inaltime, border: "1px solid #e2e8f0", borderRadius: 8 }} />;
  return <div style={{ textAlign: "center", padding: 24 }}><div style={{ fontSize: 40 }}>📄</div><div style={{ fontSize: 12, margin: "6px 0" }}>{f.nume}</div><a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Deschide</a></div>;
}

// Fisierele unei achizitii / vanzari: adaugare (poza cu camera sau fisiere), vizualizare, comparatie alaturata, stergere.
export default function PanouFisiere({ sb, G, user, logAction, fis, sursa, onClose }) {
  const fisiere = fis.pe(sursa.tip, sursa.id);
  const [urls, setUrls] = useState({});
  const [lucru, setLucru] = useState("");
  const [erori, setErori] = useState([]);
  const [selectate, setSelectate] = useState([]); // pana la 2 fisiere de comparat
  const [vezi, setVezi] = useState(null);         // fisierul deschis mare
  const [compara, setCompara] = useState(false);

  useEffect(() => {
    let activ = true;
    const lipsa = fisiere.filter((f) => !urls[f.cale]);
    if (lipsa.length) linkuri(sb, lipsa).then((m) => { if (activ) setUrls((p) => ({ ...p, ...m })); });
    return () => { activ = false; };
  }, [fisiere.map((f) => f.id).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const adauga = async (lista) => {
    const files = [...lista]; if (!files.length) return;
    setErori([]); const noi = []; const er = [];
    for (let i = 0; i < files.length; i++) {
      setLucru(`Se încarcă ${i + 1} din ${files.length}…`);
      const r = await incarcaFisier(sb, files[i], sursa, user);
      if (r.eroare) er.push(r.eroare); else noi.push(r.rand);
    }
    setLucru(""); setErori(er);
    if (noi.length) {
      fis.setRows((p) => [...p, ...noi]);
      logAction("add", "deee_fisiere", noi[0].id, { document: sursa.titlu, fisiere: noi.map((x) => x.nume).join(", ") });
    }
  };

  const sterge = async (f) => {
    if (!window.confirm(`Ștergi fișierul „${f.nume}”?`)) return;
    const er = await stergeFisiere(sb, [f]);
    if (er) { setErori([er]); return; }
    fis.setRows((p) => p.filter((x) => x.id !== f.id));
    setSelectate((p) => p.filter((id) => id !== f.id)); if (vezi?.id === f.id) setVezi(null);
    logAction("delete", "deee_fisiere", f.id, { document: sursa.titlu, _sters: f });
  };

  const comuta = (f) => setSelectate((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : [...p, f.id].slice(-2)));
  const deComparat = selectate.map((id) => fisiere.find((f) => f.id === id)).filter(Boolean);
  const btn = (extra) => ({ border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, ...extra });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(980px,100%)", maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div><div style={{ fontWeight: 700, fontSize: 15 }}>Fișiere — {sursa.titlu}</div><div style={{ fontSize: 11, color: "#64748b" }}>{fisiere.length} fișiere • poze și documente (max. 15 MB fiecare)</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>
        <div style={{ padding: 18, overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
            <label style={btn({ background: G, color: "#fff", display: "inline-block" })}>📎 Adaugă poze și documente
              <input type="file" multiple accept={ACCEPT} style={{ display: "none" }} disabled={!!lucru} onChange={(e) => { adauga(e.target.files); e.target.value = ""; }} />
            </label>
            <label style={btn({ background: "#fff", color: G, border: `1px solid ${G}`, display: "inline-block" })}>📷 Fă o poză
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} disabled={!!lucru} onChange={(e) => { adauga(e.target.files); e.target.value = ""; }} />
            </label>
            {deComparat.length === 2 && <button onClick={() => setCompara(true)} style={btn({ background: "#6a1b9a", color: "#fff" })}>↔ Compară cele 2 selectate</button>}
            {lucru && <span style={{ fontSize: 12, color: "#475569" }}>{lucru}</span>}
          </div>
          {erori.map((er, i) => <div key={i} style={{ color: "#c62828", fontSize: 12, marginBottom: 3 }}>⚠️ {er}</div>)}
          {fisiere.length === 0 && !lucru && <div style={{ color: "#94a3b8", fontSize: 13, padding: "18px 0" }}>Niciun fișier încă. Adaugă fotografia sau scanarea avizului, a anexei, a tichetului de cântar etc.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
            {fisiere.map((f) => (
              <div key={f.id} style={{ border: selectate.includes(f.id) ? `2px solid #6a1b9a` : "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fafbfc" }}>
                <div onClick={() => setVezi(f)} style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef2f6", cursor: "pointer" }}>
                  {esteImagine(f) && urls[f.cale] ? <img src={urls[f.cale]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <span style={{ fontSize: 34 }}>{f.mime === "application/pdf" ? "📕" : esteImagine(f) ? "🖼️" : "📄"}</span>}
                </div>
                <div style={{ padding: "6px 8px" }}>
                  <div title={f.nume} style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nume}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{fmtMarime(f.marime)}{f.creat_de ? ` • ${f.creat_de}` : ""}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, alignItems: "center" }}>
                    <label style={{ fontSize: 10, display: "flex", gap: 3, alignItems: "center", cursor: "pointer", color: "#6a1b9a" }}><input type="checkbox" checked={selectate.includes(f.id)} onChange={() => comuta(f)} /> compară</label>
                    <span>
                      {urls[f.cale] && <a href={urls[f.cale]} target="_blank" rel="noreferrer" download={f.nume} title="Descarcă" style={{ fontSize: 13, textDecoration: "none", marginRight: 6 }}>⬇️</a>}
                      <button onClick={() => sterge(f)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13, padding: 0 }}>✕</button>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(vezi || compara) && (
        <div onClick={(e) => { e.stopPropagation(); setVezi(null); setCompara(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: compara ? "min(1400px,100%)" : "min(900px,100%)", maxHeight: "96vh", overflow: "auto", padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <b style={{ fontSize: 13 }}>{compara ? "Comparație" : vezi.nume}</b>
              <button onClick={() => { setVezi(null); setCompara(false); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            {compara
              ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{deComparat.map((f) => <div key={f.id} style={{ flex: "1 1 400px" }}><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{f.nume}</div><Previzualizare f={f} url={urls[f.cale]} inaltime={640} /></div>)}</div>
              : <Previzualizare f={vezi} url={urls[vezi.cale]} inaltime={680} />}
          </div>
        </div>
      )}
    </div>
  );
}
