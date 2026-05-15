import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ───────────────────────────────────────────
const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Constants ─────────────────────────────────────────────────
const G = "#1d6f42";
const PRODUSE_LIST = [
  { den: "DESEURI DE AMBALAJE DIN STICLA", cod: "15 01 07" },
  { den: "Deseu Fier -17 04 05", cod: "17 04 05" },
  { den: "Fier - dezmembrare manuala", cod: "17 04 05" },
  { den: "Deseu Aluminiu - 17 04 02", cod: "17 04 02" },
  { den: "Deseu DEEE - 16 02 14", cod: "16 02 14" },
  { den: "Deseu Inox - 17 04 05", cod: "17 04 05" },
  { den: "Deseu Cupru - 17 04 01", cod: "17 04 01" },
  { den: "Deseu amb Sticla - 15 01 07", cod: "15 01 07" },
  { den: "Deseu Baterii DBA Mixt - 16 06 05", cod: "16 06 05" },
  { den: "Deseu amb Aluminiu - 15 01 04", cod: "15 01 04" },
  { den: "Deseu amb folie transparenta - 15 01 02", cod: "15 01 02" },
  { den: "Deseu cabluri cupru - 17 04 11", cod: "17 04 11" },
  { den: "Deseu Alama - 17 04 01", cod: "17 04 01" },
  { den: "Piatra din DEEE", cod: "16 02 14" },
  { den: "Deseu folie color - 15 01 02", cod: "15 01 02" },
  { den: "Deseu amb din PET - 15 01 02", cod: "15 01 02" },
  { den: "DESEURI DE AMBALAJE DIN HDPE-COD 15 01 02", cod: "15 01 02" },
  { den: "VSU", cod: "16 01 04" },
];
const PRODUSE = PRODUSE_LIST.map((p) => p.den);
const AGENTI = ["Alex","Sandel","Cosereni","Tanase George","Iacob Marian","Cuscru","Ecosal","Ecovol","Nea Costel"];
const ACHITAT_DE_OPT = ["Alex","Maria","Ion","Andrei","Nea Costel"];
const CLIENTI = ["ROMRECYCLING","CRILELMAR SRL","GREENTECH","METALROM","RECYCLE PRO","Altul"];
const CATEGORIE_COL = ["Curte","Deee","Diverse","Altele"];
const COL_COLORS = { Curte: "#c6efce", Deee: "#bdd7ee", Diverse: "#fff2cc", Altele: "#fce4d6" };
const CATEGORIE_CH = ["Diverse","Taxe","Salarii","Utilități","Transport","Altele"];
const GREENKRAFT_OPT = ["Deee","Greenkraft"];
const LUNI = ["Ian","Feb","Mar","Apr","Mai","Iun","Iul","Aug","Sep","Oct","Nov","Dec"];
const SERII = ["GK","GKR"];
const CAT_PAROLE = ["Email","Bancă","Card","Platformă","WiFi","Altele"];
const PIN_CORRECT = "336699";

