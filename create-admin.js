const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lqukyvrluighcivtyhmw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdWt5dnJsdWlnaGNpdnR5aG13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc3MTg5MSwiZXhwIjoyMDg4MzQ3ODkxfQ.VhKq_U8xZ-xHdPQo5z-5Q8c6OBqLZPqTtTtTtTtTtTt'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin() {
  try {
    // Create admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@tradeai.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        is_admin: true
      }
    })
    
    if (error) {
      console.log('Error:', error.message)
      return
    }
    
    console.log('Admin user created successfully!')
    console.log('Email:', data.user?.email)
    
    // Also insert into users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: 'admin@tradeai.com',
          full_name: 'Admin User',
          plan: 'enterprise',
          is_admin: true
        })
      
      if (insertError) {
        console.log('Insert error:', insertError.message)
      } else {
        console.log('User record added to users table!')
      }
    }
  } catch (err) {
    console.log('Exception:', err.message)
  }
}

createAdmin()
