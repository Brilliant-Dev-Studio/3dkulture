import { AdminStoreProvider } from "@/lib/admin-store";
import { AdminSidebar, AdminMobileNav, AdminHeader } from "@/components/admin-sidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminStoreProvider>
      <div className="flex min-h-screen bg-zinc-50">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <AdminMobileNav />
          <AdminHeader />
          {children}
        </div>
      </div>
    </AdminStoreProvider>
  );
}
