'use client';

interface ScoreBadgeProps {
  label: string;
  score: number;
  explanation?: string[];
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ label, score, explanation, size = 'sm' }: ScoreBadgeProps) {
  let colorClasses = 'border-slate-700 bg-slate-900/60 text-slate-300';
  let dotColor = 'bg-slate-400';

  if (score >= 75) {
    colorClasses = 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300';
    dotColor = 'bg-emerald-400';
  } else if (score >= 50) {
    colorClasses = 'border-amber-500/30 bg-amber-950/40 text-amber-300';
    dotColor = 'bg-amber-400';
  } else if (score > 0) {
    colorClasses = 'border-rose-500/30 bg-rose-950/40 text-rose-300';
    dotColor = 'bg-rose-400';
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
