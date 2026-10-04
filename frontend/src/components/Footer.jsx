import { BRAND } from "../config";

export default function Footer() {
  return (
    <footer className="bg-sand text-ink/80 mt-16 border-t border-pastel">
      <div className="max-w-7xl mx-auto px-4 py-10 text-sm flex flex-col sm:flex-row justify-between gap-3">
        <p className="font-heading text-2xl text-ink">{BRAND.name}</p>
        <p>{BRAND.tagline}</p>
        <p>{BRAND.email}</p>
      </div>
    </footer>
  );
}
