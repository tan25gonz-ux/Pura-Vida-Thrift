import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://cdeuyspzvewvqthgtybe.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZXV5c3B6dmV3dnF0aGd0eWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODc0NzYsImV4cCI6MjA3NjA2MzQ3Nn0.OYeJnOnq_aXSnfYpsR7M-t1C2FfnC0F9gX7BYvjERGk";

export const supabase = createClient(supabaseUrl, supabaseKey);
