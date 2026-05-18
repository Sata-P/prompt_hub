"use client";

import { useState, useMemo, memo, useCallback, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { UserCircle, Reply, Bold, Italic, List, ListOrdered, File, Download, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/component/ui/button";
import { useEditor, EditorContent, type ChainedCommands } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { sanitizeCommentHtml } from "@/lib/sanitize";
import { imageExtension } from "./imageExtension";
import { InsertHtmlButton } from "./InsertHtmlButton";

const IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

async function uploadImage(file: File): Promise<string | null> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data?.url === "string" ? data.url : null;
}


type ToolbarButton = {
  icon: typeof Bold;
  run: (c: ChainedCommands) => ChainedCommands;
  label: string;
};

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { icon: Bold,        run: (c) => c.toggleBold(),        label: "Bold" },
  { icon: Italic,      run: (c) => c.toggleItalic(),      label: "Italic" },
  { icon: List,        run: (c) => c.toggleBulletList(),  label: "Bullet list" },
  { icon: ListOrdered, run: (c) => c.toggleOrderedList(), label: "Ordered list" },
];

export type Comment = {
  id: number;
  content: string;
  attachment_url: string | null;
  user_id: number;
  prompt_id: number;
  parent_id: number | null;
  created_at: string;
  user: { id: number; name: string };
  replies?: Comment[];
};

type CommentItemProps = {
  comment: Comment;
  currentUserId?: number;
  onReply: (parentId: number, content: string, file: File | null) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onEdit: (commentId: number, content: string) => Promise<void>;
  isReply?: boolean;
};

// ── Inline edit editor — only mounted when editing ─────────────────────────
function EditEditor({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: string;
  onSave: (html: string) => void;
  onCancel: () => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit, imageExtension],
    content: initialContent,
    immediatelyRender: false,
    onCreate: ({ editor }) => setIsEmpty(editor.isEmpty),
    onUpdate: ({ editor }) => setIsEmpty(editor.isEmpty),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[60px] px-3 py-2 text-sm text-foreground",
      },
    },
  });

  return (

    <div className="mt-2 flex flex-col w-full max-w-md border border-border rounded-xl overflow-hidden bg-card/50">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f || !editor || !IMAGE_MIME.has(f.type)) return;
          const url = await uploadImage(f);
          if (url) editor.chain().focus().setImage({ src: url, alt: f.name }).run();
        }}
      />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border/50 bg-muted/20">
        {TOOLBAR_BUTTONS.map((btn) => (
          <Button
            key={btn.label}
            variant="ghost"
            size="icon"
            type="button"
            title={btn.label}
            // preventDefault keeps editor focused when clicking toolbar
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor && btn.run(editor.chain().focus()).run()}
            className="h-7 w-7 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <btn.icon className="h-3.5 w-3.5" />
          </Button>
        ))}
        <div className="w-px h-4 bg-border/50 mx-0.5 self-center" />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          title="Insert image"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => imageInputRef.current?.click()}
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-muted/50"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
        <InsertHtmlButton editor={editor} size="sm" />
      </div>

      <EditorContent editor={editor} />

      <div className="flex justify-end gap-2 p-2 border-t border-border/30 bg-muted/10">
        <Button size="sm" variant="ghost" className="rounded-full" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="rounded-full px-4"
          disabled={!editor || isEmpty}
          onClick={() => editor && onSave(editor.getHTML())}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

