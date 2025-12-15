'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { TaskBoard } from './TaskBoard';
import { CreateTaskModal } from './CreateTaskModal';
import TaskFilter from './TaskFilter';
import Analytics from './Analytics';
import CalendarView from './CalendarView';
import TaskComments from './TaskComments';
import NotificationCenter from './NotificationCenter';
import TaskTemplateModal from './TaskTemplateModal';
import { useTaskStore } from '@/stores/taskStore';
import { Task } from '@/types';
import { Plus, BarChart3, Clock, CheckCircle2, Grid, Calendar, Filter, MessageSquare, Settings } from 'lucide-react';

interface FilterOptions {
  status?: string;
  priority?: string;
  query?: string;
}

export function Dashboard() {
  const { data: session } = useSession();
  const { tasks, taskSteps, setTasks, setTaskSteps } = useTaskStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'calendar' | 'analytics' | 'filter'>('board');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [setTasks]);

  const fetchTaskSteps = useCallback(async () => {
    try {
      const response = await fetch('/api/task-steps');
      const data = await response.json();
      console.log('Fetched task steps:', data.length, 'steps');
      setTaskSteps(data);
    } catch (error) {
      console.error('Error fetching task steps:', error);
    }
  }, [setTaskSteps]);

  const userTasks = useMemo(
    () => tasks.filter(task => 
      task.assigned_to === session?.user?.id || 
      task.created_by === session?.user?.id ||
      task.bcd_owner === session?.user?.id ||
      task.dev_owner === session?.user?.id ||
      task.sit_support === session?.user?.id ||
      task.uat_support === session?.user?.id
    ),
    [tasks, session?.user?.id]
  );

  useEffect(() => {
    fetchTasks();
    fetchTaskSteps();
  }, [fetchTasks, fetchTaskSteps]);

  useEffect(() => {
    setFilteredTasks(userTasks);
  }, [userTasks]);

  const handleFilter = (filters: FilterOptions) => {
    let filtered = userTasks;
    
    if (filters.status) filtered = filtered.filter(t => t.status === filters.status);
    if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(t => 
        t.title?.toLowerCase().includes(q) || 
        t.description?.toLowerCase().includes(q)
      );
    }
    
    setFilteredTasks(filtered);
  };

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    const searched = userTasks.filter(t => 
      t.title?.toLowerCase().includes(q) || 
      t.description?.toLowerCase().includes(q)
    );
    setFilteredTasks(searched);
  };

  const handleApprove = async (taskId: string, stepId: string) => {
    try {
      console.log('handleApprove called for step:', stepId);
      
      // Refresh data after step update
      setTimeout(() => {
        fetchTaskSteps();
        fetchTasks();
      }, 500);
    } catch (error) {
      console.error('Error in handleApprove:', error);
    }
  };

  const handleTaskCreated = () => {
    // Add a small delay to ensure the backend has created the task and steps
    setTimeout(() => {
      fetchTasks();
      fetchTaskSteps();
    }, 500);
  };

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = userTasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-6 lg:gap-8">
      {/* Header with Action and Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">งานของ {session?.user?.name}</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2">ติดตามและจัดการงานรายวันของคุณ</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <NotificationCenter />
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Settings className="w-4 h-4" /> เทมเพลตงาน
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 sm:w-5 h-4 sm:h-5" /> สร้างงานใหม่
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'board'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid className="w-4 h-4" /> บอร์ด
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" /> ปฏิทิน
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> สถิติ
        </button>
        <button
          onClick={() => setActiveTab('filter')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'filter'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Filter className="w-4 h-4" /> ค้นหา & จัดฟิลเตอร์
        </button>
      </div>

      {/* Main Content - Tab Views */}
      {activeTab === 'board' && (
        <>
          {/* Stats Grid - Enhanced Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {/* Total Tasks Card */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-100 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">งานทั้งหมด</p>
                  <p className="text-3xl sm:text-5xl font-bold text-slate-900 mt-2 sm:mt-3">{totalTasks}</p>
                  {/* <p className="text-xs text-slate-500 mt-1 sm:mt-2">งานที่มอจิกเป็นของคุณ</p> */}
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
                  <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* In Progress Card */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-100 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-300 group">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">งานที่กําลังทำ</p>
                  <p className="text-3xl sm:text-5xl font-bold text-amber-600 mt-2 sm:mt-3">{inProgressTasks}</p>
                  {/* <p className="text-xs text-slate-500 mt-1 sm:mt-2">กำลังทำไขอยู่</p> */}
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
                  <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Completed Card */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">งานที่เสร็จแล้ว</p>
                  <p className="text-3xl sm:text-5xl font-bold text-emerald-600 mt-2 sm:mt-3">{completedTasks}</p>
                  {/* <p className="text-xs text-slate-500 mt-1 sm:mt-2">สมสหนาดและไดรับอนุมัติ</p> */}
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
                  <CheckCircle2 className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Kanban Board Section */}
          <div className="flex-1 min-h-0 bg-white rounded-lg sm:rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">📋</span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">บอร์ด Kanban</h2>
                  <p className="text-xs text-slate-500 mt-0.5">ติดตามและจัดการงาน</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 overflow-auto">
              <TaskBoard
                tasks={userTasks}
                taskSteps={taskSteps}
                onApprove={handleApprove}
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">📅</span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Calendar View</h2>
                <p className="text-xs text-slate-500 mt-0.5">Visualize tasks by due date</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <CalendarView tasks={userTasks} />
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">📊</span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Analytics & Reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">Performance metrics and insights</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <Analytics period="30days" />
          </div>
        </div>
      )}

      {activeTab === 'filter' && (
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">🔍</span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Search & Filter</h2>
                <p className="text-xs text-slate-500 mt-0.5">Find tasks with advanced filters</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <TaskFilter onFilter={handleFilter} onSearch={handleSearch} />
          </div>
          <div className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6">
              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{task.title}</h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{task.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                              task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {task.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto opacity-50 mb-2" />
                  <p>No tasks found matching your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {selectedTaskId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Task Comments & Activity</h2>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <TaskComments taskId={selectedTaskId} />
            </div>
          </div>
        </div>
      )}

      <TaskTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
}