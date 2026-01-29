export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">PrintLabs</h1>
        <p className="text-lg text-gray-600">
          Custom Laser Cutting & 3D Printing Services
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a 
            href="/admin" 
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Admin Panel
          </a>
          <a 
            href="/products" 
            className="px-6 py-3 border border-black rounded-lg hover:bg-gray-50 transition"
          >
            Browse Products
          </a>
        </div>
      </div>
    </main>
  )
}
