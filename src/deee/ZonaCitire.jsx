import { useEffect, useRef } from "react";

// Butoanele care deschid o fereastra de modificare sau modifica direct (ascunse in sectiunile doar-vizualizare).
const SCRIE_TEXT = /^\s*(\+|✏️|✕|🗑️|📋 Copiază|📎 Adaugă|📷 Fă|% Procente|Alocă|Șterge|Editează)/;
const SCRIE_TITLU = /^(Editează|Șterge|Scoate|Adaugă|Copiază|Marchează|Comută|Inactiv)/;

// Inveleste o sectiune pe care utilizatorul o poate doar vedea: banner, butoanele de scriere ascunse. Garantia reala e `bazaDoarCitire`
// (nicio scriere nu ajunge in baza de date); aceasta ascundere doar evita butoanele care ar da eroare.
export default function ZonaCitire({ activ, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!activ || !ref.current) return;
    const el = ref.current;
    const curata = () => {
      el.querySelectorAll("button, label").forEach((b) => {
        const t = (b.textContent || "").trim(), titlu = b.getAttribute("title") || "";
        if ((b.tagName === "BUTTON" && (SCRIE_TEXT.test(t) || SCRIE_TITLU.test(titlu))) || (b.tagName === "LABEL" && b.querySelector("input[type=file]"))) b.style.display = "none";
      });
      el.querySelectorAll("input[type=checkbox][title^='Marchează']").forEach((i) => { i.disabled = true; });
    };
    curata();
    const ob = new MutationObserver(curata);
    ob.observe(el, { childList: true, subtree: true });
    return () => ob.disconnect();
  }, [activ]);
  return (
    <div ref={ref}>
      {activ && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>👁️ Doar vizualizare — nu ai drept de modificare în această secțiune.</div>}
      {children}
    </div>
  );
}
