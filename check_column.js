const { createClient } = require('@supabase/supabase-js');

const NEW_URL = 'https://zwvuxadyenwmkkpzicek.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNjcwNCwiZXhwIjoyMDg1ODAyNzA0fQ.JBjpxe7gZihU5c7WBDvsXRXHXSL7ixs8fr622cu5xX0';

const newClient = createClient(NEW_URL, NEW_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function check() {
    console.log("Checking NEW DB schema...");
    const { data, error } = await newClient.from('categories').select('description').limit(1);

    if (error) {
        console.error("❌ Column check failed:", error.message);
    } else {
        console.log("✅ Column 'description' exists and is accessible!");
    }
}

check();
