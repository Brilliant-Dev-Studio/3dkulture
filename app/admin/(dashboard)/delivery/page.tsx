"use client";

import { useAdminStore } from "@/lib/admin-store";
import { RegionManager, CityManager, TownshipManager } from "@/components/township-manager";

export default function AdminDeliveryPage() {
  const {
    regions,
    cities,
    townships,
    addRegion,
    removeRegion,
    addCity,
    removeCity,
    addTownship,
    removeTownship,
  } = useAdminStore();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold">Delivery Locations</h1>
      <p className="-mt-4 text-sm text-muted">
        Region → City → Township. Customers pick these in order at checkout. Delivery fees aren't fixed here —
        they depend on the courier, so checkout just shows a note instead of a price.
      </p>
      <RegionManager items={regions} onAdd={addRegion} onRemove={removeRegion} />
      <CityManager items={cities} regions={regions} onAdd={addCity} onRemove={removeCity} />
      <TownshipManager
        items={townships}
        cities={cities.map((c) => c.name)}
        onAdd={addTownship}
        onRemove={removeTownship}
      />
    </div>
  );
}
