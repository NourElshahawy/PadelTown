export function toInternationalPhone(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-\+]/g, ""); // شيل مسافات وشرط وعلامة +

  if (cleaned.startsWith("0")) {
    cleaned = "20" + cleaned.slice(1); // 01065801252 → 201065801252
  } else if (!cleaned.startsWith("20")) {
    cleaned = "20" + cleaned; // احتياطي لو الرقم مسجل من غير صفر ومن غير كود الدولة
  }

  return cleaned;
}