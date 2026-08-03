import { emailWrapper } from "./wrapper";

export function bookingCancelledEmail({ userName, venueName, courtName, date, time, price }) {
  const body = `
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">للأسف، حجزك اتلغى</h1>
    <p style="color:rgba(234,234,234,.7);font-size:14px;margin:0 0 24px;">أهلاً ${userName}، الحجز التالي اتلغى من إدارة الملعب.</p>
    <table width="100%" style="background:#1b2438;border-radius:12px;padding:16px;margin-bottom:20px;">
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;padding:6px 0;">الملعب</td><td style="color:#fff;font-size:13px;text-align:left;">${venueName} — ${courtName}</td></tr>
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;padding:6px 0;">التاريخ</td><td style="color:#fff;font-size:13px;text-align:left;">${date}</td></tr>
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;padding:6px 0;">الوقت</td><td style="color:#fff;font-size:13px;text-align:left;">${time}</td></tr>
      <tr><td style="color:rgba(234,234,234,.6);font-size:13px;padding:6px 0;">المبلغ</td><td style="color:#ff6b6b;font-size:15px;font-weight:800;text-align:left;">${price} ج.م</td></tr>
    </table>
    <p style="color:rgba(234,234,234,.5);font-size:12px;">لو محتاج توضيح، تواصل معانا وهنساعدك.</p>
  `;
  return emailWrapper("تم إلغاء الحجز", body);
}
