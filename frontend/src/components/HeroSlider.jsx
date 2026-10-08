import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../config";

export default function HeroSlider() {
  const slides = BRAND.heroSlides || [];
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);

  // Lets the first photo begin its slow zoom right after the page appears
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Move to the next slide every 5 seconds
  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const hasText = Boolean(slide.title);

  return (
    <section className="relative h-[460px] sm:h-[520px] md:h-[600px] overflow-hidden bg-sand">
      {/* Background photos: only the current one is visible. It fades in and zooms slowly. */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${s.image})`,
            backgroundSize: "cover",
            backgroundPosition: s.position || "center",
            opacity: i === current ? 1 : 0,
            transform: i === current && started ? "scale(1.08)" : "scale(1)",
            transition: "opacity 1s ease, transform 9s ease-out",
          }}
        />
      ))}

      {hasText ? (
        <>
          <div className="hero-overlay absolute inset-0" />
          <div className="relative h-full max-w-7xl mx-auto px-5 flex items-end md:items-center pb-16 md:pb-0">
            {/* The key makes the text fade in again for every slide */}
            <div
              key={current}
              className="fade-up max-w-md mx-auto md:mx-0 text-center md:text-left"
            >
              <p className="uppercase tracking-[0.3em] text-xs sm:text-sm text-primary">
                {slide.label}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight mt-2">
                {slide.title}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-ink/80">
                {slide.text}
              </p>
              <Link to={slide.link || "/shop"} className="btn btn-primary mt-5">
                {slide.cta || "Shop now"}
              </Link>
            </div>
          </div>
        </>
      ) : (
        // A banner photo that already contains its own text: the whole photo is a link
        <Link
          to={slide.link || "/shop"}
          className="absolute inset-0"
          aria-label="Open collection"
        />
      )}

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              i === current ? "w-6 bg-primary" : "w-2.5 bg-ink/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
