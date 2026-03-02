type SectionProps = {
  id: string;
  label: string;
  children: React.ReactNode;
};

/**
 * Section wrapper used throughout the page.
 * Renders the mono-uppercase label with a bottom border,
 * followed by content with consistent vertical spacing.
 */
export default function Section({ id, label, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 flex flex-col gap-12">
      {/* Section header — matches Figma: Roboto Mono 12 / bold / uppercase */}
      <div className="type-label border-b border-border pb-2">
        {label}
      </div>
      <div className="flex flex-col gap-12">
        {children}
      </div>
    </section>
  );
}
