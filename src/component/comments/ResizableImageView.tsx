"use client";

import { useRef, useState } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";

export function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; w: number } | null>(null);
  const [resizing, setResizing] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const img = wrapperRef.current?.querySelector("img");
    if (!img) return;
    startRef.current = { x: e.clientX, w: img.getBoundingClientRect().width };
    setResizing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const next = Math.max(40, Math.round(startRef.current.w + dx));
    updateAttributes({ width: next });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!startRef.current) return;
    startRef.current = null;
    setResizing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const width = node.attrs.width as number | string | null;
  const style: React.CSSProperties = {
    width: width != null && width !== "" ? (typeof width === "number" ? `${width}px` : String(width)) : undefined,
    maxWidth: "100%",
    height: "auto",
  };

  const showHandle = selected || resizing;

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className="inline-block relative align-middle group my-1"
      data-drag-handle
    >
      <img
        src={node.attrs.src ?? undefined}
        alt={node.attrs.alt ?? ""}
        title={node.attrs.title ?? undefined}
        loading="lazy"
        referrerPolicy="no-referrer"
        draggable={false}
        style={style}
        className={`rounded-md block ${selected ? "ring-2 ring-primary" : ""}`}
      />
      <span
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title="Drag to resize"
        className={`absolute bottom-1 right-1 h-3 w-3 rounded-sm bg-primary border border-white shadow-sm cursor-nwse-resize transition-opacity ${
          showHandle ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
    </NodeViewWrapper>
  );
}
