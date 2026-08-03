import { emailWrapper } from "./wrapper";
import { SITE_URL } from "@/lib/siteConfig";

export function newsPublishedEmail({ title, body }) {
  const shortBody = (body || "").slice(0, 200);
  const html = `
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">${title}</h1>
    <p style="color:rgba(234,234,234,.75);font-size:14px;line-height:1.7;margin:0 0 20px;">${shortBody}${body && body.length > 200 ? "..." : ""}</p>
    <a href="${SITE_URL}/news" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;">اقرأ الخبر كامل</a>
  `;
  return emailWrapper("خبر جديد من Ace Town", html);
}
