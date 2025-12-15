'use server'

import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// GET comments for a guideline
export async function GET(request: NextRequest, context: RouteContext) {
  const { id: guidelineId } = await context.params

  if (!guidelineId) {
    return NextResponse.json({ error: 'Guideline ID is required' }, { status: 400 })
  }

  try {
    const { data: comments, error } = await supabase
      .from('guideline_comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user:user_id (
          id,
          name,
          email
        )
      `)
      .eq('guideline_id', guidelineId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(comments || [])
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST - Add a new comment
export async function POST(request: NextRequest, context: RouteContext) {
  const { id: guidelineId } = await context.params

  if (!guidelineId) {
    return NextResponse.json({ error: 'Guideline ID is required' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    const { data: comment, error } = await supabase
      .from('guideline_comments')
      .insert({
        guideline_id: guidelineId,
        user_id: session.user.id,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user:user_id (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

// DELETE - Remove a comment
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { commentId } = await request.json()

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify comment ownership
    const { data: comment, error: fetchError } = await supabase
      .from('guideline_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('guideline_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
