const { createClient } = require('@supabase/supabase-js');

const OLD_URL = 'https://zelynvpfzatsaiksznqx.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbHludnBmemF0c2Fpa3N6bnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTU4OTgsImV4cCI6MjA4NTI5MTg5OH0.AaNWySETk7iWCyDmbnatQyc7RbF-eSuKIkfadg_k4iU';

const NEW_URL = 'https://zwvuxadyenwmkkpzicek.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dnV4YWR5ZW53bWtrcHppY2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNjcwNCwiZXhwIjoyMDg1ODAyNzA0fQ.JBjpxe7gZihU5c7WBDvsXRXHXSL7ixs8fr622cu5xX0';

const oldClient = createClient(OLD_URL, OLD_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const newClient = createClient(NEW_URL, NEW_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
    console.log("Fetching products...");
    const { data: products } = await oldClient.from('products').select('*');
    if (!products) { console.log("No products"); return; }
    console.log(`Trying to insert ${products.length} products...`);

    // Convert array fields if necessary? 
    // Usually Supabase handles it if schema matches.

    // Try one by one to find the killer
    const product = products[0];
    const { error } = await newClient.from('products').upsert(product);

    if (error) {
        console.error("❌ INSERT ERROR:", error.message);
        console.error("Hint:", error.hint);
        console.error("Details:", error.details);
    } else {
        console.log("✅ Inserted one successfully!");

        // If one works, try all
        const { error: allErr } = await newClient.from('products').upsert(products);
        if (allErr) console.error("Batch error:", allErr.message);
        else console.log("✅ Batch success!");
    }
}

run();
