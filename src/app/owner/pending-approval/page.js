import { redirect } from "next/navigation";

export default async function PendingApprovalPage() {
  redirect("/owner/dashboard");
}
