import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/utils/supabase/client'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: stepId } = await params
    const body = await request.json()

    console.log('PATCH /api/task-steps/[id]', stepId, body)

    // Check if step exists
    const { data: step, error: stepError } = await supabase
      .from('task_steps')
      .select('*, task:tasks(*)')
      .eq('id', stepId)
      .single()

    if (stepError) {
      console.error('Step fetch error:', stepError)
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Special time restriction for step 12
    if (step.step_no === 12) {
      const currentHour = new Date().getHours()
      const isAfter4PM = currentHour >= 16

      if (isAfter4PM && step.task.created_by !== session.user.id) {
        return NextResponse.json(
          { error: 'ไม่อนุญาตให้ Move หลัง 16:00 น. ยกเว้น Dept Head สั่ง' },
          { status: 403 }
        )
      }
    }

    // Update step with done_by and done_at
    const { data: updatedStep, error: updateError } = await supabase
      .from('task_steps')
      .update({
        ...body,
        done_by: session.user.id,
        done_at: new Date().toISOString(),
      })
      .eq('id', stepId)
      .select()
      .single()

    if (updateError) {
      console.error('Step update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('Step updated successfully:', updatedStep.id)

    // Check task status and update based on step completion
    const { data: allSteps, error: stepsCheckError } = await supabase
      .from('task_steps')
      .select('id, is_done, step_no')
      .eq('task_id', step.task_id)

    if (!stepsCheckError && allSteps) {
      // Check if first step (step_no = 0) is done
      const isFirstStepDone = updatedStep.step_no === 0 ? updatedStep.is_done : allSteps.find(s => s.step_no === 0)?.is_done
      
      // Check if all steps are done
      const allCompleted = allSteps.every(s => s.is_done)
      
      let newStatus = step.task.status
      
      console.log(`isFirstStepDone: ${isFirstStepDone}, currentStatus: ${step.task.status}, allCompleted: ${allCompleted}`)
      
      // If first step (BCD creation) is done and task is in 'todo' status, change to 'in_progress'
      if (isFirstStepDone && step.task.status === 'todo') {
        newStatus = 'in_progress'
        console.log('First step completed, updating task status to in_progress')
      }
      
      // If all steps are done, update task status to 'done'
      if (allCompleted) {
        newStatus = 'done'
        console.log('All steps completed, updating task status to done')
      }
      
      // Update task status if it changed
      if (newStatus !== step.task.status) {
        console.log(`Updating task status from ${step.task.status} to ${newStatus}`)
        const { error: updateStatusError } = await supabase
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', step.task_id)
        
        if (updateStatusError) {
          console.error('Error updating task status:', updateStatusError)
        } else {
          console.log('Task status updated successfully')
        }
      }
    }

    return NextResponse.json(updatedStep)
  } catch (error) {
    console.error('Error updating step:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
