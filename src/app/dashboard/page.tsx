"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FileText,
  Clock,
  CheckCircle2,
  Archive,
  ArrowRight,
} from "lucide-react";

import { Skeleton } from "@/component/ui/skeleton";
import { useSession } from "next-auth/react";

type DashboardStats = {
  totalPrompts: number;
  byStatus: {
    DRAFT: number;
    REVIEW: number;
    PUBLISHED: number;
    REJECTED: number;
    ARCHIVED: number;
  };
  recentPrompts: {
    id: number;
    title: string;
    status: string;
    latest_version_no: number;
    updated_at: string;
    category?: { name: string; color?: string } | null;
  }[];
  systemTotalPrompts: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    axios
      .get<DashboardStats>("/api/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load dashboard stats", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
    );
    

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-10">
      {/* ── Page Header ── */}
      <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>

      {/* ── Stats Section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 2xl:gap-10">
        <StatCard
          label="Total Prompts"
          value={stats?.totalPrompts ?? 0}
          icon={<FileText className="h-6 w-6 text-white" />}
          iconBg="bg-[#F97316]"
          glowColor="rgba(249,115,22,0.4)"
        />
        <StatCard
          label="Published"
          value={stats?.byStatus?.PUBLISHED ?? 0}
          icon={<CheckCircle2 className="h-6 w-6 text-white" />}
          iconBg="bg-[#22C55E]"
          glowColor="rgba(34,197,94,0.4)"
        />
        <StatCard
          label="In Draft"
          value={stats?.byStatus?.DRAFT ?? 0}
          icon={<Clock className="h-6 w-6 text-white" />}
          iconBg="bg-[#EB9109]"
          glowColor="rgba(234,179,8,0.4)"
        />
        <StatCard
          label="Archived"
          value={stats?.byStatus?.ARCHIVED ?? 0}
          icon={<Archive className="h-6 w-6 text-white" />}
          iconBg="bg-[#A855F7]"
          glowColor="rgba(168,85,247,0.4)"
        />
      </div>

      {/* ── Recently Updated Section ── */}
      <div 
        className="relative rounded-[15px] p-8 2xl:p-12 overflow-hidden transition-all duration-500"
        style={{
          background: "linear-gradient(#10071C, #10071C) padding-box, linear-gradient(135deg, #F97316 0%, rgba(249, 115, 22, 0.1) 45%, rgba(124, 58, 237, 0.1) 65%, #7c3aed 100%) border-box",
          border: "1px solid transparent",
          boxShadow: "0 0 20px rgba(0,0,0,0.4), 0 0 40px rgba(249,115,22,0.05)"
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-7 bg-[#F97316] rounded-full" />
            <p className="text-2xl font-semibold text-white tracking-tight">Recently Updated</p>
          </div>
<Link 
    href="/prompts" 
    className="group flex items-center gap-2 text-[#F97316] font-semibold text-sm"
  >
    <span className="transition-all duration-300 ease-in-out group-hover:tracking-[0.05em]">
      View all
    </span>
    <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
  </Link>
        </div>

        <div className="flex flex-col">
          {stats?.recentPrompts?.map((prompt, i) => (
            <Link 
              key={prompt.id} 
              href={`/prompts/${prompt.id}`}
              className={`flex items-center justify-between py-6 ${i !== (stats.recentPrompts.length - 1) ? 'border-b border-white/5' : ''} group transition-all`}
            >
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 rounded-full bg-[#F97316] flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white group-hover:text-[#F97316] transition-colors">{prompt.title}</p>
                  <p className="text-sm text-white/40 mt-1 font-medium">id: {prompt.id} · v{prompt.latest_version_no}</p>
                </div>
              </div>
              <div className="text-[#22C55E] font-bold text-sm tracking-wide">
                {prompt.status === 'PUBLISHED' ? 'Published' : prompt.status.charAt(0) + prompt.status.slice(1).toLowerCase()}
              </div>
            </Link>
          ))}
          {!stats?.recentPrompts?.length && (
            <div className="py-20 text-center">
              <p className="text-white/40 font-medium">No prompts updated recently.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  iconBg, 
  glowColor 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  iconBg: string; 
  glowColor: string; 
}) {
  return (
    <div 
      className="relative rounded-[28px] p-10 flex items-center justify-between overflow-hidden hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_50px_var(--glow)] transition-all duration-500 cursor-pointer group"
      style={{
        background: `linear-gradient(#10071C, #10071C) padding-box, var(--border-grad) border-box`,
        border: "1px solid transparent",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        "--glow": glowColor,
        "--border-grad": "linear-gradient(145deg, #F97316 0%, #7c3aed 35%, rgba(124, 58, 237, 0.1) 40%, rgba(249, 115, 22, 0.1) 100%)"
      } as React.CSSProperties}
    >
      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 0% 0%, ${glowColor.replace('0.4', '0.2')}, transparent 50%)` }} 
      />
      
      {/* Intense Border Glow on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[28px]" 
        style={{ 
          padding: '1px',
          background: `linear-gradient(135deg, ${glowColor} 0%, transparent 50%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }} 
      />
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/40 mb-2 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-bold text-white tabular-nums mt-3">{value}</p>
      </div>
      <div 
        className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center ${iconBg} shadow-lg`}
        style={{ boxShadow: `0 0 20px ${glowColor}` }}
      >
        {icon}
      </div>
      {/* Subtle background glow */}
      <div 
        className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-[60px] opacity-20"
        style={{ backgroundColor: glowColor }}
      />
    </div>
  );
}
