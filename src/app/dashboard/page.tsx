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
      <div className="space-y-10">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Page Header ── */}
      <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>

      {/* ── Stats Section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        className="relative rounded-[32px] p-8 overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(249,115,22,0.1)] transition-all duration-500 cursor-pointer group"
        style={{
          background: "linear-gradient(#10071C, #10071C) padding-box, linear-gradient(135deg, #F97316 0%, rgba(249, 115, 22, 0.1) 45%, rgba(124, 58, 237, 0.1) 65%, #7c3aed 100%) border-box",
          border: "1px solid transparent",
          boxShadow: "0 0 20px rgba(0,0,0,0.4), 0 0 40px rgba(249,115,22,0.05)"
        }}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-7 bg-[#F97316] rounded-full" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Recently Updated</h2>
          </div>
          <Link 
            href="/prompts" 
            className="flex items-center gap-2 text-[#F97316] font-bold text-sm hover:translate-x-1 transition-transform"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-0">
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
                  <h3 className="text-lg font-bold text-white group-hover:text-[#F97316] transition-colors">{prompt.title}</h3>
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
      className="relative rounded-[28px] p-8 flex items-center justify-between overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_30px_var(--glow)] transition-all duration-300 cursor-pointer group"
      style={{
        background: "linear-gradient(#10071C, #10071C) padding-box, linear-gradient(145deg, #F97316 0%, #7c3aed 30%,rgba(249, 115, 22, 0.1) 40%, rgba(124, 58, 237, 0.1) 55%) border-box",
        border: "1px solid transparent",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        "--glow": glowColor
      } as React.CSSProperties}
    >
      <div className="relative z-10">
        <p className="text-sm font-semibold text-white/40 mb-2 uppercase tracking-widest">{label}</p>
        <p className="text-5xl font-bold text-white tabular-nums">{value}</p>
      </div>
      <div 
        className={`relative z-10 h-14 w-14 rounded-full flex items-center justify-center ${iconBg} shadow-lg`}
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
