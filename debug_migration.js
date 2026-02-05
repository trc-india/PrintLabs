const { createClient } = require('@supabase/supabase-js');

// OLD PROJECT - Using ANON KEY this time
const OLD_URL = 'https://zelynvpfzatsaiksznqx.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbHludnBmemF0c2Fpa3N6bnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTU4OTgsImV4cCI6MjA4NTI5MTg5OH0.AaNWySETk7iWCyDmbnatQyc7RbF-eSuKIkfadg_k4iU';

// NEW PROJECT - Using SERVICE ROLE KEY
const NEW_URL = 'https://zwvuxadyenwmkkpzicek.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InMycnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNjcwNCwiZXhwIjoyMDg1ODAyNzA0fQ.JBjpxe7gZihU5c7WBDvsXRXHXSL7ixs8fr622cu5xX0'; /* Oops I need the right one */
// Let me correct the new key below, copying carefully from previous steps

const NEW_KEY_CORRECT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dnV4YWR5ZW53bWtrcHppY2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNjcwNCwiZXhwIjoyMDg1ODAyNzA0fQ.JBjpxe7gZihU5c7WBDvsXRXHXSL7ixs8fr622cu5xX0';

const oldClient = createClient(OLD_URL, OLD_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const newClient = createClient(NEW_URL, NEW_KEY_CORRECT, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
    console.log("--- DEBUG START (With Anon Key) ---");

    // 1. Test OLD Connection
    console.log("1. Testing OLD connection (banners)...");
    const { data: b, error: e1 } = await oldClient.from('banners').select('id').limit(1);
    if (e1) {
        console.error("❌ OLD Connection Failed:", e1.message);
        return;
    }
    console.log("✅ OLD Connection OK (Anon).");

    // 3. Try Products
    console.log("3. Fetching Products from OLD...");
    const { data: products, error: e3 } = await oldClient.from('products').select('*');
    if (e3) {
        console.error("❌ Products Fetch Failed:", e3.message);
        return;
    }
    console.log(`✅ Fetched ${products.length} products.`);

    console.log("4. Upserting to NEW...");
    // We must use UPSERT for products
    const { error: e4 } = await newClient.from('products').upsert(products);

    if (e4) {
        console.error("❌ INSERT FAILED:", e4.message);
    } else {
        console.log("✅ success!");
    }
}

run();
