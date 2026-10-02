import { BRAND } from "./config";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-cream">
      <h1 className="text-5xl">{BRAND.name}</h1>
      <p className="mt-3 text-accent">{BRAND.tagline}</p>
      <button className="btn bg-accent text-ink mt-6">Test button</button>
    </div>
  );
}
