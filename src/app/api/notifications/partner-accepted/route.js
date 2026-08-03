import { sendPartnerRequestAcceptedEmail } from "@/lib/sendEmail";

export async function POST(request) {
  const body = await request.json();
  const { email, ...data } = body;
  if (!email) return Response.json({ error: "Missing email" }, { status: 400 });

  await sendPartnerRequestAcceptedEmail(email, data);
  return Response.json({ success: true });
}
