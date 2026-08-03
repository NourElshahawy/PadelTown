import { sendTournamentStartedEmail } from "@/lib/sendEmail";

export async function POST(request) {
  const body = await request.json();
  const { recipients, ...data } = body; // recipients: [{ email, captainName }]
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return Response.json({ error: "Missing recipients" }, { status: 400 });
  }
  await Promise.all(recipients.filter((r) => r.email).map((r) => sendTournamentStartedEmail(r.email, { ...data, captainName: r.captainName })));
  return Response.json({ success: true });
}
