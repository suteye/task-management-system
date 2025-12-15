import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/utils/supabase/client'
import { Task } from '@/types'

// Helper to generate CSV
function generateCSV(tasks: Task[]): string {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Assigned To',
    'Due Date',
    'Created At',
    'Time Tracked (hrs)',
    'Time Estimated (hrs)'
  ]

  const rows = tasks.map(task => [
    task.id,
    `"${task.title}"`,
    `"${task.description || ''}"`,
    task.status,
    task.priority,
    task.user?.name || task.assigned_to,
    task.due_date || '',
    task.created_at,
    task.time_tracked || 0,
    task.time_estimated || 0
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}

// Helper to generate basic HTML report
function generateHTML(tasks: Task[], analytics: any): string {
  const completionRate = analytics?.summary?.completion_rate || 0
  const totalTasks = analytics?.summary?.total_tasks || 0
  const completedTasks = analytics?.summary?.completed_tasks || 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Task Management Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    .summary { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .metric { display: inline-block; margin-right: 30px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
    .metric-label { color: #666; font-size: 12px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db; }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f9fafb; }
    .high { color: #dc2626; font-weight: bold; }
    .medium { color: #f59e0b; font-weight: bold; }
    .low { color: #059669; font-weight: bold; }
    .todo { background: #fee2e2; padding: 2px 8px; border-radius: 4px; }
    .in_progress { background: #fef3c7; padding: 2px 8px; border-radius: 4px; }
    .done { background: #dcfce7; padding: 2px 8px; border-radius: 4px; }
    .footer { margin-top: 40px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <h1>Task Management Report</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>

  <div class="summary">
    <h2>Summary</h2>
    <div class="metric">
      <div class="metric-value">${totalTasks}</div>
      <div class="metric-label">Total Tasks</div>
    </div>
    <div class="metric">
      <div class="metric-value">${completedTasks}</div>
      <div class="metric-label">Completed</div>
    </div>
    <div class="metric">
      <div class="metric-value">${completionRate.toFixed(1)}%</div>
      <div class="metric-label">Completion Rate</div>
    </div>
    <div class="metric">
      <div class="metric-value">${analytics?.summary?.overdue_tasks || 0}</div>
      <div class="metric-label">Overdue Tasks</div>
    </div>
  </div>

  <h2>Task Details</h2>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Status</th>
        <th>Priority</th>
        <th>Due Date</th>
        <th>Assigned To</th>
      </tr>
    </thead>
    <tbody>
      ${tasks.map(task => `
        <tr>
          <td>${task.title}</td>
          <td><span class="${task.status}">${task.status}</span></td>
          <td><span class="${task.priority}">${task.priority}</span></td>
          <td>${task.due_date || 'N/A'}</td>
          <td>${task.user?.name || 'Unassigned'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This report contains confidential information. Please handle with care.</p>
  </div>
</body>
</html>
  `
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json' // json, csv, html
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    let query = supabase
      .from('tasks')
      .select(`
        *,
        user:users!tasks_assigned_to_fkey(*)
      `)
      .or(`assigned_to.eq.${session.user.id},created_by.eq.${session.user.id},bcd_owner.eq.${session.user.id},dev_owner.eq.${session.user.id},sit_support.eq.${session.user.id},uat_support.eq.${session.user.id}`)

    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (format === 'csv') {
      const csv = generateCSV(tasks || [])
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tasks_report.csv"'
        }
      })
    }

    if (format === 'html') {
      // Get analytics for the HTML report
      const analyticsResponse = await fetch(
        new URL('/api/analytics', request.url).toString(),
        {
          headers: request.headers
        }
      )
      const analytics = await analyticsResponse.json()
      
      const html = generateHTML(tasks || [], analytics)
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': 'attachment; filename="tasks_report.html"'
        }
      })
    }

    // Default JSON format
    return NextResponse.json({
      tasks: tasks || [],
      count: tasks?.length || 0,
      exported_at: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
