import type { ReactNode } from 'react';

// Pill (atom): small rounded label/tag.
export function Pill({ children }: { children: ReactNode }) {
  return <span className="pill">{children}</span>;
}
