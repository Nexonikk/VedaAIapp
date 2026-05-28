"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Wrench } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <AppLayout mobileTitle="Under Development">
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
          <Wrench className="w-10 h-10 text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Feature in Development</h1>
        <p className="text-gray-500 max-w-md mb-10 text-[15px]">
          We are currently working hard to bring this feature to you. Please check back later!
        </p>
        <Link 
          href="/"
          className="bg-[#1e1e1e] text-white px-8 py-3.5 rounded-full font-medium hover:bg-black transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
        >
          Go back to Home
        </Link>
      </div>
    </AppLayout>
  );
}
