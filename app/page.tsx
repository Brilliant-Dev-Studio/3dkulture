import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { QuickNav } from "@/components/quick-nav";
import { FilterSidebar } from "@/components/filter-sidebar";
import { ProductGrid } from "@/components/product-grid";
import { ProductCardSkeleton } from "@/components/product-card";
import { BestSellingProducts } from "@/components/best-selling-products";
import { AllProductsHeading } from "@/components/all-products-heading";
import { Container } from "@/components/container";

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
      <QuickNav />
      <BestSellingProducts />

      <Container className="mt-12">
        <hr className="border-border" />
      </Container>

      <Container id="all-products" className="scroll-mt-24 flex flex-col gap-8 py-10 sm:flex-row">
        <Suspense>
          <FilterSidebar />
        </Suspense>
        <main className="flex-1">
          <AllProductsHeading />
          <div className="mt-6">
            <Suspense fallback={<GridSkeleton />}>
              <ProductGrid />
            </Suspense>
          </div>
        </main>
      </Container>
    </div>
  );
}
