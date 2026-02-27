interface Props {
  current: number;
  target: number;
}

export default function CampaignProgress({ current, target }: Props) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Raised</span>
        <span>
          ₹{current.toLocaleString('en-IN')} / ₹{target.toLocaleString('en-IN')}
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-brand-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-slate-500">{pct}% funded</p>
    </div>
  );
}
