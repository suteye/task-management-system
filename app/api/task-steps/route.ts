import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/utils/supabase/client'


export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch task steps for user's tasks
    // First, get task IDs where user is assigned or creator
    const { data: userTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .or(`assigned_to.eq.${session.user.id},created_by.eq.${session.user.id},bcd_owner.eq.${session.user.id},dev_owner.eq.${session.user.id},sit_support.eq.${session.user.id},uat_support.eq.${session.user.id}`)

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    const taskIds = userTasks?.map(t => t.id) || []
    console.log('Task IDs for user', session.user.id, ':', taskIds)

    // Fetch task steps for those tasks
    let taskSteps = []
    let error = null

    if (taskIds.length > 0) {
      const response = await supabase
        .from('task_steps')
        .select(`
          *,
          task:tasks(*)
        `)
        .in('task_id', taskIds)
      
      taskSteps = response.data || []
      error = response.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Fetched', taskSteps.length, 'task steps')

    // Get all unique user IDs from done_by field
    const allSteps = taskSteps || []
    const userIds = [...new Set(allSteps.filter(s => s.done_by).map(s => s.done_by))]

    // Fetch users data
    let userMap = new Map()
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds)

      if (!usersError && users) {
        userMap = new Map(users.map(u => [u.id, u]))
      }
    }

    // Enrich steps with user data
    const enrichedSteps = allSteps.map(step => ({
      ...step,
      done_by_user: step.done_by ? userMap.get(step.done_by) : null
    }))

    return NextResponse.json(enrichedSteps)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

