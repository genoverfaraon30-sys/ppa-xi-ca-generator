import React from "react";
import { useYearFilter } from "@/lib/YearFilterContext";
import { Button } from "@/components/ui/button";
import { DatabaseBackup } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportCertificatesBackup } from "@/lib/backup";

export default function LeftYearNav() {
  const { years, selectedYear, setSelectedYear, records } = useYearFilter();
  const { toast } = useToast();

  const handleBackup = () => {
    if (!records.length) {
      toast({ title: "No records to back up", description: "There are no certificate records yet." });
      return;
    }
    exportCertificatesBackup(records);
    toast({ title: "Backup downloaded", description: `${records.length} certificate record(s) exported to CSV.` });
  };

  const YearButton = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`mb-1 w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
        active ? "bg-red-600 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <aside className="no-print hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="p-3">
        <Button onClick={handleBackup} className="w-full bg-red-600 text-white hover:bg-red-700">
          <DatabaseBackup className="mr-2 h-4 w-4" /> BACK UP
        </Button>
      </div>
      <div className="border-t border-slate-200" />
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Filter by Year
        </p>
        <YearButton label="All Years" active={selectedYear == null} onClick={() => setSelectedYear(null)} />
        {years.map((y) => (
          <YearButton key={y} label={String(y)} active={selectedYear === y} onClick={() => setSelectedYear(y)} />
        ))}
        {!years.length && <p className="px-2 py-2 text-xs text-slate-400">No records yet.</p>}
      </div>
    </aside>
  );
}