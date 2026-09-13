interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="placeholder-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <p style={{ marginTop: 12, color: 'var(--text-faint)', fontSize: 12.5 }}>
        Full UI for this screen will be implemented in a later milestone, matching the approved
        HTML mocks.
      </p>
    </div>
  );
}
