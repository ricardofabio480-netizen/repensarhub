export default function ScoreBar({ name, score }: { name: string; score: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: '130px 1fr 56px', alignItems: 'center' }}>
      <span className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
        {name}
      </span>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-soft)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: 'var(--green)' }}
        />
      </div>
      <span className="text-sm font-bold text-right" style={{ color: 'var(--green-dark)' }}>
        {score}/100
      </span>
    </div>
  )
}
