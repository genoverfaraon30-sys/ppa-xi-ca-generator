import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import SearchableSelect from "./SearchableSelect";

function FilterField({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</label>
      {children}
    </div>
  );
}

export default function CertificateHistoryToolbar({
  search,
  setSearch,
  employees,
  fieldOffices,
  fEmployee,
  setFEmployee,
  fOffice,
  setFOffice,
  fDateFrom,
  setFDateFrom,
  fDateTo,
  setFDateTo,
  fStatus,
  setFStatus,
  years,
  selectedYear,
  setSelectedYear,
  onClear,
  hasFilters,
}) {
  const employeeOptions = employees.map((e) => ({ value: e.name, label: e.name }));
  const officeOptions = fieldOffices.map((o) => ({ value: o.name, label: o.name }));
  const yearOptions = [
    { value: "", label: "All Years" },
    ...years.map((y) => ({ value: String(y), label: String(y) })),
  ];
  const statusOptions = [
    { value: "", label: "All statuses" },
    { value: "Draft", label: "Draft" },
    { value: "Issued", label: "Issued" },
    { value: "Voided", label: "Voided" },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by certificate no., name, office, purpose, or location..."
          className="bg-white pl-9"
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <FilterField label="Employee">
          <SearchableSelect
            value={fEmployee}
            onChange={setFEmployee}
            options={employeeOptions}
            placeholder="All employees"
            emptyText="No employee found."
            triggerClassName="w-[200px]"
          />
        </FilterField>
        <FilterField label="Office / Agency">
          <SearchableSelect
            value={fOffice}
            onChange={setFOffice}
            options={officeOptions}
            placeholder="All offices"
            emptyText="No office found."
            triggerClassName="w-[220px]"
          />
        </FilterField>
        <FilterField label="Date From">
          <Input type="date" value={fDateFrom} onChange={(e) => setFDateFrom(e.target.value)} className="w-[150px] bg-white" />
        </FilterField>
        <FilterField label="Date To">
          <Input type="date" value={fDateTo} onChange={(e) => setFDateTo(e.target.value)} className="w-[150px] bg-white" />
        </FilterField>
        <FilterField label="Year">
          <SearchableSelect
            value={selectedYear == null ? "" : String(selectedYear)}
            onChange={(v) => setSelectedYear(v ? Number(v) : null)}
            options={yearOptions}
            placeholder="All Years"
            emptyText="No years."
            triggerClassName="w-[140px]"
          />
        </FilterField>
        <FilterField label="Status">
          <SearchableSelect
            value={fStatus}
            onChange={setFStatus}
            options={statusOptions}
            placeholder="All statuses"
            emptyText="—"
            triggerClassName="w-[150px]"
          />
        </FilterField>
        {hasFilters && (
          <Button variant="ghost" onClick={onClear} className="text-red-600 hover:text-red-700">
            <X className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}