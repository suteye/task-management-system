'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Users,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'งาน ', href: '/dashboard', icon: CheckSquare },
    { id: 'guidelines', label: 'เอกสาร', href: '/guidelines', icon: BookOpen },
    //{ id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
    //{ id: 'team', label: 'Team Members', href: '/team', icon: Users },
    { id: 'admin', label: 'การตั้งค่า', href: '/admin', icon: Settings },
  ]

  const isActive = (href: string) => {
    return pathname === href || (href === '/dashboard' && pathname === '/dashboard')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Menu Button - Only visible on mobile, positioned top-right */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="sm:hidden fixed top-4 right-4 z-50 p-2.5 rounded-lg bg-white text-slate-900 shadow-md border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 active:scale-95"
      >
        {isMobileSidebarOpen ? <X size={24} className="text-red-500" /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        } ${
          isOpen ? 'w-64 sm:w-72' : 'w-20 sm:w-24'
        } bg-white border-r border-slate-200 text-slate-900 transition-all duration-300 ease-out flex flex-col shadow-sm fixed sm:static h-full z-40 sm:z-auto`}
      >
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-2">
          {isOpen ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                T
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">TaskManagement</h1>
              </div>
            </div>
          ) : (
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg mx-auto shrink-0 shadow-md">
              T
            </div>
          )}
          <Button
            onClick={() => {
              setIsOpen(!isOpen)
              setIsMobileSidebarOpen(false)
            }}
            className="hidden sm:block p-1.5 bg-gray-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900 shrink-0"
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 group relative text-sm sm:text-base ${
                  active
                    ? 'bg-linear-to-r from-blue-50 to-blue-50 text-blue-600 font-semibold border border-blue-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <Icon size={20} className={`shrink-0 transition-colors ${active ? 'text-blue-600' : 'group-hover:text-slate-900'}`} />
                {isOpen && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {active && <ChevronRight size={18} className="text-blue-600 shrink-0" />}
                  </>
                )}
                {!isOpen && active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-3 sm:mx-4"></div>

        {/* User Section */}
        <div className="p-3 sm:p-4">
          {isOpen ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-lg p-2.5 sm:p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1 font-medium">เข้าสู่ระบบด้วย</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-slate-600 truncate">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/signin' })}
                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium group border border-transparent hover:border-red-200"
              >
                <LogOut size={18} className="group-hover:text-red-600 shrink-0" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/signin' })}
              className="w-full p-2 hover:bg-slate-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors flex justify-center"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50 pt-16 sm:pt-0">
          {/* Content will be rendered here by child pages */}
        </main>
      </div>
    </div>
  )
}
