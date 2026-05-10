const EXTERNAL_RESOURCES = [
  {
    id: 'brink-trick',
    title: 'Where the Alps Meet the Vedas',
    slug: 'brink-trick-47383861',
    url: 'https://brink-trick-47383861.figma.site',
    description:
      'An Alpine ashram for the modern seeker — yoga, Ayurveda, and sattvic living at the foot of sacred mountains (Italian Alps; Hindu-rooted retreat).',
  },
  {
    id: 'render-hook',
    title: 'Sustainable Farm Planning',
    slug: 'render-hook-84840522',
    url: 'https://render-hook-84840522.figma.site',
    description:
      'Sustainable farm planning — practical guidance for designing and stewarding farm projects with ecological balance in mind.',
  },
];

export default function ExternalResourcesPage() {
  return (
    <section className="page-section">
      <h1 style={{ marginBottom: 12 }}>Ashram & Farm sites</h1>
      <p style={{ marginTop: 0, opacity: 0.9 }}>
        Companion sites hosted on Figma — Alpine retreat vision and sustainable farm planning — opened here for quick access.
      </p>

      <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
        {EXTERNAL_RESOURCES.map((resource) => (
          <article key={resource.id} className="card">
            <h2 style={{ marginTop: 0 }}>{resource.title}</h2>
            <p>{resource.description}</p>
            <p style={{ marginBottom: 12 }}>
              <strong>Shortcut on this site:</strong> /pages/{resource.slug}
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
