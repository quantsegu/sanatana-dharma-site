const EXTERNAL_RESOURCES = [
  {
    id: 'brink-trick',
    title: 'Brink Trick Figma Site',
    slug: 'brink-trick-47383861',
    url: 'https://brink-trick-47383861.figma.site',
    description: 'External Figma-hosted page shared as part of the Sanatana Dharma resources.',
  },
  {
    id: 'render-hook',
    title: 'Render Hook Figma Site',
    slug: 'render-hook-84840522',
    url: 'https://render-hook-84840522.figma.site',
    description: 'External Figma-hosted page shared as part of the Sanatana Dharma resources.',
  },
];

export default function ExternalResourcesPage() {
  return (
    <section className="page-section">
      <h1 style={{ marginBottom: 12 }}>External Resource Pages</h1>
      <p style={{ marginTop: 0, opacity: 0.9 }}>
        These pages are hosted externally and linked from this site for quick access.
      </p>

      <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
        {EXTERNAL_RESOURCES.map((resource) => (
          <article key={resource.id} className="card">
            <h2 style={{ marginTop: 0 }}>{resource.title}</h2>
            <p>{resource.description}</p>
            <p style={{ marginBottom: 12 }}>
              <strong>Site path:</strong> /pages/{resource.slug}
            </p>
            <a
              href={resource.url}
              className="cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open {resource.title}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
