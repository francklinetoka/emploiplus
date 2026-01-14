import { Link } from "react-router-dom";

export default function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center">
            {it.to ? (
              <Link to={it.to} className="hover:underline text-sm">
                {it.label}
              </Link>
            ) : (
              <span className="text-sm">{it.label}</span>
            )}
            {idx < items.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
