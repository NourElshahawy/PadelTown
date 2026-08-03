export default function HeroImageSlider({ images = [] }) {
  if (images.length === 0) return null;

  return (
    <section className="booking-hero">
      <div className="hero-slider">
        {images.map((src, i) => (
          <div className="hero-slide" key={i}>
            <img src={src} alt="ملعب بادل" />
          </div>
        ))}
      </div>
    </section>
  );
}
