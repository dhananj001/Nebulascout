'use client';

interface ScoreBadgeProps {
  label: string;
  score: number;
  explanation?: string[];
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ label, score, explanation, size = 'sm' }: ScoreBadgeProps) {
  let colorClasses = 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300';
  let dotColor = 'bg-neutral-400';

  if (score >= 75) {
    colorClasses = 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    dotColor = 'bg-emerald-500';
  } else if (score >= 50) {
    colorClasses = 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400';
    dotColor = 'bg-amber-500';
  } else if (score > 0) {
    colorClasses = 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400';
    dotColor = 'bg-rose-500';
  }

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-xs' 
    : size === 'md' 
    ? 'px-2 py-1 text-[11px]' 
    : 'px-1.5 py-0.5 text-[10px]';

  return (
    <div className="relative group inline-flex items-center">
      <div className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium ${sizeClasses} ${colorClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="text-slate-400 font-sans">{label}:</span>
        <span className="font-bold">{score}</span>
      </div>

      {explanation && explanation.length > 0 && (
        <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-50 w-64 p-2.5 bg-slate-900 border border-slate-700 rounded-md shadow-xl text-[11px] text-slate-300 pointer-events-none">
          <p className="font-semibold text-white mb-1">{label} Breakdown ({score}/100):</p>
          <ul className="space-y-0.5 list-disc list-inside text-slate-400">
            {explanation.map((factor, idx) => (
              <li key={idx} className="leading-tight">{factor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
