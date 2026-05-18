import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "hr",
  "strong", "em", "u", "s", "code", "pre", "blockquote",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a", "img",
];

const ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "alt", "title", "width", "height",
  "loading", "referrerpolicy",
];

// http(s), mailto, fragment, root-relative paths, and the local /uploads/ folder
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto):|\/|#)/i;

DOMPurify.addHook("afterSanitizeAttributes", (node: Element) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer nofollow");
  }
  if (node.tagName === "IMG") {
    const src = node.getAttribute("src") ?? "";
    const isHttp = /^https?:\/\//i.test(src);
    const isLocalUpload = /^\/uploads\//.test(src);
    if (!isHttp && !isLocalUpload) {
      node.removeAttribute("src");
    }
    node.setAttribute("loading", "lazy");
    node.setAttribute("referrerpolicy", "no-referrer");
  }
});

export function sanitizeCommentHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    // Non-URI attrs: DOMPurify otherwise validates every value against
    // ALLOWED_URI_REGEXP and strips it when the value (e.g. "200") doesn't match.
    ADD_URI_SAFE_ATTR: ["width", "height", "loading", "referrerpolicy", "target", "rel"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
  });
}
