const stats = [
  { value: '50M+', label: 'Monthly impressions' },
  { value: '98%', label: 'Viewability Rate' },
  { value: '500+', label: 'Premium Channels' },
];

export function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-5xl font-bold text-(--ads-cyan) mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
