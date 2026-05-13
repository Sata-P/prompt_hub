"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { UserCircle, Reply, MessageCircle } from "lucide-react";
import { Button } from "@/component/ui/button";
import { RichTextEditor } from "@/component/ui/rich-text-editor";

export type Comment = {
  id: number;
  content: string;
  user_id: number;
  prompt_id: number;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
  replies?: Comment[];
};

type CommentItemProps = {
  comment: Comment;
  currentUserId?: number;
  onReply: (parentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onEdit: (commentId: number, content: string) => Promise<void>;
  isReply?: boolean;
};

export default function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  onEdit,
  isReply = false,
}: CommentItemProps) {
  const [mounted, setMounted] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false); // Toggle for replies
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    await onReply(comment.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
    setShowReplies(true); // Open replies when a new reply is added
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    await onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`flex gap-3 ${isReply ? "mt-3" : "mt-6"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <UserCircle className="w-8 h-8 text-gray-400" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        {/* Name and Date */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-white">
            {comment.user.name}
          </span>
          <span className="text-zinc-400 text-[11px] flex items-center gap-1.5 ml-1">
            <span className="opacity-40">•</span>
            {mounted ? (
              <>
                <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                <span className="opacity-25 ml-0.5">•</span>
                <span>{format(new Date(comment.created_at), "d MMM yyyy, HH:mm")}</span>
              </>
            ) : '...'}
          </span>
          {mounted && new Date(comment.updated_at).getTime() > new Date(comment.created_at).getTime() + 1000 && (
            <span className="text-[10px] text-zinc-500 italic ml-1" title={new Date(comment.updated_at).toLocaleString()}>
              (edited)
            </span>
          )}
        </div>

        {/* Comment Bubble */}
        {isEditing ? (
          <div className="mt-2 flex flex-col gap-2 w-full max-w-2xl">
            <RichTextEditor
              content={editContent}
              onChange={setEditContent}
              placeholder="Edit your comment..."
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditContent(comment.content); }} className="rounded-full">
                Cancel
              </Button>
              <Button size="sm" onClick={handleEditSubmit} className="rounded-full px-4" disabled={!editContent.trim() || editContent === "<p></p>" || editContent === comment.content}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl px-4 py-3 text-sm text-white inline-block w-full max-w-2xl">
            <RichTextEditor
              content={comment.content}
              onChange={() => {}}
              editable={false}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-1 pl-2">
          {!isReply && !isEditing && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="hover:text-blue-600 transition-colors"
            >
              Reply
            </button>
          )}
          
          {(currentUserId === comment.user_id) && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="hover:text-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this comment?")) {
                    onDelete(comment.id);
                  }
                }}
                className="hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>

        {/* Reply Input Form */}
        {isReplying && (
          <div className="mt-3 flex flex-col gap-2 w-full max-w-2xl">
            <RichTextEditor
              content={replyContent}
              onChange={setReplyContent}
              placeholder={`Reply to ${comment.user.name}...`}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)} className="rounded-full">
                Cancel
              </Button>
              <Button size="sm" onClick={handleReplySubmit} className="rounded-full px-4" disabled={!replyContent.trim() || replyContent === "<p></p>"}>
                Post
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies Toggle */}
        {hasReplies && !isReply && (
          <div className="mt-2 pl-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Reply className="w-4 h-4 rotate-180" />
              {showReplies ? "Hide replies" : `View ${comment.replies!.length} replies`}
            </button>
          </div>
        )}

        {/* Nested Replies List */}
        {showReplies && hasReplies && (
          <div className="pl-4 border-l-2 border-gray-200 mt-2 space-y-3">
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
