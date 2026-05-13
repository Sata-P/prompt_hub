"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Type, 
  Link as LinkIcon,
  Underline as UnderlineIcon
} from 'lucide-react';
import { Toggle } from '@/component/ui/toggle';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('URL');
    if (!url) return;

    if (editor.state.selection.empty) {
      // If no text is selected, insert the URL as text and link it
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      // If text is selected, apply the link to it
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50 rounded-t-xl">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <div className="w-px h-6 bg-border mx-1 my-auto" />
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <div className="w-px h-6 bg-border mx-1 my-auto" />
      <Toggle
        size="sm"
        pressed={editor.isActive('link')}
        onPressedChange={addLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Write something...",
  editable = true 
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`w-full border rounded-xl bg-background ${!editable ? 'border-none bg-transparent' : 'focus-within:border-primary/50 transition-colors'}`}>
      {editable && <MenuBar editor={editor} />}
      <EditorContent 
        editor={editor} 
        className={`prose prose-sm dark:prose-invert max-w-none p-4 min-h-[80px] outline-none ${!editable ? 'p-0 min-h-0' : ''}`}
      />
    </div>
  );
}
