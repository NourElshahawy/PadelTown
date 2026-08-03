import { emailWrapper } from "./wrapper";

export function tournamentFullEmail({ tournamentName, venueName, maxTeams }) {
  const body = `
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">🎉 اكتمل عدد فرق بطولتك</h1>
    <p style="color:rgba(234,234,234,.7);font-size:14px;margin:0 0 20px;">
      بطولة "${tournamentName}" في ${venueName} اكتمل عدد فرقها (${maxTeams} فريق).
      تقدر دلوقتي تدخل لوحة إدارة البطولة وتبدأها في أي وقت مناسب.
    </p>
  `;
  return emailWrapper("اكتمل عدد الفرق", body);
}
