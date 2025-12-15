import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/utils/supabase/client'
import { WORKFLOW_STEPS } from '@/constants/workflow'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch tasks based on user role and assignments
    // Include: assigned_to, created_by, bcd_owner, dev_owner, sit_support, uat_support
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        user:users!tasks_assigned_to_fkey(*)
      `)
      .or(`assigned_to.eq.${session.user.id},created_by.eq.${session.user.id},bcd_owner.eq.${session.user.id},dev_owner.eq.${session.user.id},sit_support.eq.${session.user.id},uat_support.eq.${session.user.id}`)

      console.log('Fetched tasks for user:', tasks)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(tasks)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      assigned_to,
      priority,
      timeline, // Timeline fields
      go_live, // Go Live fields
      roles, // Team roles assignment
    } = body

    // Helper function to format date strings (remove timezone, keep only YYYY-MM-DD)
    const formatDateOnly = (dateStr: string | null | undefined): string | null => {
      if (!dateStr) return null
      // Extract only YYYY-MM-DD part
      return dateStr.split('T')[0] || null
    }

    // Create task - ANY authenticated user can create tasks
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        assigned_to: assigned_to || session.user.id, // Default to current user if not specified
        created_by: session.user.id,
        priority: priority || 'medium',
        status: 'todo', // Start with todo step
        // Timeline fields - store as date only (YYYY-MM-DD)
        dev_start: formatDateOnly(timeline?.dev_start),
        dev_end: formatDateOnly(timeline?.dev_end),
        sit_start: formatDateOnly(timeline?.sit_start),
        sit_end: formatDateOnly(timeline?.sit_end),
        uat_start: formatDateOnly(timeline?.uat_start),
        uat_end: formatDateOnly(timeline?.uat_end),
        // Go Live fields - store as date only (YYYY-MM-DD)
        go_live_move_day_date: formatDateOnly(go_live?.move_day_date),
        go_live_date: formatDateOnly(go_live?.go_live_date),
        // Team roles assignment
        bcd_owner: roles?.bcd_owner || null,
        dev_owner: roles?.dev_owner || null,
        sit_support: roles?.sit_support || null,
        uat_support: roles?.uat_support || null,
      })
      .select()
      .single()

    if (taskError) {
      console.error('Task creation failed:', {
        code: taskError.code,
        message: taskError.message,
        details: taskError.details,
        hint: taskError.hint,
      })
      return NextResponse.json({ error: taskError.message }, { status: 500 })
    }

    // Create all 20 workflow steps for the new task with updated workflow
    const taskSteps = WORKFLOW_STEPS.map(step => ({
      task_id: task.id,
      step_no: step.step_no,
      step_name: step.step_name,
      who_create: step.who_create,
      who_approve: step.who_approve,
      who_complete: step.who_complete,
      output: step.output,
      is_done: false,
      created_at: new Date().toISOString()
    }))

    const { error: stepsError } = await supabase
      .from('task_steps')
      .insert(taskSteps)

    if (stepsError) {
      return NextResponse.json({ error: stepsError.message }, { status: 500 })
    }

    return NextResponse.json(task)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}