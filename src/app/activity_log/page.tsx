"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/component/ui/skeleton";
import { Button } from "@/component/ui/button";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
type UserInfo = { id: number; name: string; email: string };

type ActivityLogEntry = {
  id: number;
  user_id: number;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  // มีเฉพาะตอน ADMIN เรียก API
  user?: UserInfo;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * หน้าแสดง Activity Log
 * - ADMIN: เห็น log ของทุกคนพร้อมคอลัมน์ผู้ใช้
 * - User ทั่วไป: เห็นเฉพาะ log ของตัวเอง
 * รองรับ pagination 20 รายการต่อหน้า
 */
export default function ActivityLogPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // ──────────────────────────────────────────────
  // Fetch
  // ──────────────────────────────────────────────
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get<{ data: ActivityLogEntry[]; pagination: Pagination }>(
        `/api/activityLog?page=${page}&limit=20`
      );
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch activity log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // แปลง action string เป็นสีและ label ให้อ่านง่าย
  const actionBadge = (action: string) => {
    const upper = action.toUpperCase();
    if (upper.includes("CREATE") || upper.includes("ADD"))
      return { color: "text-green-700 bg-green-50 border-green-200", label: action };
    if (upper.includes("UPDATE") || upper.includes("EDIT") || upper.includes("CHANGE"))
      return { color: "text-blue-700 bg-blue-50 border-blue-200", label: action };
    if (upper.includes("DELETE") || upper.includes("REMOVE"))
      return { color: "text-red-700 bg-red-50 border-red-200", label: action };
    if (upper.includes("APPROVE") || upper.includes("PUBLISH"))
      return { color: "text-purple-700 bg-purple-50 border-purple-200", label: action };
    if (upper.includes("REJECT"))
      return { color: "text-orange-700 bg-orange-50 border-orange-200", label: action };
      
    // Additional actions
    if (upper.includes("UNFAVORITE"))
      return { color: "text-slate-700 bg-slate-100 border-slate-300", label: action };
    if (upper.includes("FAVORITE"))
      return { color: "text-pink-700 bg-pink-50 border-pink-200", label: action };
    if (upper.includes("REPLY"))
      return { color: "text-teal-700 bg-teal-50 border-teal-200", label: action };
    if (upper.includes("REGISTER"))
      return { color: "text-emerald-700 bg-emerald-50 border-emerald-200", label: action };

    return { color: "text-muted-foreground bg-muted border-border", label: action };
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isAdmin ? "All system-wide activity across every user" : "Your personal activity history"}
          </p>
        </div>
      </div>

      {/* Summary badge */}
      {!loading && (
        <p className="mt-3 text-xs text-muted-foreground">
          Total{" "}
          <span className="font-semibold text-foreground">{pagination.total.toLocaleString()}</span>{" "}
          entries
        </p>
      )}

      {/* Table */}
      <div className="mt-4 rounded-lg border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="px-5 py-3 text-left font-semibold text-foreground">Action</th>
                {isAdmin && (
                  <th className="px-5 py-3 text-left font-semibold text-foreground">Actor</th>
                )}
                <th className="px-5 py-3 text-left font-semibold text-foreground">Details</th>
                <th className="px-5 py-3 text-left font-semibold text-foreground whitespace-nowrap">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                // Skeleton rows
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4">
                        <Skeleton className="h-5 w-28" />
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <Skeleton className="h-5 w-48" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-5 w-36" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 4 : 3}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    No activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = actionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      {/* Action badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* User column — ADMIN only */}
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          {log.user ? (
                            <div>
                              <p className="font-medium text-foreground text-sm">{log.user.name}</p>
                              <p className="text-xs text-muted-foreground">{log.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      )}

                      {/* Details */}
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        {log.details ? (
                          <pre className="whitespace-pre-wrap font-mono bg-muted/40 rounded px-2 py-1 text-[11px] max-w-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}