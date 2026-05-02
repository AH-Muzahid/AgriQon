'use client';

const testimonials = [
  {
    quote: 'Agriqon helped me find buyers for my mango harvest within days. The direct connection saved me from middlemen.',
    author: 'Rahim Mia',
    role: 'Fruit Farmer, Rajshahi',
    avatar: 'RM',
  },
  {
    quote: 'As a restaurant owner, I get fresh vegetables directly from farmers at fair prices. The quality is consistently good.',
    author: 'Fatema Begum',
    role: 'Restaurant Owner, Dhaka',
    avatar: 'FB',
  },
  {
    quote: 'The AI search is incredible. I type what I need, and it finds exactly matching products with seller ratings.',
    author: 'Khalid Hasan',
    role: 'Wholesale Buyer, Chittagong',
    avatar: 'KH',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="testimonials-section">
      <div className="section-heading">
        <p className="section-kicker">Testimonials</p>
        <h2>What our users say</h2>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <article className="testimonial-card" key={testimonial.author}>
            <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
            <div className="testimonial-author">
              <span className="author-avatar">{testimonial.avatar}</span>
              <div>
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
