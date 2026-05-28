"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function MobileHeader({ title, showSearch = false }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo or Title */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="text-base font-semibold text-gray-900">
            {title || "VedaAI"}
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <Search size={18} />
            </button>
          )}
          <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <Bell size={18} />
          </button>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