// ── Inline reply editor ─────────────────────────────────────────────────────
function ReplyEditor({
  onSave,
  onCancel,
}: {
  onSave: (html: string, file: File | null) => void;
  onCancel: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Write a reply..." }), imageExtension],
    content: "",
    immediatelyRender: false,
    onCreate: ({ editor }) => setIsEmpty(editor.isEmpty),
    onUpdate: ({ editor }) => setIsEmpty(editor.isEmpty),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[60px] px-3 py-2 text-sm text-foreground",
      },
    },
  });

  return (
    <div className="mt-3 flex flex-col w-full max-w-md border border-border rounded-xl overflow-hidden bg-card/50 shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f || !editor || !IMAGE_MIME.has(f.type)) return;
          const url = await uploadImage(f);
          if (url) editor.chain().focus().setImage({ src: url, alt: f.name }).run();
        }}
      />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border/50 bg-muted/20">
        {TOOLBAR_BUTTONS.map((btn) => (
          <Button
            key={btn.label}
            variant="ghost"
            size="icon"
            type="button"
            title={btn.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor && btn.run(editor.chain().focus()).run()}
            className="h-7 w-7 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <btn.icon className="h-3.5 w-3.5" />
          </Button>
        ))}
        <div className="w-px h-4 bg-border/50 mx-0.5 self-center" />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          title="Insert image"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => imageInputRef.current?.click()}
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-muted/50"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          title="Attach file"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-muted/50"
        >
          <Paperclip className="h-3.5 w-3.5" />
        </Button>
        <InsertHtmlButton editor={editor} size="sm" />
      </div>

      <EditorContent editor={editor} />

      {selectedFile && (
        <div className="px-3 py-1.5 bg-muted/20 border-t border-border/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <File className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
            <span className="opacity-60 shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-muted rounded-full transition-colors shrink-0">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex justify-end gap-2 p-2 border-t border-border/30 bg-muted/10">
        <Button size="sm" variant="ghost" className="rounded-full" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="rounded-full px-4"
          disabled={(!editor || isEmpty) && !selectedFile}
          onClick={() => {
            if (editor && (!isEmpty || selectedFile)) {
              onSave(editor.getHTML(), selectedFile);
            }
          }}
        >
          Reply
        </Button>
      </div>
    </div>
  );
}

// ── Main comment item ───────────────────────────────────────────────────────
const CommentItem = memo(function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  onEdit,
  isReply = false,
}: CommentItemProps) {
  const [isReplying, setIsReplying]   = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const sanitizedContent = useMemo(
    () => sanitizeCommentHtml(comment.content),
    [comment.content],
  );

  const handleDelete = useCallback(async () => {
    const ok = await confirm({
      title: "Delete this comment?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) await onDelete(comment.id);
  }, [confirm, onDelete, comment.id]);

  const handleReplySubmit = useCallback(async (html: string, file: File | null) => {
    // If the editor is empty (e.g. only <p></p>) and there's no file, do nothing.
    const isEmptyHTML = html === "<p></p>" || html.trim() === "";
    if (isEmptyHTML && !file) return;
    
    await onReply(comment.id, html, file);
    setIsReplying(false);
    setShowReplies(true);
  }, [comment.id, onReply]);

  const handleSaveEdit = useCallback(
    async (html: string) => {
      await onEdit(comment.id, html);
      setIsEditing(false);
    },
    [comment.id, onEdit],
  );

  const hasReplies = (comment.replies?.length ?? 0) > 0;

  return (
    <div className={`flex gap-3 ${isReply ? "mt-3" : "mt-6"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <UserCircle className="w-8 h-8 text-gray-400" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        {/* Name + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">{comment.user.name}</span>
          <span
            className="text-[11px] text-gray-500 flex items-center gap-1"
            title={new Date(comment.created_at).toLocaleString()}
          >
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            <span className="opacity-50">·</span>
            {new Date(comment.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>

        {/* Bubble / edit form */}
        <div className="flex flex-col items-start gap-2">
          {isEditing ? (
            /* EditEditor is only mounted when editing → no wasted resources */
            <EditEditor
              initialContent={comment.content}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div
              className="bg-secondary/40 border border-border/30 rounded-2xl px-4 py-2.5 text-sm text-foreground inline-block prose prose-sm dark:prose-invert max-w-none shadow-sm backdrop-blur-sm"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          )}

          {/* Attachment */}
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
                  {comment.attachment_url.split("/").pop()}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  Click to download
                  <Download className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </a>
          )}
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-1 pl-2">
            {!isReply && (
              <button onClick={() => setIsReplying((v) => !v)} className="hover:text-blue-600 transition-colors">
                Reply
              </button>
            )}
            {currentUserId === comment.user_id && (
              <>
                <button onClick={() => setIsEditing(true)} className="hover:text-blue-600 transition-colors">
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {/* Reply input */}
        {isReplying && (
          <ReplyEditor
            onSave={handleReplySubmit}
            onCancel={() => setIsReplying(false)}
          />
        )}

        {/* Replies toggle */}
        {hasReplies && !isReply && (
          <div className="mt-2 pl-2">
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Reply className="w-4 h-4 rotate-180" />
              {showReplies ? "Hide replies" : `View ${comment.replies!.length} replies`}
            </button>
          </div>
        )}

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
                isReply
              />
            ))}
          </div>
        )}
      </div>
      {confirmDialog}
    </div>
  );
});

export default CommentItem;
