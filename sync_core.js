const { createClient } = require('@supabase/supabase-js');

const OLD_URL = 'https://zelynvpfzatsaiksznqx.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbHludnBmemF0c2Fpa3N6bnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTU4OTgsImV4cCI6MjA4NTI5MTg5OH0.AaNWySETk7iWCyDmbnatQyc7RbF-eSuKIkfadg_k4iU';

const NEW_URL = 'https://zwvuxadyenwmkkpzicek.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dnV4YWR5ZW53bWtrcHppY2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNjcwNCwiZXhwIjoyMDg1ODAyNzA0fQ.JBjpxe7gZihU5c7WBDvsXRXHXSL7ixs8fr622cu5xX0';

const oldClient = createClient(OLD_URL, OLD_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const newClient = createClient(NEW_URL, NEW_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
    console.log("SYNCING CATEGORIES...");

    // 1. Fetch OLD
    const { data: cats, error: e1 } = await oldClient.from('categories').select('*');
    if (e1) { console.error("Fetch Error:", e1); return; }
    console.log(`Fetched ${cats.length} categories.`);

    // 2. Insert NEW
    const { error: e2 } = await newClient.from('categories').upsert(cats);
    if (e2) { console.error("Insert Error:", e2); return; }
    console.log("✅ Categories Synced!");

    console.log("SYNCING PRODUCTS...");
    const { data: prods, error: e3 } = await oldClient.from('products').select('*');
    if (e3) { console.error("Fetch Error:", e3); return; }
    console.log(`Fetched ${prods.length} products.`);

    const { error: e4 } = await newClient.from('products').upsert(prods);
    if (e4) {
        console.error("Insert Error:", e4.message, e4.detail);
        return;
    }
    console.log("✅ Products Synced!");
}

run();
