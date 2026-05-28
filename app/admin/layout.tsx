import { Sidebar } from "@/components/admin/Sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-60 pt-0 lg:pt-0">
        {/* Mobile top padding for fixed header */}
        <div className="lg:hidden h-14" />
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
