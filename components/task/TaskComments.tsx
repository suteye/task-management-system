'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Trash2, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { DatabaseUser } from '@/types'

interface TaskCommentType {
  id: string
  task_id: string
  user_id: string
  content: string
  mentions?: string[]
  created_at: string
  updated_at: string
  user?: DatabaseUser
}

interface TaskActivityType {
  id: string
  task_id: string
  user_id: string
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'completed'
  details: Record<string, unknown>
  created_at: string
  user?: DatabaseUser
}

interface TaskCommentsProps {
  taskId: string
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<TaskCommentType[]>([])
  const [activity, setActivity] = useState<TaskActivityType[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments')

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${taskId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const fetchActivity = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/activity`)
      if (response.ok) {
        const data = await response.json()
        setActivity(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    }
  }, [taskId])

  useEffect(() => {
    const loadData = async () => {
      await fetchComments()
      await fetchActivity()
    }
    void loadData()
  }, [fetchComments, fetchActivity])

  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user?.id) return

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      })

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId))
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionLabel = (action: string, details: Record<string, unknown>) => {
    switch (action) {
      case 'created':
        return 'Created this task'
      case 'status_changed':
        return `Changed status to ${details.new_status}`
      case 'assigned':
        return `Assigned to ${details.assigned_to_name}`
      case 'completed':
        return 'Marked task as completed'
      case 'updated':
        return 'Updated task details'
      default:
        return action
    }
  }

  return (
    <Card className="p-4 sm:p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'text-blue-600 border-b-blue-600'
              : 'text-slate-600 border-b-transparent hover:text-slate-900'
          }`}
        >
          Comments ({comments.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'activity'
              ? 'text-blue-600 border-b-blue-600'
              : 'text-slate-600 border-b-transparent hover:text-slate-900'
          }`}
        >
          Activity ({activity.length})
        </button>
      </div>

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {/* Add Comment Form */}
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (use @ to mention someone)"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setNewComment('')}
                variant="outline"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send size={16} />
                Post
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4 mt-6">
            {loading ? (
              <p className="text-slate-500 text-center py-8">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.id}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{comment.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                    </div>
                    {session?.user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {activity.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activity.map(log => (
                <div
                  key={log.id}
                  className="flex gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                      <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0'>
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{log.user?.name || 'Unknown'}</span>
                      {' '}
                      {getActionLabel(log.action, log.details)}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
