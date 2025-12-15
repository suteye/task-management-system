import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/utils/supabase/client'
import bcryptjs from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || !['admin', 'dept_head'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only admins can reset passwords' }, { status: 403 })
    }

    const body = await request.json()
    const { email, newPassword } = body

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: email, newPassword' },
        { status: 400 }
      )
    }

    // Hash the new password
    const password_hash = await bcryptjs.hash(newPassword, 10)

    // Update user password
    const { error } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('email', email)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Password updated successfully', email })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
