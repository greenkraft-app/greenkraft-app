// Permisiuni pe sectiunile DEEE, per utilizator: "complet" (vede si modifica), "citire" (doar vede) sau "fara" (sectiunea nu apare).
// Administrator = Alexandru (ca la Istoric): vede totul si are mereu acces la sectiunea Permisiuni. Fara nicio setare, toti ceilalti au acces complet
// (ca pana acum).
//
// ATENTIE: aplicatia foloseste o cheie publica si parole verificate in browser, deci permisiunile restrang ce vede si ce poate face un utilizator
// din aplicatie, dar nu sunt o bariera de securitate impotriva cuiva care ar apela direct baza de date.
export const ADMIN = "Alexandru";

export const SECTIUNI = [
  { k: "achizitii", l: "Achiziții" }, { k: "tratare", l: "Tratare zilnică" }, { k: "documente", l: "Documente / Poze" }, { k: "dezmembrare", l: "Dezmembrare" }, { k: "dezmfr", l: "Dezm. fracții" },
  { k: "stocuri", l: "Stocuri" }, { k: "vanzari", l: "Vânzări fracții" }, { k: "rate", l: "Rate R&R" }, { k: "rapoarte", l: "Rapoarte" }, { k: "registre", l: "Registre" },
  { k: "furnizori", l: "Furnizori" }, { k: "transportatori", l: "Transportatori" }, { k: "retete", l: "Rețete" }, { k: "companie", l: "Compania mea" }, { k: "nomenclatoare", l: "Nomenclatoare" },
];
export const NIVELE = [["complet", "Complet"], ["citire", "Vizualizare"], ["fara", "Fără acces"]];

const toate = (n) => Object.fromEntries(SECTIUNI.map((s) => [s.k, n]));
const cu = (baza, patch) => ({ ...toate(baza), ...patch });
// Roluri din WiseWeee (Administrator / Manager / Angajat / Responsabil tratare) ca puncte de plecare; dupa aplicare se pot ajusta sectiune cu sectiune.
export const ROLURI = {
  Administrator: toate("complet"),
  Manager: toate("complet"),
  Angajat: cu("citire", { achizitii: "complet", tratare: "complet", documente: "complet", furnizori: "complet", transportatori: "complet", registre: "complet", companie: "fara", nomenclatoare: "fara", retete: "fara" }),
  "Responsabil tratare": cu("citire", { tratare: "complet", dezmembrare: "complet", dezmfr: "complet", retete: "complet", stocuri: "complet", registre: "complet", documente: "complet", rate: "complet", companie: "fara" }),
  "Doar vizualizare": toate("citire"),
};

// Nivelul unui utilizator pe o sectiune; fara rand salvat -> complet (ca pana acum)
export function nivelDe(randuri, user, k) {
  if (user === ADMIN) return "complet";
  const r = randuri.find((x) => x.user_name === user);
  return r?.sectiuni?.[k] || "complet";
}

// "Fata" bazei de date pentru o sectiune doar-citire: orice scriere (insert / update / upsert / delete, incarcare / stergere de fisiere) e refuzata.
const EROARE = { code: "DEEE_CITIRE", message: "Nu ai drept de modificare în această secțiune (doar vizualizare)." };
const blocat = () => {
  const p = Promise.resolve({ data: null, error: EROARE });
  const lant = new Proxy(p, { get: (t, k) => (k === "then" || k === "catch" || k === "finally" ? t[k].bind(t) : () => lant) });
  return lant;
};
export function bazaDoarCitire(sb) {
  const SCRIERI = new Set(["insert", "update", "upsert", "delete"]);
  const stocare = sb.storage && {
    ...sb.storage,
    from: (b) => { const s = sb.storage.from(b); return new Proxy(s, { get: (t, k) => (k === "upload" || k === "remove" || k === "update" || k === "move" || k === "copy" ? () => Promise.resolve({ data: null, error: EROARE }) : typeof t[k] === "function" ? t[k].bind(t) : t[k]) }); },
  };
  return new Proxy(sb, {
    get: (t, k) => {
      if (k === "storage") return stocare;
      if (k === "from") return (tabel) => { const q = t.from(tabel); return new Proxy(q, { get: (tq, m) => (SCRIERI.has(m) ? blocat : typeof tq[m] === "function" ? tq[m].bind(tq) : tq[m]) }); };
      return typeof t[k] === "function" ? t[k].bind(t) : t[k];
    },
  });
}
