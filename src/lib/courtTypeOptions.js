// "بانوراما" (panoramic glass-walled courts) is a padel-specific concept —
// doesn't apply to football or tennis courts, so it's hidden for those sports.
const ALL_TYPES = [
  { value: "regular", label: "عادي" },
  { value: "panoramic", label: "بانوراما" },
  { value: "indoor", label: "مغطى" },
  { value: "outdoor", label: "مكشوف" },
];

export function getTypeOptionsForSport(sportType) {
  if (sportType === "padel") return ALL_TYPES;
  return ALL_TYPES.filter((t) => t.value !== "panoramic");
}

// لو الرياضة اتغيرت والنوع الحالي بقى مش منطقي (بانوراما لملعب كورة/تنس مثلاً)، بيرجع "عادي" بدالها
export function normalizeTypeForSport(type, sportType) {
  const valid = getTypeOptionsForSport(sportType).map((t) => t.value);
  return valid.includes(type) ? type : "regular";
}
