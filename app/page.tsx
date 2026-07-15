import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { FilterSidebar } from "@/components/filter-sidebar";
import { ProductGrid } from "@/components/product-grid";
import { ProductCardSkeleton } from "@/components/product-card";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6">
        <Suspense>
          <FilterSidebar />
        </Suspense>
        <main className="flex-1">
          <Suspense fallback={<GridSkeleton />}>
            <ProductGrid />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
