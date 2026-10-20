import { useState, useEffect, useCallback } from "react";

// Incarca o tabela din Supabase si o reincarca la revenirea pe fila (alt coleg poate fi modificat intre timp).
export function useTabela(sb, nume) {
  const [rows, setRows] = useState([]);
  const [eroare, setEroare] = useState(null);
  const [incarcat, setIncarcat] = useState(false);

  const reload = useCallback(async () => {
    const { data, error } = await sb.from(nume).select("*").order("created_at", { ascending: true });
    if (error) setEroare(error);
    else { setEroare(null); setRows(data || []); }
    setIncarcat(true);
  }, [sb, nume]);

  useEffect(() => {
    reload();
    const laRevenire = () => { if (document.visibilityState === "visible") reload(); };
    document.addEventListener("visibilitychange", laRevenire);
    return () => document.removeEventListener("visibilitychange", laRevenire);
  }, [reload]);

  return { rows, setRows, eroare, incarcat, reload };
}

// Tabelul nu exista inca in Supabase (nu s-a rulat fisierul .sql)
export const lipsaTabel = (e) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || /does not exist|Could not find the table/i.test(e.message || ""));

// "12,5" sau "12.5" -> 12.5 ; gol/invalid -> NaN
export const numar = (s) => {
  if (typeof s === "number") return s;
  const n = parseFloat(String(s ?? "").trim().replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

export const colatie = (a, b) => String(a || "").localeCompare(String(b || ""), "ro", { sensitivity: "base", numeric: true });
