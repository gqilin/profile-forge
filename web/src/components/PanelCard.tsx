type PanelCardProps = {
  title: string
  items: string[]
}

export function PanelCard({ title, items }: PanelCardProps) {
  return (
    <section className="panel-card">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
