const { createClient } = require('@supabase/supabase-js');

const OLD_URL = 'https://zelynvpfzatsaiksznqx.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbHludnBmemF0c2Fpa3N6bnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTU4OTgsImV4cCI6MjA4NTI5MTg5OH0.AaNWySETk7iWCyDmbnatQyc7RbF-eSuKIkfadg_k4iU';

const oldClient = createClient(OLD_URL, OLD_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function inspect() {
    console.log("🔍 INSPECTING OLD DATA...");

    // Check Products
    const { data: products } = await oldClient.from('products').select('*').limit(1);
    if (products && products.length > 0) {
        console.log("\n📦 PRODUCTS Columns:");
        console.log(JSON.stringify(Object.keys(products[0]), null, 2));
    } else {
        console.log("No products found to inspect.");
    }
}

inspect();
