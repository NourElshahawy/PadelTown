import { emailWrapper } from "./wrapper";

export function partnerRequestAcceptedEmail({ userName, courtName, date, time, hostName, hostPhone }) {
  const body = `
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">تم قبول طلبك ✅</h1>
    <p style="color:rgba(234,234,234,.7);font-size:14px;margin:0 0 20px;">
      أهلاً ${userName}، ${hostName} وافق على انضمامك في ${courtName} يوم ${date} الساعة ${time}.
    </p>
    <table width="100%" style="background:#1b2438;border-radius:12px;padding:16px;">
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;">تواصل مع ${hostName}</td><td style="color:#00d68f;font-size:14px;text-align:left;" dir="ltr">${hostPhone}</td></tr>
    </table>
  `;
  return emailWrapper("تم قبول طلبك", body);
}
