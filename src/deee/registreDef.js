import { FIRMA, escHtml, dataRo, lunaDin, numeLuna } from "./constante";

// Registrele WEEELABEX / EN 50625-1 / GDPR din WiseWeee ("Registre"), grupate ca acolo.
// Tipuri de camp: t = text, a = text lung, d = data, h = ora, n = numar, s = lista (opt), b = da/nu, m = alegere multipla (opt).
// "lista" = campurile afisate in tabel. "sem" = numarul de semnaturi desenate. "soon" = inca neimplementat si in WiseWeee ("în curând").
export const GRUPE = [
  {
    titlu: "OPERAȚIONAL", registre: [
      { k: "vizitatori", l: "Registru Vizitatori", sem: 1, lista: ["nume", "companie", "scop", "ora_intrare", "ora_iesire"], camp: [
        { k: "nume", l: "Nume vizitator", t: "t", req: 1 }, { k: "companie", l: "Companie", t: "t" }, { k: "act", l: "Act identitate", t: "t" },
        { k: "scop", l: "Scop vizită", t: "t" }, { k: "insotitor", l: "Însoțitor", t: "t" }, { k: "zone", l: "Zone vizitate", t: "t" },
        { k: "ora_intrare", l: "Oră intrare", t: "h" }, { k: "ora_iesire", l: "Oră ieșire", t: "h" },
        { k: "briefing", l: "Briefing efectuat", t: "b" }, { k: "eip", l: "EIP furnizat", t: "b" }, { k: "obs", l: "Observații", t: "a" }] },
      { k: "intretinere", l: "Registru Întreținere Echipamente", sem: 1, lista: ["echipament", "tip", "descriere", "executant"], camp: [
        { k: "echipament", l: "Echipament", t: "t", req: 1 }, { k: "tip", l: "Tip operație", t: "s", opt: ["Preventivă", "Corectivă"] },
        { k: "descriere", l: "Descriere", t: "a" }, { k: "piese", l: "Piese înlocuite", t: "t" }, { k: "durata", l: "Durată", t: "t" },
        { k: "urmatoarea", l: "Următoarea verificare", t: "d" }, { k: "executant", l: "Executant", t: "t" }, { k: "obs", l: "Observații", t: "a" }] },
      { k: "eip", l: "Fișă Predare EIP", soon: true },
    ],
  },
  {
    titlu: "MEDIU & SIGURANȚĂ", registre: [
      { k: "incidente", l: "Incidente / Accidente", sem: 1, lista: ["tip", "locatie", "descriere", "responsabil"], camp: [
        { k: "ora", l: "Ora", t: "h" }, { k: "locatie", l: "Locație", t: "t" }, { k: "tip", l: "Tip incident", t: "s", opt: ["Accident de muncă", "Incident", "Aproape-accident", "Incendiu", "Altul"] },
        { k: "persoane", l: "Persoane implicate", t: "t" }, { k: "descriere", l: "Descriere", t: "a", req: 1 }, { k: "leziuni", l: "Leziuni / Pagube", t: "a" },
        { k: "masuri", l: "Măsuri imediate", t: "a" }, { k: "cauza", l: "Cauză probabilă", t: "a" }, { k: "preventive", l: "Măsuri preventive", t: "a" },
        { k: "raportat", l: "Raportat la", t: "m", opt: ["ITM", "APM", "ISU"] }, { k: "responsabil", l: "Responsabil", t: "t" }] },
      { k: "scurgeri", l: "Scurgeri / Poluări Accidentale", sem: 1, lista: ["locatie", "tip", "substanta", "responsabil"], camp: [
        { k: "ora", l: "Ora", t: "h" }, { k: "locatie", l: "Locație", t: "t", req: 1 }, { k: "tip", l: "Tip", t: "s", opt: ["Scurgere", "Poluare aer", "Poluare sol", "Poluare apă", "Altul"] },
        { k: "substanta", l: "Substanță / Fracție", t: "t" }, { k: "masuri", l: "Măsuri de intervenție", t: "a" }, { k: "durata", l: "Durata", t: "t" },
        { k: "responsabil", l: "Responsabil", t: "t" }, { k: "preventive", l: "Măsuri preventive", t: "a" }, { k: "obs", l: "Observații", t: "a" }] },
      { k: "curatare", l: "Curățare și Decontaminare Containere", sem: 2, lista: ["container", "fractie", "metoda", "efectuat"], camp: [
        { k: "container", l: "Tip container / Cod", t: "t", req: 1 }, { k: "fractie", l: "Fracția stocată", t: "t" }, { k: "cod_ewc", l: "Cod EWC", t: "t" },
        { k: "motiv", l: "Motiv", t: "t" }, { k: "metoda", l: "Metodă", t: "t" }, { k: "efectuat", l: "Efectuat de", t: "t" }, { k: "verificat", l: "Verificat de", t: "t" }, { k: "obs", l: "Observații", t: "a" }] },
      { k: "depoluare", l: "Monitorizare Depoluare DEEE", sem: 1, lista: ["lot", "echipament", "fractie", "executant"], camp: [
        { k: "lot", l: "Lot / Operație", t: "t" }, { k: "echipament", l: "Tip echipament", t: "t" }, { k: "fractie", l: "Fracție depoluată", t: "t" },
        { k: "metoda", l: "Metoda", t: "t" }, { k: "eip", l: "EIP utilizat", t: "t" }, { k: "control", l: "Control vizual", t: "s", opt: ["Conform", "Neconform"] },
        { k: "durata", l: "Durată", t: "t" }, { k: "executant", l: "Executant", t: "t" }, { k: "obs", l: "Observații", t: "a" }] },
    ],
  },
  {
    titlu: "CONFORMITATE", registre: [
      { k: "neconformitati", l: "Neconformități și Acțiuni Corective", sem: 1, lista: ["prioritate", "descriere", "termen", "responsabil"], dataEt: "Data constatării",
        info: "Termenul maxim pentru o acțiune corectivă este de 3 luni de la data constatării.", camp: [
        { k: "prioritate", l: "Prioritate", t: "s", opt: ["Scăzută", "Medie", "Ridicată", "Critică"] }, { k: "descriere", l: "Descriere", t: "a", req: 1 },
        { k: "cauza", l: "Cauză rădăcină", t: "a" }, { k: "actiune", l: "Acțiune corectivă", t: "a" }, { k: "termen", l: "Termen limită", t: "d" },
        { k: "responsabil", l: "Responsabil", t: "t" }, { k: "rezolvat", l: "Data rezolvării", t: "d" }, { k: "verificat", l: "Verificat de", t: "t" }, { k: "obs", l: "Observații", t: "a" }] },
      { k: "distrugere", l: "Certificate Distrugere Date", sem: 2, lista: ["nr", "tip_echipament", "suport", "client"], dataEt: "Data distrugerii",
        info: "Certificatele se păstrează 5 ani.", camp: [
        { k: "nr", l: "Nr. certificat", t: "t", req: 1 }, { k: "tip_echipament", l: "Tip echipament", t: "t" }, { k: "suport", l: "Tip suport", t: "s", opt: ["Card memorie", "Hârtie", "HDD", "SSD", "Altul"] },
        { k: "serie", l: "Serie / ID", t: "t" }, { k: "cantitate", l: "Cantitate", t: "n" }, { k: "metoda", l: "Metoda distrugere", t: "t" }, { k: "client", l: "Client", t: "t" },
        { k: "martor", l: "Martor", t: "t" }, { k: "executant", l: "Executant", t: "t" }, { k: "obs", l: "Observații", t: "a" }] },
      { k: "luare", l: "Fișă Luare la Cunoștință", soon: true },
      { k: "checklist", l: "Checklist Audit Intern", soon: true },
      { k: "plan_audit", l: "Plan Audit Intern Anual", soon: true },
    ],
  },
  {
    titlu: "TRASABILITATE (generate din date)", registre: [
      { k: "g_receptie", l: "Recepție Livrări DEEE", generat: "receptie" },
      { k: "g_lot", l: "Lot Prelucrare", generat: "lot" },
      { k: "g_output", l: "Fracții Output (masă balanțieră)", generat: "output" },
      { k: "g_downstream", l: "Trasabilitate Downstream", generat: "downstream" },
    ],
  },
  {
    titlu: "TRANSPORT", registre: [
      { k: "anexe", l: "Registru Anexe Transport", sem: 0, lista: ["nr_anexa", "tip", "sens", "partener", "cantitate"], camp: [
        { k: "nr_anexa", l: "Nr. anexă", t: "t", req: 1 }, { k: "tip", l: "Tip anexă", t: "s", opt: ["Anexa 1", "Anexa 2", "Anexa 3"] },
        { k: "sens", l: "Sens", t: "s", opt: ["Intrare", "Ieșire"], req: 1 }, { k: "partener", l: "Partener", t: "t", req: 1 }, { k: "deseu", l: "Tip deșeu / fracție", t: "t" },
        { k: "cantitate", l: "Cantitate (kg)", t: "n" }, { k: "transportator", l: "Transportator", t: "t" }, { k: "nr_auto", l: "Nr. auto", t: "t" }, { k: "obs", l: "Observații", t: "a" }] },
    ],
  },
];
export const TOATE = GRUPE.flatMap((g) => g.registre);

