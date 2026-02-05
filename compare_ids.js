const { createClient } = require('@supabase/supabase-js');

const OLD_URL = 'https://zelynvpfzatsaiksznqx.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbHludnBmemF0c2Fpa3N6bnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTU4OTgsImV4cCI6MjA4NTI5MTg5OH0.AaNWySETk7iWCyDmbnatQyc7RbF-eSuKIkfadg_k4iU';

const NEW_URL = 'https://zwvuxadyenwmkkpzicek.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dnV4YWR5ZW53bWtrcHppY2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNjcwNCwiZXhwIjoyMDg1ODAyNzA0fQ.JBjpxe7gZihU5c7WBDvsXRXHXSL7ixs8fr622cu5xX0';

const oldClient = createClient(OLD_URL, OLD_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const newClient = createClient(NEW_URL, NEW_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function compare() {
    console.log("OLD Categories:");
    const { data: oldCats } = await oldClient.from('categories').select('id, name');
    oldCats.forEach(c => console.log(`  ${c.id} - ${c.name}`));

    console.log("\nNEW Categories:");
    const { data: newCats } = await newClient.from('categories').select('id, name');
    newCats.forEach(c => console.log(`  ${c.id} - ${c.name}`));
}

compare();
