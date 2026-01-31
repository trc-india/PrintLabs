import AdminSidebar from '@/components/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // h-screen + overflow-hidden prevents the whole page from scrolling
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* 1. Sidebar (Stays fixed because parent is h-screen) */}
      <AdminSidebar />

      {/* 2. Main Content (Scrolls independently) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* overflow-y-auto enables scrolling ONLY inside this box */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}