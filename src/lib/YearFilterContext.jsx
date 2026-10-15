import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { db } from "@/api/dataAdapter";

const YearFilterContext = createContext(null);

export function YearFilterProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null); // null = All Years
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await db.entities.Certificate.list("-created_date", 5000);
      setRecords(list);
    } catch (err) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const years = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      const d = r.date_of_issuance || r.created_date;
      if (!d) return;
      const y = new Date(d).getFullYear();
      if (!Number.isNaN(y)) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [records]);

  return (
    <YearFilterContext.Provider
      value={{ records, selectedYear, setSelectedYear, years, refresh, loading }}
    >
      {children}
    </YearFilterContext.Provider>
  );
}

export function useYearFilter() {
  const ctx = useContext(YearFilterContext);
  if (!ctx) throw new Error("useYearFilter must be used within YearFilterProvider");
  return ctx;
}