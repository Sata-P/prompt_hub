// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { imageExtension } from "./imageExtension";

beforeAll(() => {
  if (typeof globalThis.requestAnimationFrame === "undefined") {
    // jsdom may lack this; TipTap sometimes calls it.
    // setTimeout returns NodeJS.Timeout in @types/node — go through `unknown`.
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 0) as unknown as number) as typeof requestAnimationFrame;
  }
});

function createEditor(content: string) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return new Editor({
    element: el,
    extensions: [StarterKit, imageExtension],
    content,
  });
}

type ImageJsonNode = { type: string; attrs: { width: number | null } };

describe("imageExtension — width attribute round-trip", () => {
  it("parses width from HTML attribute", () => {
    const editor = createEditor('<img src="/uploads/x.png" width="200">');
    const doc = editor.state.doc.toJSON() as { content?: ImageJsonNode[] };
    const img = doc.content?.find((n) => n.type === "image");
    expect(img).toBeDefined();
    expect(img!.attrs.width).toBe(200);
  });

  it("serializes width back to HTML attribute", () => {
    const editor = createEditor('<img src="/uploads/x.png" width="350">');
    const html = editor.getHTML();
    expect(html).toContain('width="350"');
    expect(html).toContain('src="/uploads/x.png"');
  });

  it("omits width when none set", () => {
    const editor = createEditor('<img src="/uploads/x.png">');
    const html = editor.getHTML();
    expect(html).not.toMatch(/width=/);
  });

  it("ignores non-numeric width on input", () => {
    const editor = createEditor('<img src="/uploads/x.png" width="abc">');
    const doc = editor.state.doc.toJSON() as { content?: ImageJsonNode[] };
    const img = doc.content?.find((n) => n.type === "image");
    expect(img!.attrs.width).toBeNull();
  });

  it("updateAttributes({ width }) round-trips through getHTML", () => {
    const editor = createEditor('<img src="/uploads/x.png">');
    // Find the image position
    let pos: number | null = null;
    editor.state.doc.descendants((node, p) => {
      if (node.type.name === "image") {
        pos = p;
        return false;
      }
    });
    expect(pos).not.toBeNull();
    editor.commands.setNodeSelection(pos!);
    editor.commands.updateAttributes("image", { width: 420 });

    const html = editor.getHTML();
    expect(html).toContain('width="420"');
  });

  it("emits the configured static HTMLAttributes (class, loading, referrerpolicy)", () => {
    const editor = createEditor('<img src="/uploads/x.png" width="200">');
    const html = editor.getHTML();
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('referrerpolicy="no-referrer"');
    expect(html).toContain('class="rounded-md max-w-full h-auto"');
  });
});
