import { BRAND } from "../config";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/80 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm flex flex-col sm:flex-row justify-between gap-2">
        <p className="font-heading text-lg text-cream">{BRAND.name}</p>
        <p>{BRAND.tagline}</p>
        <p>{BRAND.email}</p>
      </div>
    </footer>
  );
}
