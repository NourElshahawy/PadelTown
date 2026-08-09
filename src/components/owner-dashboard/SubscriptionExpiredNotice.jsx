export default function SubscriptionExpiredNotice() {
  return (
    <p style={{ color: "#ff6b6b", fontSize: ".8rem", margin: "8px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
      <i className="fa-solid fa-triangle-exclamation"></i>
      اشتراكك منتهي — هيتحفظ عندك، لكن مش هيظهر للاعبين في نتائج البحث لحد ما تجدد اشتراكك.
    </p>
  );
}
