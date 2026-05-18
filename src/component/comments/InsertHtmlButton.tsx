"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Code2 } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Textarea } from "@/component/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/component/ui/dialog";

type Size = "sm" | "md";

type Props = {
  editor: Editor | null;
  size?: Size;
};

export function InsertHtmlButton({ editor, size = "md" }: Props) {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState("");

  const btnClass = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  const handleInsert = () => {
    if (!editor || !html.trim()) {
      setOpen(false);
      return;
    }
    editor.chain().focus().insertContent(html, {
      parseOptions: { preserveWhitespace: "full" },
    }).run();
    setHtml("");
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        title="Insert HTML"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(true)}
        className={`${btnClass} text-muted-foreground hover:text-primary hover:bg-muted/50`}
      >
        <Code2 className={iconClass} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Insert HTML</DialogTitle>
            <DialogDescription>
              วาง / พิมพ์ HTML แล้วกด Insert — เฉพาะ tag ที่ระบบรองรับเท่านั้นจะถูก render ส่วนที่เหลือถูก strip โดย editor และ server sanitizer
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder={'<h3>Title</h3>\n<p><strong>Bold text</strong> and <em>italic text</em></p>\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n<blockquote>Quote</blockquote>\n<pre><code>code block</code></pre>'}
            className="min-h-[360px] lg:min-h-[480px] font-mono text-sm resize-y"
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleInsert} disabled={!html.trim()}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
