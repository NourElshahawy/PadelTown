import { emailWrapper } from "./wrapper";

export function bookingConfirmationEmail({ userName, venueName, courtName, date, time, price, bookingId }) {
  const body = `
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">تم تأكيد حجزك ✅</h1>
    <p style="color:rgba(234,234,234,.7);font-size:14px;margin:0 0 24px;">أهلاً ${userName}، حجزك جاهز — التفاصيل تحت.</p>
    <table width="100%" style="background:#1b2438;border-radius:12px;padding:16px;margin-bottom:20px;">
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;padding:6px 0;">الملعب</td><td style="color:#fff;font-size:13px;text-align:left;">${venueName} — ${courtName}</td></tr>
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;padding:6px 0;">التاريخ</td><td style="color:#fff;font-size:13px;text-align:left;">${date}</td></tr>
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;padding:6px 0;">الوقت</td><td style="color:#fff;font-size:13px;text-align:left;">${time}</td></tr>
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;padding:6px 0;">المبلغ</td><td style="color:#00d68f;font-size:15px;font-weight:800;text-align:left;">${price} ج.م</td></tr>
    </table>
    <p style="color:rgba(234,234,234,.5);font-size:12px;">رقم الحجز: ${bookingId}</p>
  `;
  return emailWrapper("تأكيد الحجز", body);
}
