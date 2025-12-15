'use client'

import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession()

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">แดชบอร์ด</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">ติดตามและจัดการงานของคุณ</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-right">
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-slate-900 truncate">{session?.user?.name}</p>
                <p className="text-slate-500 text-xs hidden sm:block">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
