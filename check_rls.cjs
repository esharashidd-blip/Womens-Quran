
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRLS() {
    console.log('--- Checking RLS status ---');
    // We can't easily check RLS status without direct SQL, 
    // but we can try to select with a NON-admin client.

    const anonClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

    const { data, error } = await anonClient.from('settings').select('*').limit(1);
    if (error) {
        console.log('Anon Select Failed (as expected if RLS is on and no session):', error.message);
    } else {
        console.log('Anon Select Succeeded (RLS might be off or misconfigured!):', data);
    }
}

checkRLS();
