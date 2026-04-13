type PanelCardProps = {
  title: string
  items: string[]
}

export function PanelCard({ title, items }: PanelCardProps) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <span className="panel-card__icon" aria-hidden="true" />
        <h3>{title}</h3>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
