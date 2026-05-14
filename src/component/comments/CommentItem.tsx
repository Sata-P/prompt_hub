"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { UserCircle, Reply, MessageCircle, Bold, Italic, List, ListOrdered,File,Download } from "lucide-react";
import { Button } from "@/component/ui/button";
import DOMPurify from "dompurify";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export type Comment = {
  id: number;
  content: string;
  attachment_url: string | null;
  user_id: number;
  prompt_id: number;
  parent_id: number | null;
  created_at: string;
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

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b border-border/50 bg-muted/30">
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${editor.isActive("bold") ? "bg-primary/20 text-primary" : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        type="button"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${editor.isActive("italic") ? "bg-primary/20 text-primary" : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        type="button"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${editor.isActive("bulletList") ? "bg-primary/20 text-primary" : ""}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        type="button"
      >
        <List className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${editor.isActive("orderedList") ? "bg-primary/20 text-primary" : ""}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        type="button"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  onEdit,
  isReply = false,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sanitize HTML content
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(comment.content);
  }, [comment.content]);

  const editEditor = useEditor({
    extensions: [StarterKit],
    content: comment.content,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[60px] px-3 py-2 text-sm text-foreground",
      },
    },
  });

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    await onReply(comment.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
    setShowReplies(true);
  };

  const handleEditSubmit = async () => {
    if (!editEditor || editEditor.isEmpty) return;
    const htmlContent = editEditor.getHTML();
    await onEdit(comment.id, htmlContent);
    setIsEditing(false);
  };

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
          <span className="text-[11px] text-gray-500 flex items-center gap-1.5" title={new Date(comment.created_at).toLocaleString()}>
            <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
            <span className="opacity-50">·</span>
            <span>{new Date(comment.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        </div>

        {/* Comment Bubble */}
        <div className="flex flex-col items-start gap-2">
          {isEditing ? (
            <div className="mt-2 flex flex-col w-full max-w-md border border-border rounded-xl overflow-hidden bg-card/50">
              <MenuBar editor={editEditor} />
              <EditorContent editor={editEditor} />
              <div className="flex justify-end gap-2 p-2 border-t border-border/30 bg-muted/10">
                <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); editEditor?.commands.setContent(comment.content); }} className="rounded-full transition-all duration-300 hover:scale-105 active:scale-95">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEditSubmit} className="rounded-full px-4 transition-all duration-300 hover:scale-105 active:scale-95" disabled={!editEditor || editEditor.isEmpty}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="bg-slate-800 rounded-2xl px-4 py-2 text-sm text-white inline-block prose prose-sm dark:prose-invert max-w-none shadow-sm"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          )}

          {/* Attachment Display */}
          {comment.attachment_url && !isEditing && (
            <a 
              href={comment.attachment_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors group max-w-[280px]"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <File className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">
                  {comment.attachment_url.split('/').pop()}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  Click to download <Download className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </a>
          )}
        </div>

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
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.user.name}...`}
              className="flex-1 text-sm border-gray-300 rounded-full px-4 py-1.5 focus:border-blue-500 focus:ring-blue-500 outline-none border"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReplySubmit();
              }}
            />
            <Button size="sm" onClick={handleReplySubmit} className="rounded-full px-4 transition-all duration-300 hover:scale-105 active:scale-95" disabled={!replyContent.trim()}>
              Post
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)} className="rounded-full transition-all duration-300 hover:scale-105 active:scale-95">
              Cancel
            </Button>
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
