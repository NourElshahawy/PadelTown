"use client";

const WHATSAPP_NUMBER = "201000665539"; // ← رقم Ace Town بصيغة دولية بدون +

export default function WhatsAppFloatButton() {
  const message = encodeURIComponent("مرحبًا، عندي استفسار بخصوص Ace Town");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="whatsapp-float-btn" aria-label="تواصل معنا على واتساب">
      <i className="fa-brands fa-whatsapp"></i>
    </a>
  );
}
