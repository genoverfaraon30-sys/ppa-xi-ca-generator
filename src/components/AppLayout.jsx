import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import LeftYearNav from "./LeftYearNav";
import { YearFilterProvider } from "@/lib/YearFilterContext";

export default function AppLayout() {
  return (
    <YearFilterProvider>
      <div className="min-h-screen bg-slate-50 md:flex">
        <LeftYearNav />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </YearFilterProvider>
  );
}