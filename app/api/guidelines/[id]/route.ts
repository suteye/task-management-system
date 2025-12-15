import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/utils/supabase/client'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: guideline, error } = await supabase
      .from('guidelines')
      .select(`
        *,
        user:users!guidelines_created_by_fkey(id, name, email, role)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(guideline)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the guideline to check ownership
    const { data: guideline, error: getError } = await supabase
      .from('guidelines')
      .select('created_by')
      .eq('id', id)
      .single()

    if (getError || !guideline) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Check if user is the creator or admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || (guideline.created_by !== session.user.id && !['admin', 'dept_head'].includes(user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, category, tags } = body

    const { data: updated, error } = await supabase
      .from('guidelines')
      .update({
        title,
        content,
        category,
        tags: tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the guideline to check ownership
    const { data: guideline, error: getError } = await supabase
      .from('guidelines')
      .select('created_by')
      .eq('id', id)
      .single()

    if (getError || !guideline) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Check if user is the creator or admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || (guideline.created_by !== session.user.id && !['admin', 'dept_head'].includes(user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('guidelines')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
