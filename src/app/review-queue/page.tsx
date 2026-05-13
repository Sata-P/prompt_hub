import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/component/ui/table";
import { ClipboardList, Eye, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Changed to query Prisma directly to avoid server-to-server fetch issues with auth
async function getReviewPrompts() {
  try {
    const prompts = await prisma.prompts.findMany({
      where: {
        status: "REVIEW",
        deleted_at: null,
      },
      include: {
        owner: { select: { name: true } },
      },
      orderBy: { updated_at: "desc" },
    });
    return prompts;
  } catch (error) {
    console.error("Failed to fetch review queue from DB:", error);
    throw new Error("Failed to fetch review queue");
  }
}

export default async function ReviewQueuePage() {
  const session = await getServerAuthSession();

  // 1. Guard: Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // 2. Guard: Role check (ADMIN or EDITOR only)
  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "EDITOR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-2">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to access this page (Admin/Editor only).</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  let prompts: any[] = [];
  let error = null;

  try {
    prompts = await getReviewPrompts();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="rounded-lg bg-primary/10 flex items-center justify-center mr-2 h-8 w-8 shrink-0">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Error: {error}
        </div>
      )}

      {/* Empty State & Data Table */}
      {!error && prompts.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border fade-in-up">
          <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">No prompts pending review at the moment 🎉</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden fade-in-up stagger-1">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] font-semibold">Prompt Title</TableHead>
                <TableHead className="font-semibold">Author</TableHead>
                <TableHead className="font-semibold">Date Submitted</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((prompt: any, i: number) => (
                <TableRow 
                  key={prompt.id} 
                  className="hover:bg-accent/40 transition-colors group"
                >
                  <TableCell className="font-medium text-foreground py-4">
                    {prompt.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {prompt.owner?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(prompt.updated_at).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning" className="font-medium">
                      {prompt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      asChild 
                      size="sm" 
                      variant="outline" 
                      className="gap-1.5 h-8 hover:bg-primary hover:text-primary-foreground border-border/60"
                    >
                      <Link href={`/prompts/${prompt.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
