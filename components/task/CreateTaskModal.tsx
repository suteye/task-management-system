'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { X, FileText, AlertCircle, CheckCircle2, BarChart3, Users, Clipboard, Code, TestTube, Calendar, Rocket, Sparkles } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const priorityColors = {
  low: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', dot: 'bg-green-500' },
  medium: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  high: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', dot: 'bg-red-500' },
};

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assigned_to: '', // Main assignee
    timeline: {
      dev_start: '',
      dev_end: '',
      sit_start: '',
      sit_end: '',
      uat_start: '',
      uat_end: '',
    },
    go_live: {
      move_day_date: '', // Calendar date selection as YYYY-MM-DD
      go_live_date: '', // วันถัดไปเช้า (auto-calculated)
    },
    // Role-based assignments
    roles: {
      bcd_owner: '', // ผู้รับผิดชอบ Create BCD
      dev_owner: '', // ผู้รับผิดชอบ Dev
      sit_support: '', // Support SIT
      uat_support: '', // Support UAT
    },
  });

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          assigned_to: '',
          timeline: {
            dev_start: '',
            dev_end: '',
            sit_start: '',
            sit_end: '',
            uat_start: '',
            uat_end: '',
          },
          go_live: {
            move_day_date: '',
            go_live_date: '',
          },
          roles: {
            bcd_owner: '',
            dev_owner: '',
            sit_support: '',
            uat_support: '',
          },
        });
        onTaskCreated();
        onClose();
      } else {
        const errorMessage = responseData?.error || 'Unknown error';
        console.error('Task creation error:', errorMessage);
        alert(`Failed to create task: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Network error creating task:', error);
      alert(`Network error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const colors = priorityColors[formData.priority];

  // Helper function to calculate next day as Go Live date (morning after move date)
  const calculateGoLiveDate = (moveDate: string): string => {
    if (!moveDate) return '';

    // Parse the move date string (YYYY-MM-DD format)
    const [year, month, day] = moveDate.split('-').map(Number);
    
    // Create date with explicit year, month, day to avoid timezone issues
    const moveDateObj = new Date(year, month - 1, day);
    
    // Add 1 day for Go Live
    moveDateObj.setDate(moveDateObj.getDate() + 1);
    
    // Format back to YYYY-MM-DD without timezone conversion
    const goLiveYear = moveDateObj.getFullYear();
    const goLiveMonth = String(moveDateObj.getMonth() + 1).padStart(2, '0');
    const goLiveDay = String(moveDateObj.getDate()).padStart(2, '0');
    
    return `${goLiveYear}-${goLiveMonth}-${goLiveDay}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-linear-to-br from-blue-500 to-blue-600 flex items-end p-4 sm:p-6 shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2"><Sparkles className="w-6 sm:w-8 h-6 sm:h-8 shrink-0" /> <span className="truncate">สร้างงานใหม่</span></h1>
            <p className="text-blue-100 text-xs sm:text-sm">เพิ่มงานใหม่เข้าสู่ระบบจัดการ workflow</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-lg hover:bg-blue-600 transition-colors shrink-0"
          >
            <X className="w-5 sm:w-5 h-5 sm:h-5 text-white" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1">
          <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Title */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 shrink-0" />
                <Label htmlFor="title" className="text-sm sm:text-base font-semibold text-gray-900">
                  ชื่องาน
                </Label>
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="กรอกชื่องานที่นี่... "
                className="border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Clipboard className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 shrink-0" />
                <Label htmlFor="description" className="text-sm sm:text-base font-semibold text-gray-900">
                  รายละเอียดงาน
                </Label>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="อธิบายรายละเอียดงานที่ต้องทำ..."
                rows={3}
                className="border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 text-sm sm:text-base p-3 sm:p-4 transition-colors resize-none"
              />
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              {/* Priority */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600 shrink-0" />
                  <Label htmlFor="priority" className="text-sm sm:text-base font-semibold text-gray-900">
                    ความสำคัญ
                  </Label>
                </div>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className={`border-2 ${colors.border} rounded-lg focus:border-blue-500 focus:ring-0 text-base h-11 transition-colors`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="flex items-center gap-2">
                      <span>🟢 ต่ำ</span>
                    </SelectItem>
                    <SelectItem value="medium" className="flex items-center gap-2">
                      <span>🟡 กลาง</span>
                    </SelectItem>
                    <SelectItem value="high" className="flex items-center gap-2">
                      <span>🔴 สูง</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Roles Assignment Section */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">ผู้รับผิดชอบ</h3>
              </div>

              {/* BCD Owner */}
              <div className="space-y-3 p-4 rounded-lg bg-indigo-50 border-2 border-indigo-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clipboard className="w-5 h-5 text-indigo-600" />
                  <Label className="text-base font-semibold text-indigo-900">
                    ผู้รับผิดชอบสร้าง BCD
                  </Label>
                </div>
                <Select
                  value={formData.roles.bcd_owner}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      roles: { ...formData.roles, bcd_owner: value },
                    })
                  }
                >
                  <SelectTrigger className="border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-0 text-sm">
                    <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <div className="p-2 text-center text-sm text-gray-500">กำลังโหลด...</div>
                    ) : users.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">ไม่มีผู้ใช้</div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Development Owner */}
              <div className="space-y-3 p-4 rounded-lg bg-blue-50 border-2 border-blue-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-blue-600" />
                  <Label className="text-base font-semibold text-blue-900">
                    ผู้รับผิดชอบ Dev
                  </Label>
                </div>
                <Select
                  value={formData.roles.dev_owner}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      roles: { ...formData.roles, dev_owner: value },
                    })
                  }
                >
                  <SelectTrigger className="border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-0 text-sm">
                    <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <div className="p-2 text-center text-sm text-gray-500">กำลังโหลด...</div>
                    ) : users.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">ไม่มีผู้ใช้</div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* SIT Support */}
              <div className="space-y-3 p-4 rounded-lg bg-orange-50 border-2 border-orange-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <TestTube className="w-5 h-5 text-orange-600" />
                  <Label className="text-base font-semibold text-orange-900">
                    Support SIT
                  </Label>
                </div>
                <Select
                  value={formData.roles.sit_support}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      roles: { ...formData.roles, sit_support: value },
                    })
                  }
                >
                  <SelectTrigger className="border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:ring-0 text-sm">
                    <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <div className="p-2 text-center text-sm text-gray-500">กำลังโหลด...</div>
                    ) : users.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">ไม่มีผู้ใช้</div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* UAT Support */}
              <div className="space-y-3 p-4 rounded-lg bg-green-50 border-2 border-green-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <Label className="text-base font-semibold text-green-900">
                    Support UAT
                  </Label>
                </div>
                <Select
                  value={formData.roles.uat_support}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      roles: { ...formData.roles, uat_support: value },
                    })
                  }
                >
                  <SelectTrigger className="border-2 border-green-300 rounded-lg focus:border-green-500 focus:ring-0 text-sm">
                    <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <div className="p-2 text-center text-sm text-gray-500">กำลังโหลด...</div>
                    ) : users.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">ไม่มีผู้ใช้</div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Timeline ช่วงเวลา</h3>
              </div>

              {/* Development Timeline */}
              <div className="space-y-4 p-4 rounded-lg bg-blue-50 border-2 border-blue-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Development</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 block mb-2">
                      เริ่มต้น
                    </Label>
                    <DatePicker
                      value={formData.timeline.dev_start}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          timeline: { ...formData.timeline, dev_start: date },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 block mb-2">
                      สิ้นสุด
                    </Label>
                    <DatePicker
                      value={formData.timeline.dev_end}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          timeline: { ...formData.timeline, dev_end: date },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* SIT Timeline */}
              <div className="space-y-4 p-4 rounded-lg bg-orange-50 border-2 border-orange-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <TestTube className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">SIT (System Integration Test)</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 block mb-2">
                      เริ่มต้น
                    </Label>
                    <DatePicker
                      value={formData.timeline.sit_start}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          timeline: { ...formData.timeline, sit_start: date },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 block mb-2">
                      สิ้นสุด
                    </Label>
                    <DatePicker
                      value={formData.timeline.sit_end}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          timeline: { ...formData.timeline, sit_end: date },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* UAT Timeline */}
              <div className="space-y-4 p-4 rounded-lg bg-green-50 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">UAT (User Acceptance Test)</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 block mb-2">
                      เริ่มต้น
                    </Label>
                    <DatePicker
                      value={formData.timeline.uat_start}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          timeline: { ...formData.timeline, uat_start: date },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 block mb-2">
                      สิ้นสุด
                    </Label>
                    <DatePicker
                      value={formData.timeline.uat_end}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          timeline: { ...formData.timeline, uat_end: date },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Go Live Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-6">
                  <Rocket className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-bold text-gray-900">Go Live Plan</h3>
                </div>

                {/* Move Day Selection - Calendar Date Picker */}
                <div className="p-4 rounded-lg bg-purple-50 border-2 border-purple-200 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">เลือกวันที่ Move Program</h4>
                  </div>
                  <p className="text-xs text-purple-700 mb-4">
                    เลือกวันที่ทำการ move program วัน Go Live จะเป็นเช้าวันถัดไปโดยอัตโนมัติ
                  </p>
                  <DatePicker
                    value={formData.go_live.move_day_date}
                    onChange={(date) => {
                      const goLiveDate = calculateGoLiveDate(date);
                      setFormData({
                        ...formData,
                        go_live: {
                          move_day_date: date,
                          go_live_date: goLiveDate,
                        },
                      });
                    }}
                  />
                </div>

                {/* Go Live Date Display */}
                {formData.go_live.move_day_date && formData.go_live.go_live_date && (
                  <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">วัน Go Live</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      วันที่ Go Live จะเป็นเช้าวันถัดไปหลังจาก Move Program
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border-2 border-purple-300 rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-1">Move Program Date</p>
                        <p className="text-lg font-bold text-purple-600">
                          {new Date(formData.go_live.move_day_date + 'T00:00:00').toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="bg-white border-2 border-green-300 rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-1">Go Live Date</p>
                        <p className="text-lg font-bold text-green-600">
                          {new Date(formData.go_live.go_live_date + 'T00:00:00').toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">เวลา Go Live: 06:00 น. (เช้า)</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                priority: 'medium',
                assigned_to: '',
                timeline: {
                  dev_start: '',
                  dev_end: '',
                  sit_start: '',
                  sit_end: '',
                  uat_start: '',
                  uat_end: '',
                },
                go_live: {
                  move_day_date: '',
                  go_live_date: '',
                },
                roles: {
                  bcd_owner: '',
                  dev_owner: '',
                  sit_support: '',
                  uat_support: '',
                },
              });
              onClose();
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 font-semibold text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            form="create-task-form"
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm sm:text-base hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">กำลังสร้าง...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">สร้างงาน</span><span className="sm:hidden">สร้าง</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}