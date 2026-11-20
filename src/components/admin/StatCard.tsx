import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink-mute">{label}</p>
        {icon ? <span className="text-ink-mute">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-3xl uppercase tracking-wide">{value}</p>
      {sub ? <p className="mt-1 text-sm text-ink-mute">{sub}</p> : null}
    </div>
  );
}
