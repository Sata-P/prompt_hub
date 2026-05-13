"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import CommentItem, { Comment } from "./CommentItem";
import { Button } from "@/component/ui/button";
import { MessageSquare, Bold, Italic, List, ListOrdered, Paperclip, X, File as FileIcon } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type CommentSectionProps = {
  promptId: number;
};

const MenuBar = ({ editor, onAttach }: { editor: any, onAttach: () => void }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b border-border/50 bg-muted/30">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${editor.isActive("bold") ? "bg-primary/20 text-primary" : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${editor.isActive("italic") ? "bg-primary/20 text-primary" : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${editor.isActive("bulletList") ? "bg-primary/20 text-primary" : ""}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${editor.isActive("orderedList") ? "bg-primary/20 text-primary" : ""}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-px h-4 bg-border/50 mx-1 self-center" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-primary"
        onClick={onAttach}
        type="button"
        title="Attach a file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function CommentSection({ promptId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canPost, setCanPost] = useState(false);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write a comment...",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      // Check if there is actual text content
      const hasContent = !editor.isEmpty && editor.getText().trim().length > 0;
      setCanPost(hasContent);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-4 py-3 text-sm text-foreground",
      },
    },
  });

  // ดึงคอมเมนต์เมื่อเปิดหน้า
  useEffect(() => {
    const controller = new AbortController();

    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/prompts/${promptId}/comments`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
    
    return () => {
      controller.abort();
    };
  }, [promptId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateComment = async () => {
    if (!editor || !canPost || isSubmitting) return;

    setIsSubmitting(true);
    let attachmentUrl = null;

    try {
      // 1. Upload file if exists
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
        } else {
          throw new Error("Failed to upload file");
        }
      }

      // 2. Post comment with attachment URL
      const htmlContent = editor.getHTML();
      const res = await fetch(`/api/prompts/${promptId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: htmlContent,
          attachmentUrl: attachmentUrl 
        }),
      });

      if (res.ok) {
        const created = await res.json();
        // เพิ่ม comment ใหม่ไปด้านบนสุด (เพราะเราเรียงใหม่ไปเก่า)
        setComments((prev) => [created, ...prev]);
        editor.commands.clearContent();
        setCanPost(false);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });

      if (res.ok) {
        const createdReply = await res.json();
        // อัปเดต state แบบ local (หา parent comment แล้ว push reply เข้าไป)
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), createdReply],
              };
            }
            return comment;
          })
        );
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // ลบออกจาก UI
        setComments((prev) => {
          // กรองคอมเมนต์หลักออก
          let filtered = prev.filter((c) => c.id !== commentId);
          // ลบออกจาก replies ดัวย (เผื่อเป็นการลบ reply)
          filtered = filtered.map((c) => ({
            ...c,
            replies: c.replies ? c.replies.filter((r) => r.id !== commentId) : [],
          }));
          return filtered;
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEdit = async (commentId: number, content: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const updatedComment = await res.json();
        // อัปเดต state แบบ local (หา comment หรือ reply แล้วอัปเดต content)
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, content: updatedComment.content };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, content: updatedComment.content } : r
                ),
              };
            }
            return c;
          })
        );
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const currentUserId = session?.user?.id ? Number(session.user.id) : undefined;

  return (
    <div className="mt-10 border-t pt-8">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800">
        <MessageSquare className="w-5 h-5" />
        Comments
      </h3>

      {/* Input สำหรับคอมเมนต์ใหม่ */}
      {session ? (
        <div className="flex flex-col mb-8 border border-border rounded-xl overflow-hidden bg-card/50">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <MenuBar 
            editor={editor} 
            onAttach={() => fileInputRef.current?.click()} 
          />
          <EditorContent editor={editor} />
          
          {/* File Preview */}
          {selectedFile && (
            <div className="px-4 py-2 bg-muted/20 border-t border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                <FileIcon className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{selectedFile.name}</span>
                <span className="opacity-60">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex justify-end p-2 border-t border-border/30 bg-muted/10">
            <Button
              onClick={handleCreateComment}
              disabled={!canPost || isSubmitting}
              className="px-6 rounded-full h-9 text-sm relative"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Posting...</span>
                </div>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500 mb-8 border">
          Please log in to leave a comment.
        </div>
      )}

      {/* รายการคอมเมนต์ */}
      {isLoading ? (
        <div className="text-center text-gray-400 text-sm py-4">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-4">
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
