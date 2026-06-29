import type { ReactNode } from 'react';

// Button (atom): the two CTA styles used across the app.
// `solid` = terracotta CTA, `light` = ghost/bordered.
// `className` appends extra classes for one-off spacing tweaks.
export function Button({
  children,
  onClick,
  variant = 'solid',
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'light';
  disabled?: boolean;
  className?: string;
}) {
  const cls = ['btn', variant === 'light' ? 'light' : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
