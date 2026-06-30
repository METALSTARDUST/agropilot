import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY

if (!url || !key) {
  throw new Error('❌ SUPABASE_URL ou SUPABASE_SECRET_KEY não definidos no .env')
}

export const db = createClient(url, key)