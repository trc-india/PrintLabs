const { createClient } = require('@supabase/supabase-js');

const NEW_URL = 'https://zwvuxadyenwmkkpzicek.supabase.co';
// Taking strictly from .env.local Line 3
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dnV4YWR5ZW53bWtrcHppY2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNjcwNCwiZXhwIjoyMDg1ODAyNzA0fQ.JBjpxe7gZihU5c7WBDvsXRXHXSL7ixs8fr622cu5xX0';

const supabase = createClient(NEW_URL, NEW_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function debug() {
    console.log('🔍 DEBUGGING DATABASE CONTENT...');

    // 1. Check Categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, is_active, sort_order');

    if (catError) console.error('❌ Categories Error:', catError.message);
    else console.log(`\n📂 Found ${categories?.length || 0} Categories:`, categories);

    // 2. Check Homepage Sections
    const { data: sections, error: secError } = await supabase
        .from('homepage_sections')
        .select('id, title, is_active, section_type, source_type');

    if (secError) console.error('❌ Sections Error:', secError.message);
    else console.log(`\nmmm Found ${sections?.length || 0} Homepage Sections:`, sections);

    // 3. Check Products count
    const { count, error: prodError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (prodError) console.error('❌ Products Error:', prodError.message);
    else console.log(`\n📦 Total Active Products: ${count}`);

}

debug();
