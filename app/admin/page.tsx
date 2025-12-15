'use client'

import { useState } from 'react'
import  DashboardLayout  from '@/components/layout/DashboardLayout'
import GuidelinesManager from '@/components/admin/GuidelinesManager'
import UserManager from '@/components/admin/UserManager'
import { Settings, BookOpen, Users } from 'lucide-react'

type AdminTab = 'guidelines' | 'users'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('guidelines')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Settings size={32} />
            การตั้งค่าการจัดการทีม
          </h1>
          <p className="text-slate-500 mt-2">จัดการการคู่มือและการจัดการผู้ใช้</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'guidelines'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={20} />
            คู่มือ
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={20} />
            จัดการผู้ใช้
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'guidelines' && <GuidelinesManager />}
          {activeTab === 'users' && <UserManager />}
        </div>
      </div>
    </DashboardLayout>
  )
}
