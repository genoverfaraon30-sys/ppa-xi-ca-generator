import { formatLongDate } from "./certUtils";

function csvCell(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function exportCertificatesBackup(records) {
  const headers = [
    "Certificate No",
    "Document Code",
    "Name",
    "Office",
    "Location",
    "Date of Appearance",
    "Purpose",
    "Date of Issuance",
    "Place of Issuance",
    "Signatory",
    "Signatory Position",
    "Status",
    "Created",
  ];

  const rows = records.map((r) => [
    r.id ? r.id.slice(-8).toUpperCase() : "",
    r.document_code || "",
    r.person_name || "",
    r.office || "",
    r.location || "",
    formatLongDate(r.date_of_appearance),
    r.purpose || "",
    formatLongDate(r.date_of_issuance),
    r.place_of_issuance || "",
    r.signatory_name || "",
    r.signatory_position || "",
    r.status || "",
    r.created_date ? new Date(r.created_date).toLocaleString() : "",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PPA-XI-Certificates-Backup-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}