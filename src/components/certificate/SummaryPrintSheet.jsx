import React from "react";
import moment from "moment";
import { ASSETS, formatLongDate } from "@/lib/certUtils";

export default function SummaryPrintSheet({ records, yearLabel }) {
  const reportDate = moment().format("MMMM D, YYYY · h:mm A");

  return (
    <div
      className="summary-print-sheet bg-white text-black"
      style={{ padding: "0.4in 0.5in", fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="flex items-center gap-3 border-b-2 border-black pb-3">
        <img src={ASSETS.ppa} alt="PPA" style={{ height: "0.6in" }} />
        <div className="flex-1 text-center">
          <p className="text-[10pt] font-bold uppercase">Republic of the Philippines</p>
          <p className="text-[10pt] font-bold uppercase">Department of Justice</p>
          <p className="text-[11pt] font-bold uppercase">
            Parole and Probation Administration · Regional Office No. XI
          </p>
        </div>
        <img src={ASSETS.bagongPilipinas} alt="Bagong Pilipinas" style={{ height: "0.6in" }} />
      </div>

      <h1 className="mt-4 text-center text-[14pt] font-bold uppercase underline">
        Summary of Issued Certificates of Appearance
      </h1>
      <p className="mt-1 text-center text-[10pt] font-semibold">{yearLabel}</p>
      <p className="mt-1 text-right text-[9pt]">Report generated: {reportDate}</p>

      <table className="mt-3 w-full border-collapse text-[9pt]">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-400 px-2 py-1 text-left">No.</th>
            <th className="border border-slate-400 px-2 py-1 text-left">Certificate No.</th>
            <th className="border border-slate-400 px-2 py-1 text-left">Date Issued</th>
            <th className="border border-slate-400 px-2 py-1 text-left">Name of Person</th>
            <th className="border border-slate-400 px-2 py-1 text-left">Office / Agency</th>
            <th className="border border-slate-400 px-2 py-1 text-left">Purpose / Reason</th>
            <th className="border border-slate-400 px-2 py-1 text-left">Signatory</th>
            <th className="border border-slate-400 px-2 py-1 text-left">Signatory Position</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={r.id}>
              <td className="border border-slate-400 px-2 py-1">{i + 1}</td>
              <td className="border border-slate-400 px-2 py-1 font-mono">
                {r.id ? r.id.slice(-8).toUpperCase() : ""}
              </td>
              <td className="border border-slate-400 px-2 py-1">{formatLongDate(r.date_of_issuance)}</td>
              <td className="border border-slate-400 px-2 py-1">{r.person_name}</td>
              <td className="border border-slate-400 px-2 py-1">{r.office}</td>
              <td className="border border-slate-400 px-2 py-1">{r.purpose}</td>
              <td className="border border-slate-400 px-2 py-1">{r.signatory_name}</td>
              <td className="border border-slate-400 px-2 py-1">{r.signatory_position}</td>
            </tr>
          ))}
          {!records.length && (
            <tr>
              <td colSpan={8} className="border border-slate-400 px-2 py-3 text-center text-slate-500">
                No issued certificates found for this period.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="mt-3 text-right text-[10pt] font-bold">
        Total Issued Certificates: {records.length}
      </p>

      <div className="mt-6 flex justify-center">
        <img src={ASSETS.iso} alt="ISO" style={{ height: "0.5in" }} />
      </div>
    </div>
  );
}