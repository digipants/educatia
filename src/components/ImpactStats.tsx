const stats = [
  { label: 'Students learning', value: '18,200+' },
  { label: 'Government schools', value: '432' },
  { label: 'Districts', value: '38' },
  { label: 'Programs running', value: '14' }
];

export default function ImpactStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card text-center">
          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          <p className="text-slate-600 text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
