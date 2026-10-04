import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../config";

export default function HeroSlider() {
  const slides = BRAND.heroSlides;
  const [current, setCurrent] = useState(0);

  // Move to the next slide every 5 seconds
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative h-[420px] md:h-[560px] overflow-hidden bg-sand">
      {/* Background photos: only the current one is visible (fades) */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${s.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      <div className="hero-overlay absolute inset-0" />

      {/* Text */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="max-w-md">
          <p className="uppercase tracking-widest text-sm text-primary">
            {slide.label}
          </p>
          <h1 className="text-5xl md:text-6xl leading-tight mt-2">
            {slide.title}
          </h1>
          <p className="mt-4 text-ink/80">{slide.text}</p>
          <Link
            to={slide.link || "/shop"}
            className="btn bg-accent text-ink mt-6"
          >
            Shop now
          </Link>
        </div>
      </div>

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
