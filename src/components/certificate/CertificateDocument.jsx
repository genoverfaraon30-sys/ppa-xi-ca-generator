import React from "react";
import CertificateHeader from "./CertificateHeader";
import CertificateFooter from "./CertificateFooter";
import { formatLongDate, issuanceParts, appearanceDateClause } from "@/lib/certUtils";

export default function CertificateDocument({ data, width = "8.5in", height = "6.5in" }) {
  const iss = issuanceParts(data.date_of_issuance);

  return (
    <div
      id="certificate-print-area"
      className="cert-sheet bg-white text-black flex flex-col"
      style={{ width, height, padding: "0.35in 0.5in", fontFamily: "Arial, Helvetica, sans-serif", overflow: "hidden" }}
    >
      {data.id && (
        <div className="text-left text-[10pt] font-medium text-black">
          Certificate No.: {data.id.slice(-8).toUpperCase()}
        </div>
      )}

      <CertificateHeader />

      <div className="mt-2 text-right text-[10pt] font-bold italic">{data.document_code}</div>

      <h1 className="mt-3 text-center text-[16pt] font-bold tracking-wide">CERTIFICATE OF APPEARANCE</h1>

      <div className="mt-4 space-y-3 text-[11pt] leading-[1.6] text-justify">
        <p className="indent-8">
          This is to certify that <span className="font-bold underline">{data.person_name}</span> of {data.office}, personally appeared at the {data.location} {appearanceDateClause(data)} to {data.purpose}.
        </p>
        <p className="indent-8">This certification is being issued for whatever legal intent it may serve.</p>
        {iss && (
          <p className="indent-8">
            Issued on {iss.day}<sup>{iss.suffix}</sup> day of {iss.month} {iss.year} in {data.place_of_issuance}.
          </p>
        )}
      </div>

      <div className="mt-auto pb-2 text-center" style={{ width: "3.4in", marginLeft: "auto" }}>
        <div className="text-[12pt] font-bold uppercase">{data.signatory_name}</div>
        <div className="text-[11pt]">{data.signatory_position}</div>
      </div>

      <CertificateFooter />
    </div>
  );
}