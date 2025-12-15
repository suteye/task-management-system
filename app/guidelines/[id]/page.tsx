'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import  DashboardLayout  from '@/components/layout/DashboardLayout'
import { LexicalRenderer } from '@/components/admin/LexicalRenderer'
import { ArrowLeft, Calendar, User, Tag, Send, Trash, Loader2, Clock, Share2, Copy } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { SerializedEditorState } from 'lexical'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Guideline {
  id: string
  title: string
  content: SerializedEditorState
  category: string
  tags: string[]
  created_by: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
  created_at: string
  updated_at: string
}

const categoryIcons: Record<string, string> = {
  'Process': '⚙️',
  'Standards': '📋',
  'Best Practices': '✨',
  'Security': '🔒',
  'Development': '👨‍💻',
  'Testing': '🧪',
  'Deployment': '🚀',
  'Documentation': '📚'
}

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  'Process': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  'Standards': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  'Best Practices': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  'Security': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  'Development': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  'Testing': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  'Deployment': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
  'Documentation': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' }
}

export default function GuidelineDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const id = params.id as string
  const [guideline, setGuideline] = useState<Guideline | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchGuideline = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/guidelines/${id}`)
      if (!response.ok) {
        setError('ไม่พบคู่มือแนะนำนี้')
        return
      }
      const data = await response.json()
      setGuideline(data)
      
      // Fetch comments
      const commentsResponse = await fetch(`/api/guidelines/${id}/comments`)
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(Array.isArray(commentsData) ? commentsData : [])
      }
    } catch (err) {
      console.error('Error fetching guideline:', err)
      setError('ไม่สามารถโหลดคู่มือได้')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGuideline()
  }, [fetchGuideline])

  // Add comment handler
  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user || !id) return

    try {
      setSavingComment(true)
      const response = await fetch(`/api/guidelines/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) throw new Error('Failed to save comment')

      const comment = await response.json()
      setComments([...comments, comment])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to save comment')
    } finally {
      setSavingComment(false)
    }
  }

  // Delete comment handler
  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user || !id) return

    try {
      const response = await fetch(`/api/guidelines/${id}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      setComments(comments.filter(c => c.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-500">กำลังโหลดคู่มือ...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !guideline) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600 font-medium mb-4">{error || 'ไม่พบคู่มือนี้'}</p>
          <Link
            href="/guidelines"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Guidelines
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const colors = categoryColors[guideline.category] || categoryColors['Documentation']
  const icon = categoryIcons[guideline.category] || '📄'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/guidelines"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          กลับไปที่คู่มือ
        </Link>

        {/* Hero Header */}
        <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-8 md:p-10`}>
          <div className="space-y-4">
            {/* Category Badge */}
            <div className="inline-flex">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${colors.text} bg-white border ${colors.border}`}>
                <span className="text-lg">{icon}</span>
                {guideline.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              {guideline.title}
            </h1>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-slate-600">
                <User size={16} />
                <span className="text-sm font-medium">{guideline.user?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={16} />
                <span className="text-sm font-medium">{new Date(guideline.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={16} />
                <span className="text-sm font-medium">Updated {new Date(guideline.updated_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium"
          >
            <Copy size={16} />
            {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium"
          >
            <Share2 size={16} />
            แชร์
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-slate-800">
            <LexicalRenderer editorState={guideline.content} />
          </div>
        </div>

        {/* Tags */}
        {guideline.tags && guideline.tags.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Tag size={20} />
                แท็กและคำสำคัญ
              </h3>
              <div className="flex flex-wrap gap-2">
                {guideline.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full font-medium text-sm border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <User size={20} />
              ความเห็น
            </h3>
            <p className="text-slate-500 text-sm mt-1">{comments.length} ความเห็น</p>
          </div>

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">ยังไม่มีความเห็น เป็นคนแรกที่แชร์ความคิดเห็นของคุณ!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors group">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{comment.user.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(comment.created_at).toLocaleDateString('th-TH')} · {new Date(comment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {session?.user?.id === comment.user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="ลบความเห็น"
                      >
                        <Trash size={16} className="text-red-500" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          {session?.user ? (
            <div className="border-t border-slate-200 pt-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">เพิ่มความเห็นของคุณ</label>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !savingComment && handleAddComment()}
                    placeholder="แชร์ความคิดเห็นของคุณ..."
                    disabled={savingComment}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={savingComment || !newComment.trim()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
                  >
                    {savingComment ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        กำลังส่ง...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        ส่งความเห็น
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-6 text-center">
              <p className="text-slate-500 text-sm font-medium">
                <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-semibold">เข้าสู่ระบบ</Link> เพื่อเพิ่มความเห็น
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

