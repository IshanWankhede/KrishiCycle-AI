/**
 * Shared class names for the Make + Batch modules, built from the KrishiCycle 2.0 design tokens
 * (dark green surfaces, lime accent, pill buttons, 24-32px card radius).
 */
export const ui = {
  card: 'bg-surface-darkcard rounded-4xl p-5 sm:p-6 border border-surface-darkborder shadow-xl',
  tile: 'bg-black/25 border border-white/5 rounded-2xl',
  tileSolid: 'bg-surface-darkcardhover/70 border border-white/5 rounded-2xl',
  eyebrow: 'text-[10px] font-mono font-bold text-lime uppercase tracking-wider',
  h1: 'font-display font-extrabold text-white',
  muted: 'text-xs text-neutral-400',
  label: 'text-xs font-bold text-neutral-300',
  input:
    'w-full p-2.5 rounded-2xl border border-white/10 bg-[#0A110D] text-xs font-semibold text-white placeholder:text-neutral-500 focus:border-lime/60 focus:outline-none',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-lime hover:bg-lime-hover text-ink font-bold text-xs transition shadow-glow-lime cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
  btnSecondary:
    'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition cursor-pointer',
  btnAmber:
    'inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-amber hover:brightness-110 text-ink font-bold text-xs transition cursor-pointer shadow-lg',
  note: 'rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs p-4',
  info: 'rounded-2xl border border-lime/25 bg-primary-dark/40 text-neutral-200 text-xs p-4',
  chip: 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 border border-white/10 text-lime',
  banner:
    'rounded-3xl bg-gradient-to-r from-primary-dark via-surface-darkcardhover to-primary-dark/80 border border-lime/30 text-white',
};

export const toneClasses = {
  lime: 'text-lime bg-lime/10 border-lime/30',
  amber: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  red: 'text-red-300 bg-red-500/10 border-red-500/30',
  teal: 'text-teal bg-teal/10 border-teal/30',
};
