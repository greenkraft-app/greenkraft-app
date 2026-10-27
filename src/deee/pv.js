import { FIRMA, escHtml, dataRo, fmtKg } from "./constante";

const fara = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");

// Denumirea contabila a unei fractii: cea din nomenclator, altfel "FRACTIE EWC cod" (ex. "FIER EWC 19 12 02").
export const denContabilitate = (fractie, cod, nomenclator = []) => {
  const n = nomenclator.find((f) => f.den === fractie && f.cod === cod);
  return n?.den_contabilitate || `${fara(fractie).toUpperCase()}${cod ? ` EWC ${cod}` : ""}`;
};

// Proces-verbal de dezmembrare fractii / de concasare (cel de concasare are in plus cod CED, tip material, echipamente utilizate, mentiuni).
export function htmlPvFractii({ op, intrari, iesiri, nomenclator, responsabil }) {
  const e = escHtml;
  const concasare = op.tip === "Concasare";
  const totI = intrari.reduce((s, l) => s + Number(l.kg || 0), 0), totO = iesiri.reduce((s, l) => s + Number(l.kg || 0), 0);
  const rand = (ls, tot) => ls.map((l, i) => `<tr><td class="c">${i + 1}</td><td class="c">${e(l.cod)}</td><td>${e(l.fractie)}</td><td>${e(denContabilitate(l.fractie, l.cod, nomenclator))}</td><td class="r">${fmtKg(l.kg)}</td><td class="r">${tot > 0 ? ((Number(l.kg) / tot) * 100).toFixed(2) : "0.00"}%</td></tr>`).join("");
  const tabel = (ls, tot) => `<table><thead><tr><th style="width:28px">Nr</th><th style="width:70px" class="c">Cod</th><th>Denumire fracțiune</th><th>Denumire contabilitate</th><th style="width:80px" class="r">Kg</th><th style="width:60px" class="r">%</th></tr></thead><tbody>${rand(ls, tot)}<tr class="tot"><td colspan="4">TOTAL</td><td class="r">${fmtKg(tot)}</td><td></td></tr></tbody></table>`;
  return `<html><head><meta charset="utf-8"><title>PV ${e(op.nr_operatiune)}</title>
<style>
  @page { size: A4 portrait; margin: 14mm; } * { box-sizing: border-box; } body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; margin: 0; }
  h1 { font-size: 17px; text-align: center; margin: 0 0 4px; } .sub { text-align: center; color: #555; margin-bottom: 14px; }
  .antet { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 12px; line-height: 1.6; font-size: 11.5px; } .antet > div { flex: 1; }
  h2 { font-size: 12.5px; margin: 16px 0 6px; } table { border-collapse: collapse; width: 100%; font-size: 10.5px; }
  th { background: #555; color: #fff; padding: 5px; text-align: left; } td { padding: 4px 5px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .c { text-align: center; } .r { text-align: right; } tr.tot td { font-weight: bold; border-top: 2px solid #555; border-bottom: none; }
  .semn { margin-top: 40px; display: flex; justify-content: space-between; } .semn div { min-width: 70mm; line-height: 1.9; }
</style></head><body>
<h1>${concasare ? "PROCES-VERBAL DE CONCASARE" : "PROCES-VERBAL DE DEZMEMBRARE FRACȚII"}</h1>
<div class="sub">Nr. ${e(op.nr_operatiune)} din ${dataRo(op.data)}</div>
<div class="antet">
  <div><b>${e(FIRMA.den)}</b><br>CUI: ${e(FIRMA.cui)}<br>Punct de lucru: ${e(FIRMA.punctLucru)}</div>
  <div>Organizație: <b>${e(op.organizatie)}</b>${concasare ? `<br>Cod CED: ${e(op.cod_ced)}<br>Tip material: ${e(op.tip_material)}<br>Echipamente utilizate: ${e(op.echipamente_utilizate)}` : ""}${op.observatii ? `<br>Observații: ${e(op.observatii)}` : ""}</div>
</div>
<h2>Fracții intrate</h2>${tabel(intrari, totI)}
<h2>${concasare ? "Materiale rezultate" : "Fracții rezultate"}</h2>${tabel(iesiri, totO)}
${concasare && op.mentiuni ? `<h2>Mențiuni</h2><div>${e(op.mentiuni)}</div>` : ""}
<div class="semn"><div>${concasare ? "Operator" : "Responsabil tratare"}:<br>Numele: ${e(responsabil || FIRMA.gestionar)}<br>Semnătura: ______________________</div>${concasare ? `<div>Responsabil:<br>Numele: ______________________<br>Semnătura: ______________________</div>` : ""}</div>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>
</body></html>`;
}

