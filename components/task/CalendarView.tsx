'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Task } from '@/types'

interface CalendarViewProps {
  tasks: Task[]
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days: (number | null)[] = Array(firstDay).fill(null)

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }, [currentDate])

  const getTasksForDate = (day: number | null) => {
    if (!day) return []
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // Helper to extract date part from timestamp
    const extractDate = (dateField: string | null | undefined): string | null => {
      if (!dateField) return null
      return dateField.split('T')[0] // Extract YYYY-MM-DD part
    }
    
    return tasks.filter(task => {
      // Check flat structure (legacy)
      const hasFlatDate = 
        extractDate(task.due_date) === dateStr ||
        extractDate(task.dev_start) === dateStr ||
        extractDate(task.dev_end) === dateStr ||
        extractDate(task.sit_start) === dateStr ||
        extractDate(task.sit_end) === dateStr ||
        extractDate(task.uat_start) === dateStr ||
        extractDate(task.uat_end) === dateStr ||
        extractDate(task.go_live_move_day_date) === dateStr ||
        extractDate(task.go_live_date) === dateStr
      
      // Check nested structure (new)
      const timeline = (task as any).timeline as Record<string, string> | undefined
      const goLive = (task as any).go_live as Record<string, string> | undefined
      const hasNestedDate =
        (extractDate(timeline?.dev_start) === dateStr) ||
        (extractDate(timeline?.dev_end) === dateStr) ||
        (extractDate(timeline?.sit_start) === dateStr) ||
        (extractDate(timeline?.sit_end) === dateStr) ||
        (extractDate(timeline?.uat_start) === dateStr) ||
        (extractDate(timeline?.uat_end) === dateStr) ||
        (extractDate(goLive?.move_day_date) === dateStr) ||
        (extractDate(goLive?.go_live_date) === dateStr)
      
      return hasFlatDate || hasNestedDate
    })
  }

  const getMilestoneLabel = (task: Task, dateStr: string): string[] => {
    const labels: string[] = []
    const timeline = (task as any).timeline as Record<string, string> | undefined
    const goLive = (task as any).go_live as Record<string, string> | undefined
    
    // Helper to extract date part from timestamp
    const extractDate = (dateField: string | null | undefined): string | null => {
      if (!dateField) return null
      return dateField.split('T')[0]
    }
    
    // Check flat structure
    if (extractDate(task.dev_start) === dateStr || extractDate(timeline?.dev_start) === dateStr) labels.push('Dev Start')
    if (extractDate(task.dev_end) === dateStr || extractDate(timeline?.dev_end) === dateStr) labels.push('Dev End')
    if (extractDate(task.sit_start) === dateStr || extractDate(timeline?.sit_start) === dateStr) labels.push('SIT Start')
    if (extractDate(task.sit_end) === dateStr || extractDate(timeline?.sit_end) === dateStr) labels.push('SIT End')
    if (extractDate(task.uat_start) === dateStr || extractDate(timeline?.uat_start) === dateStr) labels.push('UAT Start')
    if (extractDate(task.uat_end) === dateStr || extractDate(timeline?.uat_end) === dateStr) labels.push('UAT End')
    if (extractDate(task.go_live_move_day_date) === dateStr || extractDate(goLive?.move_day_date) === dateStr) labels.push('Move Day')
    if (extractDate(task.go_live_date) === dateStr || extractDate(goLive?.go_live_date) === dateStr) labels.push('Go Live')
    if (extractDate(task.due_date) === dateStr) labels.push('Due')
    
    return labels
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{monthName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Week
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="h-10 flex items-center justify-center font-medium text-slate-600 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 sm:min-h-32 p-2 border rounded-lg transition-colors ${
                    day === null
                      ? 'bg-slate-50 border-slate-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {day && (
                    <>
                      <p className="font-medium text-slate-900 text-sm mb-1">{day}</p>
                      <div className="space-y-1">
                        {getTasksForDate(day).slice(0, 2).map(task => {
                          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          const milestones = getMilestoneLabel(task, dateStr)
                          return (
                            <div key={task.id}>
                              <div
                                className={`text-xs p-1 rounded truncate ${getPriorityColor(task.priority)}`}
                                title={task.title}
                              >
                                {task.title}
                              </div>
                              {milestones.length > 0 && (
                                <div className="text-xs text-slate-500 px-1 truncate">
                                  {milestones.join(', ')}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {getTasksForDate(day).length > 2 && (
                          <p className="text-xs text-slate-500 px-1">
                            +{getTasksForDate(day).length - 2} more
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
          <div>
            <p className="text-sm font-medium text-slate-900 mb-3">Priority:</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-100"></div>
                <span className="text-xs text-slate-600">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-100"></div>
                <span className="text-xs text-slate-600">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100"></div>
                <span className="text-xs text-slate-600">Low Priority</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 mb-3">Milestones:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <p>• Dev Start/End</p>
              <p>• SIT Start/End</p>
              <p>• UAT Start/End</p>
              <p>• Move Day</p>
              <p>• Go Live</p>
              <p>• Due Date</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
