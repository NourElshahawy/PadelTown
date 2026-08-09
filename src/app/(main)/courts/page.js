import CourtsListing from "@/_pages/courts/CourtsListing";
import { getAllCourts } from "@/services/courtService";
import { SITE_URL } from "@/lib/siteConfig";

export const metadata = {
  title: "ملاعب بادل وكورة وتنس في المنصورة | PadelTown",
  description: "كل ملاعب البادل والكورة والتنس في المنصورة على PadelTown. شوف الأسعار والمواعيد المتاحة فورًا واحجز مكانك في ثوانٍ.",
  keywords: [
    "ملاعب البادل",
    "كورت بادل المنصورة",
    "نادي بادل المنصورة",
    "Padel Club Mansoura",
    "Padel Court Near Me",
    "ملاعب كورة قدم المنصورة",
    "حجز ملعب خماسي",
    "ملاعب تنس المنصورة",
    "Football Court Mansoura",
    "Tennis Court Mansoura",
  ],
};

export default async function CourtsPage({ searchParams }) {
  const sp = await searchParams;
  const courts = await getAllCourts({ date: sp.date });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courts.map((court, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SportsActivityLocation",
        name: court.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: court.location,
          addressLocality: court.city || "المنصورة",
          addressCountry: "EG",
        },
        url: `${SITE_URL}/booking/${court.slug}?subCourtId=${court.subCourtId}`,
        image: court.image?.startsWith("http") ? court.image : `${SITE_URL}${court.image}`,
        ...(court.rating > 0 &&
          court.reviewCount > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: court.rating,
              reviewCount: court.reviewCount,
              bestRating: 5,
            },
          }),
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CourtsListing courts={courts} searchFilters={{ date: sp.date }} />
    </>
  );
}
