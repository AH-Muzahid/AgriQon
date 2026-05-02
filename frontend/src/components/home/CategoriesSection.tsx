'use client';

import Image from 'next/image';

const categories = [
  {
    name: 'Fruits',
    count: '320+ listings',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Vegetables',
    count: '480+ listings',
    image: 'https://images.unsplash.com/photo-1540420773420-3366a92e002c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Grains',
    count: '210+ listings',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed9f2f1?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Spices',
    count: '150+ listings',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  },
];

export default function CategoriesSection() {
  return (
    <section id="categories" className="categories-section">
      <div className="section-heading">
        <p className="section-kicker">Categories</p>
        <h2>Browse by product type</h2>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <article className="category-card" key={category.name}>
            <Image
              src={category.image}
              alt={category.name}
              width={600}
              height={400}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="category-overlay">
              <h3>{category.name}</h3>
              <span>{category.count}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
