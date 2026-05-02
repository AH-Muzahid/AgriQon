'use client';

const services = [
  {
    icon: '🔍',
    title: 'Smart Search',
    description: 'AI-powered natural language search finds the perfect products matching your needs.',
  },
  {
    icon: '📦',
    title: 'Direct Sourcing',
    description: 'Connect directly with verified farmers and suppliers.',
  },
  {
    icon: '📊',
    title: 'Price Insights',
    description: 'Real-time market data and fair pricing transparency.',
  },
  {
    icon: '🚚',
    title: 'Logistics Support',
    description: 'End-to-end delivery tracking and quality assurance.',
  },
  {
    icon: '💬',
    title: 'Seller Chat',
    description: 'In-app messaging for quick negotiations and inquiries.',
  },
  {
    icon: '⭐',
    title: 'Verified Reviews',
    description: 'Trust scores based on real transaction feedback.',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="services-section">
      <div className="section-heading">
        <p className="section-kicker">Services</p>
        <h2>Everything you need to trade smarter</h2>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <article className="service-card" key={service.title}>
            <span className="service-icon">{service.icon}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
