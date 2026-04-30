import Image from "next/image";

const products = [
  {
    title: "Himsagar Mango",
    seller: "Rahman Agro",
    category: "Fruit",
    price: "280",
    unit: "kg",
    stock: 160,
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Aromatic Rice",
    seller: "North Field Co-op",
    category: "Grain",
    price: "86",
    unit: "kg",
    stock: 920,
    rating: "4.6",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Green Chili",
    seller: "Mita Farms",
    category: "Vegetable",
    price: "140",
    unit: "kg",
    stock: 75,
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Fresh Potato",
    seller: "Bogura Growers",
    category: "Vegetable",
    price: "38",
    unit: "kg",
    stock: 1250,
    rating: "4.5",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
  },
];

const stats = [
  { label: "Active products", value: "1,248" },
  { label: "Verified sellers", value: "316" },
  { label: "Avg response", value: "182ms" },
  { label: "Search lift", value: "+31%" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#18211c]">
      <header className="border-b border-[#dfe4d8] bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#557064]">
              AI agriculture marketplace
            </p>
            <h1 className="text-3xl font-semibold tracking-normal text-[#16251d]">
              Agriqon
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-medium text-[#405248]">
            <a className="nav-pill" href="#marketplace">Marketplace</a>
            <a className="nav-pill" href="#seller">Seller</a>
            <a className="nav-pill" href="#ai">AI Assistant</a>
            <a className="nav-pill nav-pill-dark" href="#dashboard">Dashboard</a>
          </nav>
        </div>
      </header>

      <section className="border-b border-[#dfe4d8] bg-[#eef2e7]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_360px]">
          <div className="flex min-h-[360px] flex-col justify-between bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center p-5 text-white shadow-sm">
            <div className="max-w-2xl">
              <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
                Find farm products with semantic search.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/90 md:text-lg">
                Search by intent, compare trusted sellers, and use RAG answers for export quality, pricing, and product fit.
              </p>
            </div>
            <form className="mt-8 grid gap-3 bg-white p-3 text-[#18211c] shadow-lg md:grid-cols-[1fr_150px_140px]">
              <label className="sr-only" htmlFor="search">Search products</label>
              <input
                id="search"
                className="h-12 border border-[#ccd5c8] px-4 text-sm outline-none focus:border-[#2f6b4f]"
                placeholder="sweet mango under 300"
              />
              <select className="h-12 border border-[#ccd5c8] px-3 text-sm outline-none focus:border-[#2f6b4f]">
                <option>All categories</option>
                <option>Fruit</option>
                <option>Vegetable</option>
                <option>Grain</option>
              </select>
              <button className="h-12 bg-[#245f47] px-5 text-sm font-semibold text-white transition hover:bg-[#1c4c39]">
                Search
              </button>
            </form>
          </div>

          <aside id="ai" className="flex flex-col justify-between border border-[#d9dfd1] bg-white p-5">
            <div>
              <p className="section-kicker">RAG assistant</p>
              <h3 className="mt-2 text-2xl font-semibold">Ask before buying.</h3>
              <div className="mt-5 border border-[#e1e5dd] bg-[#f9faf6] p-4">
                <p className="text-sm font-semibold text-[#26352d]">
                  Which mango is best for export?
                </p>
                <p className="mt-3 text-sm leading-6 text-[#5a675f]">
                  Himsagar and Langra usually rank well when firmness, sweetness, and shipment distance are matched with buyer requirements.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div className="border border-[#e1e5dd] p-3" key={stat.label}>
                  <p className="text-xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs text-[#65736b]">{stat.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="marketplace" className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Marketplace</p>
            <h2 className="mt-1 text-3xl font-semibold">Fresh listings</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Fruit", "Vegetable", "Grain", "Under 300"].map((filter) => (
              <button className="filter-button" key={filter}>{filter}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article className="product-card" key={product.title}>
              <Image
                className="h-44 w-full object-cover"
                src={product.image}
                alt={product.title}
                width={900}
                height={520}
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a6247]">
                      {product.category}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{product.title}</h3>
                  </div>
                  <p className="text-sm font-semibold text-[#245f47]">{product.rating}</p>
                </div>
                <p className="mt-2 text-sm text-[#65736b]">{product.seller}</p>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-2xl font-semibold">
                    Tk {product.price}
                    <span className="text-sm font-normal text-[#65736b]">/{product.unit}</span>
                  </p>
                  <p className="text-xs text-[#65736b]">{product.stock} in stock</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="dashboard" className="border-t border-[#dfe4d8] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 lg:grid-cols-3">
          <div className="panel">
            <p className="section-kicker">Buyer</p>
            <h3 className="panel-title">Order history</h3>
            <p className="panel-copy">Track pending, shipped, delivered, and cancelled orders from one API surface.</p>
          </div>
          <div id="seller" className="panel">
            <p className="section-kicker">Seller</p>
            <h3 className="panel-title">Product management</h3>
            <p className="panel-copy">Create listings, upload Cloudinary image URLs, manage stock, and view sales analytics.</p>
          </div>
          <div className="panel">
            <p className="section-kicker">Admin</p>
            <h3 className="panel-title">Platform control</h3>
            <p className="panel-copy">Review users, order status, platform stats, logs, and protected role-based actions.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
