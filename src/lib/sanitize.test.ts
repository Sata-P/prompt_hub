import { describe, it, expect } from "vitest";
import { sanitizeCommentHtml } from "./sanitize";

describe("sanitizeCommentHtml — safe content passes through", () => {
  it("keeps plain paragraph text", () => {
    expect(sanitizeCommentHtml("<p>hello world</p>")).toBe("<p>hello world</p>");
  });

  it("keeps inline formatting", () => {
    expect(sanitizeCommentHtml("<p><strong>bold</strong> <em>italic</em></p>"))
      .toBe("<p><strong>bold</strong> <em>italic</em></p>");
  });

  it("keeps headings h1–h6", () => {
    for (const lvl of [1, 2, 3, 4, 5, 6]) {
      expect(sanitizeCommentHtml(`<h${lvl}>hi</h${lvl}>`)).toBe(`<h${lvl}>hi</h${lvl}>`);
    }
  });

  it("keeps lists", () => {
    expect(sanitizeCommentHtml("<ul><li>a</li><li>b</li></ul>"))
      .toBe("<ul><li>a</li><li>b</li></ul>");
    expect(sanitizeCommentHtml("<ol><li>1</li></ol>"))
      .toBe("<ol><li>1</li></ol>");
  });

  it("keeps blockquote, code, pre", () => {
    expect(sanitizeCommentHtml("<blockquote>q</blockquote>")).toBe("<blockquote>q</blockquote>");
    expect(sanitizeCommentHtml("<pre><code>x</code></pre>")).toBe("<pre><code>x</code></pre>");
  });
});

describe("sanitizeCommentHtml — XSS vectors are blocked", () => {
  it("strips <script> tag and contents", () => {
    const out = sanitizeCommentHtml("<p>before</p><script>alert(1)</script><p>after</p>");
    expect(out).not.toContain("script");
    expect(out).not.toContain("alert");
    expect(out).toContain("before");
    expect(out).toContain("after");
  });

  it("strips onerror on <img>", () => {
    const out = sanitizeCommentHtml('<img src="/uploads/x.png" onerror="alert(1)">');
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("alert");
  });

  it("strips onclick / onmouseover / onload / onfocus / onblur", () => {
    const inputs = [
      '<p onclick="alert(1)">x</p>',
      '<p onmouseover="alert(1)">x</p>',
      '<p onload="alert(1)">x</p>',
      '<p onfocus="alert(1)">x</p>',
      '<p onblur="alert(1)">x</p>',
    ];
    for (const html of inputs) {
      const out = sanitizeCommentHtml(html);
      expect(out).not.toMatch(/on\w+=/i);
      expect(out).not.toContain("alert");
    }
  });

  it("strips style attribute (CSS injection vector)", () => {
    const out = sanitizeCommentHtml('<p style="background:url(javascript:alert(1))">x</p>');
    expect(out).not.toContain("style");
    expect(out).not.toContain("alert");
  });

  it("strips javascript: href on <a>", () => {
    const out = sanitizeCommentHtml('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("alert");
    expect(out).toContain("click");
  });

  it("strips data: URI on <img>", () => {
    const out = sanitizeCommentHtml('<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">');
    // src must be removed because it's neither http(s) nor /uploads/
    expect(out).not.toContain("data:");
    expect(out).not.toContain("src=");
  });

  it("strips <iframe>", () => {
    const out = sanitizeCommentHtml('<iframe src="https://evil.com"></iframe>');
    expect(out).not.toContain("iframe");
    expect(out).not.toContain("evil.com");
  });

  it("strips <object> / <embed>", () => {
    expect(sanitizeCommentHtml('<object data="x"></object>')).not.toContain("object");
    expect(sanitizeCommentHtml('<embed src="x">')).not.toContain("embed");
  });

  it("strips <svg> with embedded script", () => {
    const out = sanitizeCommentHtml('<svg><script>alert(1)</script></svg>');
    expect(out).not.toContain("script");
    expect(out).not.toContain("alert");
  });
});

describe("sanitizeCommentHtml — links", () => {
  it("forces target=_blank and rel=noopener noreferrer nofollow on safe links", () => {
    const out = sanitizeCommentHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  it("keeps mailto: links", () => {
    const out = sanitizeCommentHtml('<a href="mailto:a@b.com">mail</a>');
    expect(out).toContain('href="mailto:a@b.com"');
  });

  it("strips href on javascript: link but keeps text", () => {
    const out = sanitizeCommentHtml('<a href="javascript:alert(1)">text</a>');
    expect(out).not.toContain("javascript:");
    expect(out).toContain("text");
  });
});

describe("sanitizeCommentHtml — images", () => {
  it("keeps http(s) image src", () => {
    const out = sanitizeCommentHtml('<img src="https://example.com/a.png" alt="a">');
    expect(out).toContain('src="https://example.com/a.png"');
    expect(out).toContain('alt="a"');
  });

  it("keeps /uploads/ relative image src", () => {
    const out = sanitizeCommentHtml('<img src="/uploads/a.png">');
    expect(out).toContain('src="/uploads/a.png"');
  });

  it("removes src when scheme is not allowed", () => {
    const out = sanitizeCommentHtml('<img src="file:///etc/passwd">');
    expect(out).not.toContain("file:");
    expect(out).not.toContain("src=");
  });

  it("forces loading=lazy and referrerpolicy=no-referrer on <img>", () => {
    const out = sanitizeCommentHtml('<img src="/uploads/a.png">');
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('referrerpolicy="no-referrer"');
  });

  // Regression: the bug we just fixed — DOMPurify was stripping width when
  // ALLOWED_URI_REGEXP was set, because the value "200" doesn't match a URI.
  // ADD_URI_SAFE_ATTR should bypass URI validation for width/height/loading.
  it("preserves width attribute on <img> (regression)", () => {
    const out = sanitizeCommentHtml('<img src="/uploads/a.png" width="200">');
    expect(out).toContain('width="200"');
  });

  it("preserves height attribute on <img>", () => {
    const out = sanitizeCommentHtml('<img src="/uploads/a.png" width="200" height="150">');
    expect(out).toContain('width="200"');
    expect(out).toContain('height="150"');
  });
});

describe("sanitizeCommentHtml — output shape", () => {
  it("returns a string", () => {
    expect(typeof sanitizeCommentHtml("<p>x</p>")).toBe("string");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeCommentHtml("")).toBe("");
  });

  it("collapses tags it does not allow but keeps inner text", () => {
    const out = sanitizeCommentHtml("<div>hi</div>");
    expect(out).not.toContain("<div");
    expect(out).toContain("hi");
  });
});
