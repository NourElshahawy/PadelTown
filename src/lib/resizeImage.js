export function resizeImageFile(file, maxSize = 512, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("فشل تجهيز الصورة"));
            const resizedFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
            resolve(resizedFile);
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => reject(new Error("الصورة تالفة أو غير مدعومة"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("فشل قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}
