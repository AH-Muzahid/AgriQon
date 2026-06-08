import { serviceItems } from "./data";

export function ServiceStrip() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
      <div className="no-scrollbar flex gap-3 overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white p-3 shadow-sm md:grid md:grid-cols-5 md:gap-4 md:p-5">
        {serviceItems.map((item) => (
          <div key={item.label} className="flex min-w-[185px] items-center gap-3 md:min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#f8fafc] md:size-11">
              <item.icon className={`size-5 md:size-6 ${item.color}`} />
            </div>
            <p className="text-sm font-semibold text-[var(--brand-ink)]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