const e = escHtml;
const celulaText = (c, v) => (c.t === "b" ? (v ? "Da" : "Nu") : c.t === "m" ? (Array.isArray(v) ? v.join(", ") : "") : c.t === "d" ? (v ? dataRo(v) : "") : String(v ?? ""));
export const textCamp = celulaText;

// Document tiparibil (se salveaza ca PDF din fereastra de tiparire): titlu, perioada si un tabel
export function htmlTabel({ titlu, subtitlu, cols, rows, nota }) {
  return `<html><head><meta charset="utf-8"><title>${e(titlu)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; } * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; color: #222; margin: 0; }
  h1 { font-size: 16px; margin: 0 0 2px; } .sub { color: #555; margin-bottom: 4px; } .nota { color: #777; font-size: 10px; margin-bottom: 10px; }
  table { border-collapse: collapse; width: 100%; } th { background: #555; color: #fff; padding: 5px; text-align: left; font-size: 10px; }
  td { padding: 4px 5px; border-bottom: 1px solid #ddd; vertical-align: top; } img.sem { max-height: 34px; max-width: 110px; }
</style></head><body>
<h1>${e(titlu)}</h1><div class="sub">${e(FIRMA.den)} • CUI ${e(FIRMA.cui)} • ${e(subtitlu || "")}</div>${nota ? `<div class="nota">${e(nota)}</div>` : ""}
<table><thead><tr>${cols.map((c) => `<th>${e(c)}</th>`).join("")}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${typeof v === "object" && v?.img ? `<img class="sem" src="${e(v.img)}">` : e(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script></body></html>`;
}

