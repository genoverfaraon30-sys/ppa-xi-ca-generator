import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Pencil, Printer, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLongDate, effDateFrom, effDateTo } from "@/lib/certUtils";

const STATUS_STYLES = {
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Issued: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Voided: "bg-red-50 text-red-600 border-red-200",
};

const TABLE_WIDTH = 2128;

function StatusSelect({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-7 w-[110px] text-xs font-medium border ${STATUS_STYLES[value] || STATUS_STYLES.Draft}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Draft">Draft</SelectItem>
        <SelectItem value="Issued">Issued</SelectItem>
        <SelectItem value="Voided">Voided</SelectItem>
      </SelectContent>
    </Select>
  );
}

function SortTh({ label, k, sortKey, sortDir, onSort, className, style }) {
  const active = sortKey === k;
  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th style={style} className={cn("whitespace-nowrap px-3 py-3 font-medium", className)}>
      <button
        onClick={() => onSort(k)}
        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700"
      >
        {label} <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

export default function CertificateHistory({
  records,
  onView,
  onEdit,
  onPrint,
  onDelete,
  onStatusChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sortKey,
  sortDir,
  onSort,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (!records.length) {
    return <p className="py-16 text-center text-sm text-slate-400">No certificates found.</p>;
  }

  const allChecked = selectedIds.length === records.length && records.length > 0;

  const rowActions = (r) => (
    <div className="flex gap-1">
      <Button size="icon" variant="ghost" title="View" onClick={() => onView(r)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" title="Edit" onClick={() => onEdit(r)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" title="Print" onClick={() => onPrint(r)}>
        <Printer className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" title="Delete" onClick={() => setDeleteTarget(r)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );

  const sortProps = { sortKey, sortDir, onSort };
  const headBase = "sticky top-0 z-30 bg-slate-100 text-[10px] uppercase tracking-widest text-slate-500";
  const stickyLeftHead = "sticky top-0 z-40 bg-slate-100";
  const stickyRightHead = "sticky top-0 right-0 z-40 bg-slate-100";
  const stickyLeftBody = "sticky z-20 bg-white group-hover:bg-slate-50";
  const stickyRightBody = "sticky right-0 z-20 bg-white group-hover:bg-slate-50";

  return (
    <>
      <div className="overflow-auto max-h-[72vh] rounded-b-xl">
        <table className="table-fixed text-left text-sm" style={{ width: TABLE_WIDTH }}>
          <thead>
            <tr className="border-b border-slate-200">
              <th style={{ width: 48, left: 0 }} className={cn(stickyLeftHead, "px-3 py-3")}>
                <Checkbox checked={allChecked} onCheckedChange={onToggleSelectAll} aria-label="Select all" />
              </th>
              <SortTh label="Certificate No." k="cert_no" {...sortProps} style={{ width: 120, left: 48 }} className={cn(stickyLeftHead, "border-r border-slate-200")} />
              <SortTh label="Name of Person" k="person_name" {...sortProps} style={{ width: 200, left: 168 }} className={cn(stickyLeftHead, "border-r border-slate-200")} />
              <th style={{ width: 180 }} className={cn(headBase, "px-3 py-3 font-medium whitespace-nowrap")}>Position</th>
              <SortTh label="Office / Agency" k="office" {...sortProps} style={{ width: 220 }} className={cn(headBase, "px-3 py-3")} />
              <SortTh label="Date From" k="date_from" {...sortProps} style={{ width: 120 }} className={cn(headBase, "px-3 py-3")} />
              <th style={{ width: 120 }} className={cn(headBase, "px-3 py-3 font-medium whitespace-nowrap")}>Date To</th>
              <th style={{ width: 240 }} className={cn(headBase, "px-3 py-3 font-medium whitespace-nowrap")}>Purpose</th>
              <th style={{ width: 280 }} className={cn(headBase, "px-3 py-3 font-medium whitespace-nowrap")}>Regional Office / Location</th>
              <SortTh label="Date Generated" k="created_date" {...sortProps} style={{ width: 160 }} className={cn(headBase, "px-3 py-3")} />
              <th style={{ width: 140 }} className={cn(headBase, "px-3 py-3 font-medium whitespace-nowrap")}>Status</th>
              <th style={{ width: 200, right: 0 }} className={cn(stickyRightHead, "px-3 py-3 font-medium whitespace-nowrap border-l border-slate-200")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="group border-b border-slate-100 hover:bg-slate-50/60">
                <td style={{ width: 48, left: 0 }} className={cn(stickyLeftBody, "px-3 py-3")}>
                  <Checkbox
                    checked={selectedIds.includes(r.id)}
                    onCheckedChange={() => onToggleSelect(r.id)}
                    aria-label={`Select ${r.person_name}`}
                  />
                </td>
                <td style={{ width: 120, left: 48 }} className={cn(stickyLeftBody, "px-3 py-3 font-mono text-xs whitespace-nowrap border-r border-slate-200")}>
                  {r.id.slice(-8).toUpperCase()}
                </td>
                <td style={{ width: 200, left: 168 }} className={cn(stickyLeftBody, "px-3 py-3 font-medium text-slate-900 border-r border-slate-200")}>
                  <div className="break-words whitespace-normal">{r.person_name}</div>
                </td>
                <td style={{ width: 180 }} className="px-3 py-3 text-slate-600 align-top">
                  <div className="break-words whitespace-normal">{r.person_position || "—"}</div>
                </td>
                <td style={{ width: 220 }} className="px-3 py-3 text-slate-600 align-top">
                  <div className="break-words whitespace-normal">{r.office}</div>
                </td>
                <td style={{ width: 120 }} className="whitespace-nowrap px-3 py-3 text-slate-600 align-top">
                  {formatLongDate(effDateFrom(r))}
                </td>
                <td style={{ width: 120 }} className="whitespace-nowrap px-3 py-3 text-slate-600 align-top">
                  {formatLongDate(effDateTo(r))}
                </td>
                <td style={{ width: 240 }} className="px-3 py-3 text-slate-600 align-top">
                  <div className="break-words whitespace-normal">{r.purpose}</div>
                </td>
                <td style={{ width: 280 }} className="px-3 py-3 text-slate-600 align-top">
                  <div className="break-words whitespace-normal">{r.location}</div>
                </td>
                <td style={{ width: 160 }} className="whitespace-nowrap px-3 py-3 text-slate-500 align-top">
                  {new Date(r.created_date).toLocaleString()}
                </td>
                <td style={{ width: 140 }} className="px-3 py-3 align-top">
                  <StatusSelect value={r.status || "Draft"} onChange={(v) => onStatusChange(r, v)} />
                </td>
                <td style={{ width: 200, right: 0 }} className={cn(stickyRightBody, "px-3 py-3 whitespace-nowrap border-l border-slate-200")}>
                  {rowActions(r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this certificate?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the certificate for {deleteTarget?.person_name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                onDelete(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}