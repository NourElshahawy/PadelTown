"use client";
import { useState } from "react";

export default function PasswordField({ id, label, placeholder, value, onChange, required = true }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="field-input-wrap">
        <input className="field-input" type={visible ? "text" : "password"} id={id} placeholder={placeholder} value={value} onChange={onChange} required={required} />
        <i className={`fa-solid ${visible ? "fa-eye-slash" : "fa-eye"} field-icon`} onClick={() => setVisible((v) => !v)} />

      </div>
    </div>
  );
}
