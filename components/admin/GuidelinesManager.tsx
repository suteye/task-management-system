'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Plus, Edit2, Trash2, X, Eye } from 'lucide-react'
import { ContentEditor } from './ContentEditor'
import type { SerializedEditorState } from 'lexical'

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

const CATEGORIES = [
  'Process',
  'Standards',
  'Best Practices',
  'Security',
  'Development',
  'Testing',
  'Deployment',
  'Documentation'
]

interface FormData {
  title: string
  content: SerializedEditorState
  category: string
  tags: string
}

const initialEditorState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState

// Helper function to extract text preview from SerializedEditorState
const extractPreviewText = (editorState: SerializedEditorState): string => {
  try {
    const root = (editorState as unknown as Record<string, unknown>).root as Record<string, unknown>
    if (!root || !root.children) return ''
    
    let text = ''
    const extractText = (nodes: Record<string, unknown>[]): void => {
      for (const node of nodes) {
        if (node.type === 'text' && node.text) {
          text += node.text
        } else if (node.children) {
          extractText(node.children as Record<string, unknown>[])
        }
        if (text.length > 100) return
      }
    }
    
    extractText(root.children as Record<string, unknown>[])
    return text.substring(0, 100) + (text.length > 100 ? '...' : '')
  } catch {
    return ''
  }
}

export default function GuidelinesManager() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: initialEditorState,
    category: '',
    tags: '',
  })

  const fetchGuidelines = useCallback(async () => {
    try {
      setLoading(true)
      const url = selectedCategory
        ? `/api/guidelines?category=${selectedCategory}`
        : '/api/guidelines'
      const response = await fetch(url)
      const data = await response.json()
      setGuidelines(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching guidelines:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchGuidelines()
  }, [fetchGuidelines])

  const handleCreateOrUpdate = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const method = editingGuideline ? 'PUT' : 'POST'
      const url = editingGuideline
        ? `/api/guidelines/${editingGuideline.id}`
        : '/api/guidelines'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        }),
      })

      console.log('Save guideline response:',formData)

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Error saving guideline')
        return
      }

      fetchGuidelines()
      setIsCreateModalOpen(false)
      setEditingGuideline(null)
      setFormData({ title: '', content: initialEditorState, category: '', tags: '' })
    } catch (error) {
      console.error('Error saving guideline:', error)
      alert('Error saving guideline')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guideline?')) return

    try {
      const response = await fetch(`/api/guidelines/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        alert('Error deleting guideline')
        return
      }
      fetchGuidelines()
    } catch (error) {
      console.error('Error deleting guideline:', error)
      alert('Error deleting guideline')
    }
  }

  const handleEdit = (guideline: Guideline) => {
    setEditingGuideline(guideline)
    setFormData({
      title: guideline.title,
      content: guideline.content,
      category: guideline.category,
      tags: guideline.tags.join(', '),
    })
    setIsCreateModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: initialEditorState,
      category: '',
      tags: '',
    })
    setEditingGuideline(null)
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">คู่มือ</h2>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          สร้าง
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === ''
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ทั้งหมด
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Guidelines List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500">กำลังโหลดคู่มือ...</p>
        </div>
      ) : guidelines.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500">ไม่พบคู่มือ</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {guidelines.map(guideline => (
            <Card key={guideline.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{guideline.title}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      {guideline.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{extractPreviewText(guideline.content)}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {guideline.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Created by {guideline.user?.name} • {new Date(guideline.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/guidelines/${guideline.id}`}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="ดู"
                  >
                    <Eye size={18} className="text-blue-600" />
                  </Link>
                  <button
                    onClick={() => handleEdit(guideline)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit2 size={18} className="text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(guideline.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingGuideline ? 'แก้ไขคู่มือ' : 'คู่มือใหม่'}
                </h3>
                <button onClick={resetForm} className="p-1 hover:bg-slate-100 rounded">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">ชื่อคู่มือ *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ชื่อคู่มือ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">ซิคส่วน *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">เลือกซิคส่วน</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">เนื้อหา *</label>
                  <ContentEditor
                    value={formData.content}
                    onChange={content => setFormData({ ...formData, content })}
                    placeholder="เขียนเนื้อหาคู่มือที่นี่..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">แท็ก (คั่นด้วยคอมม่า)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น: สำคัญ, ภายใน, การพัฒนา"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleCreateOrUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingGuideline ? 'อัพเดต' : 'สร้าง'}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
