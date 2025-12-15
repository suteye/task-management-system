'use client';

import { TaskStep } from '@/types';
import { Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface StepTimelineProps {
  steps: TaskStep[];
}

export function StepTimeline({ steps }: StepTimelineProps) {
  const { data: session } = useSession()

  if (session?.user == null) {
    return null
  }
  const sortedSteps = [...steps].sort((a, b) => a.step_no - b.step_no);

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Check className="w-5 h-5 text-emerald-600" /> Checklist ขั้นตอน
      </h3>
      {sortedSteps.map((step) => {
        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              step.is_done 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Checkbox */}
            <div className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center border-2 ${
              step.is_done 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-300'
            }`}>
              {step.is_done && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>

            {/* Step Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium text-sm ${
                step.is_done 
                  ? 'text-green-800 line-through' 
                  : 'text-gray-900'
              }`}>
                ขั้นตอนที่ {step.step_no}: {step.step_name}
              </h4>
              <p className={`text-xs mt-1 ${
                step.is_done
                  ? 'text-green-700'
                  : 'text-gray-600'
              }`}>
                {step.output || 'ผลลัพธ์: —'}
              </p>
            </div>

            {/* Done Date */}
            {step.is_done && step.done_at && (
              <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                {new Date(step.done_at).toLocaleDateString('th-TH')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}