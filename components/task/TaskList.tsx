'use client';

import { Task, TaskStep } from '@/types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  taskSteps: TaskStep[];
  status: string;
  onApprove?: (taskId: string, stepId: string) => void;
}

export function TaskList({ tasks, taskSteps, status, onApprove }: TaskListProps) {
  
  const filteredTasks = tasks.filter(task => task.status === status);

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">ไม่มีงานในสถานะ {status}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          taskSteps={taskSteps}
          onApprove={onApprove}
        />
      ))}
    </div>
  );
}