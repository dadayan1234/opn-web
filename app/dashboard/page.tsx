"use client"

import { FinanceCard } from "./components/finance-card"
import { RealStats } from "./components/real-stats"
import { QuickActions } from "./components/quick-actions"
import { EventsList } from "./components/events-list"

export default function DashboardPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
            Pantau aktivitas dan kelola acara Anda dengan mudah
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <RealStats />
          <FinanceCard />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl shadow-slate-200/20 p-8">
          <QuickActions />
        </div>

        {/* Upcoming Events Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Acara Terbaru
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Daftar acara yang akan datang dan sedang berlangsung
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="p-8">
              <EventsList />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}