// Proces-verbal de tratare / dezmembrare — echipamentele intrate, fractiile rezultate (cu denumire contabila si % din total),
// responsabil tratare. Acelasi continut ca PV-ul din WiseWeee.
export function htmlPv({ op, ech, fr, nomenclator, responsabil }) {
  const e = escHtml;
  const totE = ech.reduce((s, l) => s + Number(l.kg || 0), 0);
  const totBuc = ech.reduce((s, l) => s + (l.buc || 0), 0);
  const totF = fr.reduce((s, l) => s + Number(l.kg || 0), 0);
  const randE = ech.map((l, i) => `<tr><td class="c">${i + 1}</td><td class="c">${e(l.cod_ewc)}</td><td>${e(l.echipament)}</td><td class="r">${fmtKg(l.kg)}</td><td class="r">${l.buc || 0}</td></tr>`).join("");
  const randF = fr.map((l, i) => `<tr><td class="c">${i + 1}</td><td class="c">${e(l.cod)}</td><td>${e(l.fractie)}</td><td>${e(denContabilitate(l.fractie, l.cod, nomenclator))}</td><td class="r">${fmtKg(l.kg)}</td><td class="r">${totF > 0 ? ((Number(l.kg) / totF) * 100).toFixed(2) : "0.00"}%</td></tr>`).join("");
  return `<html><head><meta charset="utf-8"><title>PV ${e(op.nr_operatiune)}</title>
<style>
  @page { size: A4 portrait; margin: 14mm 14mm; }
  * { box-sizing: border-box; } body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; margin: 0; }
  h1 { font-size: 17px; text-align: center; margin: 0 0 4px; } .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 14px; }
  .antet { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 14px; line-height: 1.6; font-size: 11.5px; } .antet > div { flex: 1; }
  h2 { font-size: 12.5px; margin: 16px 0 6px; }
  table { border-collapse: collapse; width: 100%; font-size: 10.5px; }
  th { background: #555; color: #fff; padding: 5px; text-align: left; } td { padding: 4px 5px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .c { text-align: center; } .r { text-align: right; } tr.tot td { font-weight: bold; border-top: 2px solid #555; border-bottom: none; }
  .semn { margin-top: 40px; display: flex; justify-content: flex-end; } .semn div { min-width: 70mm; line-height: 1.9; }
</style></head><body>
<h1>PROCES-VERBAL DE TRATARE / DEZMEMBRARE</h1>
<div class="sub">Nr. ${e(op.nr_operatiune)} din ${dataRo(op.data)}</div>
<div class="antet">
  <div><b>${e(FIRMA.den)}</b><br>CUI: ${e(FIRMA.cui)}<br>Punct de lucru: ${e(FIRMA.punctLucru)}</div>
  <div>Organizație: <b>${e(op.organizatie)}</b><br>Status: ${e(op.status || "Finalizat")}<br>${op.observatii ? `Observații: ${e(op.observatii)}` : ""}</div>
</div>
<h2>Echipamente intrate în tratare</h2>
<table><thead><tr><th style="width:28px">Nr</th><th style="width:70px" class="c">Cod HG856</th><th>Denumire</th><th style="width:80px" class="r">Kg</th><th style="width:50px" class="r">Buc</th></tr></thead>
<tbody>${randE}<tr class="tot"><td colspan="3">TOTAL</td><td class="r">${fmtKg(totE)}</td><td class="r">${totBuc}</td></tr></tbody></table>
<h2>Fracții rezultate din tratare</h2>
<table><thead><tr><th style="width:28px">Nr</th><th style="width:70px" class="c">Cod fracțiune</th><th>Denumire fracțiune</th><th>Denumire contabilitate</th><th style="width:80px" class="r">Kg</th><th style="width:60px" class="r">% din total</th></tr></thead>
<tbody>${randF}<tr class="tot"><td colspan="4">TOTAL</td><td class="r">${fmtKg(totF)}</td><td class="r">${totF > 0 ? "100.00%" : ""}</td></tr></tbody></table>
<div class="semn"><div>Responsabil tratare:<br>Numele: ${e(responsabil || FIRMA.gestionar)}<br>Semnătura: ______________________</div></div>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>
</body></html>`;
}
