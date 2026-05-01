"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

const categories = ["All", "Fruit", "Vegetable", "Grain"];

const products = [
  {
    title: "Himsagar Mango",
    seller: "Rahman Agro",
    region: "Rajshahi",
    category: "Fruit",
    price: "280",
    unit: "kg",
    stock: "160 kg",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Aromatic Rice",
    seller: "North Field Co-op",
    region: "Dinajpur",
    category: "Grain",
    price: "86",
    unit: "kg",
    stock: "920 kg",
    rating: "4.6",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Green Chili",
    seller: "Mita Farms",
    region: "Bogura",
    category: "Vegetable",
    price: "140",
    unit: "kg",
    stock: "75 kg",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Fresh Potato",
    seller: "Bogura Growers",
    region: "Rangpur",
    category: "Vegetable",
    price: "38",
    unit: "kg",
    stock: "1.2 ton",
    rating: "4.5",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
  },
];

const metrics = [
  { label: "Verified sellers", value: "316" },
  { label: "Fresh listings", value: "1,248" },
  { label: "Search lift", value: "+31%" },
  { label: "Avg response", value: "182ms" },
];

const aiRows = [
  ["Query", "sweet mango under 300"],
  ["Match", "Himsagar Mango, Rahman Agro"],
  ["Reason", "High sweetness, current stock, export-friendly firmness"],
];

const workflows = [
  {
    label: "Farmers",
    title: "List crops faster",
    copy: "Manage stock, pricing, images, order flow, and seller analytics from one focused workspace.",
  },
  {
    label: "Buyers",
    title: "Find the right supply",
    copy: "Compare freshness, seller rating, region, price, and availability before placing an order.",
  },
  {
    label: "Admins",
    title: "Control the market",
    copy: "Review users, moderate orders, watch platform stats, and keep role-based operations tidy.",
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("sweet mango under 300");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [selectedCategory]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const marketplace = document.getElementById("marketplace");
    marketplace?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#18211c]">
      <section className="hero-shell">
        <header className="site-header">
          <a className="brand-mark" href="/home" aria-label="Agriqon home">
            <span className="brand-icon">A</span>
            <span>Agriqon</span>
          </a>

          <nav className="top-nav" aria-label="Main navigation">
            <a href="#marketplace">Marketplace</a>
            <a href="#ai">AI Search</a>
            <a href="#workflow">Dashboards</a>
          </nav>

          <Link className="header-action" href="/">
            Shop now
          </Link>
        </header>

        <div id="top" className="hero-content">
          <p className="eyebrow">AI agriculture marketplace</p>
          <h1>Agriqon</h1>
          <p className="hero-copy">
            A smarter way for farmers and buyers to discover fresh products,
            compare trusted sellers, and make faster trade decisions.
          </p>

          <form onSubmit={handleSearch} className="search-dock">
            <label className="sr-only" htmlFor="search">
              Search farm products
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="sweet mango under 300"
            />
            <select
              aria-label="Category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <button type="submit">Search</button>
          </form>

          <div className="hero-metrics" aria-label="Platform metrics">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="marketplace" className="market-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Marketplace</p>
            <h2>Live product discovery</h2>
          </div>
          <div className="segmented-control" aria-label="Product category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? "active" : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.title}>
              <Image
                src={product.image}
                alt={product.title}
                width={900}
                height={620}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="product-body">
                <div>
                  <p className="product-meta">
                    {product.category} / {product.region}
                  </p>
                  <h3>{product.title}</h3>
                  <p>{product.seller}</p>
                </div>
                <div className="product-footer">
                  <strong>
                    Tk {product.price}
                    <span>/{product.unit}</span>
                  </strong>
                  <span>{product.stock}</span>
                </div>
                <div className="rating-row">
                  <span>{product.rating} seller rating</span>
                  <a href="#workflow">View flow</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="ai" className="ai-section">
        <div className="ai-copy">
          <p className="section-kicker">Semantic search + RAG</p>
          <h2>Answers that understand buyer intent.</h2>
          <p>
            Agriqon turns natural language requests into relevant products,
            seller context, and practical recommendations for quality, price,
            and fit.
          </p>
        </div>

        <div className="ai-panel" aria-label="AI answer preview">
          <div className="assistant-topline">
            <span>AI Assistant</span>
            <strong>Ready</strong>
          </div>
          <div className="answer-bubble">
            Himsagar from Rahman Agro is the strongest match because it fits the
            price target, has available stock, and ranks highly for sweetness.
          </div>
          <div className="ai-table">
            {aiRows.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="workflow-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Dashboards</p>
            <h2>Built around real marketplace roles.</h2>
          </div>
          <a className="text-link" href="#top">
            Start searching
          </a>
        </div>

        <div className="workflow-grid">
          {workflows.map((workflow) => (
            <article className="workflow-card" key={workflow.label}>
              <span>{workflow.label}</span>
              <h3>{workflow.title}</h3>
              <p>{workflow.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
