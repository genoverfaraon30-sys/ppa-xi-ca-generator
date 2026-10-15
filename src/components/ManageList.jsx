import React, { useState } from "react";
import { db } from "@/api/dataAdapter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function ManageList({ title, description, entityName, records, fields, onReload, addLabel }) {
  const { toast } = useToast();
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, ""])));
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const add = async () => {
    const name = (values.name || "").trim();
    if (!name) return;
    const exists = records.some((r) => (r.name || "").toLowerCase() === name.toLowerCase());
    if (exists) {
      toast({ variant: "destructive", title: "Already exists", description: `${name} is already in the list.` });
      return;
    }
    setBusy(true);
    try {
      const payload = {};
      fields.forEach((f) => {
        const v = (values[f.key] || "").trim();
        if (v) payload[f.key] = v;
      });
      await db.entities[entityName].create(payload);
      setValues(Object.fromEntries(fields.map((f) => [f.key, ""])));
      await onReload();
      toast({ title: `${addLabel || title} added` });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r) => {
    setBusy(true);
    try {
      await db.entities[entityName].delete(r.id);
      await onReload();
      toast({ title: "Entry removed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {fields.map((f) => (
            <Input
              key={f.key}
              value={values[f.key]}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              className={cn("bg-white", f.className)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
          ))}
          <Button onClick={add} disabled={busy}>{addLabel || "Add"}</Button>
        </div>
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {records.length === 0 && <p className="text-sm text-slate-400">No entries yet.</p>}
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5 text-sm">
              <span className="truncate">{r.name}{r.position ? ` — ${r.position}` : ""}</span>
              <Button size="icon" variant="ghost" onClick={() => remove(r)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}