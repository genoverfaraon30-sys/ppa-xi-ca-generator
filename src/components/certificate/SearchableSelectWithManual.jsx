import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function SearchableSelectWithManual({
  value,
  onChange,
  options,
  placeholder = "Select...",
  emptyText = "No results.",
  manualLabel = "+ ADD / ENTER MANUALLY",
  saveLabel,
  saveChecked = false,
  onSaveToggle,
  duplicateWarning,
  triggerClassName,
  loading = false,
}) {
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const selected = options.find((o) => o.value === value);

  const selectOption = (v) => {
    onChange(v);
    onSaveToggle?.(false);
    setManual(false);
    setOpen(false);
  };

  const chooseManual = () => {
    setManual(true);
    setOpen(false);
  };

  if (manual) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type the complete entry..."
            className="bg-white"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setManual(false)}
            className="shrink-0 bg-white text-black"
            title="Back to list"
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </div>
        {saveLabel && (
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <Checkbox checked={saveChecked} onCheckedChange={(c) => onSaveToggle?.(!!c)} />
            {saveLabel}
          </label>
        )}
        {duplicateWarning && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {duplicateWarning}
          </p>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-white text-black font-normal", triggerClassName)}
        >
          <span className="truncate">
            {loading ? (
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-400" />
                Loading...
              </span>
            ) : selected ? selected.label : value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{loading ? "Loading employees..." : emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => selectOption(o.value)}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <button
          type="button"
          onClick={chooseManual}
          className="flex w-full items-center gap-2 border-t border-slate-100 px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" /> {manualLabel}
        </button>
      </PopoverContent>
    </Popover>
  );
}