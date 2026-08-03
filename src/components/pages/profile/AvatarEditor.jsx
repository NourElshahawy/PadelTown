"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAvatar } from "@/services/authClient";
import { useToast } from "@/components/shared/ToastProvider";

export default function AvatarEditor({ userId, name, avatarUrl }) {
  const [preview, setPreview] = useState(avatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();
  const { showToast } = useToast();

  const initial = name?.charAt(0)?.toUpperCase() || "U";

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await updateAvatar(userId, file);
      setPreview(url);
      showToast("اتغيرت الصورة الشخصية بنجاح", "success");
      router.refresh(); // عشان الصورة تتحدث كمان في المينيو بتاع الناف بار
    } catch {
      showToast("حصل خطأ أثناء رفع الصورة، حاول تاني", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <span className="profile-menu-avatar" style={{ position: "relative" }}>
      {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : initial}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="تغيير الصورة الشخصية"
        style={{
          position: "absolute",
          bottom: -2,
          right: -2,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "var(--accent, #22d3a7)",
          border: "2px solid var(--bg-dark, #0b0b12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: uploading ? "wait" : "pointer",
        }}>
        <i className={`fa-solid ${uploading ? "fa-spinner fa-spin" : "fa-camera"}`} style={{ fontSize: 11, color: "#0b0b12" }}></i>
      </button>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
    </span>
  );
}
