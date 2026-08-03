"use client";

export default function PhotoDropZone({ courtName, photos, onAddFiles, onRemovePhoto }) {
  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => onAddFiles({ id: `${Date.now()}-${Math.random()}`, dataUrl: ev.target.result });
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <div className="photo-section">
      <h4>{courtName}</h4>
      <div className="photo-drop-zone">
        <input type="file" accept="image/*" multiple onChange={handleChange} />
        <i className="fa-solid fa-image"></i>
        <p>
          Drag & drop photos or <b style={{ color: "var(--accent)" }}>browse</b>
        </p>
        <span>JPG, PNG, WEBP — max 10MB each</span>
      </div>

      {photos.length > 0 && (
        <div className="photo-previews">
          {photos.map((p) => (
            <div className="photo-preview-item" key={p.id}>
              <img src={p.dataUrl} alt="" />
              <button type="button" className="remove-photo" onClick={() => onRemovePhoto(p.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
