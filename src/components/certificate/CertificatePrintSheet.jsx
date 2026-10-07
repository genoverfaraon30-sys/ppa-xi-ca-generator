import React from "react";
import CertificateDocument from "./CertificateDocument";

const PAGE_WIDTH = "8.5in";
const PAGE_HEIGHT = "13in";
const CUT_HEIGHT = "0.2in";
const CERT_HEIGHT = "6.4in"; // 6.4 + 0.2 + 6.4 = 13in

function buildPages(queue) {
  const pages = [];
  for (let i = 0; i < queue.length; i += 2) {
    pages.push(queue.slice(i, i + 2));
  }
  return pages;
}

function CuttingLine() {
  return (
    <div
      style={{
        height: CUT_HEIGHT,
        display: "flex",
        alignItems: "center",
        position: "relative",
        margin: "0 0.3in",
      }}
    >
      <div style={{ borderTop: "2px dotted #000", width: "100%" }} />
      <span
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "#ffffff",
          padding: "0 12px",
          fontSize: "8pt",
          letterSpacing: "3px",
          color: "#000000",
          fontWeight: 600,
        }}
      >
        CUT HERE
      </span>
    </div>
  );
}

export default function CertificatePrintSheet({ queue }) {
  const pages = buildPages(queue);
  return (
    <>
      {pages.map((page, i) => (
        <div
          key={i}
          className="print-page"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            pageBreakAfter: i < pages.length - 1 ? "always" : "auto",
          }}
        >
          <CertificateDocument data={page[0]} height={CERT_HEIGHT} />
          {page[1] && (
            <>
              <CuttingLine />
              <CertificateDocument data={page[1]} height={CERT_HEIGHT} />
            </>
          )}
        </div>
      ))}
    </>
  );
}