// Registrele generate din date: coloane + randuri, pentru un an / o luna.
export function registruGenerat(tip, { ach, achL, dz, dzE, dzF, van, an, luna }) {
  const inP = (d) => (luna ? lunaDin(d) === luna : !an || String(d).startsWith(an));
  const sortD = (a, b) => String(a[0]).localeCompare(String(b[0]));
  const kg = (n) => Math.round((Number(n) || 0) * 100) / 100;
  if (tip === "receptie") {
    const A = Object.fromEntries(ach.filter((a) => inP(a.data_colectare)).map((a) => [a.id, a]));
    const rows = achL.filter((l) => A[l.achizitie_id]).map((l) => { const a = A[l.achizitie_id]; return [a.data_colectare, a.furnizor, a.nr_document, a.nr_auto || "", a.cod_hg856, l.echipament, kg(l.kg), l.buc || 0, l.organizatie || a.organizatie]; });
    return { cols: ["Data", "Furnizor", "Aviz", "Nr. auto", "Cod HG856", "Echipament", "Kg", "Buc", "Organizație"], rows: rows.sort(sortD).map((r) => [dataRo(r[0]), ...r.slice(1)]) };
  }
  const ops = dz.filter((d) => inP(d.data));
  const eDe = (id) => dzE.filter((l) => l.dezm_id === id), fDe = (id) => dzF.filter((l) => l.dezm_id === id);
  if (tip === "lot") {
    const rows = ops.map((d) => [d.data, d.nr_operatiune, d.organizatie, eDe(d.id).map((l) => `${l.echipament} (${kg(l.kg)} kg)`).join("; "), kg(eDe(d.id).reduce((s, l) => s + Number(l.kg), 0)), fDe(d.id).map((l) => `${l.fractie} ${l.cod} (${kg(l.kg)} kg)`).join("; ")]);
    return { cols: ["Data", "Nr. lot / operațiune", "Organizație", "Echipamente prelucrate", "Total intrat (kg)", "Fracții rezultate"], rows: rows.sort(sortD).map((r) => [dataRo(r[0]), ...r.slice(1)]) };
  }
  if (tip === "output") {
    const rows = ops.map((d) => { const i = eDe(d.id).reduce((s, l) => s + Number(l.kg), 0), o = fDe(d.id).reduce((s, l) => s + Number(l.kg), 0); return [d.data, d.nr_operatiune, d.organizatie, kg(i), kg(o), kg(i - o), Math.abs(i - o) <= 0.01 ? "Echilibrat" : "Diferență"]; });
    return { cols: ["Data", "Operațiune", "Organizație", "Intrat (kg)", "Ieșit (kg)", "Diferență (kg)", "Balanță"], rows: rows.sort(sortD).map((r) => [dataRo(r[0]), ...r.slice(1)]) };
  }
  const rows = van.filter((v) => inP(v.data)).map((v) => [v.data, v.client, v.nr_aviz || "", v.cod, v.fractie, v.organizatie, kg(v.kg), v.cod_rd || ""]);
  return { cols: ["Data", "Client", "Nr. aviz", "Cod", "Fracție", "Organizație", "Kg", "Cod R/D"], rows: rows.sort(sortD).map((r) => [dataRo(r[0]), ...r.slice(1)]) };
}
export { numeLuna };
