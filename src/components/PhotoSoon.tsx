type Props = {
  className?: string
}

export function PhotoSoon({ className = "aspect-square" }: Props) {
  return (
    <div
      className={`flex w-full items-center justify-center bg-cloud ${className}`}
    >
      <p className="font-display text-2xl font-bold uppercase tracking-[0.14em] text-blood/50">
        Próximamente
      </p>
    </div>
  )
}
