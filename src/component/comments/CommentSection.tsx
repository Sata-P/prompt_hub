"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CommentItem, { Comment } from "./CommentItem";
import { Button } from "@/component/ui/button";
import { MessageSquare } from "lucide-react";
import { RichTextEditor } from "@/component/ui/rich-text-editor";

type CommentSectionProps = {
  promptId: number;
};

export default function CommentSection({ promptId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/prompts/${promptId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const created = await res.json();
        // เพิ่ม comment ใหม่ไปด้านบนสุด (เพราะเราเรียงใหม่ไปเก่า)
        setComments((prev) => [created, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
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
        <div className="flex gap-3 mb-8">
          <div className="flex-1">
            <RichTextEditor
              content={newComment}
              onChange={setNewComment}
              placeholder="Write a comment..."
            />
            <div className="flex justify-end mt-3">
              <Button
                onClick={handleCreateComment}
                disabled={!newComment.trim() || newComment === "<p></p>"}
                className="px-6 rounded-full"
              >
                Post Comment
              </Button>
            </div>
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
