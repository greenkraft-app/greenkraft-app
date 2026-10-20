import { FIRMA, escHtml, dataRo } from "./constante";

const kg = (n) => String(Math.round((Number(n) || 0) * 1000) / 1000); // "2140", nu "2.140,00" — ca in NIR-ul din WiseWeee

// Nota de Intrare-Receptie (NIR) pentru un document de colectare DEEE — acelasi continut si aspect ca NIR-ul din WiseWeee
// (A4 pe orizontal). Numarul se formeaza din document: NIR-<aviz>-<an>.
export function htmlNir({ doc, linii, furnizorCui, nr, data, gestionar }) {
  const e = escHtml;
  const totKg = linii.reduce((s, l) => s + Number(l.kg || 0), 0);
  const totBuc = linii.reduce((s, l) => s + (l.buc || 0), 0);
  const randuri = linii.map((l, i) => `<tr>
    <td class="c">${i + 1}</td><td>${e(l.echipament)}</td><td class="c">${e(doc.cod_hg856)}</td><td class="c">${e(doc.organizatie)}</td>
    <td></td><td></td><td class="c">kg</td><td class="r">${kg(l.kg)}</td><td class="r">${l.buc || 0}</td><td></td><td></td></tr>`).join("");
  return `<html><head><meta charset="utf-8"><title>${e(nr)}</title>
<style>
  @page { size: A4 landscape; margin: 14mm 16mm; }
  * { box-sizing: border-box; } body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; margin: 0; position: relative; min-height: 175mm; }
  h1 { font-size: 20px; font-weight: normal; text-align: center; margin: 0 0 14px; letter-spacing: .3px; }
  .rand { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11.5px; }
  .blocuri { display: flex; justify-content: space-between; gap: 30px; margin-bottom: 14px; line-height: 1.6; font-size: 11.5px; }
  .blocuri > div { flex: 1; } .dr { text-align: left; }
  table { border-collapse: collapse; width: 100%; font-size: 10.5px; }
  th { background: #555; color: #fff; padding: 6px 5px; text-align: left; font-weight: bold; }
  td { padding: 5px 5px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .c { text-align: center; } .r { text-align: right; }
  .tot { margin-top: 18px; font-size: 12px; line-height: 1.7; }
  .gest { position: absolute; right: 8mm; bottom: 22mm; font-size: 11.5px; line-height: 1.9; min-width: 70mm; }
  .pag { position: absolute; left: 0; right: 0; bottom: 0; text-align: center; font-size: 10px; color: #444; }
</style></head><body>
<h1>NOTA DE INTRARE-RECEPTIE (NIR)</h1>
<div class="rand"><div>Nr: ${e(nr)}</div><div>Data: ${dataRo(data)}</div></div>
<div class="blocuri">
  <div>
    FURNIZOR (generator): ${e(doc.furnizor)}<br>
    CUI: ${e(furnizorCui)}<br>
    Doc: ${e(doc.nr_document)}<br>
    Cod EWC: ${e(doc.cod_hg856)}<br>
    Total: ${kg(doc.greutate)} kg
  </div>
  <div class="dr">
    BENEFICIAR: ${e(FIRMA.den)}<br>
    CUI: ${e(FIRMA.cui)}<br>
    Adresa: ${e(FIRMA.adresa)}<br>
    Punct de lucru: ${e(FIRMA.punctLucru)}
  </div>
</div>
<table>
  <thead><tr>
    <th style="width:28px">Nr</th><th>Echipament DEEE</th><th style="width:60px" class="c">Cod EWC</th><th style="width:80px" class="c">Organizatie</th>
    <th style="width:80px">Denumire Org</th><th style="width:120px">Categorie_anexa2_OUG 5</th><th style="width:34px" class="c">U/M</th>
    <th style="width:50px" class="r">Kg</th><th style="width:40px" class="r">Buc</th><th style="width:44px">Pret</th><th style="width:54px">Valoare</th>
  </tr></thead>
  <tbody>${randuri}</tbody>
</table>
<div class="tot">TOTAL CANTITATE: ${kg(totKg)} kg<br>TOTAL BUCATI: ${totBuc}<br>TOTAL VALOARE: —</div>
<div class="gest">GESTIONARUL:<br>Numele: ${e(gestionar || FIRMA.gestionar)}<br>Semnatura: ______________________</div>
<div class="pag">Pagina 1 din 1</div>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>
</body></html>`;
}
