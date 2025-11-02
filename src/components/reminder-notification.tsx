"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, Clock, X } from "lucide-react"

interface Reminder {
  id: string
  reminderType: string
  message: string
  scheduledDate: string
  isCompleted: boolean
  cropName?: string
}

export function ReminderNotification() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReminders()
    // Poll for new reminders every 5 minutes
    const interval = setInterval(fetchReminders, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/reminders/upcoming")
      const data = await response.json()
      setReminders(data.filter((r: Reminder) => !r.isCompleted))
    } catch (error) {
      console.error("Error fetching reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await fetch(`/api/reminders/${reminderId}/complete`, {
        method: "POST",
      })
      setReminders(reminders.filter((r) => r.id !== reminderId))
    } catch (error) {
      console.error("Error completing reminder:", error)
    }
  }

  const handleDismiss = (reminderId: string) => {
    setReminders(reminders.filter((r) => r.id !== reminderId))
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "watering":
        return "Siram Tanaman"
      case "fertilizing":
        return "Beri Pupuk"
      case "disease_check":
        return "Periksa Penyakit"
      case "harvest":
        return "Waktu Panen"
      default:
        return "Pengingat"
    }
  }

  const getReminderColor = (type: string) => {
    switch (type) {
      case "watering":
        return "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
      case "fertilizing":
        return "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700"
      case "disease_check":
        return "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700"
      case "harvest":
        return "bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700"
      default:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
        title="Pengingat"
      >
        <Bell className="w-5 h-5" />
        {reminders.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {reminders.length > 9 ? "9+" : reminders.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed md:absolute top-12 left-4 right-4 md:right-0 md:left-auto md:w-96 max-h-96 bg-background border border-border rounded-lg shadow-xl overflow-hidden flex flex-col z-50">
          {/* Header */}
          <div className="bg-green-50 dark:bg-green-900 p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Pengingat & Notifikasi
            </h3>
            <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reminders List */}
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Memuat pengingat...</div>
          ) : reminders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Tidak ada pengingat. Semua tugas selesai!</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 border-b border-border last:border-b-0 ${getReminderColor(reminder.reminderType)}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{getReminderIcon(reminder.reminderType)}</p>
                      <p className="text-sm text-muted-foreground mt-1">{reminder.message}</p>
                      {reminder.cropName && (
                        <p className="text-xs text-muted-foreground mt-1">Tanaman: {reminder.cropName}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(reminder.scheduledDate).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDismiss(reminder.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handleCompleteReminder(reminder.id)}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      Selesai
                    </Button>
                    <button
                      onClick={() => handleDismiss(reminder.id)}
                      className="flex-1 px-2 py-1 text-xs border rounded-md text-muted-foreground hover:bg-muted"
                    >
                      Abaikan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showNotifications && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowNotifications(false)} />
      )}
    </div>
  )
}
