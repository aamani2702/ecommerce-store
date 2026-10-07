import { Link } from "react-router-dom";

// items: [{ label: 'Home', to: '/' }, { label: 'Current page' }]
export default function Breadcrumbs({ items }) {
  return (
    <nav
      className="text-xs text-ink/60 flex flex-wrap items-center gap-1 mb-6"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {item.to ? (
            <Link to={item.to} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
          {i < items.length - 1 && <span>/</span>}
        </span>
      ))}
    </nav>
  );
}
