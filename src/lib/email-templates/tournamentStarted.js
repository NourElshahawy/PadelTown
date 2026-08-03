import { emailWrapper } from "./wrapper";

export function tournamentStartedEmail({ captainName, tournamentName, venueName }) {
  const body = `
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">⚡ بدأت البطولة</h1>
    <p style="color:rgba(234,234,234,.7);font-size:14px;margin:0 0 20px;">
      يا ${captainName || "بطل"}، بطولة "${tournamentName}" في ${venueName} بدأت رسميًا.
      هيتم التواصل معاك على المواعيد والأيام الخاصة بمبارياتك أول بأول.
    </p>
  `;
  return emailWrapper("بدأت البطولة", body);
}
