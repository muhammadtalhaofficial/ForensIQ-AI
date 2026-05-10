import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspect() {
  const { data, error } = await supabase
    .from('knowledge_documents')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Columns:', Object.keys(data[0] || {}));
  }
}

inspect();
