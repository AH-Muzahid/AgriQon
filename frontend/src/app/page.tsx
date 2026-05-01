"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const categories = ["All", "Fruits", "Vegetables", "Grains", "Spices"];

const products = [
  {
    name: "Himsagar Mango",
    vendor: "Rahman Agro",
    category: "Fruits",
    location: "Rajshahi",
    price: 280,
    unit: "kg",
    stock: "160 kg",
    rating: "4.8",
    orders: "92",
    tag: "Export grade",
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Aromatic Rice",
    vendor: "North Field Co-op",
    category: "Grains",
    location: "Dinajpur",
    price: 86,
    unit: "kg",
    stock: "920 kg",
    rating: "4.6",
    orders: "214",
    tag: "Bulk ready",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Green Chili",
    vendor: "Mita Farms",
    category: "Spices",
    location: "Bogura",
    price: 140,
    unit: "kg",
    stock: "75 kg",
    rating: "4.7",
    orders: "68",
    tag: "Fresh picked",
    image:
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fresh Potato",
    vendor: "Bogura Growers",
    category: "Vegetables",
    location: "Rangpur",
    price: 38,
    unit: "kg",
    stock: "1.2 ton",
    rating: "4.5",
    orders: "301",
    tag: "Wholesale",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Red Tomato",
    vendor: "Green Delta Farm",
    category: "Vegetables",
    location: "Jashore",
    price: 62,
    unit: "kg",
    stock: "450 kg",
    rating: "4.4",
    orders: "147",
    tag: "Daily harvest",
    image:
      "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Banana Bunch",
    vendor: "Hill Fresh",
    category: "Fruits",
    location: "Narsingdi",
    price: 95,
    unit: "dozen",
    stock: "310 dozen",
    rating: "4.6",
    orders: "122",
    tag: "Fast delivery",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80",
  },
];

const vendors = [
  { name: "Rahman Agro", specialty: "Premium fruits", sales: "1.8k" },
  { name: "North Field Co-op", specialty: "Rice and grains", sales: "3.4k" },
  { name: "Bogura Growers", specialty: "Bulk vegetables", sales: "2.1k" },
];

export default function MarketplaceHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const searchText = `${product.name} ${product.vendor} ${product.location} ${product.category}`;
      const matchesSearch = searchText
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <main className="storefront">
      <header className="commerce-header">
        <Link className="commerce-brand" href="/" aria-label="Agriqon marketplace">
          <span>A</span>
          Agriqon Market
        </Link>

        <div className="commerce-search">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search products, vendors, or region"
            aria-label="Search marketplace"
          />
        </div>

        <nav className="commerce-actions" aria-label="Marketplace actions">
          <a href="/home">Landing</a>
          <a href="#vendors">Vendors</a>
          <button type="button">Cart 0</button>
        </nav>
      </header>

      <section className="commerce-hero">
        <div className="commerce-hero-copy">
          <p className="store-kicker">Multivendor agriculture ecommerce</p>
          <h1>Buy fresh farm products from verified sellers.</h1>
          <p>
            Browse crops by category, compare vendors, review stock, and place
            orders from one clean marketplace interface.
          </p>
          <div className="commerce-hero-actions">
            <a href="#products">Shop products</a>
            <a href="#vendors">View vendors</a>
          </div>
        </div>

        <div className="deal-board" aria-label="Today market summary">
          <div>
            <span>Today&apos;s featured deal</span>
            <strong>Himsagar Mango</strong>
            <p>Tk 280/kg from Rahman Agro</p>
          </div>
          <Image
            src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80"
            alt="Fresh mango"
            width={600}
            height={460}
            priority
          />
        </div>
      </section>

      <section className="category-strip" aria-label="Product categories">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <section id="products" className="commerce-section">
        <div className="commerce-section-title">
          <div>
            <p className="store-kicker">Products</p>
            <h2>Available now</h2>
          </div>
          <span>{filteredProducts.length} products found</span>
        </div>

        <div className="commerce-grid">
          {filteredProducts.map((product) => (
            <article className="commerce-card" key={product.name}>
              <div className="commerce-card-image">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={900}
                  height={620}
                  sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
                />
                <span>{product.tag}</span>
              </div>
              <div className="commerce-card-body">
                <div>
                  <p>{product.category} / {product.location}</p>
                  <h3>{product.name}</h3>
                  <a href="#vendors">{product.vendor}</a>
                </div>
                <div className="commerce-card-meta">
                  <strong>
                    Tk {product.price}
                    <span>/{product.unit}</span>
                  </strong>
                  <span>{product.stock}</span>
                </div>
                <div className="commerce-card-bottom">
                  <span>{product.rating} rating</span>
                  <span>{product.orders} orders</span>
                  <button type="button">Add</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="vendors" className="commerce-section vendor-section">
        <div className="commerce-section-title">
          <div>
            <p className="store-kicker">Vendors</p>
            <h2>Trusted seller network</h2>
          </div>
          <a href="/home">About Agriqon</a>
        </div>

        <div className="vendor-grid">
          {vendors.map((vendor) => (
            <article className="vendor-card" key={vendor.name}>
              <span>{vendor.name.charAt(0)}</span>
              <div>
                <h3>{vendor.name}</h3>
                <p>{vendor.specialty}</p>
              </div>
              <strong>{vendor.sales} sales</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
