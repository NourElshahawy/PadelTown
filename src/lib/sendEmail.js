import { resend, FROM_EMAIL } from "./resend";
import { bookingConfirmationEmail } from "./email-templates/bookingConfirmation";
import { paymentReceivedEmail } from "./email-templates/paymentReceived";
import { tournamentInviteEmail } from "./email-templates/tournamentInvite";
import { partnerRequestAcceptedEmail } from "./email-templates/partnerRequestAccepted";
import { tournamentFullEmail } from "./email-templates/tournamentFull";
import { tournamentStartedEmail } from "./email-templates/tournamentStarted";
import { bookingCancelledEmail } from "./email-templates/bookingCancelled";
import { newsPublishedEmail } from "./email-templates/newsPublished";
export async function sendBookingConfirmationEmail(to, data) {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `تأكيد حجزك في ${data.venueName}`,
      html: bookingConfirmationEmail(data),
    });
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
  }
}

export async function sendPaymentReceivedEmail(to, data) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "تم تأكيد دفعتك — InstaPadel",
      html: paymentReceivedEmail(data),
    });
  } catch (err) {
    console.error("Failed to send payment email:", err);
  }
}

export async function sendTournamentInviteEmail(to, data) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `بطولة جديدة: ${data.tournamentName}`,
      html: tournamentInviteEmail(data),
    });
  } catch (err) {
    console.error("Failed to send tournament invite:", err);
  }
}

export async function sendPartnerRequestAcceptedEmail(to, data) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "تم قبول طلب انضمامك — InstaPadel",
      html: partnerRequestAcceptedEmail(data),
    });
  } catch (err) {
    console.error("Failed to send partner accepted email:", err);
  }
}

// آخر الملف
export async function sendTournamentFullEmail(to, data) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `اكتمل عدد فرق بطولة ${data.tournamentName}`,
      html: tournamentFullEmail(data),
    });
  } catch (err) {
    console.error("Failed to send tournament full email:", err);
  }
}

export async function sendTournamentStartedEmail(to, data) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `بدأت بطولة ${data.tournamentName}`,
      html: tournamentStartedEmail(data),
    });
  } catch (err) {
    console.error("Failed to send tournament started email:", err);
  }
}
export async function sendBookingCancelledEmail(to, data) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `تم إلغاء حجزك في ${data.venueName}`,
      html: bookingCancelledEmail(data),
    });
  } catch (err) {
    console.error("Failed to send booking cancelled email:", err);
  }
}

export async function sendNewsPublishedEmail(to, data) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `خبر جديد: ${data.title}`,
      html: newsPublishedEmail(data),
    });
  } catch (err) {
    console.error("Failed to send news email:", err);
  }
}