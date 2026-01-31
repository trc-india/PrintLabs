import { supabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import ProductScrollRow from "@/components/product-scroll-row";
export const dynamic = "force-dynamic";

// --- 1. HERO BANNER ---
async function HeroBanner() {
  const { data: banners } = await supabaseAdmin
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!banners || banners.length === 0) return null;
  const banner = banners[0];

  return (
    <div className="relative w-full h-[120px] sm:h-[160px] md:h-[200px] bg-gray-50">
      <Link href={banner.link_url || "#"}>
        <Image
          src={banner.image_url}
          alt={banner.title}
          fill
          className="object-cover object-center"
          priority
        />
      </Link>
    </div>
  );
}

// --- 2. CATEGORY BAR ---
function CategoryBar({ categories }: { categories: any[] }) {
  return (
    <div className="border-b border-gray-200 bg-white sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3 overflow-x-auto no-scrollbar">
          <Link
            href="/categories"
            className="flex-shrink-0 px-4 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-gray-800 transition"
          >
            View All
          </Link>
          <div className="w-px h-6 bg-gray-300"></div>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex-shrink-0 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-100 px-3 py-1.5 rounded transition whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 3. DYNAMIC SECTION ENGINE ---
async function DynamicSection({ section }: { section: any }) {
  let products: any[] = [];

  // --- FETCHING LOGIC BASED ON SOURCE TYPE ---
  if (section.source_type === "category" && section.data_source_id) {
    // Fetch by Category
    const { data } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, base_price, product_images(image_url)")
      .eq("category_id", section.data_source_id)
      .eq("status", "active")
      .limit(8);
    products = data || [];
  } else if (
    section.source_type === "manual_products" &&
    section.specific_product_ids?.length > 0
  ) {
    // Fetch Specific IDs
    const { data } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, base_price, product_images(image_url)")
      .in("id", section.specific_product_ids)
      .eq("status", "active");

    // Preserve the order of IDs if possible (Postgres .in() doesn't guarantee order)
    // We can re-sort in JS if strictly needed, but roughly okay for now.
    products = data || [];
  } else if (section.data_source_id) {
    // Default: Fetch from Group (Collection)
    const { data } = await supabaseAdmin
      .from("product_group_items")
      .select(
        "products (id, name, slug, base_price, product_images (image_url))",
      )
      .eq("group_id", section.data_source_id)
      .limit(8);
    products = data?.map((d: any) => d.products) || [];
  }

  if (products.length === 0) return null;

  // --- RENDERER ---
  return (
    <section className="py-8 border-b border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-5">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {section.title}
          </h2>
          {section.data_source_id &&
            section.source_type !== "manual_products" && (
              <Link
                href={
                  section.source_type === "category"
                    ? `/products`
                    : `/collections/${section.data_source_id}`
                }
                className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black"
              >
                View All
              </Link>
            )}
        </div>

        {/* LAYOUT SWITCHER */}

        {/* 1. SCROLL ROW (Netflix Style) */}
        {/* 1. SCROLL ROW (Netflix Style with Arrows) */}
        {section.layout_variant === "scroll_row" ? (
          <ProductScrollRow products={products} />
        ) :
        
        /* 2. FEATURED SPLIT (Big Left) */
        section.layout_variant === "featured_split" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 relative h-[300px] md:h-auto bg-gray-100 rounded-lg overflow-hidden group">
              <BigCard product={products[0]} />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.slice(1, 7).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : /* 3. FEATURED SPLIT RIGHT (Big Right) */
        section.layout_variant === "featured_split_right" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 order-2 md:order-1">
              {products.slice(1, 7).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="md:col-span-1 relative h-[300px] md:h-auto bg-gray-100 rounded-lg overflow-hidden group order-1 md:order-2">
              <BigCard product={products[0]} />
            </div>
          </div>
        ) : /* 4. TWO BIG CARDS */
        section.layout_variant === "grid_2_big" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.slice(0, 2).map((p: any) => (
              <div
                key={p.id}
                className="relative h-[250px] sm:h-[350px] bg-gray-100 rounded-lg overflow-hidden group"
              >
                <BigCard product={p} />
              </div>
            ))}
          </div>
        ) : /* 5. HIGH DENSITY (6 Cols) */
        section.layout_variant === "grid_6" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        ) : /* 6. WIDE GRID (5 Cols) */
        section.layout_variant === "grid_5" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          /* DEFAULT: STANDARD GRID (4 Cols) */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// --- HELPERS ---

function ProductCard({
  product,
  compact,
}: {
  product: any;
  compact?: boolean;
}) {
  const img = product.product_images?.[0]?.image_url;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div
        className={`aspect-square relative bg-gray-50 rounded-lg overflow-hidden ${compact ? "mb-2" : "mb-3"}`}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
            No Image
          </div>
        )}
      </div>
      <h3
        className={`font-medium text-gray-900 truncate ${compact ? "text-xs" : "text-sm"}`}
      >
        {product.name}
      </h3>
      <p
        className={`font-bold text-gray-900 ${compact ? "text-xs" : "text-sm"}`}
      >
        ₹{product.base_price}
      </p>
    </Link>
  );
}

function BigCard({ product }: { product: any }) {
  if (!product) return null;
  const img = product.product_images?.[0]?.image_url;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="block h-full w-full relative"
    >
      {img && (
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-xl font-bold leading-tight">{product.name}</h3>
        <p className="font-medium text-lg">₹{product.base_price}</p>
      </div>
    </Link>
  );
}

// --- MAIN PAGE ---
export default async function HomePage() {
  const [{ data: categories }, { data: sections }] = await Promise.all([
    supabaseAdmin
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("homepage_sections")
      .select("*")
      .eq("is_active", true)
      .neq("section_type", "banner_slider")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <HeroBanner />
      <CategoryBar categories={categories || []} />
      <div className="flex flex-col">
        {sections?.map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))}
        {(!sections || sections.length === 0) && (
          <div className="py-20 text-center text-gray-400">
            <p>Add content via Admin &gt; Homepage Layout</p>
          </div>
        )}
      </div>
    </div>
  );
}
