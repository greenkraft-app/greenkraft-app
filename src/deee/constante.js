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
