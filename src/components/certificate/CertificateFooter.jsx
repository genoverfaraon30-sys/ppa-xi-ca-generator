import React from "react";
import { ASSETS } from "@/lib/certUtils";

export default function CertificateFooter() {
  return (
    <div className="flex justify-center">
      <img src={ASSETS.iso} alt="ISO 9001:2015" className="h-[0.7in] w-auto object-contain" />
    </div>
  );
}