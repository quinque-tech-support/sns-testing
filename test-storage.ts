import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: 'c:/Users/kjlup/projects/websites/insta-auto/insta-auto/sns-instagram/.env' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testStorage() {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) {
        console.error('Error fetching buckets:', error)
    } else {
        console.log('Buckets:', data)
    }
}

testStorage()
