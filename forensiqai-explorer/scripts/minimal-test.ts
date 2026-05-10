import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const { data, error } = await supabase
    .from('knowledge_documents')
    .insert({ title: 'test' })
    .select();
  
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
