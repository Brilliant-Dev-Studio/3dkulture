"use client";

import { useAdminStore } from "@/lib/admin-store";
import { CityManager, TownshipManager } from "@/components/township-manager";

export default function AdminDeliveryPage() {
  const { cities, townships, addCity, removeCity, addTownship, updateTownship, removeTownship } = useAdminStore();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold">Delivery Fees</h1>
      <CityManager items={cities} onAdd={addCity} onRemove={removeCity} />
      <TownshipManager
        items={townships}
        cities={cities}
        onAdd={addTownship}
        onUpdate={updateTownship}
        onRemove={removeTownship}
      />
    </div>
  );
}
