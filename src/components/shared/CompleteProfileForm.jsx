"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompleteProfileForm({ redirectTo }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!/^01[0125]\d{8}$/.test(phone.trim())) {
      setError("رقم الهاتف لازم يكون رقم مصري صحيح (01 وبعده 9 أرقام)");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: updateError } = await supabase.from("profiles").update({ phone: phone.trim() }).eq("id", user.id);

    if (updateError) {
      setError("حصل خطأ، حاول تاني");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onSubmit={handleSubmit} className="owner-card" style={{ maxWidth: 420, width: "100%" }}>
        <h2 className="owner-card-title">خطوة أخيرة</h2>
        <p style={{ color: "var(--text-muted)", fontSize: ".85rem", marginBottom: 16 }}>محتاجين رقم تليفونك عشان نقدر نتواصل معاك بخصوص حجوزاتك.</p>

        {error && <p style={{ color: "#ff6b6b", fontSize: ".85rem", marginBottom: 12 }}>{error}</p>}

        <div className="field-group">
          <label>رقم الهاتف</label>
          <input className="field-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" required />
        </div>

        <button type="submit" className="owner-btn-save" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
          {loading ? "جاري الحفظ..." : "متابعة"}
        </button>
      </form>
    </main>
  );
}
