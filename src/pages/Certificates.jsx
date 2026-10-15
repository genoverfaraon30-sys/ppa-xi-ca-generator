import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { db } from "@/api/dataAdapter";
import { openPrintWindowSync, populatePrintWindow } from "@/lib/printUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Printer, Save, X, Eye, History as HistoryIcon, BarChart3 } from "lucide-react";
import CertificateForm from "@/components/certificate/CertificateForm";
import CertificateDocument from "@/components/certificate/CertificateDocument";
import CertificateHistory from "@/components/certificate/CertificateHistory";
import CertificateHistoryToolbar from "@/components/certificate/CertificateHistoryToolbar";
import CertificatePrintSheet from "@/components/certificate/CertificatePrintSheet";
import CertificateStatusLog from "@/components/certificate/CertificateStatusLog";
import { useYearFilter } from "@/lib/YearFilterContext";
import { lastNameOf } from "@/lib/certUtils";

const today = new Date().toISOString().slice(0, 10);

const EMPTY = {
  document_code: "ADM-FOR-012",
  person_name: "",
  person_position: "",
  office: "",
  location: "DOJ – Parole and Probation Administration Regional Office No. XI, Ecoland, Davao City",
  date_from: today,
  date_to: today,
  purpose: "",
  date_of_issuance: today,
  place_of_issuance: "Davao City",
  signatory_name: "",
  signatory_position: "",
  status: "Draft"
};

const REQUIRED_LABELS = {
  document_code: "Document Code",
  person_name: "Name of Person",
  office: "Office / Agency",
  location: "Regional Office / Location",
  date_from: "Date From",
  purpose: "Purpose / Activity",
  date_of_issuance: "Date of Issuance",
  place_of_issuance: "Place of Issuance",
  signatory_name: "Signatory Name",
  signatory_position: "Signatory Position"
};

