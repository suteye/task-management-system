'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface FilterState {
  search: string
  status: string
  priority: string
  assigned_to: string
  due_after: string
  due_before: string
  sort_by: string
  sort_order: 'asc' | 'desc'
}

interface TaskFilterProps {
  onFilter: (filters: FilterState) => void
  onSearch: (query: string) => void
}

export default function TaskFilter({ onFilter, onSearch }: TaskFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    assigned_to: '',
    due_after: '',
    due_before: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  })

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value }
    setFilters(newFilters)
    onSearch(value)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const resetFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      status: '',
      priority: '',
      assigned_to: '',
      due_after: '',
      due_before: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    }
    setFilters(emptyFilters)
    onFilter(emptyFilters)
  }

  const activeFilters = Object.values(filters).filter(v => v !== '' && v !== 'created_at' && v !== 'desc').length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search tasks by title, description..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 w-full"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="create_bcd">Create BCD</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Advanced Filters Toggle */}
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
            showAdvanced
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Filter size={16} />
          Advanced
          {activeFilters > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </Button>

        {/* Reset Button */}
        {activeFilters > 0 && (
          <Button
            onClick={resetFilters}
            className="px-3 py-2 text-sm rounded-lg bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Reset
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due After</label>
              <input
                type="date"
                value={filters.due_after}
                onChange={(e) => handleFilterChange('due_after', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Before</label>
              <input
                type="date"
                value={filters.due_before}
                onChange={(e) => handleFilterChange('due_before', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              >
                <option value="created_at">Created Date</option>
                <option value="due_date">Due Date</option>
                <option value="updated_at">Updated Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort Order</label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
