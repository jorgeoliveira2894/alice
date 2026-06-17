interface ContactButtonProps {
  href: string;
  children: React.ReactNode;
  /** Subtle outline variant for the closing section */
  variant?: 'text' | 'outline';
  className?: string;
}

/**
 * A discreet, non-commercial call to action. Opens the visitor's email client.
 */
export function ContactButton({
  href,
  children,
  variant = 'text',
  className = '',
}: ContactButtonProps) {
  const base =
    'group inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-xs font-sans uppercase tracking-editorial transition-colors duration-500 ease-premium';

  const styles =
    variant === 'outline'
      ? 'border border-ink/20 px-6 py-3 hover:border-ink/60 text-ink'
      : 'text-ink/70 hover:text-ink';

  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      <span>{children}</span>
      <span
        aria-hidden
        className="inline-block translate-x-0 transition-transform duration-500 ease-premium group-hover:translate-x-1"
      >
        →
      </span>
    </a>
  );
}
