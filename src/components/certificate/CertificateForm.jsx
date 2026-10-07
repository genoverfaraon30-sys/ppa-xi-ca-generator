import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SearchableSelect from "./SearchableSelect";
import SearchableSelectWithManual from "./SearchableSelectWithManual";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</Label>
    {children}
  </div>
);

export default function CertificateForm({
  data,
  onChange,
  employees,
  fieldOffices,
  savedSignatories,
  onPickSignatory,
  saveEmployee,
  setSaveEmployee,
  saveOffice,
  setSaveOffice,
  employeeDupWarning,
  officeDupWarning,
}) {
  const set = (k) => (e) => onChange({ ...data, [k]: e.target.value });

  const employeeOptions = employees.map((e) => ({ value: e.name, label: e.name }));
  const officeOptions = fieldOffices.map((o) => ({ value: o.name, label: o.name }));

  const pickEmployee = (name) => {
    const emp = employees.find((e) => e.name === name);
    onChange({
      ...data,
      person_name: name,
      person_position: emp?.position || data.person_position,
      office: emp?.office || data.office,
    });
    setSaveEmployee?.(false);
    if (emp?.office) setSaveOffice?.(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Document Code">
          <Input value={data.document_code} onChange={set("document_code")} />
        </Field>
        <Field label="Name of Person">
          <SearchableSelectWithManual
            value={data.person_name}
            onChange={pickEmployee}
            options={employeeOptions}
            placeholder="Search employee..."
            emptyText="No employee found — Enter name manually"
            manualLabel="+ ADD / ENTER NAME MANUALLY"
            saveLabel="Save this person to Employee Database"
            saveChecked={saveEmployee}
            onSaveToggle={setSaveEmployee}
            duplicateWarning={employeeDupWarning}
          />
        </Field>
        <Field label="Position / Designation">
          <Input value={data.person_position} onChange={set("person_position")} placeholder="PPO II (optional)" />
        </Field>
        <Field label="Office / Agency">
          <SearchableSelectWithManual
            value={data.office}
            onChange={(v) => onChange({ ...data, office: v })}
            options={officeOptions}
            placeholder="Search office..."
            emptyText="No office/agency found — Enter manually"
            manualLabel="+ ADD / ENTER OFFICE/AGENCY MANUALLY"
            saveLabel="Save this office to Office/Agency Database"
            saveChecked={saveOffice}
            onSaveToggle={setSaveOffice}
            duplicateWarning={officeDupWarning}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Regional Office / Location">
            <Input
              value={data.location}
              onChange={set("location")}
              placeholder="DOJ – Parole and Probation Administration Regional Office No. XI, Ecoland, Davao City"
            />
          </Field>
        </div>
        <Field label="Date From">
          <Input type="date" value={data.date_from || ""} onChange={set("date_from")} />
        </Field>
        <Field label="Date To">
          <Input type="date" value={data.date_to || ""} onChange={set("date_to")} />
        </Field>
        <Field label="Date of Issuance">
          <Input type="date" value={data.date_of_issuance} onChange={set("date_of_issuance")} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Purpose / Activity">
            <Textarea rows={2} value={data.purpose} onChange={set("purpose")} placeholder="Internal Quality Audit" />
          </Field>
        </div>
        <Field label="Place of Issuance">
          <Input value={data.place_of_issuance} onChange={set("place_of_issuance")} />
        </Field>
      </div>

      <div>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Signatory</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Signatory Name">
            <Input value={data.signatory_name} onChange={set("signatory_name")} />
          </Field>
          <Field label="Signatory Position">
            <Input value={data.signatory_position} onChange={set("signatory_position")} />
          </Field>
        </div>
        {savedSignatories?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {savedSignatories.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onPickSignatory(s)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
              >
                {s.name} — {s.position}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}