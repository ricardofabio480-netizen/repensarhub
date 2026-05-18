export default function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  return (
    <div
      className="rounded-full grid place-items-center text-center shrink-0"
      style={{
        width: size,
        height: size,
        border: '14px solid var(--surface-soft)',
        outline: '8px solid rgba(31,138,85,0.12)',
      }}
    >
      <div>
        <span
          className="block font-black leading-none"
          style={{ fontSize: size * 0.28, color: 'var(--ink)' }}
        >
          {score}
        </span>
        <small className="font-bold text-xs" style={{ color: 'var(--muted)' }}>
          /100
        </small>
      </div>
    </div>
  )
}
