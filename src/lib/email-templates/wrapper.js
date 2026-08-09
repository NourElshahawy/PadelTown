export function emailWrapper(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0b1020;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1020;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#141b2d;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#00d68f;padding:24px;text-align:center;">
              <span style="color:#04140e;font-size:20px;font-weight:800;">PadelTown</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#eaeaea;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(234,234,234,.1);text-align:center;">
              <span style="color:rgba(234,234,234,.4);font-size:12px;">© 2026 PadelTown — المنصورة</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
