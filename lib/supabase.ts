import { createClient } from "@supabase/supabase-js";

const supbaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supbaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supbase = createClient(supbaseUrl, supbaseAnonKey);
