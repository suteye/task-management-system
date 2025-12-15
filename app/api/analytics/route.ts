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
    const period = searchParams.get('period') || '30days' // 7days, 30days, 90days, all
    const team_view = searchParams.get('team_view') === 'true'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    if (period === '7days') startDate.setDate(now.getDate() - 7)
    else if (period === '30days') startDate.setDate(now.getDate() - 30)
    else if (period === '90days') startDate.setDate(now.getDate() - 90)
    else startDate = new Date(0)

    // Get tasks
    let query = supabase
      .from('tasks')
      .select('*, task_activity(*)')
      .gte('created_at', startDate.toISOString())

    if (!team_view) {
      query = query.or(`assigned_to.eq.${session.user.id},created_by.eq.${session.user.id},bcd_owner.eq.${session.user.id},dev_owner.eq.${session.user.id},sit_support.eq.${session.user.id},uat_support.eq.${session.user.id}`)
    }

    const { data: tasks, error: tasksError } = await query

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    // Calculate metrics
    const totalTasks = tasks?.length || 0
    const completedTasks = tasks?.filter((t) => t?.status === 'done').length || 0
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Get workload by user
    const workloadByUser: Record<string, number> = {}
    tasks?.forEach((task) => {
      if (task?.assigned_to) {
        workloadByUser[task.assigned_to] = (workloadByUser[task.assigned_to] || 0) + 1
      }
    })

    // Get burndown data (tasks completed over time)
    const burndownData: Record<string, number> = {}
    tasks?.forEach((task) => {
      if (task?.task_activity && Array.isArray(task.task_activity)) {
        task.task_activity.forEach((activity: {action: string; created_at: string}) => {
          if (activity.action === 'completed') {
            const date = new Date(activity.created_at).toLocaleDateString()
            burndownData[date] = (burndownData[date] || 0) + 1
          }
        })
      }
    })

    // Get status distribution
    const statusDistribution: Record<string, number> = {}
    tasks?.forEach((task) => {
      if (task?.status) {
        statusDistribution[task.status] = (statusDistribution[task.status] || 0) + 1
      }
    })

    // Get priority distribution
    const priorityDistribution: Record<string, number> = {}
    tasks?.forEach((task) => {
      if (task?.priority) {
        priorityDistribution[task.priority] = (priorityDistribution[task.priority] || 0) + 1
      }
    })

    // Get time tracking if available
    const totalTimeTracked = tasks?.reduce((sum: number, t) => sum + (t?.time_tracked || 0), 0) || 0
    const totalTimeEstimated = tasks?.reduce((sum: number, t) => sum + (t?.time_estimated || 0), 0) || 0

    // Get overdue tasks
    const today = new Date().toISOString().split('T')[0]
    const overdueTasks = tasks?.filter((t) => t?.due_date && t.due_date < today && t.status !== 'done').length || 0

    return NextResponse.json({
      summary: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_rate: Math.round(completionRate * 100) / 100,
        overdue_tasks: overdueTasks,
        total_time_tracked: totalTimeTracked,
        total_time_estimated: totalTimeEstimated
      },
      workload_by_user: workloadByUser,
      burndown_data: burndownData,
      status_distribution: statusDistribution,
      priority_distribution: priorityDistribution,
      period,
      generated_at: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
