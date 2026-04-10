import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vrathpugozerrvuumekc.supabase.co";
const supabaseKey = "sb_publishable_Jzl41Mj1lQHQ422M8U1Fqg_RgMKZCLg";

export const supabase = createClient(supabaseUrl, supabaseKey);
