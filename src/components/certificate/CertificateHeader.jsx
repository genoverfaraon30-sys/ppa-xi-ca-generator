import React from "react";
import { ASSETS } from "@/lib/certUtils";

export default function CertificateHeader() {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <img src={ASSETS.ppa} alt="PPA Seal" className="h-[1.05in] w-auto object-contain" />
        <div className="flex-1 text-center leading-tight px-2">
          <div className="text-[11pt]">Republic of the Philippines</div>
          <div className="text-[12pt] font-bold">DEPARTMENT OF JUSTICE</div>
          <div className="text-[12pt] font-bold text-red-600">PAROLE AND PROBATION ADMINISTRATION</div>
          <div className="text-[11pt] font-bold text-blue-700">Regional Office No. XI</div>
          <div className="text-[10pt] font-bold">2/F Hall of Justice, Ecoland, Davao City</div>
          <div className="text-[10pt] font-bold">☎(082) 2961213</div>
          <div className="text-[10pt] font-bold">✉dojppa.regionxi.second.acct@gmail.com</div>
        </div>
        <img src={ASSETS.bagongPilipinas} alt="Bagong Pilipinas" className="h-[1.05in] w-auto object-contain" />
      </div>
      <div className="mt-1 h-[1.5px] w-full bg-red-600" />
    </div>
  );
}