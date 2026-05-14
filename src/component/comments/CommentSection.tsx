"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import CommentItem, { Comment } from "./CommentItem";
import { Button } from "@/component/ui/button";
import { MessageSquare, Bold, Italic, List, ListOrdered, Paperclip, X, File as FileIcon, Loader2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type CommentSectionProps = { promptId: number };

// ── Toolbar ─────────────────────────────────────────────────────────────────
// onMouseDown preventDefault is the key fix: prevents the editor from losing
// focus when a toolbar button is clicked.
const MenuBar = ({ editor, onAttach }: { editor: any; onAttach: () => void }) => {
  if (!editor) return null;

  const buttons = [
    { icon: Bold,         cmd: "toggleBold",        active: "bold",        label: "Bold" },
    { icon: Italic,       cmd: "toggleItalic",      active: "italic",      label: "Italic" },
    { icon: List,         cmd: "toggleBulletList",  active: "bulletList",  label: "Bullet list" },
    { icon: ListOrdered,  cmd: "toggleOrderedList", active: "orderedList", label: "Ordered list" },
  ] as const;

  return (
    <div className="flex flex-wrap gap-1 p-1.5 border-b border-border/50 bg-muted/30">
      {buttons.map((btn) => (
        <Button
          key={btn.label}
          variant="ghost"
          size="icon"
          type="button"
          title={btn.label}
          // ← This single line fixes the toolbar: keeps editor focused
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (editor.chain().focus() as any)[btn.cmd]().run()}
          className="h-8 w-8 transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}

      <div className="w-px h-5 bg-border/50 mx-0.5 self-center" />

      <Button
        variant="ghost"
        size="icon"
        type="button"
        title="Attach file"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAttach}
        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted/50"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </div>
  );
};

// ── Main Section ─────────────────────────────────────────────────────────────
export default function CommentSection({ promptId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments]     = useState<Comment[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canPost, setCanPost]       = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write a comment\u2026" }),
    ],
    content: "",
    // Required in Next.js to avoid SSR/hydration mismatch
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setCanPost(!editor.isEmpty && editor.getText().trim().length > 0);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-4 py-3 text-sm text-foreground",
      },
    },
  });

  // Fetch comments
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    fetch(`/api/prompts/${promptId}/comments`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setComments(data))
      .catch((e) => { if (e.name !== "AbortError") console.error(e); })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [promptId]);

  const handleCreateComment = async () => {
    if (!editor || !canPost || isSubmitting) return;

    const htmlContent = editor.getHTML();
    setIsSubmitting(true);
    let attachmentUrl: string | null = null;

    // Optimistic update
    const tempId: number = -Date.now();
    const optimistic: Comment = {
      id: tempId,
      content: htmlContent,
      attachment_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
      user_id: Number(session!.user!.id),
      prompt_id: promptId,
      parent_id: null,
      created_at: new Date().toISOString(),
      user: { id: Number(session!.user!.id), name: session!.user!.name ?? "You" },
      replies: [],
    };

    setComments((prev) => [optimistic, ...prev]);
    editor.commands.clearContent();
    setCanPost(false);
    const fileToUpload = selectedFile;
    setSelectedFile(null);

    try {
      if (fileToUpload) {
        const form = new FormData();
        form.append("file", fileToUpload);
        const up = await fetch("/api/upload", { method: "POST", body: form });
        if (!up.ok) throw new Error("Upload failed");
        attachmentUrl = (await up.json()).url;
      }

      const res = await fetch(`/api/prompts/${promptId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: htmlContent, attachmentUrl }),
      });

      if (!res.ok) throw new Error("Post failed");

      const created: Comment = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? { ...created, replies: [] } : c))
      );
    } catch (err) {
      console.error(err);
      // Rollback on failure
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      editor.commands.setContent(htmlContent);
      setCanPost(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = useCallback(async (parentId: number, content: string, file: File | null = null) => {
    let attachmentUrl: string | null = null;
    
    if (file) {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      if (!up.ok) {
        console.error("Upload failed for reply");
        return;
      }
      attachmentUrl = (await up.json()).url;
    }

    const res = await fetch(`/api/prompts/${promptId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId, attachmentUrl }),
    });
    if (!res.ok) return;
    const created: Comment = await res.json();
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies ?? []), created] }
          : c
      )
    );
  }, [promptId]);

  const handleDelete = useCallback(async (commentId: number) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (!res.ok) return; // In a real app, maybe show a toast error
    setComments((prev) => {
      let next = prev.filter((c) => c.id !== commentId);
      next = next.map((c) => ({
        ...c,
        replies: c.replies?.filter((r) => r.id !== commentId) ?? [],
      }));
      return next;
    });
  }, []);

  const handleEdit = useCallback(async (commentId: number, content: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return;
    const updated: Comment = await res.json();
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) return { ...c, content: updated.content };
        return {
          ...c,
          replies: c.replies?.map((r) =>
            r.id === commentId ? { ...r, content: updated.content } : r
          ),
        };
      })
    );
  }, []);

  const currentUserId = session?.user?.id ? Number(session.user.id) : undefined;

  return (
    <div className="mt-10 border-t pt-8">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5" />
        Comments
        {!isLoading && comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h3>

      {session ? (
        <div className="flex flex-col mb-8 border border-border rounded-xl overflow-hidden bg-card/50 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
          />

          <MenuBar editor={editor} onAttach={() => fileInputRef.current?.click()} />
          <EditorContent editor={editor} />

          {selectedFile && (
            <div className="px-4 py-2 bg-muted/20 border-t border-border/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                <FileIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
                <span className="opacity-60 shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-muted rounded-full transition-colors shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex justify-end p-2 border-t border-border/30 bg-muted/10">
            <Button
              onClick={handleCreateComment}
              disabled={!canPost || isSubmitting}
              className="px-6 rounded-full h-9 text-sm gap-2"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting ? "Posting\u2026" : "Post Comment"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/20 rounded-xl p-4 text-center text-sm text-muted-foreground mb-8 border border-dashed">
          Please log in to leave a comment.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading comments\u2026
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm py-8 border border-dashed rounded-xl">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
