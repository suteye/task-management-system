'use client';

import { Task, TaskStep } from '@/types';
import { Clipboard, Clock, Check, X } from 'lucide-react';
import { useState } from 'react';

interface ChecklistModalProps {
  task: Task;
  taskSteps: TaskStep[];
  isOpen: boolean;
  onClose: () => void;
  onMarkDone?: (taskId: string, stepId: string) => void;
}

export function ChecklistModal({ task, taskSteps, isOpen, onClose, onMarkDone }: ChecklistModalProps) {
  const [marking, setMarking] = useState<string | null>(null);

  if (!isOpen) return null;

  console.log('ChecklistModal opened for task:', task.id);
  console.log('Total taskSteps received:', taskSteps.length);
  console.log('Task ID to filter:', task.id);

  const taskStepsFiltered = taskSteps
    .filter(step => step.task_id === task.id)
    .sort((a, b) => a.step_no - b.step_no);

  console.log('Filtered steps for this task:', taskStepsFiltered.length);

  const completedCount = taskStepsFiltered.filter(s => s.is_done).length;
  const totalSteps = taskStepsFiltered.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const handleMarkStep = async (stepId: string) => {
    setMarking(stepId);
    try {
      const response = await fetch(`/api/task-steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_done: true }),
      });

      if (response.ok) {
        console.log('Step marked as done');
        onMarkDone?.(task.id, stepId);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error marking step:', error);
      alert('Error marking step as done');
    } finally {
      setMarking(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 flex items-start justify-between shrink-0">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{task.title}</h2>
            <p className="text-blue-100 text-sm">{task.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-800 transition-colors shrink-0 ml-4"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Progress Card */}
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-blue-900">ความคืบหน้าโดยรวม</span>
              <span className="text-lg font-bold text-blue-700">{completedCount}/{totalSteps}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-linear-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-blue-700 mt-2 font-medium">{progressPercent}% เสร็จสมบูรณ์</p>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">เช็คลิสต์ขั้นตอน</h3>

            {taskStepsFiltered.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">📋</span>
                <p className="text-gray-500 text-sm">ไม่มีขั้นตอนในงานนี้</p>
              </div>
            ) : (
              taskStepsFiltered.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    step.is_done
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 font-medium text-sm ${
                      step.is_done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {step.is_done ? <Check className="w-4 h-4" /> : step.step_no}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm ${
                        step.is_done
                          ? 'text-emerald-800 line-through'
                          : 'text-gray-900'
                      }`}>
                        {step.step_name}
                      </h4>
                      {step.output && (
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <Clipboard className="w-3 h-3" /> ผลลัพธ์: {step.output}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step Status */}
                  {step.is_done && step.done_by ? (
                    <div className="ml-9 text-xs bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-2 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> ทำเสร็จ โดย <span className="font-semibold">{step.done_by_user?.name || 'Unknown'}</span>
                      {step.done_at && ` • ${new Date(step.done_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  ) : (
                    <div className="ml-9">
                      <button
                        onClick={() => handleMarkStep(step.id)}
                        disabled={marking === step.id}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                      >
                        {marking === step.id ? (
                          <><Clock className="w-3 h-3 animate-spin" /> กำลังทำเครื่องหมาย...</>
                        ) : (
                          <><Check className="w-3 h-3" /> ทำเสร็จแล้ว</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
