import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";
import ManageList from "@/components/ManageList";

export default function Settings() {
  const { toast } = useToast();
  const [counts, setCounts] = useState({ certs: 0, sigs: 0 });
  const [employees, setEmployees] = useState([]);
  const [fieldOffices, setFieldOffices] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [certs, sigs, emps, offices] = await Promise.all([
      base44.entities.Certificate.list(),
      base44.entities.Signatory.list(),
      base44.entities.Employee.list("name", 5000),
      base44.entities.FieldOffice.list("name", 5000),
    ]);
    setCounts({ certs: certs.length, sigs: sigs.length });
    setEmployees(emps);
    setFieldOffices(offices);
  };

  useEffect(() => { load(); }, []);

  const wipe = async (entity, label) => {
    setBusy(true);
    try {
      await base44.entities[entity].deleteMany({});
      await load();
      toast({ title: `${label} deleted` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 pb-28 md:pb-12">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage employee and office lists, and your account data for this app.</p>
      </header>

      <div className="space-y-6">
        <ManageList
          title="Employees"
          description="Personnel available in the Name of Person dropdown."
          entityName="Employee"
          records={employees}
          addLabel="Add Employee"
          fields={[
            { key: "name", label: "Name", placeholder: "Juan D. Cruz", className: "w-[220px]" },
            { key: "position", label: "Position", placeholder: "PPO II (optional)", className: "w-[180px]" },
          ]}
          onReload={load}
        />

        <ManageList
          title="Field Offices"
          description="Offices under PPA Region XI used in the Office / Agency dropdown."
          entityName="FieldOffice"
          records={fieldOffices}
          addLabel="Add Office"
          fields={[
            { key: "name", label: "Office Name", placeholder: "PPA Provincial Office - Davao del Sur", className: "w-[280px]" },
          ]}
          onReload={load}
        />

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-900">Delete all certificates</p>
                <p className="text-sm text-slate-500">{counts.certs} record(s) will be permanently removed.</p>
              </div>
              <Button variant="destructive" disabled={busy || counts.certs === 0} onClick={() => wipe("Certificate", "Certificates")}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-900">Delete saved signatories</p>
                <p className="text-sm text-slate-500">{counts.sigs} record(s) will be permanently removed.</p>
              </div>
              <Button variant="destructive" disabled={busy || counts.sigs === 0} onClick={() => wipe("Signatory", "Signatories")}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              disabled={busy || (counts.certs === 0 && counts.sigs === 0)}
              onClick={async () => {
                setBusy(true);
                try {
                  await Promise.all([
                    base44.entities.Certificate.deleteMany({}),
                    base44.entities.Signatory.deleteMany({}),
                  ]);
                  await load();
                  toast({ title: "All app data deleted" });
                } finally {
                  setBusy(false);
                }
              }}
            >
              Delete all my app data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}