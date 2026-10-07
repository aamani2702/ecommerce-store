import { useEffect, useState } from "react";
import { BRAND } from "../config";

// A WhatsApp chat button and a "back to top" button, fixed to the corner of the screen
export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-20 md:bottom-6 z-40 flex flex-col items-end gap-3">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="w-11 h-11 rounded-full bg-white shadow-lg border border-pastel-dark text-primary text-xl"
        >
          ↑
        </button>
      )}
      {BRAND.whatsapp && (
        <a
          href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Hello! I have a question about ${BRAND.name}`)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
          </svg>
        </a>
      )}
    </div>
  );
}
