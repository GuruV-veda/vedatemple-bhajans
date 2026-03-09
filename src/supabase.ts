import { createClient } from "@supabase/supabase-js"

  const supabaseUrl = "https://impsslvlluihsfharioo.supabase.co",
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcHNzbHZsbHVpaHNmaGFyaW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzMyODUsImV4cCI6MjA4ODE0OTI4NX0.WFTJHpy2qC8CIl7oEW2NhT6A3JIKC6-T07F4S6ngGRQ"

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
