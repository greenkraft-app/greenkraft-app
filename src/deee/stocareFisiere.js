import { useMemo } from "react";
import { useTabela } from "./hooks";

// Fisiere atasate (poze si documente) la achizitii si vanzari, in Supabase Storage (bucket privat) — ca "Fisiere" din WiseWeee.
export const BUCKET = "deee-fisiere";
export const MAX_BYTES = 15 * 1024 * 1024;
export const ACCEPT = "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv";

// Lista fisierelor; `pe(tip, id)` da fisierele unei achizitii ("achizitie") sau vanzari ("vanzare").
export function useFisiere(sb) {
  const t = useTabela(sb, "deee_fisiere");
  const pe = useMemo(() => {
    const m = new Map();
    t.rows.forEach((f) => { const k = f.achizitie_id ? `achizitie:${f.achizitie_id}` : `vanzare:${f.vanzare_id}`; (m.get(k) || m.set(k, []).get(k)).push(f); });
    return (tip, id) => (m.get(`${tip}:${id}`) || []).slice().sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  }, [t.rows]);
  return { ...t, pe };
}

const slug = (n) => String(n).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
export const esteImagine = (f) => f.categorie === "poza";
export const fmtMarime = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// Pozele mari (de pe telefon) se micsoreaza inainte de incarcare: maxim 2000 px, JPEG — ocupa mult mai putin loc.
async function comprima(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 500 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const sc = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch { return file; }
}

// Incarca un fisier si il leaga de o achizitie / vanzare. Intoarce { rand } sau { eroare }.
export async function incarcaFisier(sb, file, sursa, user) {
  const f = await comprima(file);
  if (f.size > MAX_BYTES) return { eroare: `„${file.name}” are peste 15 MB.` };
  const cale = `${sursa.tip}/${sursa.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${slug(f.name)}`;
  const up = await sb.storage.from(BUCKET).upload(cale, f, { contentType: f.type || "application/octet-stream", upsert: false });
  if (up.error) return { eroare: `„${file.name}”: ${/mime|not supported/i.test(up.error.message || "") ? "tip de fișier neacceptat" : up.error.message}` };
  const row = {
    [sursa.tip === "achizitie" ? "achizitie_id" : "vanzare_id"]: sursa.id, nume: f.name, cale,
    mime: f.type || "", marime: f.size, categorie: /^image\//.test(f.type) ? "poza" : "document", creat_de: user || "",
  };
  const { data, error } = await sb.from("deee_fisiere").insert(row).select();
  if (error) { await sb.storage.from(BUCKET).remove([cale]); return { eroare: `„${file.name}”: ${error.message}` }; }
  return { rand: data[0] };
}

// Sterge fisierele din stocare si din lista. Intoarce eroarea (text) sau "".
export async function stergeFisiere(sb, rows) {
  if (!rows.length) return "";
  const r = await sb.storage.from(BUCKET).remove(rows.map((x) => x.cale));
  if (r.error) return r.error.message;
  const { error } = await sb.from("deee_fisiere").delete().in("id", rows.map((x) => x.id));
  return error ? error.message : "";
}

// Linkuri temporare (o ora) pentru vizualizare / descarcare: { cale: url }
export async function linkuri(sb, rows) {
  if (!rows.length) return {};
  const { data } = await sb.storage.from(BUCKET).createSignedUrls(rows.map((x) => x.cale), 3600);
  return Object.fromEntries((data || []).filter((x) => x.signedUrl).map((x) => [x.path, x.signedUrl]));
}
