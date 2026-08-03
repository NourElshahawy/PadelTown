import { emailWrapper } from "./wrapper";

export function tournamentInviteEmail({ tournamentName, venueName, date, tournamentUrl }) {
  const body = `
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">🏆 بطولة جديدة: ${tournamentName}</h1>
    <p style="color:rgba(234,234,234,.7);font-size:14px;margin:0 0 20px;">
      بطولة جديدة اتفتحت في ${venueName} يوم ${date} — سجّل فريقك قبل ما الأماكن تخلص.
    </p>
    <a href="${tournamentUrl}" style="display:inline-block;background:#00d68f;color:#04140e;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:800;font-size:14px;">
      سجّل الآن
    </a>
  `;
  return emailWrapper("بطولة جديدة", body);
}
