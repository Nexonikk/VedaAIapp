"use client";

import { Bell, ChevronLeft, ChevronDown, LayoutGrid } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  
  let title = "Overview";
  if (pathname.includes("assignments") || pathname === "/") title = "Assignment";
  if (pathname.includes("create-assignment")) title = "Create New";
  if (pathname.includes("groups")) title = "My Groups";
  if (pathname.includes("ai-toolkit")) title = "AI Teacher's Toolkit";
  if (pathname.includes("library")) title = "My Library";
  if (pathname.includes("settings")) title = "Settings";

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-transparent w-full">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-2 text-gray-400 font-medium">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-gray-500">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative p-2 hover:bg-gray-200 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-[#f3f4f6]"></span>
        </button>
        <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-all">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-50 flex items-center justify-center">
            <span className="text-lg">👨‍🏫</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 pr-1">John Doe</span>
          <ChevronDown className="w-4 h-4 text-gray-500 mr-2" />
        </div>
      </div>
    </header>
  );
}