// ── Helpers ───────────────────────────────────────────────────
const fmt = (v, dec = 2) => {
  if (v === "" || v === null || v === undefined || isNaN(v)) return "";
  return Number(v).toLocaleString("ro-RO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
};
const parseSuma = (s) => {
  if (!s) return 0;
  return parseFloat(String(s).replace(/\./g, "").replace(",", ".")) || 0;
};
const calcRow = (r, cost) => {
  const m = r.pv && r.pa ? +(r.pv - r.pa).toFixed(4) : 0;
  return { ...r, cost, marja: m, cant: m > 0 ? +(cost / m).toFixed(2) : 0 };
};
function today() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function litere(n) {
  n = Math.round(n || 0);
  const u = ["","unu","doi","trei","patru","cinci","șase","șapte","opt","nouă","zece","unsprezece","doisprezece","treisprezece","paisprezece","cincisprezece","șaisprezece","șaptesprezece","optsprezece","nouăsprezece"];
  const z = ["","","douăzeci","treizeci","patruzeci","cincizeci","șaizeci","șaptezeci","optzeci","nouăzeci"];
  const s = ["","una sută","două sute","trei sute","patru sute","cinci sute","șase sute","șapte sute","opt sute","nouă sute"];
  if (!n) return "zero";
  let p = [], rest = n;
  if (rest >= 1000) { const m = Math.floor(rest / 1000); p.push(m === 1 ? "o mie" : m === 2 ? "două mii" : fmt(m, 0) + " mii"); rest = rest % 1000; }
  const sv = Math.floor(rest / 100); if (sv) p.push(s[sv]); rest = rest % 100;
  if (rest < 20 && rest > 0) p.push(u[rest]);
  else { const zv = Math.floor(rest / 10), uv = rest % 10; if (zv) p.push(z[zv] + (uv ? " și " + u[uv] : "")); }
  return p.join(" ") || "zero";
}
const getNextNr = (serie, reg) => {
  const m = reg.filter((r) => r.serie === serie).map((r) => parseInt(r.nr) || 0);
  return m.length ? String(Math.max(...m) + 1) : serie === "GK" ? "18050" : "1";
};
function calcStoc(miscari = []) {
  const map = {};
  miscari.forEach((m) => {
    const k = m.produs;
    if (!map[k]) map[k] = { produs: m.produs, cod: m.cod || "", cant: 0, val: 0, intrari: 0, iesiri: 0, data: m.data || "" };
    if (m.tip === "intrare") { map[k].val += (parseFloat(m.cant) || 0) * (parseFloat(m.pu) || 0); map[k].cant += parseFloat(m.cant) || 0; map[k].intrari += parseFloat(m.cant) || 0; }
    else { map[k].cant -= parseFloat(m.cant) || 0; map[k].iesiri += parseFloat(m.cant) || 0; }
    if ((m.data || "") > (map[k].data || "")) map[k].data = m.data;
  });
  return Object.values(map).map((r) => ({ ...r, pm: r.intrari > 0 ? r.val / r.intrari : 0 }));
}

// ── Styles ────────────────────────────────────────────────────
const th = (x = {}) => ({ background: "#3a6b4a", color: "#fff", padding: "5px 6px", border: "1px solid #aaa", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", textAlign: "center", ...x });
const td = (x = {}) => ({ padding: "3px 5px", border: "1px solid #d0d0d0", fontSize: 12, background: "#fff", verticalAlign: "middle", ...x });
const inp = (x = {}) => ({ width: "100%", border: "none", outline: "none", fontSize: 12, background: "transparent", ...x });
const sel = (x = {}) => ({ border: "none", outline: "none", background: "transparent", fontSize: 12, width: "100%", cursor: "pointer", ...x });
const LSt = { fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 2, display: "block" };
const IFS = { width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px", fontSize: 12, boxSizing: "border-box" };

// ── Autocomplete ──────────────────────────────────────────────
function AC({ value, onChange, options, placeholder = "" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  return (
    <div style={{ position: "relative" }}>
      <input style={inp()} value={q} placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} />
      {open && options.filter((o) => o.toLowerCase().includes((q || "").toLowerCase())).length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 999, background: "#fff", border: "1px solid #ccc", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,.15)", maxHeight: 180, overflowY: "auto", minWidth: 200 }}>
          {options.filter((o) => o.toLowerCase().includes((q || "").toLowerCase())).map((o) => (
            <div key={o} onMouseDown={() => { setQ(o); onChange(o); setOpen(false); }}
              style={{ padding: "5px 10px", fontSize: 12, cursor: "pointer", borderBottom: "1px solid #eee" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e8f5e9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Borderou Print ────────────────────────────────────────────
function BordPrint({ b }) {
  const tot = b.produse.reduce((s, p) => s + (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0), 0);
  const imp = Math.round(tot * 0.1), tax = Math.round(tot * 0.02), rest = tot - imp - tax;
  const tS = { width: "100%", borderCollapse: "collapse", margin: "8px 0", fontSize: 11 };
  const thP = (x = {}) => ({ border: "1px solid #000", padding: "4px 6px", fontWeight: "bold", textAlign: "center", background: "#f5f5f5", ...x });
  const tdP = (x = {}) => ({ border: "1px solid #000", padding: "4px 6px", textAlign: "center", ...x });
  return (
    <div style={{ fontFamily: "Times New Roman,serif", fontSize: 11, color: "#000", background: "#fff", padding: "18px 24px", maxWidth: 760, margin: "0 auto", lineHeight: 1.5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div><div style={{ fontWeight: "bold", fontSize: 13 }}>S.C. GREEN KRAFT S.R.L.</div><div>CUI:36191378</div><div>Nr. Reg Comert: J23/2426/2016</div></div>
        <div style={{ textAlign: "right", fontSize: 10 }}><div>Autorizatie Mediu : 233/22.12.2021</div><div>Soseaua de centura dreapta 18A, Afumați</div><div>Judeţul Ilfov, cod postal 770110</div></div>
      </div>
      <div style={{ textAlign: "center", margin: "8px 0" }}>
        <div style={{ fontSize: 18, fontWeight: "bold", fontStyle: "italic" }}>BORDEROU</div>
        <div style={{ fontSize: 12, fontStyle: "italic" }}>De achizitie deseuri</div>
        <div style={{ fontSize: 12, fontWeight: "bold" }}>Seria {b.serie} Nr. {b.nr} din data de {b.data}</div>
      </div>
      <div style={{ margin: "8px 0", fontSize: 11 }}>S-au primit de la (detinator) <strong>{b.det.toUpperCase()}</strong>, domiciliat{b.det.toLowerCase().endsWith("a") ? "a" : ""} in localitatea <strong>{b.dom}</strong>, legitimat{b.det.toLowerCase().endsWith("a") ? "a" : ""} cu C.I. Seria <strong>{b.ci_s}</strong>, nr. <strong>{b.ci_n}</strong>, eliberata de <strong>{b.ci_e}</strong> <strong>{b.ci_v}</strong>, CNP <strong>{b.cnp}</strong>, cu mijloc de transport <strong>{b.trans}</strong>,</div>
      <div style={{ fontSize: 11, marginBottom: 4 }}>următoarele materiale deseuri:</div>
      <table style={tS}>
        <thead>
          <tr><th style={thP({ textAlign: "left" })}>Denumire deseu</th><th style={thP()}>Cod HG 856</th><th style={thP()}>U/M</th><th style={thP()}>Cant.(Kg)</th><th style={thP()}>Pret (Lei/Kg)</th><th style={thP()}>Valoare (Lei)</th></tr>
          <tr>{["1","2","","","","5=3x4"].map((h, i) => <td key={i} style={tdP({ fontSize: 10, background: "#f9f9f9" })}>{h}</td>)}</tr>
        </thead>
        <tbody>
          {b.produse.map((p, i) => { const v = (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0); return (<tr key={i}><td style={tdP({ textAlign: "left" })}>{p.den.toUpperCase()}</td><td style={tdP()}>{p.cod}</td><td style={tdP()}>KG</td><td style={tdP()}>{p.cant || ""}</td><td style={tdP()}>{p.pret || ""}</td><td style={tdP()}>{v > 0 ? fmt(v) : ""}</td></tr>); })}
          {Array(Math.max(0, 5 - b.produse.length)).fill(0).map((_, i) => <tr key={"e" + i}><td style={{ ...tdP(), height: 18 }} colSpan={6}>&nbsp;</td></tr>)}
        </tbody>
      </table>
      <table style={{ ...tS, width: "55%", marginLeft: "auto" }}>
        <tbody>
          <tr><td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>TOTAL</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>{fmt(tot)}</td></tr>
          <tr><td style={{ border: "1px solid #000", padding: "3px 6px" }}>Impozit pe venit 10%</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{imp}</td></tr>
          <tr><td style={{ border: "1px solid #000", padding: "3px 6px" }}>Taxa mediu OUG 196/2005 2%</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{fmt(tax)}</td></tr>
          <tr style={{ background: "#f0f0f0" }}><td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>REST DE PLATA</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold", fontSize: 14 }}>{fmt(rest)}</td></tr>
        </tbody>
      </table>
      <div style={{ margin: "8px 0", fontSize: 11 }}>Se achita suma de <strong>{Math.round(rest)} Lei</strong>, adica (<em>{litere(Math.round(rest))} lei</em>) reprezentand contravaloarea deseurilor achizitionate cu chitanta nr. {b.nr}, sau la termen de maximum 3 zile lucratoare.</div>
      <div style={{ fontSize: 10, margin: "6px 0", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 5px" }}>Impozitul pe venit de 10% si contributia de 2% la Administratia Fondului pentru Mediu (conf. OUG nr. 196/2005) din contravaloarea deseurilor predate, au fost retinute la sursa din valoarea bruta.</p>
        <p style={{ margin: "0 0 5px" }}>Imi exprim acordul cu privire la utilizarea si prelucrarea datelor mele cu caracter personal de catre societatea GREEN KRAFT S.R.L., in conformitate cu prevederile Regulamentului (UE) 2016/679.</p>
        <p style={{ margin: "0" }}>Datele dumneavoastra personale sunt prelucrate de societatea GREEN KRAFT S.R.L. in conformitate cu Regulamentul (UE) 2016/679 in scopul completarii si transmiterii declaratiilor si raportarilor legale.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 11 }}>
        <div style={{ textAlign: "center" }}><div>Am primit,</div><div style={{ fontWeight: "bold" }}>Gana Mihai</div><div style={{ fontSize: 9 }}>(nume/CNP/semnatura/stampila)</div><div style={{ marginTop: 6, width: 60, height: 60, border: "1px dashed #bbb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: 9, margin: "6px auto 0" }}>ștampilă</div></div>
        <div style={{ flex: 1, paddingLeft: 20 }}>
          <div style={{ fontWeight: "bold" }}>Detinator de deseuri-persoana fizica.</div>
          <div>1. Cunosc faptul ca falsul in declaratii constituie infractiune si se pedepseste conform Codului penal.</div>
          <div>2. Declar pe proprie raspundere ca deseurile pe care le predau provin din</div>
          <div style={{ paddingLeft: 14 }}>a) Gospodărie proprie [{b.sursa === "gospodarie" ? " X" : " "}]</div>
          <div style={{ paddingLeft: 14 }}>b) Alte surse [{b.sursa === "alte" ? " X" : " "}]</div>
          <div style={{ marginTop: 8 }}>Nume si prenume (detinator): <strong>{b.det}</strong></div>
          <div style={{ marginTop: 6 }}>Semnatura __________________</div>
        </div>
      </div>
    </div>
  );
}

// ── Supabase realtime helper ──────────────────────────────────
function useSupaTable(tableName, setFn) {
  useEffect(() => {
    sb.from(tableName).select("*").order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setFn(data); });
    const ch = sb.channel(`${tableName}-rt`)
      .on("postgres_changes", { event: "*", schema: "public", table: tableName },
        () => sb.from(tableName).select("*").order("created_at", { ascending: true })
          .then(({ data }) => { if (data) setFn(data); }))
      .subscribe();
    return () => sb.removeChannel(ch);
  }, []);
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const printRef = useRef();
  const regPrintRef = useRef();
  const scanInputRef = useRef();
  const debounce = useRef({});

  // Debounced save to Supabase
  const dbSave = (table, id, changes) => {
    if (!id) return;
    const key = `${table}-${id}`;
    clearTimeout(debounce.current[key]);
    debounce.current[key] = setTimeout(async () => {
      await sb.from(table).update(changes).eq("id", id);
    }, 700);
  };

  // ── UI state ─────────────────────────────────────────────
  const [tab, setTab] = useState("borderou");
  const [bordSubTab, setBordSubTab] = useState("editor");
  const [activeBord, setActiveBord] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [detSearch, setDetSearch] = useState("");
  const [detOpen, setDetOpen] = useState(false);
  const [stocFilter, setStocFilter] = useState("");
  const [showMisc, setShowMisc] = useState(false);
  const [newM, setNewM] = useState({ data: today(), tip: "intrare", produs: "", cod: "", cant: "", pu: "", sursa: "" });
  const [selSal, setSelSal] = useState(null);
  const [concF, setConcF] = useState({ luna: 0, zile: 1 });
  const [costAl, setCostAl] = useState(86100);
  const [calRows, setCalRows] = useState([
    { material: "Fier", pa: 0.9, pv: 1.15 }, { material: "Aluminiu", pa: 5.5, pv: 7.5 },
    { material: "Cupru", pa: 35, pv: 40 }, { material: "Baterii", pa: 2.3, pv: 2.8 }, { material: "Deee", pa: 1.1, pv: 1.6 },
  ].map((r) => calcRow(r, 86100)));
  const [datFilter, setDatFilter] = useState("");
  const [avTip, setAvTip] = useState("toate");
  const [avPers, setAvPers] = useState("");
  const [ctSearch, setCtSearch] = useState("");
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [parolaCat, setParolaCat] = useState("toate");
  const [parolaSearch, setParolaSearch] = useState("");
  const [showParole, setShowParole] = useState({});
  const [parolaEdit, setParolaEdit] = useState(null);
  const [pfFilter, setPfFilter] = useState("");
  const [pjFilter, setPjFilter] = useState("");
  const [cuiSearch, setCuiSearch] = useState("");
  const [cuiLoading, setCuiLoading] = useState(false);
  const [cuiResult, setCuiResult] = useState(null);
  const [cuiErr, setCuiErr] = useState("");
  // ── Print from Registru ───────────────────────────────────
  const [printBord, setPrintBord] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);

  // Borderouri (local only — saved to registru on submit)
  const newBord = (serie = "GK", reg = []) => ({
    serie, nr: getNextNr(serie, reg), data: today(),
    det: "", dom: "", ci_s: "", ci_n: "", ci_e: "", ci_v: "", cnp: "", trans: "Auto", sursa: "alte",
    produse: [{ den: "", cod: "", cant: "", pret: "" }],
  });
  const [borderouri, setBorderouri] = useState([newBord()]);
  const b = borderouri[activeBord] || newBord();
  const setB = (fn) => setBorderouri((p) => { const n = [...p]; n[activeBord] = fn(n[activeBord]); return n; });
  const updB = (f, v) => setB((b) => f === "serie" ? { ...b, serie: v, nr: getNextNr(v, registru) } : { ...b, [f]: v });
  const updP = (i, f, v) => setB((b) => { const ps = [...b.produse]; ps[i] = { ...ps[i], [f]: v }; if (f === "den") { const fd = PRODUSE_LIST.find((p) => p.den === v); if (fd) ps[i].cod = fd.cod; } return { ...b, produse: ps }; });
  const bTot = b.produse.reduce((s, p) => s + (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0), 0);
  const bImp = Math.round(bTot * 0.1), bTax = Math.round(bTot * 0.02), bRest = bTot - bImp - bTax;

  // ── Supabase-backed data ──────────────────────────────────
  const [registru, setRegistru] = useState([]);
  const [chRows, setChRows] = useState([]);
  const [colRows, setColRows] = useState([]);
  const [livRows, setLivRows] = useState([]);
  const [datRows, setDatRows] = useState([]);
  const [avRows, setAvRows] = useState([]);
  const [contracte, setContracte] = useState([]);
  const [pfList, setPfList] = useState([]);
  const [pjList, setPjList] = useState([]);
  const [parole, setParole] = useState([]);
  const [salRows, setSalRows] = useState([]);
  const [manMisc, setManMisc] = useState([]);

  useSupaTable("registru", setRegistru);
  useSupaTable("cheltuieli", setChRows);
  useSupaTable("colectari", setColRows);
  useSupaTable("livrari", setLivRows);
  useSupaTable("datorii", setDatRows);
  useSupaTable("avansuri", setAvRows);
  useSupaTable("contracte", setContracte);
  useSupaTable("furnizori_pf", setPfList);
  useSupaTable("furnizori_pj", setPjList);
  useSupaTable("salariati", setSalRows);
  useSupaTable("stoc_manual", setManMisc);

  // Parole — map utilizator → user
  useEffect(() => {
    sb.from("parole").select("*").order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setParole(data.map((r) => ({ ...r, user: r.utilizator }))); });
    const ch = sb.channel("parole-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "parole" },
        () => sb.from("parole").select("*").order("created_at", { ascending: true })
          .then(({ data }) => { if (data) setParole(data.map((r) => ({ ...r, user: r.utilizator }))); }))
      .subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  // ── CRUD helpers ─────────────────────────────────────────
  const mkUpd = (rows, setRows, table) => (i, f, v) => {
    setRows((p) => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n; });
    dbSave(table, rows[i]?.id, { [f]: v });
  };
  const mkDel = (setRows, table) => async (id) => {
    setRows((p) => p.filter((r) => r.id !== id));
    await sb.from(table).delete().eq("id", id);
  };

  // Cheltuieli
  const updCH = mkUpd(chRows, setChRows, "cheltuieli");
  const delCH = mkDel(setChRows, "cheltuieli");
  const addCH = async () => {
    const row = { data: today(), gk: "Deee", suma: "", cat: "Diverse", det: "", ach: "", ach_de: "", note: "" };
    const { data } = await sb.from("cheltuieli").insert(row).select();
    if (data) setChRows((p) => [...p, data[0]]);
  };

  // Colectari
  const updCOL = mkUpd(colRows, setColRows, "colectari");
  const delCOL = mkDel(setColRows, "colectari");
  const addCOL = async () => {
    const row = { data: today(), agent: "", furn: "", cat: "Curte", produs: "", cant: 0, pret: 0, ach: "", ach_de: "" };
    const { data } = await sb.from("colectari").insert(row).select();
    if (data) setColRows((p) => [...p, data[0]]);
  };

  // Livrari
  const updLIV = mkUpd(livRows, setLivRows, "livrari");
  const delLIV = mkDel(setLivRows, "livrari");
  const addLIV = async () => {
    const row = { data: today(), nr: "", client: "", produs: "", cant: 0, pret: 0, fact: "", inc: "", det: "" };
    const { data } = await sb.from("livrari").insert(row).select();
    if (data) setLivRows((p) => [...p, data[0]]);
  };

  // Datorii
  const updDAT = mkUpd(datRows, setDatRows, "datorii");
  const delDAT = mkDel(setDatRows, "datorii");
  const addDAT = async () => {
    const row = { data: today(), nume: "", suma: "", det: "" };
    const { data } = await sb.from("datorii").insert(row).select();
    if (data) setDatRows((p) => [...p, data[0]]);
  };

  // Avansuri
  const updAV = mkUpd(avRows, setAvRows, "avansuri");
  const delAV = mkDel(setAvRows, "avansuri");
  const addAV = async (tip) => {
    const row = { data: today(), catre: "", suma: "", tip, det: "" };
    const { data } = await sb.from("avansuri").insert(row).select();
    if (data) setAvRows((p) => [...p, data[0]]);
  };

  // Contracte
  const updCT = mkUpd(contracte, setContracte, "contracte");
  const delCT = mkDel(setContracte, "contracte");
  const addCT = async () => {
    const maxNr = contracte.reduce((m, r) => Math.max(m, parseInt(r.nr) || 0), 0);
    const row = { nr: String(maxNr + 1), companie: "", data: today(), detalii: "" };
    const { data } = await sb.from("contracte").insert(row).select();
    if (data) setContracte((p) => [...p, data[0]]);
  };

  // Furnizori PF
  const updPF = mkUpd(pfList, setPfList, "furnizori_pf");
  const delPF = mkDel(setPfList, "furnizori_pf");
  const addPF = async () => {
    const codes = pfList.map((f) => parseInt(f.cod) || 0);
    const cod = String((codes.length ? Math.max(...codes) : 0) + 1).padStart(5, "0");
    const row = { cod, denumire: "", cod_fiscal: "", analitic: `401.${cod}`, tara: "RO", judet: "", adresa: "", reg_com: "", inf_supl: "" };
    const { data } = await sb.from("furnizori_pf").insert(row).select();
    if (data) setPfList((p) => [...p, data[0]]);
  };

  // Furnizori PJ
  const updPJ = mkUpd(pjList, setPjList, "furnizori_pj");
  const delPJ = mkDel(setPjList, "furnizori_pj");
  const addPJ = async () => {
    const row = { cod: "", denumire: "", cod_fiscal: "", analitic: "", tara: "RO", judet: "B", adresa: "", cont_banca: "", banca: "", reg_com: "", grupa: "", tel: "" };
    const { data } = await sb.from("furnizori_pj").insert(row).select();
    if (data) setPjList((p) => [...p, data[0]]);
  };

  // Parole
  const updPAR = (i, f, v) => {
    setParole((p) => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n; });
    const id = parole[i]?.id;
    if (id) dbSave("parole", id, { [f === "user" ? "utilizator" : f]: v });
  };
  const delPAR = mkDel(setParole, "parole");
  const addPAR = async () => {
    const row = { platforma: "", cat: "Platformă", utilizator: "", parola: "", note: "" };
    const { data } = await sb.from("parole").insert(row).select();
    if (data) setParole((p) => [...p, { ...data[0], user: data[0].utilizator }]);
  };

  // Salariati
  const updSAL = (i, f, v) => {
    setSalRows((p) => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n; });
    dbSave("salariati", salRows[i]?.id, { [f]: v });
  };
  const delSAL = mkDel(setSalRows, "salariati");
  const addSAL = async () => {
    const row = { nume: "Nume Nou", functie: "", net: 0, taxe: 0, co: 21, ef: 0, conc: [] };
    const { data } = await sb.from("salariati").insert(row).select();
    if (data) setSalRows((p) => [...p, data[0]]);
  };
  const delConc = async (si, ci) => {
    const row = salRows[si];
    const conc = row.conc.filter((_, j) => j !== ci);
    const ef = conc.reduce((s, x) => s + x.zile, 0);
    setSalRows((p) => { const n = [...p]; n[si] = { ...n[si], conc, ef }; return n; });
    await sb.from("salariati").update({ conc, ef }).eq("id", row.id);
  };
  const addConc = async (si) => {
    const row = salRows[si];
    const conc = [...row.conc, { luna: concF.luna, zile: parseInt(concF.zile) || 1 }];
    const ef = conc.reduce((s, x) => s + x.zile, 0);
    setSalRows((p) => { const n = [...p]; n[si] = { ...n[si], conc, ef }; return n; });
    await sb.from("salariati").update({ conc, ef }).eq("id", row.id);
    setSelSal(null);
  };

  // Stoc manual
  const delManMisc = mkDel(setManMisc, "stoc_manual");
  const addManMisc = async () => {
    if (!newM.produs || !newM.cant) return;
    const fd = PRODUSE_LIST.find((p) => p.den === newM.produs);
    const row = { ...newM, cod: newM.cod || fd?.cod || "" };
    const { data } = await sb.from("stoc_manual").insert(row).select();
    if (data) setManMisc((p) => [...p, data[0]]);
    setNewM({ data: today(), tip: "intrare", produs: "", cod: "", cant: "", pu: "", sursa: "" });
  };

  // Salveaza borderou → registru
  const salveaza = async () => {
    const pr = b.produse.filter((p) => p.den && p.cant);
    if (!pr.length) { alert("Completați cel puțin un produs!"); return; }
    const newEntries = pr.map((p) => {
      const v = (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0);
      const imp = Math.round(v * 0.1), tx = Math.round(v * 0.02);
      return { serie: b.serie, nr: b.nr, data: b.data, furnizor: b.det, adresa: b.dom, cnp: b.cnp, denumire: p.den.toUpperCase(), cantitate: parseFloat(p.cant) || 0, pu: parseFloat(p.pret) || 0, valoare: Math.round(v - imp - tx) };
    });
    await sb.from("registru").insert(newEntries);
    alert(`✅ Borderou ${b.serie} ${b.nr} salvat!`);
    setBordSubTab("registru");
  };

  const handlePrint = () => {
    const c = printRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Borderou ${b.serie} ${b.nr}</title><style>body{margin:0;padding:16px;font-family:'Times New Roman',serif;}</style></head><body>${c}</body></html>`);
    w.document.close(); w.focus(); w.print();
  };

  // ── Print borderou din Registru ───────────────────────────
  const printRegistruBord = (serie, nr) => {
    const rows = registru.filter((r) => r.serie === serie && String(r.nr) === String(nr));
    if (!rows.length) return;
    const first = rows[0];
    const bord = {
      serie, nr,
      data: first.data || "",
      det: first.furnizor || "",
      dom: first.adresa || "",
      ci_s: "", ci_n: "", ci_e: "", ci_v: "",
      cnp: first.cnp || "",
      trans: "Auto",
      sursa: "alte",
      produse: rows.map((r) => {
        const fd = PRODUSE_LIST.find((p) => p.den === r.denumire || p.den.toUpperCase() === r.denumire);
        return {
          den: r.denumire || "",
          cod: fd?.cod || "",
          cant: r.cantitate || "",
          pret: r.pu || "",
        };
      }),
    };
    setPrintBord(bord);
    setTimeout(() => {
      if (regPrintRef.current) {
        const c = regPrintRef.current.innerHTML;
        const w = window.open("", "_blank");
        w.document.write(`<html><head><title>Borderou ${serie} ${nr}</title><style>body{margin:0;padding:16px;font-family:'Times New Roman',serif;}</style></head><body>${c}</body></html>`);
        w.document.close(); w.focus(); w.print();
      }
    }, 150);
  };

  // ── Scanare Buletin ───────────────────────────────────────
const scanBuletin = async (file) => {
  if (!file) return;
  setScanLoading(true);
  try {
    let base64, mediaType = "image/jpeg";

    if (file.type === "application/pdf") {
      if (!window.pdfjsLib) {
        await new Promise((res) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          s.onload = res;
          document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    } else {
      base64 = await new Promise((res, rej) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const maxW = 1024;
          const scale = Math.min(1, maxW / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          res(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
        };
        img.onerror = () => rej(new Error("Eroare citire imagine"));
        img.src = url;
      });
    }

    const resp = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: `Acesta este un buletin/carte de identitate românesc. Extrage datele și returnează DOAR JSON valid fără alt text:\n{"denumire":"Nume Prenume","cod_fiscal":"CNP 13 cifre","judet":"cod judet 2 litere","adresa":"adresa completa","reg_com":"seria+nr CI ex IF123456","inf_supl":"Eliberat de SPCLEP... - valabil DD.MM.YYYY"}` }
        ]}]
      })
    });
    const data = await resp.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    const text = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean.slice(clean.indexOf("{")));
    const codes = pfList.map(f => parseInt(f.cod) || 0);
    const cod = String((codes.length ? Math.max(...codes) : 0) + 1).padStart(5, "0");
    const row = { cod, denumire: parsed.denumire || "", cod_fiscal: parsed.cod_fiscal || "", analitic: `401.${cod}`, tara: "RO", judet: parsed.judet || "", adresa: parsed.adresa || "", reg_com: parsed.reg_com || "", inf_supl: parsed.inf_supl || "" };
    const { data: ins } = await sb.from("furnizori_pf").insert(row).select();
    if (ins) { setPfList(p => [...p, ins[0]]); alert(`✅ ${parsed.denumire} adăugat cu succes!`); }
  } catch (e) { alert("Eroare la scanare: " + e.message); }
  setScanLoading(false);
};

  // CUI search
  const searchCUI = async () => {
    const cui = cuiSearch.replace(/\D/g, "");
    if (!cui || cui.length < 4) { setCuiErr("CUI invalid."); return; }
    setCuiLoading(true); setCuiResult(null); setCuiErr("");
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 800, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `Cauta pe termene.ro firma cu CUI ${cui} Romania. Returneaza DOAR JSON: {"denumire":"","cod_fiscal":"RO${cui}","adresa":"","reg_com":"","judet":"","tel":""}` }] }) });
      const respText = await resp.text();
if (!respText || respText.trim() === "") throw new Error("Raspuns gol - verifica ANTHROPIC_API_KEY in Vercel");
let data;
try { data = JSON.parse(respText); } catch { throw new Error("Raspuns invalid: " + respText.slice(0, 150)); }
      const text = data.content?.filter((c) => c.type === "text").map((c) => c.text).join("") || "";
      try { const cl = text.replace(/```json|```/g, "").trim(); const idx = cl.indexOf("{"); setCuiResult(JSON.parse(idx >= 0 ? cl.slice(idx) : cl)); }
      catch { setCuiErr("Nu am găsit date pentru CUI-ul " + cui + "."); }
    } catch (e) { setCuiErr("Eroare: " + e.message); }
    setCuiLoading(false);
  };
  const importCUI = async () => {
    if (!cuiResult) return;
    const codes = pjList.map((f) => parseInt(f.cod) || 0);
    const cod = String((codes.length ? Math.max(...codes) : 0) + 1).padStart(5, "0");
    const row = { cod, denumire: cuiResult.denumire || "", cod_fiscal: cuiResult.cod_fiscal || "RO" + cuiSearch.replace(/\D/g, ""), analitic: `401.${cod}`, tara: "RO", judet: cuiResult.judet || "", adresa: cuiResult.adresa || "", cont_banca: "", banca: "", reg_com: cuiResult.reg_com || "", grupa: "", tel: cuiResult.tel || "" };
    const { data } = await sb.from("furnizori_pj").insert(row).select();
    if (data) setPjList((p) => [...p, data[0]]);
    setCuiResult(null); setCuiSearch("");
  };

  // Detinator fill from PF list
  const detFiltered = pfList.filter((f) => detSearch.length > 1 && (f.denumire?.toLowerCase().includes(detSearch.toLowerCase()) || f.cod_fiscal?.includes(detSearch) || f.cod?.includes(detSearch)));
  const fillDet = (f) => {
    setB((b) => ({ ...b, det: f.denumire, dom: f.adresa, ci_s: f.reg_com?.slice(0, 2) || "", ci_n: f.reg_com?.slice(2) || "", ci_e: f.inf_supl?.split("-")[0]?.trim() || "", ci_v: f.inf_supl?.split("-").slice(1).join("-").trim() || "", cnp: f.cod_fiscal || "" }));
    setDetSearch(f.denumire); setDetOpen(false);
  };

  // Stoc computed
  const getMiscari = () => {
    const r = [];
    colRows.forEach((x, i) => { if (!x.produs || !x.cant) return; const fd = PRODUSE_LIST.find((p) => p.den === x.produs); r.push({ id: `col-${i}`, data: x.data, tip: "intrare", produs: x.produs, cod: fd?.cod || "", cant: parseFloat(x.cant) || 0, pu: parseFloat(x.pret) || 0, sursa: `Colectare${x.agent ? " - " + x.agent : ""}` }); });
    registru.forEach((x, i) => { if (!x.denumire || !x.cantitate) return; const fd = PRODUSE_LIST.find((p) => p.den === x.denumire || p.den.toUpperCase() === x.denumire); r.push({ id: `bord-${i}`, data: x.data, tip: "intrare", produs: x.denumire, cod: fd?.cod || "", cant: parseFloat(x.cantitate) || 0, pu: parseFloat(x.pu) || 0, sursa: `Borderou ${x.serie} ${x.nr} - ${x.furnizor}` }); });
    livRows.forEach((x, i) => { if (!x.produs || !x.cant) return; const fd = PRODUSE_LIST.find((p) => p.den === x.produs); r.push({ id: `liv-${i}`, data: x.data, tip: "iesire", produs: x.produs, cod: fd?.cod || "", cant: parseFloat(x.cant) || 0, pu: parseFloat(x.pret) || 0, sursa: `Livrare ${x.client || ""} ${x.nr ? "nr." + x.nr : ""}`.trim() }); });
    manMisc.forEach((m) => r.push(m));
    return r;
  };
  const miscari = getMiscari();
  const stocAg = calcStoc(miscari);
  const stocFilt = stocAg.filter((r) => !stocFilter || r.produs.toLowerCase().includes(stocFilter.toLowerCase()) || r.cod.includes(stocFilter));
  const totStocVal = stocAg.reduce((s, r) => s + Math.max(0, r.cant) * r.pm, 0);
  const totStocKg = stocAg.reduce((s, r) => s + Math.max(0, r.cant), 0);

  // Calculator
  const updCost = (v) => { const c = parseFloat(v) || 0; setCostAl(v); setCalRows((p) => p.map((r) => calcRow(r, c))); };
  const updCal = (i, f, v) => setCalRows((p) => { const n = [...p]; const u = { ...n[i], [f]: v }; const pa = parseFloat(u.pa) || 0, pv = parseFloat(u.pv) || 0, cost = parseFloat(u.cost) || 0; u.marja = pv && pa ? +(pv - pa).toFixed(4) : 0; u.cant = u.marja > 0 ? +(cost / u.marja).toFixed(2) : 0; n[i] = u; return n; });

  // Datorii computed
  const numeUnici = [...new Set(datRows.map((r) => r.nume))];
  const filtDat = datRows.filter((r) => !datFilter || r.nume === datFilter);
  const totDat = filtDat.reduce((s, r) => s + (parseSuma(r.suma) || 0), 0);
  const totDatAll = datRows.reduce((s, r) => s + (parseSuma(r.suma) || 0), 0);

  // Avansuri computed
  const filtAv = avRows.filter((r) => (avTip === "toate" || r.tip === avTip) && (!avPers || r.catre === avPers));
  const totAvans = avRows.filter((r) => r.tip === "avans").reduce((s, r) => s + (parseSuma(r.suma) || 0), 0);
  const totDiv = avRows.filter((r) => r.tip === "dividend").reduce((s, r) => s + (parseSuma(r.suma) || 0), 0);
  const persList = [...new Set(avRows.map((r) => r.catre).filter(Boolean))];

  // Contracte computed
  const filtCT = contracte.filter((r) => !ctSearch || r.companie?.toLowerCase().includes(ctSearch.toLowerCase()) || r.nr?.includes(ctSearch) || r.detalii?.toLowerCase().includes(ctSearch.toLowerCase()));

  // Parole computed
  const filtParole = parole.filter((r) => {
    if (parolaCat !== "toate" && r.cat !== parolaCat) return false;
    if (parolaSearch && !(r.platforma?.toLowerCase().includes(parolaSearch.toLowerCase()) || r.user?.toLowerCase().includes(parolaSearch.toLowerCase()) || r.note?.toLowerCase().includes(parolaSearch.toLowerCase()))) return false;
    return true;
  });

  // PIN
  const checkPin = (pin) => {
    if (pin === PIN_CORRECT) { setPinUnlocked(true); setPinError(false); setPinInput(""); }
    else { setPinError(true); setPinInput(""); setTimeout(() => setPinError(false), 1500); }
  };

  // ── Render helpers ────────────────────────────────────────
  const tabSt = (name) => ({ padding: "7px 13px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderBottom: tab === name ? `3px solid ${G}` : "3px solid transparent", background: tab === name ? "#fff" : "#e8f0eb", color: tab === name ? G : "#555", borderRadius: "6px 6px 0 0", marginRight: 2, whiteSpace: "nowrap" });
  const subTabSt = (name) => ({ padding: "5px 13px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderBottom: bordSubTab === name ? `2px solid ${G}` : "2px solid transparent", background: bordSubTab === name ? "#f0faf4" : "transparent", color: bordSubTab === name ? G : "#666", marginRight: 3 });
  const SC = ({ label, value, c, bg }) => (<div style={{ flex: 1, minWidth: 120, background: bg, border: `1px solid ${c}33`, borderRadius: 8, padding: "7px 12px" }}><div style={{ fontSize: 10, color: "#666", marginBottom: 1 }}>{label}</div><div style={{ fontSize: 14, fontWeight: 700, color: c }}>{value}</div></div>);
  const AddBtn = ({ onClick, label, color = G }) => (<button onClick={onClick} style={{ marginTop: 10, background: color, color: "#fff", border: "none", borderRadius: 6, padding: "7px 15px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{label}</button>);
  const IBox = (label, f, ph = "") => (<div style={{ marginBottom: 7 }}><label style={LSt}>{label}</label><input style={IFS} value={b[f] || ""} onChange={(e) => updB(f, e.target.value)} placeholder={ph} /></div>);
  const regCols = [{ k: "serie", l: "Serie", w: 45 }, { k: "nr", l: "Nr", w: 65 }, { k: "data", l: "Data", w: 85 }, { k: "furnizor", l: "Furnizor", w: 150 }, { k: "cnp", l: "CNP", w: 110 }, { k: "denumire", l: "Denumire Deseu", w: 180 }, { k: "cantitate", l: "Cant.(kg)", w: 75 }, { k: "pu", l: "PU", w: 50 }, { k: "valoare", l: "Valoare", w: 65 }];

  // Group registru rows by serie+nr for print button display
  const bordGroupKeys = [...new Set(registru.map((r) => `${r.serie}__${r.nr}`))];

  return (
    <div style={{ fontFamily: "Segoe UI,sans-serif", background: "#f0f4f0", minHeight: "100vh", padding: 12 }}>

      {/* Hidden div for registru print */}
      <div ref={regPrintRef} style={{ display: "none" }}>
        {printBord && <BordPrint b={printBord} />}
      </div>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,#1b5e20,${G},#2e7d32)`, color: "#fff", borderRadius: "10px 10px 0 0", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#e8f5e9", letterSpacing: -0.5 }}>Green</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#4caf50", letterSpacing: -0.5 }}>kraft</span>
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>Tablou de Bord</div>
            <div style={{ fontSize: 10, opacity: 0.65 }}>S.C. GREEN KRAFT S.R.L. • CUI: 36191378</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, opacity: 0.8 }}><span>📍 Afumați, Jud. Ilfov</span><span>📋 Autorizație Mediu: 233/22.12.2021</span></div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#e8f0eb", borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", overflowX: "auto" }}>
        {[["borderou","📄 Borderouri"],["cheltuieli","💸 Cheltuieli"],["colectari","🚛 Colectări"],["livrari","📤 Livrări"],["stoc","📦 Stocuri"],["salariati","👷 Salariați"],["calculator","🧮 Calculator"],["datorii","💳 Datorii"],["avansuri","💵 Avansuri & Dividende"],["contracte","📃 Contracte"],["parole","🔐 Parole"]].map(([k, l]) => (
          <button key={k} style={tabSt(k)} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #ccc", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 14, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>

        {/* ══ BORDEROURI ══ */}
        {tab === "borderou" && (
          <div>
            <div style={{ display: "flex", borderBottom: "2px solid #e0e0e0", marginBottom: 12, flexWrap: "wrap", gap: 2 }}>
              <button style={subTabSt("editor")} onClick={() => setBordSubTab("editor")}>✏️ Editor</button>
              <button style={subTabSt("registru")} onClick={() => setBordSubTab("registru")}>📋 Registru <span style={{ marginLeft: 4, background: "#e53935", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{registru.length}</span></button>
              <button style={subTabSt("pf")} onClick={() => setBordSubTab("pf")}>👤 Pers. Fizice <span style={{ marginLeft: 4, background: "#1565c0", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{pfList.length}</span></button>
              <button style={subTabSt("pj")} onClick={() => setBordSubTab("pj")}>🏢 Pers. Juridice <span style={{ marginLeft: 4, background: "#e65100", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{pjList.length}</span></button>
            </div>

            {bordSubTab === "editor" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {borderouri.map((_, i) => (<button key={i} onClick={() => { setActiveBord(i); setPreviewMode(false); setDetSearch(borderouri[i].det || ""); }} style={{ padding: "4px 12px", border: `2px solid ${activeBord === i ? G : "#ccc"}`, borderRadius: 20, background: activeBord === i ? G : "#fff", color: activeBord === i ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{borderouri[i].serie} #{borderouri[i].nr || "nou"}</button>))}
                  <button onClick={() => { setBorderouri((p) => [...p, newBord("GK", registru)]); setActiveBord(borderouri.length); setPreviewMode(false); setDetSearch(""); }} style={{ padding: "4px 12px", border: "2px dashed #aaa", borderRadius: 20, background: "#f9f9f9", color: "#666", cursor: "pointer", fontSize: 12 }}>+ Borderou nou</button>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={salveaza} style={{ padding: "6px 14px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>💾 Salvează</button>
                    <button onClick={() => setPreviewMode((p) => !p)} style={{ padding: "6px 14px", background: previewMode ? "#1565c0" : G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{previewMode ? "✏️ Editare" : "👁️ Preview"}</button>
                    {previewMode && <button onClick={handlePrint} style={{ padding: "6px 14px", background: "#333", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🖨️ Print</button>}
                  </div>
                </div>
                {!previewMode && (
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: "0 0 296px", minWidth: 256 }}>
                      <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: G, marginBottom: 8, fontSize: 12 }}>📋 Date Borderou</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ flex: "0 0 85px" }}><label style={LSt}>Seria</label><select style={{ ...IFS, fontWeight: 700, color: G }} value={b.serie} onChange={(e) => updB("serie", e.target.value)}>{SERII.map((s) => <option key={s}>{s}</option>)}</select></div>
                          <div style={{ flex: 1 }}><label style={LSt}>Nr.</label><input style={{ ...IFS, fontWeight: 700, color: "#1565c0" }} value={b.nr} onChange={(e) => updB("nr", e.target.value)} /></div>
                          <div style={{ flex: 1 }}>{IBox("Data", "data")}</div>
                        </div>
                      </div>
                      <div style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: "#1565c0", marginBottom: 8, fontSize: 12 }}>👤 Date Deținător</div>
                        <div style={{ marginBottom: 8, position: "relative" }}>
                          <label style={LSt}>Caută în Furnizori Pers. Fizice</label>
                          <input style={{ ...IFS, borderColor: "#1565c0" }} value={detSearch} onChange={(e) => { setDetSearch(e.target.value); setDetOpen(true); }} onFocus={() => setDetOpen(true)} onBlur={() => setTimeout(() => setDetOpen(false), 200)} placeholder="Tastează nume, CNP sau cod..." />
                          {detOpen && detFiltered.length > 0 && (
                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999, background: "#fff", border: "1px solid #1565c0", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,.15)", maxHeight: 180, overflowY: "auto" }}>
                              {detFiltered.map((f, fi) => (<div key={fi} onMouseDown={() => fillDet(f)} style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", borderBottom: "1px solid #e3f2fd", display: "flex", gap: 8, alignItems: "center" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e3f2fd")} onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}><span style={{ background: "#1565c0", color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{f.cod}</span><span style={{ fontWeight: 600, flex: 1 }}>{f.denumire}</span><span style={{ color: "#888", fontSize: 10 }}>{f.cod_fiscal}</span></div>))}
                            </div>
                          )}
                          {b.det && <div style={{ marginTop: 4, background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, padding: "4px 10px", fontSize: 11, color: "#1565c0", display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between" }}><span>✅ <strong>{b.det}</strong> — {b.cnp}</span><button onMouseDown={() => { setDetSearch(""); setB((b) => ({ ...b, det: "", dom: "", ci_s: "", ci_n: "", ci_e: "", ci_v: "", cnp: "" })); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 12, padding: 0 }}>✕</button></div>}
                        </div>
                        {IBox("Nume complet", "det")}{IBox("Domiciliu / Adresă", "dom")}
                        <div style={{ display: "flex", gap: 6 }}><div style={{ flex: "0 0 68px" }}>{IBox("CI Seria", "ci_s", "IZ")}</div><div style={{ flex: 1 }}>{IBox("CI Nr.", "ci_n", "030452")}</div></div>
                        {IBox("Eliberată de", "ci_e")}{IBox("Valabilitate CI", "ci_v")}{IBox("CNP", "cnp")}
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Mijloc transport</label><select style={IFS} value={b.trans} onChange={(e) => updB("trans", e.target.value)}><option>Auto</option><option>Pietonal</option><option>Bicicletă</option></select></div>
                        <div><label style={LSt}>Sursa deșeurilor</label>
                          <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                            <label style={{ cursor: "pointer" }}><input type="radio" name="sursa" value="gospodarie" checked={b.sursa === "gospodarie"} onChange={(e) => updB("sursa", e.target.value)} /> Gospodărie</label>
                            <label style={{ cursor: "pointer" }}><input type="radio" name="sursa" value="alte" checked={b.sursa === "alte"} onChange={(e) => updB("sursa", e.target.value)} /> Alte surse</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: "#e65100", marginBottom: 8, fontSize: 12 }}>📦 Produse / Deșeuri</div>
                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                          <thead><tr><th style={th({ textAlign: "left", background: "#e65100", minWidth: 170 })}>Denumire</th><th style={th({ width: 85, background: "#e65100" })}>Cod HG 856</th><th style={th({ width: 80, background: "#e65100" })}>Cant.(kg)</th><th style={th({ width: 68, background: "#e65100" })}>Preț</th><th style={th({ width: 72, background: "#e65100" })}>Valoare</th><th style={th({ width: 26, background: "#e65100" })}></th></tr></thead>
                          <tbody>{b.produse.map((p, i) => { const v = (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0); return (<tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fffde7" }}><td style={td()}><AC value={p.den} options={PRODUSE} placeholder="Selectează..." onChange={(v) => updP(i, "den", v)} /></td><td style={td()}><input style={inp({ textAlign: "center" })} value={p.cod} onChange={(e) => updP(i, "cod", e.target.value)} /></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={p.cant} onChange={(e) => updP(i, "cant", e.target.value)} /></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={p.pret} onChange={(e) => updP(i, "pret", e.target.value)} /></td><td style={td({ textAlign: "right", fontWeight: 600, background: "#fff8e1" })}>{v > 0 ? fmt(v) : "—"}</td><td style={td({ textAlign: "center", padding: 2 })}><button onClick={() => setB((b) => ({ ...b, produse: b.produse.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                        </table>
                        <button onClick={() => setB((b) => ({ ...b, produse: [...b.produse, { den: "", cod: "", cant: "", pret: "" }] }))} style={{ marginTop: 6, background: "#e65100", color: "#fff", border: "none", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>+ Adaugă produs</button>
                      </div>
                      <div style={{ background: "#f3e5f5", border: "1px solid #ce93d8", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: "#6a1b9a", marginBottom: 8, fontSize: 12 }}>💰 Calcule Automate</div>
                        {[["Total brut", fmt(bTot) + " lei", "#333"], ["Impozit venit 10%", fmt(bImp) + " lei", "#c62828"], ["Taxa mediu 2%", fmt(bTax) + " lei", "#c62828"]].map(([l, v, c]) => (<div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "1px solid #e1bee7", fontSize: 13 }}><span>{l}</span><span style={{ fontWeight: 600, color: c }}>{v}</span></div>))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "#6a1b9a", borderRadius: 4, marginTop: 6, color: "#fff" }}><span style={{ fontWeight: 700, fontSize: 14 }}>REST DE PLATĂ</span><span style={{ fontWeight: 700, fontSize: 16 }}>{fmt(bRest)} lei</span></div>
                      </div>
                    </div>
                  </div>
                )}
                {previewMode && (<div ref={printRef} style={{ border: "1px solid #ccc", borderRadius: 4, padding: 8, background: "#fff" }}><BordPrint b={b} /></div>)}
              </div>
            )}

            {bordSubTab === "registru" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <SC label="Total" value={registru.length + " buc."} c={G} bg="#e8f5e9" />
                  <SC label="Cant." value={fmt(registru.reduce((s, r) => s + (parseFloat(r.cantitate) || 0), 0)) + " kg"} c="#1565c0" bg="#e3f2fd" />
                  <SC label="Valoare" value={fmt(registru.reduce((s, r) => s + (parseFloat(r.valoare) || 0), 0)) + " lei"} c="#6a1b9a" bg="#f3e5f5" />
                  <button onClick={() => setBordSubTab("editor")} style={{ marginLeft: "auto", padding: "6px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Borderou nou</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800 }}>
                    <thead><tr>{[{ l: "", w: 28 }, ...regCols, { l: "🖨️ Print", w: 70 }, { l: "", w: 30 }].map((c, i) => <th key={i} style={{ ...th({ background: G }), width: c.w }}>{c.l}</th>)}</tr></thead>
                    <tbody>{registru.map((r, i) => {
                      const rowBg = i % 2 === 0 ? "#fff" : "#f7faf8";
                      // Show print button only on first row of each serie+nr group
                      const key = `${r.serie}__${r.nr}`;
                      const isFirstInGroup = registru.findIndex((x) => x.serie === r.serie && String(x.nr) === String(r.nr)) === i;
                      const groupSize = registru.filter((x) => x.serie === r.serie && String(x.nr) === String(r.nr)).length;
                      return (
                        <tr key={r.id || i} style={{ background: rowBg }}>
                          <td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 133}</td>
                          {regCols.map((c) => (<td key={c.k} style={td({ background: c.k === "valoare" ? "#e8f5e9" : rowBg, textAlign: ["cantitate", "pu", "valoare"].includes(c.k) ? "right" : "left", fontWeight: c.k === "valoare" || c.k === "nr" ? 600 : 400, color: c.k === "valoare" ? G : "#333", whiteSpace: "nowrap", maxWidth: c.w + 20, overflow: "hidden", textOverflow: "ellipsis" })}>{["cantitate", "pu", "valoare"].includes(c.k) ? fmt(r[c.k]) : r[c.k]}</td>))}
                          <td style={td({ textAlign: "center", padding: 3 })}>
                            {isFirstInGroup && (
                              <button
                                onClick={() => printRegistruBord(r.serie, r.nr)}
                                title={`Printează borderou ${r.serie} ${r.nr}`}
                                style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, cursor: "pointer", color: "#1565c0", fontSize: 11, fontWeight: 700, padding: "2px 8px", whiteSpace: "nowrap" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#1565c0"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#e3f2fd"; e.currentTarget.style.color = "#1565c0"; }}
                              >🖨️ {groupSize > 1 ? `(${groupSize})` : ""}</button>
                            )}
                          </td>
                          <td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => sb.from("registru").delete().eq("id", r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                        </tr>
                      );
                    })}</tbody>
                    <tfoot><tr style={{ background: G, color: "#fff" }}><td></td><td colSpan={6} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(registru.reduce((s, r) => s + (parseFloat(r.cantitate) || 0), 0))}</td><td></td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(registru.reduce((s, r) => s + (parseFloat(r.valoare) || 0), 0))}</td><td></td><td></td></tr></tfoot>
                  </table>
                </div>
              </div>
            )}

            {bordSubTab === "pf" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <SC label="Total" value={pfList.length + " pers."} c="#1565c0" bg="#e3f2fd" />
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <input value={pfFilter} onChange={(e) => setPfFilter(e.target.value)} placeholder="🔍 Caută..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 180 }} />
                    <button onClick={addPF} style={{ padding: "6px 12px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă</button>
                    <button onClick={() => scanInputRef.current.click()} disabled={scanLoading} style={{ padding: "6px 12px", background: scanLoading ? "#ccc" : "#1565c0", color: "#fff", border: "none", borderRadius: 6, cursor: scanLoading ? "wait" : "pointer", fontSize: 12, fontWeight: 600 }}>{scanLoading ? "⏳ Scanez..." : "📷 Scanează Buletin"}</button>
                    <input ref={scanInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) scanBuletin(e.target.files[0]); e.target.value = ""; }} />
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 860 }}>
                    <thead><tr><th style={th({ width: 28, background: "#1565c0" })}></th>{[{ l: "Cod", w: 60 }, { l: "Denumire", w: 175 }, { l: "CNP", w: 125 }, { l: "Analitic", w: 85 }, { l: "Jud.", w: 48 }, { l: "Adresa", w: 185 }, { l: "CI", w: 85 }, { l: "Inf.Supl.", w: 175 }].map((c) => <th key={c.l} style={{ ...th({ background: "#1565c0" }), width: c.w, textAlign: "left" }}>{c.l}</th>)}<th style={th({ background: "#1565c0", width: 30 })}></th></tr></thead>
                    <tbody>{pfList.filter((r) => !pfFilter || r.denumire?.toLowerCase().includes(pfFilter.toLowerCase()) || r.cod?.includes(pfFilter) || r.cod_fiscal?.includes(pfFilter)).map((r, i) => { const rowBg = i % 2 === 0 ? "#fff" : "#f0f4ff"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: "#e3f2fd", fontWeight: 700, color: "#1565c0", textAlign: "center" })}><input style={inp({ textAlign: "center", fontWeight: 700, color: "#1565c0" })} value={r.cod || ""} onChange={(e) => updPF(i, "cod", e.target.value)} /></td><td style={td({ fontWeight: 600 })}><input style={inp({ fontWeight: 600 })} value={r.denumire || ""} onChange={(e) => updPF(i, "denumire", e.target.value)} /></td><td style={td({ background: "#fff8e1" })}><input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.cod_fiscal || ""} onChange={(e) => updPF(i, "cod_fiscal", e.target.value)} /></td><td style={td()}><input style={inp({ fontSize: 11 })} value={r.analitic || ""} onChange={(e) => updPF(i, "analitic", e.target.value)} /></td><td style={td({ background: "#e8f5e9", textAlign: "center", fontWeight: 600, color: G })}><input style={inp({ textAlign: "center", fontWeight: 600, color: G })} value={r.judet || ""} onChange={(e) => updPF(i, "judet", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.adresa || ""} onChange={(e) => updPF(i, "adresa", e.target.value)} /></td><td style={td({ fontFamily: "monospace", fontSize: 11 })}><input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.reg_com || ""} onChange={(e) => updPF(i, "reg_com", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.inf_supl || ""} onChange={(e) => updPF(i, "inf_supl", e.target.value)} /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delPF(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                  </table>
                </div>
              </div>
            )}

            {bordSubTab === "pj" && (
              <div>
                <div style={{ background: "linear-gradient(135deg,#fff3e0,#fff8f5)", border: "2px solid #ffcc80", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: "#e65100", fontSize: 13, marginBottom: 10 }}>🔍 Caută firmă după CUI</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ flex: "0 0 210px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input value={cuiSearch} onChange={(e) => { setCuiSearch(e.target.value); setCuiResult(null); setCuiErr(""); }} onKeyDown={(e) => e.key === "Enter" && searchCUI()} placeholder="ex: 36191378" style={{ ...IFS, borderColor: "#ffcc80", fontFamily: "monospace" }} />
                        <button onClick={searchCUI} disabled={cuiLoading} style={{ padding: "5px 12px", background: cuiLoading ? "#ccc" : "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: cuiLoading ? "wait" : "pointer", fontSize: 12, fontWeight: 700 }}>{cuiLoading ? "⏳" : "🔎"}</button>
                      </div>
                      {cuiErr && <div style={{ marginTop: 5, background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 5, padding: "5px 8px", fontSize: 11, color: "#c62828" }}>{cuiErr}</div>}
                    </div>
                    {cuiResult && !cuiLoading && (<div style={{ flex: 1, minWidth: 260, background: "#fff", border: "2px solid #a5d6a7", borderRadius: 8, padding: 10 }}><div style={{ fontWeight: 700, color: G, fontSize: 12, marginBottom: 6 }}>✅ Date găsite</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", fontSize: 12 }}>{[["Denumire", cuiResult.denumire], ["CUI", cuiResult.cod_fiscal], ["Adresă", cuiResult.adresa], ["Reg.Com.", cuiResult.reg_com], ["Județ", cuiResult.judet], ["Tel.", cuiResult.tel]].map(([l, v]) => v ? (<div key={l}><span style={{ color: "#888", fontSize: 10 }}>{l}: </span><strong>{v}</strong></div>) : null)}</div><div style={{ display: "flex", gap: 8, marginTop: 8 }}><button onClick={importCUI} style={{ padding: "6px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇️ Importă</button><button onClick={() => setCuiResult(null)} style={{ padding: "6px 10px", background: "#f5f5f5", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✕</button></div></div>)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <SC label="Total Firme" value={pjList.length + " firme"} c="#e65100" bg="#fff3e0" />
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <input value={pjFilter} onChange={(e) => setPjFilter(e.target.value)} placeholder="🔍 Caută..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 180 }} />
                    <button onClick={addPJ} style={{ padding: "6px 12px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
                    <thead><tr><th style={th({ background: "#b71c1c", width: 28 })}></th>{[{ l: "Cod", w: 55 }, { l: "Denumire", w: 185 }, { l: "CUI", w: 105 }, { l: "Analitic", w: 82 }, { l: "Jud.", w: 45 }, { l: "Adresa", w: 180 }, { l: "Cont Bancă", w: 165 }, { l: "Bancă", w: 130 }, { l: "Reg.Com.", w: 100 }, { l: "Tel.", w: 90 }].map((c) => <th key={c.l} style={{ ...th({ background: "#e65100" }), width: c.w, textAlign: "left" }}>{c.l}</th>)}<th style={th({ background: "#e65100", width: 30 })}></th></tr></thead>
                    <tbody>{pjList.filter((r) => !pjFilter || r.denumire?.toLowerCase().includes(pjFilter.toLowerCase()) || r.cod?.includes(pjFilter) || r.cod_fiscal?.toLowerCase().includes(pjFilter.toLowerCase())).map((r, i) => { const rowBg = i % 2 === 0 ? "#fff" : "#fff8f5"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: "#fff3e0", fontWeight: 700, color: "#e65100", textAlign: "center" })}><input style={inp({ textAlign: "center", fontWeight: 700, color: "#e65100" })} value={r.cod || ""} onChange={(e) => updPJ(i, "cod", e.target.value)} /></td><td style={td({ fontWeight: 600 })}><input style={inp({ fontWeight: 600, fontSize: 11 })} value={r.denumire || ""} onChange={(e) => updPJ(i, "denumire", e.target.value)} /></td><td style={td({ background: "#fff8e1" })}><input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.cod_fiscal || ""} onChange={(e) => updPJ(i, "cod_fiscal", e.target.value)} /></td><td style={td()}><input style={inp({ fontSize: 11 })} value={r.analitic || ""} onChange={(e) => updPJ(i, "analitic", e.target.value)} /></td><td style={td({ background: "#e8f5e9", textAlign: "center", fontWeight: 600, color: G })}><input style={inp({ textAlign: "center", fontWeight: 600, color: G })} value={r.judet || ""} onChange={(e) => updPJ(i, "judet", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.adresa || ""} onChange={(e) => updPJ(i, "adresa", e.target.value)} /></td><td style={td({ background: r.cont_banca ? "#e8f5e9" : "#fff", fontFamily: "monospace", fontSize: 10 })}><input style={inp({ fontFamily: "monospace", fontSize: 10 })} value={r.cont_banca || ""} onChange={(e) => updPJ(i, "cont_banca", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.banca || ""} onChange={(e) => updPJ(i, "banca", e.target.value)} /></td><td style={td({ fontFamily: "monospace", fontSize: 11 })}><input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.reg_com || ""} onChange={(e) => updPJ(i, "reg_com", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.tel || ""} onChange={(e) => updPJ(i, "tel", e.target.value)} /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delPJ(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CHELTUIELI ══ */}
        {tab === "cheltuieli" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total" value={fmt(chRows.reduce((s, r) => s + parseSuma(r.suma), 0)) + " lei"} c="#1565c0" bg="#e3f2fd" />
              <SC label="✅ Achitat" value={fmt(chRows.filter((r) => r.ach === "Da").reduce((s, r) => s + parseSuma(r.suma), 0)) + " lei"} c={G} bg="#e8f5e9" />
              <SC label="⏳ Neachitat" value={fmt(chRows.filter((r) => r.ach === "Nu").reduce((s, r) => s + parseSuma(r.suma), 0)) + " lei"} c="#c62828" bg="#ffebee" />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
                <thead><tr><th style={th({ width: 28 })}></th>{["Data", "Greenkraft/Deee", "Suma(lei)", "Categorie", "Detalii", "Achitat", "Achitat De", "Note"].map((h, ci) => <th key={ci} style={th({ textAlign: ci === 2 ? "right" : "left" })}>{h}</th>)}<th style={th({ width: 28 })}></th></tr></thead>
                <tbody>{chRows.map((r, i) => { const rowBg = i % 2 === 0 ? "#fff" : "#f7faf8"; const achBg = r.ach === "Da" ? "#e8f5e9" : r.ach === "Nu" ? "#fff8e1" : "#fff"; const achC = r.ach === "Da" ? G : r.ach === "Nu" ? "#e65100" : "#555"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: rowBg })}><input style={inp()} value={r.data || ""} onChange={(e) => updCH(i, "data", e.target.value)} /></td><td style={td({ background: "#fffde7" })}><select style={sel()} value={r.gk || ""} onChange={(e) => updCH(i, "gk", e.target.value)}>{GREENKRAFT_OPT.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} value={r.suma || ""} onChange={(e) => updCH(i, "suma", e.target.value)} /></td><td style={td({ background: "#fffde7" })}><select style={sel()} value={r.cat || ""} onChange={(e) => updCH(i, "cat", e.target.value)}>{CATEGORIE_CH.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ background: rowBg })}><input style={inp()} value={r.det || ""} onChange={(e) => updCH(i, "det", e.target.value)} /></td><td style={td({ background: achBg })}><select style={sel({ color: achC, fontWeight: 700 })} value={r.ach || ""} onChange={(e) => updCH(i, "ach", e.target.value)}><option value=""></option><option>Da</option><option>Nu</option></select></td><td style={td({ background: "#fffde7" })}><select style={sel()} value={r.ach_de || ""} onChange={(e) => updCH(i, "ach_de", e.target.value)}><option value=""></option>{ACHITAT_DE_OPT.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ background: rowBg })}><input style={inp()} value={r.note || ""} onChange={(e) => updCH(i, "note", e.target.value)} /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delCH(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td></td><td colSpan={2} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(chRows.reduce((s, r) => s + parseSuma(r.suma), 0))}</td><td colSpan={5}></td><td></td></tr></tfoot>
              </table>
            </div>
            <AddBtn onClick={addCH} label="+ Adaugă cheltuială" />
          </div>
        )}

        {/* ══ COLECTARI ══ */}
        {tab === "colectari" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total Cant." value={fmt(colRows.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0)) + " kg"} c="#1565c0" bg="#e3f2fd" />
              <SC label="Total Valoare" value={fmt(colRows.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0)) + " lei"} c={G} bg="#e8f5e9" />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800 }}>
                <thead><tr><th style={th({ width: 28 })}></th><th style={th({ width: 80 })}>Data</th><th style={th({ width: 82 })}>Agent</th><th style={th({ width: 90 })}>Furnizor</th><th style={th({ width: 68 })}>Cat.</th><th style={th({ minWidth: 160 })}>Produs</th><th style={th({ width: 78 })}>Cant.(kg)</th><th style={th({ width: 62 })}>Preț</th><th style={th({ width: 78 })}>Total</th><th style={th({ width: 88 })}>Fără Imp.12%</th><th style={th({ width: 72 })}>Achitat</th><th style={th({ width: 78 })}>Achitat De</th><th style={th({ width: 28 })}></th></tr></thead>
                <tbody>{colRows.map((r, i) => { const tot = (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0); const faraImp = tot ? +(tot * 0.88).toFixed(2) : 0; const rowBg = i % 2 === 0 ? "#fff" : "#f8fbf9"; const achBg = r.ach === "Da" ? "#e8f5e9" : r.ach === "Nu" ? "#fff8e1" : "#fff"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: rowBg })}><input style={inp()} value={r.data || ""} onChange={(e) => updCOL(i, "data", e.target.value)} /></td><td style={td({ background: rowBg })}><select style={sel()} value={r.agent || ""} onChange={(e) => updCOL(i, "agent", e.target.value)}><option value=""></option>{AGENTI.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ background: rowBg })}><input style={inp()} value={r.furn || ""} onChange={(e) => updCOL(i, "furn", e.target.value)} placeholder="—" /></td><td style={td({ background: COL_COLORS[r.cat] || "#eee", textAlign: "center" })}><select style={sel({ fontWeight: 600 })} value={r.cat || ""} onChange={(e) => updCOL(i, "cat", e.target.value)}>{CATEGORIE_COL.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ background: rowBg })}><AC value={r.produs || ""} options={PRODUSE} onChange={(v) => updCOL(i, "produs", v)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.cant || ""} onChange={(e) => updCOL(i, "cant", e.target.value)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.pret || ""} onChange={(e) => updCOL(i, "pret", e.target.value)} /></td><td style={td({ textAlign: "right", background: "#f0f4f0", fontWeight: 600 })}>{tot > 0 ? fmt(tot) : "0,00"}</td><td style={td({ textAlign: "right", background: "#fce4d6", fontWeight: 600, color: "#bf360c" })}>{faraImp > 0 ? fmt(faraImp) : "0,00"}</td><td style={td({ background: achBg })}><select style={sel({ color: r.ach === "Da" ? G : r.ach === "Nu" ? "#e65100" : "#555", fontWeight: 700 })} value={r.ach || ""} onChange={(e) => updCOL(i, "ach", e.target.value)}><option value=""></option><option>Da</option><option>Nu</option></select></td><td style={td({ background: r.ach_de ? "#ffe0b2" : "#fff" })}><select style={sel({ color: r.ach_de ? "#e65100" : "#aaa", fontWeight: r.ach_de ? 700 : 400 })} value={r.ach_de || ""} onChange={(e) => updCOL(i, "ach_de", e.target.value)}><option value=""></option>{ACHITAT_DE_OPT.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delCOL(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={6} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(colRows.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0))} kg</td><td></td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(colRows.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0))}</td><td colSpan={4}></td></tr></tfoot>
              </table>
            </div>
            <AddBtn onClick={addCOL} label="+ Adaugă colectare" />
          </div>
        )}

        {/* ══ LIVRARI ══ */}
        {tab === "livrari" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total Cant." value={fmt(livRows.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0)) + " kg"} c="#1565c0" bg="#e3f2fd" />
              <SC label="Total Valoare" value={fmt(livRows.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0)) + " lei"} c={G} bg="#e8f5e9" />
              <SC label="✅ Încasat" value={fmt(livRows.filter((r) => r.inc === "DA").reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0)) + " lei"} c="#2e7d32" bg="#c8e6c9" />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", minWidth: 720 }}>
                <colgroup><col style={{ width: 28 }} /><col style={{ width: 82 }} /><col style={{ width: 52 }} /><col style={{ width: 115 }} /><col /><col style={{ width: 78 }} /><col style={{ width: 62 }} /><col style={{ width: 85 }} /><col style={{ width: 68 }} /><col style={{ width: 68 }} /><col style={{ width: 150 }} /><col style={{ width: 28 }} /></colgroup>
                <thead><tr><th style={th({})}></th><th style={th({})}>Data</th><th style={th({})}>Nr.</th><th style={th({})}>Client</th><th style={th({ textAlign: "left" })}>Produs</th><th style={th({})}>Cant.(kg)</th><th style={th({})}>Preț</th><th style={th({})}>Total(lei)</th><th style={th({})}>Facturat</th><th style={th({})}>Încasat</th><th style={th({ textAlign: "left" })}>Detalii</th><th style={th({})}></th></tr></thead>
                <tbody>{livRows.map((r, i) => { const tot = (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0); const rowBg = i % 2 === 0 ? "#fff" : "#f8fbf9"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: rowBg })}><input style={inp()} value={r.data || ""} onChange={(e) => updLIV(i, "data", e.target.value)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "center" })} value={r.nr || ""} onChange={(e) => updLIV(i, "nr", e.target.value)} /></td><td style={td({ background: "#fffde7" })}><select style={sel()} value={r.client || ""} onChange={(e) => updLIV(i, "client", e.target.value)}><option value=""></option>{CLIENTI.map((o) => <option key={o}>{o}</option>)}</select></td><td style={{ ...td({ background: rowBg }), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.produs}><AC value={r.produs || ""} options={PRODUSE} onChange={(v) => updLIV(i, "produs", v)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.cant || ""} onChange={(e) => updLIV(i, "cant", e.target.value)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.pret || ""} onChange={(e) => updLIV(i, "pret", e.target.value)} /></td><td style={td({ textAlign: "right", background: "#f0f4f0", fontWeight: 600 })}>{tot > 0 ? fmt(tot) : "0,00"}</td><td style={td({ background: r.fact === "DA" ? "#e8f5e9" : "#fff", textAlign: "center" })}><select style={sel({ color: r.fact === "DA" ? G : "#555", fontWeight: 700 })} value={r.fact || ""} onChange={(e) => updLIV(i, "fact", e.target.value)}><option value=""></option><option>DA</option><option>NU</option></select></td><td style={td({ background: r.inc === "DA" ? "#c8e6c9" : r.inc === "NU" ? "#ffebee" : "#fff", textAlign: "center" })}><select style={sel({ color: r.inc === "DA" ? G : r.inc === "NU" ? "#c62828" : "#555", fontWeight: 700 })} value={r.inc || ""} onChange={(e) => updLIV(i, "inc", e.target.value)}><option value=""></option><option>DA</option><option>NU</option></select></td><td style={{ ...td({ background: rowBg }), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.det}><input style={inp()} value={r.det || ""} onChange={(e) => updLIV(i, "det", e.target.value)} placeholder="..." /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delLIV(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={5} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(livRows.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0))} kg</td><td></td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(livRows.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0))}</td><td colSpan={4}></td></tr></tfoot>
              </table>
            </div>
            <AddBtn onClick={addLIV} label="+ Adaugă livrare" />
          </div>
        )}

        {/* ══ STOCURI ══ */}
        {tab === "stoc" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <SC label="Produse în stoc" value={stocAg.filter((r) => r.cant > 0).length + " tipuri"} c={G} bg="#e8f5e9" />
              <SC label="Total Cantitate" value={fmt(totStocKg) + " kg"} c="#1565c0" bg="#e3f2fd" />
              <SC label="Valoare estimată" value={fmt(totStocVal) + " lei"} c="#6a1b9a" bg="#f3e5f5" />
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <input value={stocFilter} onChange={(e) => setStocFilter(e.target.value)} placeholder="🔍 Caută..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 160 }} />
                <button onClick={() => setShowMisc((p) => !p)} style={{ padding: "6px 12px", background: showMisc ? "#1565c0" : "#e3f2fd", color: showMisc ? "#fff" : "#1565c0", border: "1px solid #90caf9", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{showMisc ? "📊 Stoc" : "📋 Mișcări"}</button>
              </div>
            </div>
            {!showMisc && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                  <thead><tr><th style={th({ width: 28 })}>#</th><th style={th({ textAlign: "left", minWidth: 190 })}>Produs</th><th style={th({ width: 90 })}>Cod HG 856</th><th style={th({ width: 105 })}>Intrat (kg)</th><th style={th({ width: 105 })}>Ieșit (kg)</th><th style={{ ...th({ width: 115 }), background: "#0d4a2a" }}>Stoc Curent</th><th style={th({ width: 100 })}>Preț Mediu</th><th style={{ ...th({ width: 115 }), background: "#6a1b9a" }}>Val. Stoc (lei)</th><th style={th({ width: 95 })}>Ultima misc.</th></tr></thead>
                  <tbody>
                    {stocFilt.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Niciun produs. Adaugă colectări sau borderouri.</td></tr>}
                    {stocFilt.map((r, i) => { const vs = Math.max(0, r.cant) * r.pm; const alert = r.cant <= 0; const rowBg = alert ? "#fff8f8" : i % 2 === 0 ? "#fff" : "#f8fbf9"; return (<tr key={i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 1}</td><td style={td({ background: rowBg, fontWeight: 600, color: alert ? "#c62828" : G })}>{alert && "⚠️ "}{r.produs}</td><td style={td({ background: rowBg, textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.cod}</td><td style={td({ background: "#e8f5e9", textAlign: "right", color: G, fontWeight: 600 })}>{fmt(r.intrari)}</td><td style={td({ background: "#ffebee", textAlign: "right", color: "#c62828", fontWeight: 600 })}>{fmt(r.iesiri)}</td><td style={td({ background: alert ? "#ffcdd2" : "#d4edda", textAlign: "right", fontWeight: 700, fontSize: 13, color: alert ? "#c62828" : "#0d4a2a" })}>{fmt(Math.max(0, r.cant))}</td><td style={td({ background: rowBg, textAlign: "right" })}>{fmt(r.pm, 4)}</td><td style={td({ background: "#f3e5f5", textAlign: "right", fontWeight: 700, color: "#6a1b9a" })}>{fmt(vs)}</td><td style={td({ background: rowBg, textAlign: "center", fontSize: 11, color: "#888" })}>{r.data}</td></tr>); })}
                  </tbody>
                  <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={3} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(stocAg.reduce((s, r) => s + r.intrari, 0))}</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(stocAg.reduce((s, r) => s + r.iesiri, 0))}</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(totStocKg)}</td><td></td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(totStocVal)}</td><td></td></tr></tfoot>
                </table>
                <div style={{ marginTop: 10, background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: G }}>💡 <strong>Actualizare automată:</strong> Colectările + Borderourile = intrări ⬆️ &nbsp;|&nbsp; Livrările = ieșiri ⬇️</div>
              </div>
            )}
            {showMisc && (
              <div>
                <div style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: G, fontSize: 12, marginBottom: 8 }}>+ Adaugă mișcare manuală</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div><label style={LSt}>Data</label><input value={newM.data} onChange={(e) => setNewM((p) => ({ ...p, data: e.target.value }))} style={{ ...IFS, width: 90 }} /></div>
                    <div><label style={LSt}>Tip</label><select value={newM.tip} onChange={(e) => setNewM((p) => ({ ...p, tip: e.target.value }))} style={{ ...IFS, width: 90, color: newM.tip === "intrare" ? G : "#c62828", fontWeight: 700 }}><option value="intrare">⬆ Intrare</option><option value="iesire">⬇ Ieșire</option></select></div>
                    <div style={{ flex: "0 0 180px" }}><label style={LSt}>Produs</label><select value={newM.produs} onChange={(e) => { const fd = PRODUSE_LIST.find((p) => p.den === e.target.value); setNewM((p) => ({ ...p, produs: e.target.value, cod: fd?.cod || "" })); }} style={IFS}><option value=""></option>{PRODUSE.map((p) => <option key={p}>{p}</option>)}</select></div>
                    <div><label style={LSt}>Cant.(kg)</label><input type="number" value={newM.cant} onChange={(e) => setNewM((p) => ({ ...p, cant: e.target.value }))} style={{ ...IFS, width: 80, textAlign: "right" }} /></div>
                    <div><label style={LSt}>Preț/kg</label><input type="number" value={newM.pu} onChange={(e) => setNewM((p) => ({ ...p, pu: e.target.value }))} style={{ ...IFS, width: 72, textAlign: "right" }} /></div>
                    <div style={{ flex: 1, minWidth: 120 }}><label style={LSt}>Sursă</label><input value={newM.sursa} onChange={(e) => setNewM((p) => ({ ...p, sursa: e.target.value }))} style={IFS} placeholder="Ajustare stoc..." /></div>
                    <button onClick={addManMisc} style={{ padding: "5px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 1 }}>+ Adaugă</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                    <thead><tr><th style={th({ width: 28 })}>#</th><th style={th({ width: 82 })}>Data</th><th style={th({ width: 72 })}>Tip</th><th style={th({ minWidth: 170 })}>Produs</th><th style={th({ width: 78 })}>Cod</th><th style={th({ width: 80 })}>Cant.(kg)</th><th style={th({ width: 78 })}>Preț/kg</th><th style={th({ width: 80 })}>Valoare</th><th style={th({ minWidth: 150 })}>Sursă</th><th style={th({ width: 28 })}></th></tr></thead>
                    <tbody>{[...miscari].reverse().map((r, i) => { const v = (parseFloat(r.cant) || 0) * (parseFloat(r.pu) || 0); const isIn = r.tip === "intrare"; const isCol = String(r.id).startsWith("col-"); const isBord = String(r.id).startsWith("bord-"); const isLiv = String(r.id).startsWith("liv-"); const isMan = String(r.id).startsWith("man-"); const rowBg = isCol ? "#f0fff4" : isBord ? "#fffde7" : isLiv ? "#fff5f5" : "#f0f4ff"; const badge = isCol ? { bg: "#c6efce", c: G, l: "🚛" } : isBord ? { bg: "#fff2cc", c: "#e65100", l: "📄" } : isLiv ? { bg: "#fce4d6", c: "#c62828", l: "📤" } : { bg: "#e3f2fd", c: "#1565c0", l: "✏️" }; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{miscari.length - i}</td><td style={td({ background: rowBg, textAlign: "center", fontSize: 11 })}>{r.data}</td><td style={td({ background: isIn ? "#e8f5e9" : "#ffebee", textAlign: "center", fontWeight: 700, color: isIn ? G : "#c62828" })}>{isIn ? "⬆" : "⬇"} {isIn ? "Intrare" : "Ieșire"}</td><td style={td({ background: rowBg, fontSize: 11 })}>{r.produs}</td><td style={td({ background: rowBg, textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.cod}</td><td style={td({ background: rowBg, textAlign: "right", fontWeight: 600, color: isIn ? G : "#c62828" })}>{isIn ? "+" : "-"}{fmt(r.cant)}</td><td style={td({ background: rowBg, textAlign: "right" })}>{fmt(r.pu, 4)}</td><td style={td({ background: rowBg, textAlign: "right", fontWeight: 600 })}>{fmt(v)}</td><td style={td({ background: rowBg, fontSize: 11 })}><span style={{ background: badge.bg, color: badge.c, borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 700, marginRight: 5 }}>{badge.l}</span>{r.sursa}</td><td style={td({ textAlign: "center", padding: 3 })}>{isMan ? <button onClick={() => delManMisc(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button> : <span style={{ color: "#ccc", fontSize: 11 }} title="Modifică din sursa originală">🔒</span>}</td></tr>); })}</tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SALARIATI ══ */}
        {tab === "salariati" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total Salarii Nete" value={fmt(salRows.reduce((s, r) => s + (parseFloat(r.net) || 0), 0)) + " lei"} c={G} bg="#e8f5e9" />
              <SC label="Total Taxe Stat" value={fmt(salRows.reduce((s, r) => s + (parseFloat(r.taxe) || 0), 0)) + " lei"} c="#c62828" bg="#ffebee" />
              <SC label="Total Cost Brut" value={fmt(salRows.reduce((s, r) => s + (parseFloat(r.net) || 0) + (parseFloat(r.taxe) || 0), 0)) + " lei"} c="#1565c0" bg="#e3f2fd" />
            </div>
            <div style={{ overflowX: "auto", marginBottom: 12 }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                <thead><tr><th style={th({ width: 28 })}>#</th><th style={th({ textAlign: "left", width: 115 })}>Nume</th><th style={th({ width: 105 })}>Funcție</th><th style={th({ width: 100 })}>Salariu Net</th><th style={th({ width: 92 })}>Taxe Stat</th><th style={th({ width: 92 })}>Cost Brut</th><th style={th({ width: 72 })}>Zile CO</th><th style={th({ width: 72 })}>Efectuate</th><th style={th({ width: 72 })}>Rămase</th><th style={th({ width: 82 })}>Concedii</th><th style={th({ width: 28 })}></th></tr></thead>
                <tbody>{salRows.map((r, i) => { const brut = (parseFloat(r.net) || 0) + (parseFloat(r.taxe) || 0); const ramase = (parseInt(r.co) || 0) - (parseInt(r.ef) || 0); const rowBg = i % 2 === 0 ? "#fff" : "#f8fbf9"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#888", fontSize: 11, background: "#f5f5f5" })}>{i + 1}</td><td style={td({ background: rowBg, fontWeight: 600 })}><input style={inp({ fontWeight: 600 })} value={r.nume || ""} onChange={(e) => updSAL(i, "nume", e.target.value)} /></td><td style={td({ background: "#fffde7" })}><input style={inp()} value={r.functie || ""} onChange={(e) => updSAL(i, "functie", e.target.value)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.net || ""} onChange={(e) => updSAL(i, "net", e.target.value)} /></td><td style={td({ background: "#ffebee" })}><input style={inp({ textAlign: "right", color: "#c62828" })} type="number" value={r.taxe || ""} onChange={(e) => updSAL(i, "taxe", e.target.value)} /></td><td style={td({ textAlign: "right", background: "#e3f2fd", fontWeight: 600, color: "#1565c0" })}>{fmt(brut)}</td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "center" })} type="number" value={r.co || ""} onChange={(e) => updSAL(i, "co", e.target.value)} /></td><td style={td({ textAlign: "center", background: "#fff8e1", color: "#e65100", fontWeight: 600 })}>{r.ef}</td><td style={td({ textAlign: "center", background: ramase < 5 ? "#ffebee" : "#e8f5e9", color: ramase < 5 ? "#c62828" : G, fontWeight: 700 })}>{ramase}</td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => setSelSal(selSal === i ? null : i)} style={{ background: selSal === i ? G : "#e8f5e9", color: selSal === i ? "#fff" : G, border: `1px solid ${G}`, borderRadius: 4, padding: "2px 7px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{(r.conc || []).length > 0 ? `${r.conc.length} per.` : "+ Add"}</button></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delSAL(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={3} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(salRows.reduce((s, r) => s + (parseFloat(r.net) || 0), 0))}</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(salRows.reduce((s, r) => s + (parseFloat(r.taxe) || 0), 0))}</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(salRows.reduce((s, r) => s + (parseFloat(r.net) || 0) + (parseFloat(r.taxe) || 0), 0))}</td><td colSpan={5}></td></tr></tfoot>
              </table>
            </div>
            {selSal !== null && salRows[selSal] && (
              <div style={{ background: "#f9f9f9", border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: G, marginBottom: 8 }}>📅 Concedii — {salRows[selSal].nume}</div>
                {(salRows[selSal].conc || []).length > 0 ? (<table style={{ borderCollapse: "collapse", marginBottom: 10, maxWidth: 300 }}><thead><tr><th style={th({ width: 100 })}>Lună</th><th style={th({ width: 90 })}>Zile</th><th style={th({ width: 36 })}></th></tr></thead><tbody>{(salRows[selSal].conc || []).map((c, ci) => (<tr key={ci}><td style={td({ textAlign: "center", background: "#e8f5e9" })}>{LUNI[c.luna]}</td><td style={td({ textAlign: "center", fontWeight: 600 })}>{c.zile} zile</td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delConc(selSal, ci)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>))}</tbody></table>) : <div style={{ color: "#aaa", fontSize: 12, marginBottom: 8 }}>Nicio perioadă înregistrată.</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Adaugă:</span>
                  <select style={{ border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px", fontSize: 12 }} value={concF.luna} onChange={(e) => setConcF((f) => ({ ...f, luna: parseInt(e.target.value) }))}>{LUNI.map((l, li) => <option key={li} value={li}>{l}</option>)}</select>
                  <input type="number" min={1} max={30} value={concF.zile} onChange={(e) => setConcF((f) => ({ ...f, zile: e.target.value }))} style={{ width: 50, border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px", fontSize: 12, textAlign: "center" }} />
                  <span style={{ fontSize: 12 }}>zile</span>
                  <button onClick={() => addConc(selSal)} style={{ background: G, color: "#fff", border: "none", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓ Adaugă</button>
                </div>
              </div>
            )}
            <AddBtn onClick={addSAL} label="+ Adaugă angajat" />
          </div>
        )}

        {/* ══ CALCULATOR ══ */}
        {tab === "calculator" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: G }}>💰 Cost alocat (lei):</label>
                <input type="number" value={costAl} onChange={(e) => updCost(e.target.value)} style={{ width: 110, padding: "4px 8px", borderRadius: 4, border: "1px solid #a5d6a7", fontSize: 14, fontWeight: 700, textAlign: "right", color: G }} />
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead><tr><th style={th({ width: 28 })}>#</th><th style={th({ textAlign: "left" })}>Material</th><th style={th()}>Cost Alocat</th><th style={th()}>Preț Ach.(lei/kg)</th><th style={th()}>Preț Vânz.(lei/kg)</th><th style={{ ...th(), background: "#155a35" }}>Marjă</th><th style={{ ...th(), background: "#0d4a2a" }}>Cantitate(kg)</th><th style={th({ width: 28 })}></th></tr></thead>
                <tbody>{calRows.map((r, i) => (<tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fbf9" }}><td style={td({ textAlign: "center", color: "#999" })}>{i + 1}</td><td style={td()}><input style={inp()} value={r.material} onChange={(e) => updCal(i, "material", e.target.value)} /></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={r.cost} onChange={(e) => updCal(i, "cost", e.target.value)} /></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={r.pa} onChange={(e) => updCal(i, "pa", e.target.value)} /></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={r.pv} onChange={(e) => updCal(i, "pv", e.target.value)} /></td><td style={td({ textAlign: "right", background: "#e8f5e9", color: r.marja > 0 ? G : "#c62828", fontWeight: 600 })}>{r.marja !== 0 ? fmt(r.marja) : "—"}</td><td style={td({ textAlign: "right", background: "#d4edda", fontWeight: 700, color: "#0d4a2a" })}>{r.cant > 0 ? fmt(r.cant) : "—"}</td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => setCalRows((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>))}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={6} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(calRows.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0))} kg</td><td></td></tr></tfoot>
              </table>
            </div>
            <AddBtn onClick={() => setCalRows((p) => [...p, calcRow({ material: "", pa: "", pv: "" }, parseFloat(costAl) || 0)])} label="+ Adaugă material" />
          </div>
        )}

        {/* ══ DATORII ══ */}
        {tab === "datorii" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <SC label="Total Datorii" value={fmt(totDatAll) + " lei"} c="#c62828" bg="#ffebee" />
              {numeUnici.map((n) => { const tot = datRows.filter((r) => r.nume === n).reduce((s, r) => s + (parseSuma(r.suma) || 0), 0); return <SC key={n} label={n} value={fmt(tot) + " lei"} c="#e65100" bg="#fff3e0" />; })}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <select value={datFilter} onChange={(e) => setDatFilter(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, minWidth: 110 }}><option value="">Toți</option>{numeUnici.map((n) => <option key={n} value={n}>{n}</option>)}</select>
                {datFilter && <button onClick={() => setDatFilter("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16 }}>✕</button>}
                <button onClick={addDAT} style={{ padding: "6px 14px", background: "#c62828", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", minWidth: 480 }}>
                <colgroup><col style={{ width: 28 }} /><col style={{ width: 95 }} /><col style={{ width: 130 }} /><col style={{ width: 100 }} /><col /><col style={{ width: 30 }} /></colgroup>
                <thead><tr style={{ background: "#c62828" }}><th style={th({ background: "#b71c1c" })}></th><th style={th({ background: "#c62828", textAlign: "left" })}>Data</th><th style={th({ background: "#c62828", textAlign: "left" })}>Nume</th><th style={th({ background: "#c62828", textAlign: "right" })}>Suma (lei)</th><th style={th({ background: "#c62828", textAlign: "left" })}>Detalii</th><th style={th({ background: "#c62828" })}></th></tr></thead>
                <tbody>{filtDat.map((r, i) => { const oi = datRows.indexOf(r); const rowBg = i % 2 === 0 ? "#fff" : "#fff5f5"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: rowBg })}><input style={inp()} value={r.data || ""} onChange={(e) => updDAT(oi, "data", e.target.value)} /></td><td style={td({ background: "#fff8e1", fontWeight: 600 })}><input style={inp({ fontWeight: 600 })} value={r.nume || ""} onChange={(e) => updDAT(oi, "nume", e.target.value)} placeholder="Nume..." /></td><td style={td({ background: "#ffebee", textAlign: "right", fontWeight: 700, color: "#c62828" })}><input style={inp({ textAlign: "right", fontWeight: 700, color: "#c62828" })} value={r.suma || ""} onChange={(e) => updDAT(oi, "suma", e.target.value)} placeholder="0" /></td><td style={{ ...td({ background: rowBg }), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.det}><input style={inp()} value={r.det || ""} onChange={(e) => updDAT(oi, "det", e.target.value)} placeholder="Descriere..." /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delDAT(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 14 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: "#c62828", color: "#fff" }}><td colSpan={3} style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL {datFilter ? "— " + datFilter : ""}</td><td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(totDat)} lei</td><td colSpan={2}></td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ══ AVANSURI & DIVIDENDE ══ */}
        {tab === "avansuri" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total Avansuri" value={fmt(totAvans) + " lei"} c="#e65100" bg="#fff3e0" />
              <SC label="Total Dividende" value={fmt(totDiv) + " lei"} c="#1565c0" bg="#e3f2fd" />
              <SC label="Total General" value={fmt(totAvans + totDiv) + " lei"} c="#6a1b9a" bg="#f3e5f5" />
              {persList.map((p) => { const tot = avRows.filter((r) => r.catre === p).reduce((s, r) => s + (parseSuma(r.suma) || 0), 0); return <SC key={p} label={"👤 " + p} value={fmt(tot) + " lei"} c={G} bg="#e8f5e9" />; })}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", border: "1px solid #ccc", borderRadius: 6, overflow: "hidden" }}>
                {[["toate", "Toate"], ["avans", "Avansuri"], ["dividend", "Dividende"]].map(([v, l]) => (<button key={v} onClick={() => setAvTip(v)} style={{ padding: "5px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: avTip === v ? G : "#f5f5f5", color: avTip === v ? "#fff" : "#555" }}>{l}</button>))}
              </div>
              <select value={avPers} onChange={(e) => setAvPers(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, minWidth: 120 }}><option value="">Toate persoanele</option>{persList.map((p) => <option key={p} value={p}>{p}</option>)}</select>
              {avPers && <button onClick={() => setAvPers("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16 }}>✕</button>}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={() => addAV("avans")} style={{ padding: "6px 14px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Avans</button>
                <button onClick={() => addAV("dividend")} style={{ padding: "6px 14px", background: "#1565c0", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Dividend</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", minWidth: 480 }}>
                <colgroup><col style={{ width: 28 }} /><col style={{ width: 100 }} /><col style={{ width: 140 }} /><col style={{ width: 110 }} /><col style={{ width: 110 }} /><col /><col style={{ width: 30 }} /></colgroup>
                <thead><tr style={{ background: G }}><th style={th({ background: "#155a35" })}></th><th style={th({ textAlign: "left" })}>Data</th><th style={th({ textAlign: "left" })}>Către</th><th style={th({ textAlign: "right" })}>Suma (lei)</th><th style={th({})}>Tip</th><th style={th({ textAlign: "left" })}>Detalii</th><th style={th({})}></th></tr></thead>
                <tbody>
                  {filtAv.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Nicio înregistrare.</td></tr>}
                  {filtAv.map((r, i) => { const oi = avRows.indexOf(r); const isDiv = r.tip === "dividend"; const rowBg = isDiv ? (i % 2 === 0 ? "#eff6ff" : "#dbeafe") : (i % 2 === 0 ? "#fff" : "#f9f9f9"); return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: rowBg })}><input style={inp()} value={r.data || ""} onChange={(e) => updAV(oi, "data", e.target.value)} placeholder="dd.mm.yyyy" /></td><td style={td({ background: rowBg, fontWeight: 600 })}><input style={inp({ fontWeight: 600 })} value={r.catre || ""} onChange={(e) => updAV(oi, "catre", e.target.value)} placeholder="—" /></td><td style={td({ background: rowBg, textAlign: "right", fontWeight: 700, color: isDiv ? "#1565c0" : "#e65100" })}><input style={inp({ textAlign: "right", fontWeight: 700, color: isDiv ? "#1565c0" : "#e65100" })} value={r.suma || ""} onChange={(e) => updAV(oi, "suma", e.target.value)} placeholder="0" /></td><td style={td({ background: isDiv ? "#dbeafe" : "#fff3e0", textAlign: "center" })}><select style={sel({ color: isDiv ? "#1565c0" : "#e65100", fontWeight: 700 })} value={r.tip || ""} onChange={(e) => updAV(oi, "tip", e.target.value)}><option value="avans">avans</option><option value="dividend">dividende</option></select></td><td style={td({ background: rowBg })}><input style={inp()} value={r.det || ""} onChange={(e) => updAV(oi, "det", e.target.value)} placeholder="..." /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delAV(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 14 }}>✕</button></td></tr>); })}
                </tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={3} style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(filtAv.reduce((s, r) => s + (parseSuma(r.suma) || 0), 0))} lei</td><td colSpan={3}></td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ══ CONTRACTE ══ */}
        {tab === "contracte" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <SC label="Total Contracte" value={contracte.filter((r) => r.companie).length + " buc."} c="#1565c0" bg="#e3f2fd" />
              <SC label="Cu detalii" value={contracte.filter((r) => r.detalii).length + " buc."} c={G} bg="#e8f5e9" />
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <input value={ctSearch} onChange={(e) => setCtSearch(e.target.value)} placeholder="🔍 Caută companie, nr, detalii..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 220 }} />
                {ctSearch && <button onClick={() => setCtSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16, lineHeight: 1 }}>✕</button>}
                <button onClick={addCT} style={{ padding: "6px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă contract</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", minWidth: 520 }}>
                <colgroup><col style={{ width: 28 }} /><col style={{ width: 65 }} /><col style={{ width: "auto" }} /><col style={{ width: 110 }} /><col style={{ width: 180 }} /><col style={{ width: 30 }} /></colgroup>
                <thead><tr style={{ background: G }}><th style={th({ background: "#155a35" })}></th><th style={th({ textAlign: "center" })}>Nr.</th><th style={th({ textAlign: "left" })}>Companie</th><th style={th({ textAlign: "center" })}>Data</th><th style={th({ textAlign: "left" })}>Detalii</th><th style={th({})}></th></tr></thead>
                <tbody>
                  {filtCT.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Niciun contract găsit.</td></tr>}
                  {filtCT.map((r, i) => { const oi = contracte.indexOf(r); const isEmpty = !r.companie; const rowBg = isEmpty ? "#fafafa" : i % 2 === 0 ? "#fff" : "#f3f8ff"; const hasD = !!r.detalii; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: "#e3f2fd", textAlign: "center", fontWeight: 700, color: "#1565c0", fontFamily: "monospace" })}><input style={inp({ textAlign: "center", fontWeight: 700, color: "#1565c0", fontFamily: "monospace" })} value={r.nr || ""} onChange={(e) => updCT(oi, "nr", e.target.value)} /></td><td style={td({ background: rowBg, fontWeight: isEmpty ? 400 : 600, color: isEmpty ? "#bbb" : "#222" })}><input style={inp({ fontWeight: isEmpty ? 400 : 600, color: isEmpty ? "#bbb" : "#222" })} value={r.companie || ""} onChange={(e) => updCT(oi, "companie", e.target.value)} placeholder="—" /></td><td style={td({ background: rowBg, textAlign: "center", fontSize: 12 })}><input style={inp({ textAlign: "center" })} value={r.data || ""} onChange={(e) => updCT(oi, "data", e.target.value)} placeholder="dd.mm.yyyy" /></td><td style={td({ background: hasD ? "#fff8e1" : rowBg, fontStyle: hasD ? "italic" : "normal", color: hasD ? "#e65100" : "#555" })}><input style={inp({ fontStyle: hasD ? "italic" : "normal", color: hasD ? "#e65100" : "#555" })} value={r.detalii || ""} onChange={(e) => updCT(oi, "detalii", e.target.value)} placeholder="—" /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delCT(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 14 }}>✕</button></td></tr>); })}
                </tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={2} style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td colSpan={4} style={{ padding: "7px 10px", fontSize: 12 }}>{filtCT.length} contracte din {contracte.length}</td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ══ PAROLE ══ */}
        {tab === "parole" && (
          <div>
            {!pinUnlocked ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", minHeight: 320 }}>
                <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 16, padding: "36px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 320, width: "100%" }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#263238", marginBottom: 4 }}>Secțiune protejată</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>Introduceți PIN-ul pentru a accesa parolele</div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
                    {[0, 1, 2, 3, 4, 5].map((idx) => (<div key={idx} style={{ width: 14, height: 14, borderRadius: "50%", background: pinInput.length > idx ? (pinError ? "#e53935" : G) : "#e0e0e0", border: `2px solid ${pinInput.length > idx ? (pinError ? "#e53935" : G) : "#ccc"}` }} />))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k, i) => (
                      <button key={i} onClick={() => {
                        if (k === "⌫") { setPinInput((p) => p.slice(0, -1)); setPinError(false); }
                        else if (k !== "" && pinInput.length < 6) {
                          const next = pinInput + String(k);
                          setPinInput(next);
                          if (next.length === 6) checkPin(next);
                        }
                      }} disabled={k === ""}
                        style={{ height: 52, borderRadius: 10, border: "none", fontSize: k === "⌫" ? 18 : 20, fontWeight: 600, cursor: k === "" ? "default" : "pointer", background: k === "" ? "transparent" : pinError ? "#ffebee" : "#f5f5f5", color: pinError && k !== "" ? "#e53935" : k === "⌫" ? "#e53935" : "#263238", boxShadow: k === "" ? "none" : "0 2px 4px rgba(0,0,0,.08)" }}
                        onMouseEnter={(e) => { if (k !== "") e.currentTarget.style.background = pinError ? "#ffcdd2" : "#e8f5e9"; }}
                        onMouseLeave={(e) => { if (k !== "") e.currentTarget.style.background = pinError ? "#ffebee" : "#f5f5f5"; }}
                      >{k}</button>
                    ))}
                  </div>
                  {pinError && <div style={{ color: "#e53935", fontSize: 13, fontWeight: 600 }}>❌ PIN incorect</div>}
                  {!pinError && <div style={{ color: "#aaa", fontSize: 12 }}>Tastează cele 6 cifre</div>}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button onClick={() => { setPinUnlocked(false); setPinInput(""); }} style={{ padding: "5px 14px", background: "#ffebee", color: "#e53935", border: "1px solid #ef9a9a", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🔒 Blochează</button>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {CAT_PAROLE.map((c) => { const cnt = parole.filter((r) => r.cat === c).length; const colors = { Email: ["#1565c0", "#e3f2fd"], Bancă: ["#2e7d32", "#e8f5e9"], Card: ["#6a1b9a", "#f3e5f5"], Platformă: ["#e65100", "#fff3e0"], WiFi: ["#0277bd", "#e1f5fe"], Altele: ["#555", "#f5f5f5"] }; const [c1, bg1] = colors[c] || ["#555", "#f5f5f5"]; return (<div key={c} onClick={() => setParolaCat(parolaCat === c ? "toate" : c)} style={{ flex: "0 0 auto", background: parolaCat === c ? c1 : bg1, border: `2px solid ${c1}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}><div style={{ fontSize: 10, color: parolaCat === c ? "rgba(255,255,255,0.8)" : "#666" }}>{c}</div><div style={{ fontSize: 16, fontWeight: 700, color: parolaCat === c ? "#fff" : c1 }}>{cnt}</div></div>); })}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <input value={parolaSearch} onChange={(e) => setParolaSearch(e.target.value)} placeholder="🔍 Caută platformă, user, note..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 220 }} />
                    {parolaSearch && <button onClick={() => setParolaSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16 }}>✕</button>}
                    {parolaCat !== "toate" && <button onClick={() => setParolaCat("toate")} style={{ padding: "5px 10px", background: "#f5f5f5", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✕ {parolaCat}</button>}
                    <button onClick={addPAR} style={{ padding: "6px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                    <thead><tr style={{ background: "#263238" }}><th style={th({ background: "#1c2529", width: 28 })}></th><th style={th({ background: "#263238", textAlign: "left", minWidth: 170 })}>Platformă</th><th style={th({ background: "#263238", width: 85 })}>Categorie</th><th style={th({ background: "#263238", textAlign: "left", minWidth: 160 })}>Utilizator / Email</th><th style={th({ background: "#263238", minWidth: 160 })}>Parolă</th><th style={th({ background: "#263238", textAlign: "left", minWidth: 140 })}>Note</th><th style={th({ background: "#263238", width: 30 })}></th></tr></thead>
                    <tbody>
                      {filtParole.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Niciun rezultat.</td></tr>}
                      {filtParole.map((r, i) => {
                        const oi = parole.indexOf(r); const isEdit = parolaEdit === oi; const catColors = { Email: ["#1565c0", "#e3f2fd"], Bancă: ["#2e7d32", "#e8f5e9"], Card: ["#6a1b9a", "#f3e5f5"], Platformă: ["#e65100", "#fff3e0"], WiFi: ["#0277bd", "#e1f5fe"], Altele: ["#555", "#f5f5f5"] }; const [cc, cbg] = catColors[r.cat] || ["#555", "#f5f5f5"]; const rowBg = i % 2 === 0 ? "#fff" : "#f8f9fa"; const visible = showParole[oi];
                        return (<tr key={r.id || i} style={{ background: isEdit ? "#fffde7" : rowBg }}>
                          <td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 1}</td>
                          <td style={td({ background: isEdit ? "#fffde7" : rowBg, fontWeight: 600 })}>{isEdit ? <input style={inp({ fontWeight: 600 })} value={r.platforma || ""} onChange={(e) => updPAR(oi, "platforma", e.target.value)} /> : <span>{r.platforma}</span>}</td>
                          <td style={td({ background: cbg, textAlign: "center" })}><select style={sel({ color: cc, fontWeight: 700, fontSize: 10 })} value={r.cat || ""} onChange={(e) => updPAR(oi, "cat", e.target.value)}>{CAT_PAROLE.map((c) => <option key={c}>{c}</option>)}</select></td>
                          <td style={td({ background: isEdit ? "#fffde7" : rowBg, fontSize: 11 })}><div style={{ display: "flex", alignItems: "center", gap: 4 }}>{isEdit ? <input style={inp({ fontSize: 11 })} value={r.user || ""} onChange={(e) => updPAR(oi, "user", e.target.value)} placeholder="user / email" /> : <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.user}>{r.user || "—"}</span>}{r.user && !isEdit && <button onClick={() => navigator.clipboard?.writeText(r.user)} title="Copiază" style={{ background: "none", border: "none", cursor: "pointer", color: "#90a4ae", fontSize: 12, padding: "0 2px", flexShrink: 0 }}>📋</button>}</div></td>
                          <td style={td({ background: isEdit ? "#fffde7" : "#f9fbe7" })}><div style={{ display: "flex", alignItems: "center", gap: 4 }}>{isEdit ? <input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.parola || ""} onChange={(e) => updPAR(oi, "parola", e.target.value)} placeholder="parolă" /> : <span style={{ flex: 1, fontFamily: "monospace", fontSize: 12, letterSpacing: visible ? "0" : "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={visible ? r.parola : ""}>{visible ? r.parola : (r.parola ? "••••••••" : "—")}</span>}{r.parola && !isEdit && (<><button onClick={() => setShowParole((p) => ({ ...p, [oi]: !p[oi] }))} title={visible ? "Ascunde" : "Arată"} style={{ background: "none", border: "none", cursor: "pointer", color: "#90a4ae", fontSize: 13, padding: "0 2px", flexShrink: 0 }}>{visible ? "🙈" : "👁️"}</button><button onClick={() => navigator.clipboard?.writeText(r.parola)} title="Copiază parola" style={{ background: "none", border: "none", cursor: "pointer", color: "#90a4ae", fontSize: 12, padding: "0 2px", flexShrink: 0 }}>📋</button></>)}</div></td>
                          <td style={td({ background: isEdit ? "#fffde7" : rowBg, fontSize: 11, color: "#666" })}>{isEdit ? <input style={inp({ fontSize: 11 })} value={r.note || ""} onChange={(e) => updPAR(oi, "note", e.target.value)} placeholder="note, url, detalii..." /> : <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.note}>{r.note || ""}</span>}</td>
                          <td style={td({ textAlign: "center", padding: 3 })}><div style={{ display: "flex", flexDirection: "column", gap: 2 }}><button onClick={() => setParolaEdit(isEdit ? null : oi)} title={isEdit ? "Salvează" : "Editează"} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>{isEdit ? "✅" : "✏️"}</button><button onClick={() => delPAR(r.id)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13, lineHeight: 1 }}>✕</button></div></td>
                        </tr>);
                      })}
                    </tbody>
                    <tfoot><tr style={{ background: "#263238", color: "#fff" }}><td colSpan={2} style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td colSpan={5} style={{ padding: "7px 10px", fontSize: 12 }}>{filtParole.length} înregistrări din {parole.length}</td></tr></tfoot>
                  </table>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "#888", textAlign: "center" }}>👁️ Click pe ochi pentru a vedea parola &nbsp;|&nbsp; 📋 Click pentru a copia &nbsp;|&nbsp; ✏️ Click pentru a edita</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