export default function Certificates() {
  const { toast } = useToast();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHistory = pathname === "/history";

  const { records: allRecords, refresh, selectedYear, setSelectedYear, years } = useYearFilter();
  const [data, setData] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [signatories, setSignatories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [fieldOffices, setFieldOffices] = useState([]);
  const [auxLoading, setAuxLoading] = useState(true);
  const [employeeError, setEmployeeError] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [preview, setPreview] = useState(null);
  const [printQueue, setPrintQueue] = useState([]);
  const printSheetRef = useRef(null);
  const pendingPrintWindowRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [saveEmployee, setSaveEmployee] = useState(false);
  const [saveOffice, setSaveOffice] = useState(false);

  // history search / filter / sort state
  const [search, setSearch] = useState("");
  const [fEmployee, setFEmployee] = useState("");
  const [fOffice, setFOffice] = useState("");
  const [fDateFrom, setFDateFrom] = useState("");
  const [fDateTo, setFDateTo] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [sortKey, setSortKey] = useState("created_date");
  const [sortDir, setSortDir] = useState("desc");

  const loadAux = async () => {
    setAuxLoading(true);
    setEmployeeError(null);

    const [sigsResult, empsResult, officesResult] = await Promise.allSettled([
      db.entities.Signatory.list("-created_date", 10),
      db.entities.Employee.filter({ active: true }, "name", 5000),
      db.entities.FieldOffice.list("name", 5000),
    ]);

    if (sigsResult.status === "fulfilled") setSignatories(sigsResult.value);

    if (empsResult.status === "fulfilled") {
      setEmployees(
        empsResult.value
          .slice()
          .sort((a, b) =>
            (a.last_name || lastNameOf(a.name) || "").localeCompare(b.last_name || lastNameOf(b.name) || "")
          )
      );
    } else {
      setEmployees([]);
      setEmployeeError(empsResult.reason?.message || "Unable to load employees");
    }

    if (officesResult.status === "fulfilled") {
      setFieldOffices(officesResult.value.slice().sort((a, b) => (a.name || "").localeCompare(b.name || "")));
    }

    try {
      const users = await db.entities.User.list();
      const map = {};
      users.forEach((u) => { map[u.id] = u.full_name || u.email || ""; });
      setUserMap(map);
    } catch {
      /* non-admin users cannot list users; fall back to id fragment */
    }

    setAuxLoading(false);
  };

  useEffect(() => { loadAux(); }, []);

  // After React commits the printQueue to the DOM, copy the rendered content
  // into the already-open print window. Using useEffect (not rAF) guarantees
  // the DOM is updated before we read it.
  useEffect(() => {
    if (printQueue.length === 0) return;
    const printWindow = pendingPrintWindowRef.current;
    if (!printWindow || printWindow.closed) return;
    // Use rAF inside the effect to wait for the browser to paint the committed DOM
    const rafId = requestAnimationFrame(() => {
      if (printSheetRef.current) {
        populatePrintWindow(printWindow, printSheetRef.current);
      }
      pendingPrintWindowRef.current = null;
    });
    return () => cancelAnimationFrame(rafId);
  }, [printQueue]);

  // records already filtered by selected year from the left navigation
  const records = useMemo(
    () => (selectedYear == null
      ? allRecords
      : allRecords.filter((r) => {
          const d = r.date_of_issuance || r.created_date;
          return d && new Date(d).getFullYear() === selectedYear;
        })),
    [allRecords, selectedYear]
  );

  const lastLocation = useMemo(() => {
    const sorted = [...allRecords].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    return sorted[0]?.location || "";
  }, [allRecords]);

  // remember the last successfully encoded location as the default for new certificates
  useEffect(() => {
    if (!editingId && lastLocation) {
      setData((d) => ({ ...d, location: lastLocation }));
    }
  }, [lastLocation, editingId]);

  const missing = useMemo(
    () => Object.keys(REQUIRED_LABELS).filter((k) => !String(data[k] || "").trim()).map((k) => REQUIRED_LABELS[k]),
    [data]
  );

  const normMatch = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
  const employeeDupWarning = useMemo(() => {
    const v = (data.person_name || "").trim();
    if (!v) return "";
    if (employees.some((e) => e.name === v)) return "";
    const dup = employees.find((e) => normMatch(e.name) === normMatch(v));
    return dup ? `A similar employee already exists: "${dup.name}".` : "";
  }, [data.person_name, employees]);
  const officeDupWarning = useMemo(() => {
    const v = (data.office || "").trim();
    if (!v) return "";
    if (fieldOffices.some((o) => o.name === v)) return "";
    const dup = fieldOffices.find((o) => normMatch(o.name) === normMatch(v));
    return dup ? `A similar office already exists: "${dup.name}".` : "";
  }, [data.office, fieldOffices]);

  const validate = () => {
    if (missing.length) {
      toast({ variant: "destructive", title: "Incomplete certificate", description: `Please fill in: ${missing.join(", ")}` });
      return false;
    }
    const from = data.date_from;
    const to = data.date_to || data.date_from;
    if (from && to && to < from) {
      toast({ variant: "destructive", title: "Invalid date range", description: "The 'To' date cannot be earlier than the 'From' date." });
      return false;
    }
    return true;
  };

  const filtered = useMemo(() => {
    let list = records;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        [r.id?.slice(-8), r.person_name, r.office, r.purpose, r.location]
          .some((v) => (v || "").toLowerCase().includes(q))
      );
    }
    if (fEmployee) list = list.filter((r) => r.person_name === fEmployee);
    if (fOffice) list = list.filter((r) => r.office === fOffice);
    if (fDateFrom) list = list.filter((r) => (r.date_from || r.date_of_appearance || "") >= fDateFrom);
    if (fDateTo) list = list.filter((r) => (r.date_to || r.date_from || r.date_of_appearance || "") <= fDateTo);
    if (fStatus) list = list.filter((r) => (r.status || "Draft") === fStatus);
    return list;
  }, [records, search, fEmployee, fOffice, fDateFrom, fDateTo, fStatus]);

  const filteredSorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const arr = [...filtered];
    arr.sort((a, b) => {
      switch (sortKey) {
        case "cert_no":
          return (a.id || "").slice(-8).localeCompare((b.id || "").slice(-8)) * dir;
        case "person_name":
          return (a.person_name || "").localeCompare(b.person_name || "") * dir;
        case "office":
          return (a.office || "").localeCompare(b.office || "") * dir;
        case "date_from":
          return (a.date_from || a.date_of_appearance || "").localeCompare(b.date_from || b.date_of_appearance || "") * dir;
        case "created_date":
        default:
          return (a.created_date || "").localeCompare(b.created_date || "") * dir;
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds((prev) => (prev.length === filteredSorted.length ? [] : filteredSorted.map((r) => r.id)));

  const doPrint = (record) => {
    const printWindow = openPrintWindowSync();
    if (!printWindow) {
      toast({ variant: "destructive", title: "Print blocked", description: "Please allow pop-ups for this site to print certificates." });
      return;
    }
    pendingPrintWindowRef.current = printWindow;
    setPrintQueue([record]);
  };

  const doPrintMultiple = (recs) => {
    if (!recs.length) return;
    const printWindow = openPrintWindowSync();
    if (!printWindow) {
      toast({ variant: "destructive", title: "Print blocked", description: "Please allow pop-ups for this site to print certificates." });
      return;
    }
    pendingPrintWindowRef.current = printWindow;
    setPrintQueue(recs);
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = { ...data, date_to: data.date_to || data.date_from };
    try {
      if (editingId) {
        await db.entities.Certificate.update(editingId, payload);
      } else {
        const created = await db.entities.Certificate.create(payload);
        try {
          await db.entities.CertificateLog.create({
            certificate_id: created.id,
            from_status: "Created",
            to_status: payload.status || "Draft",
          });
        } catch (logErr) {
          console.warn("CertificateLog insert failed:", logErr);
        }
      }
      const exists = signatories.some((s) => s.name === data.signatory_name && s.position === data.signatory_position);
      if (!exists && data.signatory_name) {
        try {
          await db.entities.Signatory.create({ name: data.signatory_name, position: data.signatory_position });
        } catch (auxErr) {
          console.warn("Signatory save failed:", auxErr);
        }
      }
      if (saveEmployee && data.person_name) {
        const dup = employees.some((e) => normMatch(e.name) === normMatch(data.person_name));
        if (!dup) {
          try {
            await db.entities.Employee.create({
              name: data.person_name.trim(),
              position: data.person_position || "",
              office: data.office || "",
              active: true,
            });
          } catch (auxErr) {
            console.warn("Employee save failed:", auxErr);
          }
        }
      }
      if (saveOffice && data.office) {
        const dup = fieldOffices.some((o) => normMatch(o.name) === normMatch(data.office));
        if (!dup) {
          try {
            await db.entities.FieldOffice.create({ name: data.office.trim() });
          } catch (auxErr) {
            console.warn("FieldOffice save failed:", auxErr);
          }
        }
      }
      await refresh();
      await loadAux();
      toast({ title: editingId ? "Certificate updated" : "Certificate saved" });
      setEditingId(null);
      setData({ ...EMPTY, location: payload.location });
      setSaveEmployee(false);
      setSaveOffice(false);
      navigate("/history");
    } catch (err) {
      console.error("Save failed:", err);
      const msg = (err.message || "").toLowerCase();
      let title = "Could not save certificate";
      let description = err.message || "An unexpected error occurred. Please try again.";

      if (msg.includes("row-level security") || msg.includes("rls") || err.code === "42501") {
        title = "Permission denied";
        description = "Your account does not have permission to save certificates. Please contact your administrator to verify database access policies.";
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
        title = "Connection error";
        description = "Could not connect to the server. Please check your internet connection and try again.";
      } else if (msg.includes("jwt") || msg.includes("token") || msg.includes("session")) {
        title = "Session expired";
        description = "Your login session has expired. Please log out and sign in again, then try saving.";
      } else if (msg.includes("duplicate") || err.code === "23505") {
        title = "Duplicate record";
        description = "A certificate with this information already exists.";
      }

      toast({ variant: "destructive", title, description });
    }
  };

  const handleDelete = async (r) => {
    await db.entities.Certificate.delete(r.id);
    await refresh();
    toast({ title: "Certificate deleted" });
  };

  const handleStatusChange = async (r, status) => {
    const prev = r.status || "Draft";
    await db.entities.Certificate.update(r.id, { status });
    if (prev !== status) {
      await db.entities.CertificateLog.create({
        certificate_id: r.id,
        from_status: prev,
        to_status: status,
      });
    }
    await refresh();
    toast({ title: `Marked as ${status}` });
  };

  const startEdit = (r) => {
    const merged = { ...EMPTY, ...r };
    if (!merged.date_from && merged.date_of_appearance) {
      merged.date_from = merged.date_of_appearance;
      if (!merged.date_to) merged.date_to = merged.date_of_appearance;
    }
    setData(merged);
    setEditingId(r.id);
    setSaveEmployee(false);
    setSaveOffice(false);
    navigate("/");
  };

  const onSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "created_date" ? "desc" : "asc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFEmployee("");
    setFOffice("");
    setFDateFrom("");
    setFDateTo("");
    setFStatus("");
    setSelectedYear(null);
  };

  const hasFilters = !!(search || fEmployee || fOffice || fDateFrom || fDateTo || fStatus || selectedYear != null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`no-print mx-auto py-12 pb-28 md:pb-12 ${isHistory ? "w-full max-w-[1700px] px-4 md:px-6" : "max-w-5xl px-6"}`}>
        <header className="mb-10">
          <p className="font-semibold uppercase tracking-[0.3em] text-red-600 text-xs">
            Parole and Probation Administration · Regional Office No. XI
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">
            Certificate of Appearance
          </h1>
        </header>

        <div className="mb-8 hidden gap-2 md:flex">
          <Button asChild variant={!isHistory ? "default" : "outline"}>
            <Link to="/"><FileText className="mr-2 h-4 w-4" /> Certificate of Appearance</Link>
          </Button>
          <Button asChild variant={isHistory ? "default" : "outline"}>
            <Link to="/history"><HistoryIcon className="mr-2 h-4 w-4" /> Generated Certificates</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard"><BarChart3 className="mr-2 h-4 w-4" /> Dashboard</Link>
          </Button>
        </div>

        <div className={`rounded-2xl border border-border bg-card shadow-sm ${isHistory ? "p-3 md:p-4" : "p-5 md:p-8"}`}>
          {!isHistory ? (
            <>
              <CertificateForm
                data={data}
                onChange={setData}
                employees={employees}
                fieldOffices={fieldOffices}
                employeeLoading={auxLoading}
                employeeError={employeeError}
                savedSignatories={signatories}
                onPickSignatory={(s) => setData({ ...data, signatory_name: s.name, signatory_position: s.position })}
                saveEmployee={saveEmployee}
                setSaveEmployee={setSaveEmployee}
                saveOffice={saveOffice}
                setSaveOffice={setSaveOffice}
                employeeDupWarning={employeeDupWarning}
                officeDupWarning={officeDupWarning}
              />

              <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
                <Button variant="outline" onClick={() => validate() && setPreview(data)} className="bg-white text-black border-slate-300 hover:bg-slate-100">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
                <Button variant="outline" onClick={() => validate() && doPrint(data)} className="bg-white text-black border-slate-300 hover:bg-slate-100">
                  <Printer className="mr-2 h-4 w-4" /> Print Certificate
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="ghost" onClick={() => { setData({ ...EMPTY, location: lastLocation || EMPTY.location }); setEditingId(null); setSaveEmployee(false); setSaveOffice(false); }} className="bg-white text-black border border-slate-300 hover:bg-slate-100">
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <CertificateHistoryToolbar
                search={search}
                setSearch={setSearch}
                employees={employees}
                fieldOffices={fieldOffices}
                fEmployee={fEmployee}
                setFEmployee={setFEmployee}
                fOffice={fOffice}
                setFOffice={setFOffice}
                fDateFrom={fDateFrom}
                setFDateFrom={setFDateFrom}
                fDateTo={fDateTo}
                setFDateTo={setFDateTo}
                fStatus={fStatus}
                setFStatus={setFStatus}
                years={years}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                onClear={clearFilters}
                hasFilters={hasFilters}
              />

              {filteredSorted.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {selectedIds.length} of {filteredSorted.length} selected
                  </p>
                  <Button
                    onClick={() => {
                      const selected = filteredSorted.filter((r) => selectedIds.includes(r.id));
                      if (!selected.length) {
                        toast({ variant: "destructive", title: "No certificates selected", description: "Please select at least one certificate to print." });
                        return;
                      }
                      doPrintMultiple(selected);
                    }}
                  >
                    <Printer className="mr-2 h-4 w-4" /> Print Selected
                  </Button>
                </div>
              )}

              <div className="mt-4">
                <CertificateHistory
                  records={filteredSorted}
                  onView={setPreview}
                  onEdit={startEdit}
                  onPrint={doPrint}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSort}
                  userMap={userMap}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="no-print max-w-[9in] overflow-x-auto bg-slate-100 p-6">
          {preview && (
            <div className="mx-auto shadow-lg">
              <CertificateDocument data={preview} />
            </div>
          )}
          {preview && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
              <Button onClick={() => doPrint(preview)}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>
          )}
          {preview && preview.id && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Status History</h3>
              <CertificateStatusLog certificateId={preview.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div ref={printSheetRef} className="print-sheet">
        <CertificatePrintSheet queue={printQueue} />
      </div>
    </div>
  );
}