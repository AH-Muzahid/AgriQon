'use client';

const statistics = [
  { value: '10K+', label: 'Active Farmers', description: 'Verified agricultural producers' },
  { value: '50K+', label: 'Products Listed', description: 'Fresh produce available' },
  { value: '₹50Cr+', label: 'Monthly GMV', description: 'Transaction volume' },
  { value: '98%', label: 'Satisfaction', description: 'Buyer satisfaction rate' },
  { value: '24hrs', label: 'Avg Delivery', description: 'Time to market' },
  { value: '15+', label: 'Districts', description: 'Coverage areas' },
];

export default function StatisticsSection() {
  return (
    <section id="statistics" className="statistics-section">
      <div className="section-heading">
        <p className="section-kicker">Trust & Impact</p>
        <h2>Platform by the numbers</h2>
      </div>

      <div className="statistics-grid">
        {statistics.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <h3>{stat.label}</h3>
            <p>{stat.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
