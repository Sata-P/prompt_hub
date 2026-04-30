"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Archive,
  LayoutGrid
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Skeleton } from "@/component/ui/skeleton";
import { Badge } from "@/component/ui/badge";
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
  totalCategories: number;
  totalTags: number;
};

/**
 * หน้า Dashboard 
 * แสดงสถิติและภาพรวมการทำงานของระบบ ไวรัล หรือจำนวน Prompts ในสถานะต่างๆ
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get<DashboardStats>("/api/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <Badge variant="success">Published</Badge>;
      case "DRAFT": return <Badge variant="secondary">Draft</Badge>;
      case "REVIEW": return <Badge variant="warning">Review</Badge>;
      case "ARCHIVED": return <Badge variant="outline">Archived</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const { data: session } = useSession();
  

  return (
    <div className="min-h-screen bg-background text-foreground">

      <main className="py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">ภาพรวมการทำงานและระบบ Prompt ของคุณ</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/prompts"><LayoutGrid className="mr-2 h-4 w-4" /> ดูทั้งหมด</Link>
            </Button>
            <Button asChild>
              <Link href="/prompts/new"><Plus className="mr-2 h-4 w-4" /> สร้าง Prompt</Link>
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prompt ทั้งหมด</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stats?.totalPrompts || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">รายการสะสม</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">พร้อมใช้งาน (Published)</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-green-600">{stats?.byStatus.PUBLISHED || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">ที่เปิดใช้งานอยู่</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">กำลังแก้ไข (Draft)</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-yellow-600">{stats?.byStatus.DRAFT || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">รอการตรวจสอบ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">เก็บถาวร (Archived)</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stats?.byStatus.ARCHIVED || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">ไม่ได้ใช้งานแล้ว</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Prompts List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>ใช้งานล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : stats?.recentPrompts?.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
                  ยังไม่ได้สร้าง Prompt ใดๆ
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentPrompts?.map(prompt => (
                    <Link 
                      key={prompt.id} 
                      href={`/prompts/${prompt.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{prompt.title}</span>
                          {prompt.category && (
                            <span className="text-[10px] uppercase bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                              {prompt.category.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          อัปเดต {new Date(prompt.updated_at).toLocaleDateString('th-TH')}
                          <span>• v{prompt.latest_version_no}</span>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(prompt.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ภาพรวมหมวดหมู่</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-muted-foreground">Categories ทั้งหมด:</span>
                    <span className="text-xl font-bold">{stats?.totalCategories || 0}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-muted-foreground">Tags ทั้งหมด:</span>
                    <span className="text-xl font-bold">{stats?.totalTags || 0}</span>
                  </div>
                  {session?.user?.role === 'ADMIN' && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/settings">จัดการ Category / Tag</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
