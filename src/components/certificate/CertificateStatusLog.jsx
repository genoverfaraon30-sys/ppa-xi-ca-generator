import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function CertificateStatusLog({ certificateId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certificateId) return;
    setLoading(true);
    base44.entities.CertificateLog
      .filter({ certificate_id: certificateId }, "-created_date", 100)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) return <p className="text-xs text-slate-400">Loading history…</p>;
  if (!logs.length) return <p className="text-xs text-slate-400">No status changes recorded.</p>;

  return (
    <ol className="space-y-2">
      {logs.map((l) => (
        <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span className="font-mono text-slate-400">{moment(l.created_date).format("MMM D, YYYY · h:mm A")}</span>
          <span>
            <span className="font-medium">{l.from_status}</span>
            <span className="mx-1 text-slate-400">→</span>
            <span className="font-medium">{l.to_status}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}