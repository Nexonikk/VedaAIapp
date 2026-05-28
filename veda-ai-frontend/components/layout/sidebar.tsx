"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAssignmentStore } from "@/store";

const ICON_MAP = {
  Home,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
};

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "My Groups", href: "/groups", icon: "Users" },
  { label: "Assignments", href: "/assignments", icon: "FileText", showBadge: true },
  { label: "AI Teacher's Toolkit", href: "/ai-toolkit", icon: "Sparkles" },
  { label: "My Library", href: "/library", icon: "BookOpen" },
  { label: "Settings", href: "/settings", icon: "Settings", isBottom: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const assignments = useAssignmentStore((s) => s.assignments);

  const topItems = NAV_ITEMS.filter((i) => !i.isBottom);
  const bottomItems = NAV_ITEMS.filter((i) => i.isBottom);

  return (
    <aside className="hidden lg:flex flex-col w-full h-full bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-10 h-10 bg-gradient-to-br from-[#E65C00] to-[#F9D423] rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white text-xl font-bold">V</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-gray-900">VedaAI</span>
      </div>

      {/* Create Assignment Button */}
      <div className="px-5 mb-6">
        <Link
          href="/create-assignment"
          className="flex items-center justify-center gap-3 w-full bg-[#1e1e1e] border border-transparent hover:border-orange-500/50 shadow-[0_0_20px_rgba(255,94,0,0.1)] text-white rounded-full px-4 py-3.5 text-sm font-medium hover:bg-black transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
        >
          <Sparkles size={18} className="text-white group-hover:text-orange-400 transition-colors" />
          <span className="flex-1 text-left">Create Assignment</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {topItems.map((item) => {
          const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const badgeCount =
            item.showBadge && assignments.length > 0
              ? assignments.length
              : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] transition-all duration-200 group hover:translate-x-1",
                isActive
                  ? "bg-gray-100 text-gray-900 font-semibold shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
              )}
            >
              <Icon
                size={20}
                className={cn(
                  isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {badgeCount && (
                <span className="bg-[#FF4500] text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[26px] text-center shadow-sm">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings & User Profile at Bottom */}
      <div className="px-4 pb-6 pt-4 mt-auto space-y-3 bg-white">
        {bottomItems.map((item) => {
          const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] transition-all duration-200 group hover:translate-x-1",
                isActive
                  ? "bg-gray-100 text-gray-900 font-semibold shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600")} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
        
        <div className="mt-4 bg-gray-100/80 hover:bg-gray-100 transition-colors cursor-default rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
            🏫
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[13px] font-bold text-gray-900 truncate tracking-tight">Delhi Public School</p>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
