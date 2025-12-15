'use client';

import { Task, TaskStep } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChecklistModal } from './ChecklistModal';

interface TaskCardProps {
  task: Task;
  taskSteps: TaskStep[];
  onApprove?: (taskId: string, stepId: string) => void;
}

export function TaskCard({ task, taskSteps, onApprove }: TaskCardProps) {
  const [showChecklist, setShowChecklist] = useState(false);

  const taskStepsFiltered = taskSteps
    .filter(step => step.task_id === task.id)
    .sort((a, b) => a.step_no - b.step_no);

  const completedCount = taskStepsFiltered.filter(s => s.is_done).length;
  const totalSteps = taskStepsFiltered.length;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="p-3 sm:p-4">
          {/* Header with Title and Priority */}
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">{task.title}</h3>
            </div>
            <span className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap ${
              task.priority === 'high' 
                ? 'bg-red-100 text-red-700'
                : task.priority === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Med' : '🟢 Low'}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{task.description}</p>

          {/* Quick Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-100 gap-1">
            <span className="font-medium">Status: <span className="text-gray-900">{task.status.replace('_', ' ')}</span></span>
            <span className="font-medium">{completedCount}/{totalSteps} done</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 sm:mb-4 overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: totalSteps > 0 ? `${Math.round((completedCount / totalSteps) * 100)}%` : '0%' }}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <button
              onClick={() => setShowChecklist(true)}
              className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full sm:w-auto"
            >
              📋 <span>เช็คลิสต์</span>
            </button>
            <span className="text-xs text-gray-500 text-center sm:text-right">Created by {task.user?.name || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Checklist Modal */}
      <ChecklistModal
        task={task}
        taskSteps={taskSteps}
        isOpen={showChecklist}
        onClose={() => setShowChecklist(false)}
        onMarkDone={(taskId, stepId) => {
          onApprove?.(taskId, stepId);
        }}
      />
    </>
  );
}