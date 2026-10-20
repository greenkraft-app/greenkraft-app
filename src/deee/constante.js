// Judetele (denumirea completa, ca in WiseWeee) si codul auto folosit in alte parti ale aplicatiei.
export const JUDETE = [
  ["AB", "Alba"], ["AR", "Arad"], ["AG", "Argeș"], ["BC", "Bacău"], ["BH", "Bihor"], ["BN", "Bistrița-Năsăud"],
  ["BT", "Botoșani"], ["BV", "Brașov"], ["BR", "Brăila"], ["B", "București"], ["BZ", "Buzău"], ["CS", "Caraș-Severin"],
  ["CL", "Călărași"], ["CJ", "Cluj"], ["CT", "Constanța"], ["CV", "Covasna"], ["DB", "Dâmbovița"], ["DJ", "Dolj"],
  ["GL", "Galați"], ["GR", "Giurgiu"], ["GJ", "Gorj"], ["HR", "Harghita"], ["HD", "Hunedoara"], ["IL", "Ialomița"],
  ["IS", "Iași"], ["IF", "Ilfov"], ["MM", "Maramureș"], ["MH", "Mehedinți"], ["MS", "Mureș"], ["NT", "Neamț"],
  ["OT", "Olt"], ["PH", "Prahova"], ["SM", "Satu Mare"], ["SJ", "Sălaj"], ["SB", "Sibiu"], ["SV", "Suceava"],
  ["TR", "Teleorman"], ["TM", "Timiș"], ["TL", "Tulcea"], ["VS", "Vaslui"], ["VL", "Vâlcea"], ["VN", "Vrancea"],
];

const fara = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

// "IF" / "ilfov" / "Ilfov " -> "Ilfov"; orice altceva -> "" (nu ghicim)
export function numeJudet(valoare) {
  const v = fara(valoare);
  if (!v) return "";
  const dupaCod = JUDETE.find(([cod]) => cod.toLowerCase() === v);
  if (dupaCod) return dupaCod[1];
  const dupaNume = JUDETE.find(([, nume]) => fara(nume) === v);
  return dupaNume ? dupaNume[1] : "";
}

export const TIPURI_FURNIZOR = ["COLECTOR", "PF", "PJ", "CLIENT", "PARTENER"];

// zile pana la o data "YYYY-MM-DD" (negativ = expirata); null daca nu e data valida
export function zilePanaLa(data) {
  if (!data) return null;
  const m = String(data).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const t = new Date(+m[1], +m[2] - 1, +m[3]).getTime();
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  return Math.round((t - azi.getTime()) / 86400000);
}

// Codurile de deseu (HG 856) folosite la DEEE — cele din lista WiseWeee; se pot scrie si alte coduri.
export const COD_EWC = ["16 02 11*", "16 02 13*", "16 02 14", "16 02 16", "20 01 21*", "20 01 23*", "20 01 35*", "20 01 36"];
export const TIPURI_ANEXA = ["Anexa 1", "Anexa 2", "Anexa 3"];

// "YYYY-MM-DD" -> "DD.MM.YYYY" ; orice altceva -> "—"
export function dataRo(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "—";
}
// "DD.MM.YYYY" (formatul tichetelor din Greenkraft) -> "YYYY-MM-DD" ; invalid -> ""
export function roIso(dmy) {
  const m = String(dmy || "").match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : "";
}
export const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
// "2026-10-20" -> "2026-10" (cheie de luna)
export const lunaDin = (iso) => String(iso || "").slice(0, 7);
export const numeLuna = (cheie) => { const [a, l] = String(cheie).split("-"); return `${LUNI[(+l || 1) - 1]} ${a}`; };
export const fmtKg = (n) => (Number(n) || 0).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Datele firmei, pentru documentele tiparite (NIR) — ca in NIR-ul din WiseWeee
export const FIRMA = {
  den: "GREEN KRAFT SRL", cui: "RO36191378",
  adresa: "Soseaua de centura dreapta 18A, 770110 Afumati",
  punctLucru: "Soseaua de Centura Dreapta nr. 18A, comuna Afumati, jud. Ilfov",
  gestionar: "Alexandru I.",
};
export const escHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
