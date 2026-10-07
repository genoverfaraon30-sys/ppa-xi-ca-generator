import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { FileText, History as HistoryIcon, BarChart3, Printer } from "lucide-react";
import { useYearFilter } from "@/lib/YearFilterContext";
import SummaryPrintSheet from "@/components/certificate/SummaryPrintSheet";

const STATUS_COLORS = {
  Issued: "#10b981",
  Draft: "#94a3b8",
  Voided: "#ef4444",
};

function yearOf(r) {
  const d = r.date_of_issuance || r.created_date;
  return d ? new Date(d).getFullYear() : null;
}

export default function Dashboard() {
  const { records, selectedYear, setSelectedYear, years, loading } = useYearFilter();
  const [summaryQueue, setSummaryQueue] = useState(null);

  const totals = useMemo(() => {
    const t = { Draft: 0, Issued: 0, Voided: 0 };
    records.forEach((r) => { t[r.status || "Draft"]++; });
    return t;
  }, [records]);

  const issuedToday = useMemo(() => {
    const today = moment().format("YYYY-MM-DD");
    return records.filter(
      (r) => r.status === "Issued" && (r.date_of_issuance || "").slice(0, 10) === today
    ).length;
  }, [records]);

  const issuedThisMonth = useMemo(() => {
    const m = moment().format("YYYY-MM");
    return records.filter(
      (r) => r.status === "Issued" && (r.date_of_issuance || "").slice(0, 7) === m
    ).length;
  }, [records]);

  const latestNumber = useMemo(() => {
    const issued = records.filter((r) => r.status === "Issued");
    if (!issued.length) return "—";
    const latest = issued.slice().sort(
      (a, b) => new Date(b.date_of_issuance || b.created_date) - new Date(a.date_of_issuance || a.created_date)
    )[0];
    return latest.id ? latest.id.slice(-8).toUpperCase() : "—";
  }, [records]);

  const byYear = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const y = yearOf(r);
      if (y == null) return;
      if (!map[y]) map[y] = { year: y, total: 0, issued: 0 };
      map[y].total++;
      if (r.status === "Issued") map[y].issued++;
    });
    return Object.values(map).sort((a, b) => b.year - a.year);
  }, [records]);

  const monthly = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const d = r.date_of_issuance || r.created_date;
      if (!d) return;
      const m = moment(d);
      if (!m.isValid()) return;
      const key = m.format("YYYY-MM");
      const label = m.format("MMM YYYY");
      if (!map[key]) map[key] = { key, label, Draft: 0, Issued: 0, Voided: 0 };
      const status = r.status || "Draft";
      if (map[key][status] !== undefined) map[key][status] += 1;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [records]);

  const issuedForSelectedYear = useMemo(() => {
    return records
      .filter((r) => r.status === "Issued")
      .filter((r) => selectedYear == null || yearOf(r) === selectedYear)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.date_of_issuance || b.created_date) - new Date(a.date_of_issuance || a.created_date)
      );
  }, [records, selectedYear]);

  const printSummary = () => {
    setSummaryQueue(issuedForSelectedYear);
    setTimeout(() => window.print(), 150);
  };

  const yearLabel = selectedYear == null ? "All Years" : String(selectedYear);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-28 md:pb-12">
      <header className="mb-10">
        <p className="font-semibold uppercase tracking-[0.3em] text-red-600 text-xs">
          Parole and Probation Administration · Regional Office No. XI
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
      </header>

      <div className="mb-8 hidden gap-2 md:flex">
        <Button asChild variant="outline">
          <Link to="/"><FileText className="mr-2 h-4 w-4" /> Certificate of Appearance</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/history"><HistoryIcon className="mr-2 h-4 w-4" /> Generated Certificates</Link>
        </Button>
        <Button asChild variant="default">
          <Link to="/dashboard"><BarChart3 className="mr-2 h-4 w-4" /> Dashboard</Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <p className="text-sm text-slate-500">
            Summary period: <span className="font-semibold text-slate-800">{yearLabel}</span>
          </p>
          <p className="text-xs text-slate-400">
            {issuedForSelectedYear.length} issued certificate(s) in this period
          </p>
        </div>
        <Button onClick={printSummary} className="bg-red-600 text-white hover:bg-red-700">
          <Printer className="mr-2 h-4 w-4" /> PRINT SUMMARY
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Total" value={records.length} color="bg-slate-100 text-slate-700" />
        <SummaryCard label="Issued" value={totals.Issued} color="bg-emerald-50 text-emerald-700" />
        <SummaryCard label="Draft" value={totals.Draft} color="bg-slate-50 text-slate-600" />
        <SummaryCard label="Voided" value={totals.Voided} color="bg-red-50 text-red-600" />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Issued Today" value={issuedToday} color="bg-blue-50 text-blue-700" />
        <SummaryCard label="Issued This Month" value={issuedThisMonth} color="bg-indigo-50 text-indigo-700" />
        <SummaryCard label="Latest Cert No." value={latestNumber} color="bg-amber-50 text-amber-700" />
        <SummaryCard label="Years on Record" value={years.length} color="bg-slate-100 text-slate-700" />
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Certificates by Year</h2>
        {byYear.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No certificate data yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-slate-400">
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2 font-medium">Year</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody>
              {byYear.map((row) => (
                <tr
                  key={row.year}
                  onClick={() => setSelectedYear(row.year)}
                  className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                    selectedYear === row.year ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-slate-900">{row.year}</td>
                  <td className="px-3 py-2 text-slate-600">{row.total}</td>
                  <td className="px-3 py-2 text-emerald-700">{row.issued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Certificates by Month &amp; Status</h2>
        {monthly.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">No certificate data yet.</p>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Issued" stackId="a" fill={STATUS_COLORS.Issued} name="Issued" />
                <Bar dataKey="Draft" stackId="a" fill={STATUS_COLORS.Draft} name="Draft" />
                <Bar dataKey="Voided" stackId="a" fill={STATUS_COLORS.Voided} name="Voided" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="print-sheet">
        {summaryQueue && <SummaryPrintSheet records={summaryQueue} yearLabel={yearLabel} />}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className={`rounded-xl border border-border p-4 ${color}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}