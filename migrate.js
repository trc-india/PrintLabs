const { createClient } = require('@supabase/supabase-js');

// 1. OLD PROJECT (Source - Using ANON KEY which worked for reading)
const OLD_URL = 'https://zelynvpfzatsaiksznqx.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbHludnBmemF0c2Fpa3N6bnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTU4OTgsImV4cCI6MjA4NTI5MTg5OH0.AaNWySETk7iWCyDmbnatQyc7RbF-eSuKIkfadg_k4iU';

// 2. NEW PROJECT (Destination - Using SERVICE ROLE KEY to write)
const NEW_URL = 'https://zwvuxadyenwmkkpzicek.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dnV4YWR5ZW53bWtrcHppY2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNjcwNCwiZXhwIjoyMDg1ODAyNzA0fQ.JBjpxe7gZihU5c7WBDvsXRXHXSL7ixs8fr622cu5xX0';

// Initialize Clients
const oldClient = createClient(OLD_URL, OLD_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const newClient = createClient(NEW_URL, NEW_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// --- MIGRATION LOGIC ---

async function migrateTable(tableName) {
    console.log(`\nStarting migration for table: [${tableName}]...`);

    // 1. Fetch from OLD
    const { data: rows, error: fetchError } = await oldClient
        .from(tableName)
        .select('*');

    if (fetchError) {
        console.error(`❌ Error fetching from OLD ${tableName}:`, fetchError.message);
        return;
    }

    if (!rows || rows.length === 0) {
        console.log(`ℹ️ Table [${tableName}] is empty. Skipping.`);
        return;
    }

    console.log(`✅ Fetched ${rows.length} rows from [${tableName}]. Inserting into NEW project...`);

    // 2. Insert into NEW (Upsert to prevent duplicate key errors)
    const { error: insertError } = await newClient
        .from(tableName)
        .upsert(rows);

    if (insertError) {
        console.error(`❌ Error inserting into NEW ${tableName}:`, insertError.message);
    } else {
        console.log(`✅ Successfully migrated [${tableName}]!`);
    }
}

async function runMigration() {
    console.log('🚀 STARTING MIGRATION...');
    console.log('-----------------------------------');

    // ORDER MATTERS!

    // 1. Independent Tables
    await migrateTable('site_settings');
    await migrateTable('banners');
    await migrateTable('categories');

    // 2. Dependent Tables
    await migrateTable('products');

    // 3. Deeply Dependent Tables
    await migrateTable('product_images');
    await migrateTable('homepage_sections');

    await migrateTable('product_group_items');

    console.log('-----------------------------------');
    console.log('🎉 MIGRATION COMPLETE!');
}

runMigration();
