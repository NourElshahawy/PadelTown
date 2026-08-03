import { emailWrapper } from "./wrapper";

export function paymentReceivedEmail({ userName, venueName, price, bookingId }) {
  const body = `
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">تم استلام دفعتك 💰</h1>
    <p style="color:rgba(234,234,234,.7);font-size:14px;margin:0 0 20px;">
      أهلاً ${userName}، تم تأكيد دفع <b style="color:#00d68f;">${price} ج.م</b> لحجزك في ${venueName}.
    </p>
    <p style="color:rgba(234,234,234,.5);font-size:12px;">رقم الحجز: ${bookingId}</p>
  `;
  return emailWrapper("تأكيد الدفع", body);
}
