'use client';

import { Task, TaskStep } from '@/types';
import { TaskList } from './TaskList';
import { CheckCircle2, Clock, ListTodo, Inbox } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  taskSteps: TaskStep[];
  onApprove?: (taskId: string, stepId: string) => void;
}

const statusConfig = [
  { 
    id: 'todo', 
    label: 'งานที่ต้องทำ',
    icon: ListTodo,
    bgColor: 'bg-slate-500',
    lightBg: 'bg-slate-50',
    borderColor: 'border-slate-200',
    badgeColor: 'bg-slate-100 text-slate-700',
    dotColor: 'bg-slate-400'
  },
  { 
    id: 'in_progress', 
    label: 'งานที่กําลังทำ',
    icon: Clock,
    bgColor: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
    dotColor: 'bg-amber-400'
  },
  { 
    id: 'done', 
    label: 'งานที่เสร็จแล้ว',
    icon: CheckCircle2,
    bgColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    dotColor: 'bg-emerald-400'
  }
];

export function TaskBoard({ tasks, taskSteps, onApprove }: TaskBoardProps) {
  return (
    <div className="p-3 sm:p-4 lg:p-6 h-full flex flex-col gap-3 sm:gap-4 overflow-hidden">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 shrink-0">
        {statusConfig.map((status) => {
          const count = tasks.filter(task => task.status === status.id).length;
          const IconComponent = status.icon;
          return (
            <div key={status.id} className={`${status.lightBg} rounded-lg p-2 sm:p-3 lg:p-4 border ${status.borderColor} hover:shadow-md transition-shadow`}>
              <div className="text-center">
                <IconComponent className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 block mx-auto mb-1 sm:mb-2 text-gray-600" />
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">{status.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 overflow-y-auto">
        {statusConfig.map((status) => {
          const statusTasks = tasks.filter(task => task.status === status.id);
          return (
            <div 
              key={status.id} 
              className={`${status.lightBg} rounded-lg border-2 ${status.borderColor} overflow-hidden flex flex-col h-fit hover:shadow-lg transition-all`}
            >
              {/* Column Header */}
              <div className={`${status.bgColor} p-3 sm:p-4 text-white`}>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const IconComponent = status.icon;
                    return <IconComponent className="w-5 sm:w-6 h-5 sm:h-6" />;
                  })()}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">{status.label}</h3>
                    <p className="text-white/80 text-xs font-medium">{statusTasks.length}</p>
                  </div>
                </div>
              </div>

              {/* Tasks Container */}
              <div className="flex-1 p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 overflow-y-auto min-h-0">
                {statusTasks.length > 0 ? (
                  <TaskList
                    tasks={statusTasks}
                    taskSteps={taskSteps}
                    status={status.id}
                    onApprove={onApprove}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Inbox className="w-8 h-8 mb-2" />
                    <p className="text-xs font-medium">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}