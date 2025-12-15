'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { BookOpen, Search, Filter, Calendar, ArrowRight, Zap } from 'lucide-react'
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

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  'Process': { bg: 'bg-blue-50', text: 'text-blue-700', icon: '⚙️' },
  'Standards': { bg: 'bg-purple-50', text: 'text-purple-700', icon: '📋' },
  'Best Practices': { bg: 'bg-green-50', text: 'text-green-700', icon: '✨' },
  'Security': { bg: 'bg-red-50', text: 'text-red-700', icon: '🔒' },
  'Development': { bg: 'bg-orange-50', text: 'text-orange-700', icon: '👨‍💻' },
  'Testing': { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: '🧪' },
  'Deployment': { bg: 'bg-cyan-50', text: 'text-cyan-700', icon: '🚀' },
  'Documentation': { bg: 'bg-pink-50', text: 'text-pink-700', icon: '📚' }
}

export default function GuidelinesPage() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)

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

  // Helper to extract preview text from SerializedEditorState
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
          if (text.length > 150) return
        }
      }
      
      extractText(root.children as Record<string, unknown>[])
      return text.substring(0, 150) + (text.length > 150 ? '...' : '')
    } catch {
      return ''
    }
  }

  // Filter by search query
  const filteredGuidelines = guidelines.filter(guideline =>
    guideline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    extractPreviewText(guideline.content).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BookOpen size={24} className="text-blue-300" />
              </div>
              <span className="text-blue-300 text-sm font-semibold">Guidelines</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">เอกสารของทีม</h1>
            <p className="text-slate-300 text-lg max-w-2xl">แหล่งเก็บเอกสารที่เกี่ยวข้องกับการพัฒนาโปรเจ็ค</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเอกสาร..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">หมวดหมู่</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {categoryColors[cat]?.icon} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guidelines Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500">กำลังโหลดเอกสาร...</p>
          </div>
        ) : filteredGuidelines.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 text-lg font-medium mb-1">ไม่พบเอกสาร</p>
            <p className="text-slate-400">ลองขยายการค้นหาหรือจัดหมวดหมู่ของคุณ</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center gap-2 px-1">
              <Zap size={18} className="text-amber-500" />
              <p className="text-sm font-medium text-slate-600">พบ {filteredGuidelines.length} เอกสาร</p>
            </div>

            {/* Guidelines Grid - Notion Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuidelines.map(guideline => {
                const colors = categoryColors[guideline.category] || categoryColors['Documentation']
                return (
                  <Link key={guideline.id} href={`/guidelines/${guideline.id}`}>
                    <div className={`h-full ${colors.bg} rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group`}>
                      <div className="flex flex-col h-full gap-4">
                        {/* Category Badge */}
                        <div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold ${colors.text} bg-white rounded-full border border-current border-opacity-20`}>
                            <span className="text-sm">{colors.icon}</span>
                            {guideline.category}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className={`text-lg font-bold line-clamp-2 ${colors.text} group-hover:opacity-80 transition-opacity`}>
                            {guideline.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-sm line-clamp-3 flex-1 leading-relaxed">
                          {extractPreviewText(guideline.content) || 'No preview available'}
                        </p>

                        {/* Tags */}
                        {guideline.tags && guideline.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {guideline.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs bg-white bg-opacity-60 text-slate-600 px-2 py-1 rounded-md font-medium">
                                #{tag}
                              </span>
                            ))}
                            {guideline.tags.length > 2 && (
                              <span className="text-xs bg-white bg-opacity-60 text-slate-600 px-2 py-1 rounded-md font-medium">
                                +{guideline.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer with Metadata and Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-current border-opacity-10 mt-auto">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white bg-opacity-40"></div>
                            <div className="text-xs text-slate-600 font-medium truncate">{guideline.user?.name || 'Unknown'}</div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={12} />
                            {new Date(guideline.created_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>

                        {/* Read More Arrow */}
                        <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all opacity-0 group-hover:opacity-100">
                          อ่านต่อ
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
