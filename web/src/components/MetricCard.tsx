type MetricCardProps = {
  label: string
  value: string
  tone: string
}

const toneLabel: Record<string, string> = {
  default: 'NORMAL',
  warning: 'WATCH',
  success: 'READY',
}

export function MetricCard({ label, value, tone }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__top">
        <span className="metric-card__indicator" />
        <span className="metric-card__tone">{toneLabel[tone] ?? 'NORMAL'}</span>
      </div>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
    </article>
  )
}
