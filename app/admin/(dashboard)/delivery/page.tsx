"use client";

import { useAdminStore } from "@/lib/admin-store";
import { TownshipManager } from "@/components/township-manager";

export default function AdminDeliveryPage() {
  const { townships, addTownship, updateTownship, removeTownship } = useAdminStore();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold">Delivery Fees</h1>
      <TownshipManager
        items={townships}
        onAdd={addTownship}
        onUpdate={updateTownship}
        onRemove={removeTownship}
      />
    </div>
  );
}
