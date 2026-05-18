import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageView } from "./ResizableImageView";

const ResizableImageBase = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const raw = el.getAttribute("width");
          if (!raw) return null;
          const n = parseInt(raw, 10);
          return Number.isFinite(n) ? n : null;
        },
        renderHTML: (attrs) => {
          if (attrs.width == null || attrs.width === "") return {};
          return { width: String(attrs.width) };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

export const imageExtension = ResizableImageBase.configure({
  HTMLAttributes: {
    class: "rounded-md max-w-full h-auto",
    loading: "lazy",
    referrerpolicy: "no-referrer",
  },
});
