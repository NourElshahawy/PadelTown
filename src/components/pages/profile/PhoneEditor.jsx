"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePhone } from "@/services/authClient";
import { useToast } from "@/components/shared/ToastProvider";

const PHONE_REGEX = /^01[0125]\d{8}$/;

export default function PhoneEditor({ userId, phone }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(phone || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const isValid = PHONE_REGEX.test(value);

  const handleSave = async () => {
    if (!isValid) {
      showToast("رقم الهاتف لازم يكون رقم مصري صحيح (01xxxxxxxxx)", "error");
      return;
    }
    setSaving(true);
    try {
      await updatePhone(userId, value);
      showToast("اتحدث رقم الهاتف بنجاح", "success");
      setEditing(false);
      router.refresh();
    } catch {
      showToast("حصل خطأ أثناء تحديث الرقم، حاول تاني", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(phone || "");
    setEditing(false);
  };

  if (!editing) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {phone || "مفيش رقم مسجل"}
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="تعديل رقم الهاتف"
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--accent, #22d3a7)",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}>
          <i className="fa-solid fa-pen" style={{ fontSize: 9, color: "#0b0b12" }}></i>
        </button>
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <input
        type="tel"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        placeholder="01xxxxxxxxx"
        dir="ltr"
        maxLength={11}
        disabled={saving}
        style={{
          width: 130,
          padding: "2px 8px",
          borderRadius: 6,
          border: value && !isValid ? "1px solid #ff6b6b" : "1px solid var(--border, #333)",
          background: "transparent",
          color: "inherit",
        }}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !isValid}
        title="حفظ"
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "var(--accent, #22d3a7)",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: saving || !isValid ? "not-allowed" : "pointer",
          opacity: saving || !isValid ? 0.5 : 1,
        }}>
        <i className={`fa-solid ${saving ? "fa-spinner fa-spin" : "fa-check"}`} style={{ fontSize: 10, color: "#0b0b12" }}></i>
      </button>
      <button
        type="button"
        onClick={handleCancel}
        disabled={saving}
        title="إلغاء"
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "transparent",
          border: "1px solid var(--border, #333)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}>
        <i className="fa-solid fa-xmark" style={{ fontSize: 10 }}></i>
      </button>
    </span>
  );
}
