import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, History as HistoryIcon, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const items = [
  { to: "/", label: "New", Icon: FileText },
  { to: "/history", label: "History", Icon: HistoryIcon },
  { to: "/dashboard", label: "Dashboard", Icon: BarChart3 },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  return (
    <nav
      className="no-print fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {items.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                active ? "text-red-600" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-slate-500 transition hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
