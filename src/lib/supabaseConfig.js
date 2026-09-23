import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://selhfelbtkbahwfajusi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbGhmZWxidGtiYWh3ZmFqdXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMzM2MDUsImV4cCI6MjEwNTYwOTYwNX0.kvzbt_o1BReo_j8RokMY_YB4z-xE8tEJse7aACUel9Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);