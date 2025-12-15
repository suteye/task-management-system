'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { TrendingUp, Clock, AlertCircle } from 'lucide-react'

interface AnalyticsData {
  summary: {
    total_tasks: number
    completed_tasks: number
    completion_rate: number
    overdue_tasks: number
    total_time_tracked: number
    total_time_estimated: number
  }
  workload_by_user: Record<string, number>
  burndown_data: Record<string, number>
  status_distribution: Record<string, number>
  priority_distribution: Record<string, number>
  period: string
}

interface AnalyticsProps {
  period?: '7days' | '30days' | '90days' | 'all'
}

export default function Analytics({ period = '30days' }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?period=${selectedPeriod}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    void fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">No data available</div>
  }

  // Prepare chart data
  const workloadData = Object.entries(data.workload_by_user).map(([user, count]) => ({
    name: user,
    tasks: count
  }))

  const statusData = Object.entries(data.status_distribution).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count
  }))

  const priorityData = Object.entries(data.priority_distribution).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count
  }))

  const burndownData = Object.entries(data.burndown_data)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => ({
      date,
      completed: count
    }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {(['7days', '30days', '90days', 'all'] as const).map(p => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === p
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {p === 'all' ? 'All Time' : p === '7days' ? 'Last 7 Days' : p === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Completion Rate</p>
              <p className="text-4xl font-bold text-slate-900">{data.summary.completion_rate}%</p>
              <p className="text-xs text-slate-500 mt-2">
                {data.summary.completed_tasks} of {data.summary.total_tasks} tasks
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Time Tracked</p>
              <p className="text-4xl font-bold text-slate-900">{data.summary.total_time_tracked}h</p>
              <p className="text-xs text-slate-500 mt-2">
                Est: {data.summary.total_time_estimated}h
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Overdue Tasks</p>
              <p className="text-4xl font-bold text-slate-900">{data.summary.overdue_tasks}</p>
              <p className="text-xs text-slate-500 mt-2">
                Need attention
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Workload by User */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Workload Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Burndown Chart */}
        {burndownData.length > 0 && (
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Burndown Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  )
}
