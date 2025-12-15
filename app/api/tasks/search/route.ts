import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/utils/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assigned_to = searchParams.get('assigned_to')
    const due_after = searchParams.get('due_after')
    const due_before = searchParams.get('due_before')
    const labels = searchParams.get('labels')?.split(',') || []
    const sort_by = searchParams.get('sort_by') || 'created_at'
    const sort_order = searchParams.get('sort_order') || 'desc'

    let taskQuery = supabase
      .from('tasks')
      .select(`
        *,
        user:users!tasks_assigned_to_fkey(*)
      `)
      .or(`assigned_to.eq.${session.user.id},created_by.eq.${session.user.id},bcd_owner.eq.${session.user.id},dev_owner.eq.${session.user.id},sit_support.eq.${session.user.id},uat_support.eq.${session.user.id}`)

    // Text search
    if (query) {
      taskQuery = taskQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    // Status filter
    if (status) {
      taskQuery = taskQuery.eq('status', status)
    }

    // Priority filter
    if (priority) {
      taskQuery = taskQuery.eq('priority', priority)
    }

    // Assigned to filter
    if (assigned_to) {
      taskQuery = taskQuery.eq('assigned_to', assigned_to)
    }

    // Due date range filter
    if (due_after) {
      taskQuery = taskQuery.gte('due_date', due_after)
    }
    if (due_before) {
      taskQuery = taskQuery.lte('due_date', due_before)
    }

    // Labels filter (if labels table exists)
    if (labels.length > 0) {
      // This would require a join with labels table
      // For now, we'll handle basic filtering
    }

    // Sorting
    const validSortFields = ['created_at', 'due_date', 'priority', 'updated_at']
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at'
    const order = sort_order === 'asc' ? { ascending: true } : { ascending: false }

    const { data: tasks, error } = await taskQuery.order(sortField, order)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      tasks,
      count: tasks?.length || 0,
      query,
      filters: { status, priority, assigned_to, due_after, due_before, labels }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
