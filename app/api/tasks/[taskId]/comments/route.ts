import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/utils/supabase/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    const { data: comments, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        user:users!task_comments_user_id_fkey(*)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(comments)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    const { content, mentions } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: session.user.id,
        content: content.trim(),
        mentions: mentions || []
      })
      .select(`
        *,
        user:users!task_comments_user_id_fkey(*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create activity log
    await supabase.from('task_activity').insert({
      task_id: taskId,
      user_id: session.user.id,
      action: 'commented',
      details: { comment_id: comment.id }
    })

    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      const notificationPromises = mentions.map((userId: string) =>
        supabase.from('notifications').insert({
          user_id: userId,
          task_id: taskId,
          type: 'commented',
          message: `${session.user.name} mentioned you in a comment`,
          read: false
        })
      )
      await Promise.all(notificationPromises)
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await params
    const { commentId } = await request.json()

    // Verify ownership
    const { data: comment } = await supabase
      .from('task_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (comment?.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
