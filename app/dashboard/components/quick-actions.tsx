"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Users, PlusCircle } from "lucide-react"
import { SafeIcon } from "@/components/ui/safe-icon"

export function QuickActions() {
  const router = useRouter()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const quickActions = [
    {
      title: "Buat Acara",
      description: "Jadwalkan acara baru",
      icon: Calendar,
      onClick: () => router.push("/dashboard/events/create"),
      gradient: "from-blue-500/10 to-indigo-500/10",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      hoverShadow: "hover:shadow-blue-100/30"
    },
    {
      title: "Undang Tim",
      description: "Tambah anggota tim",
      icon: Users,
      onClick: () => router.push("/dashboard/members"),
      gradient: "from-emerald-500/10 to-green-500/10",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      hoverShadow: "hover:shadow-emerald-100/30"
    },
    {
      title: "Postingan Baru",
      description: "Buat pengumuman",
      icon: PlusCircle,
      onClick: () => router.push("/dashboard/news?action=create"),
      gradient: "from-orange-500/10 to-amber-500/10",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
      hoverShadow: "hover:shadow-orange-100/30"
    },
  ]

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Undangan terkirim",
      description: `Undangan telah dikirim ke ${inviteEmail}`,
    })
    setInviteEmail("")
    setIsInviteDialogOpen(false)
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadFile) {
      toast({
        title: "Berkas diunggah",
        description: `${uploadFile.name} telah berhasil diunggah`,
      })
      setUploadFile(null)
      setIsUploadDialogOpen(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Tindakan Cepat</h2>
          <p className="text-slate-600 leading-relaxed">Akses cepat untuk tugas-tugas yang sering dilakukan</p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card
                key={index}
                className={`group relative overflow-hidden bg-gradient-to-br ${action.gradient} backdrop-blur-sm transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl ${action.hoverShadow}`}
                onClick={action.onClick}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-60"></div>
                
                {/* Content */}
                <CardContent className="relative px-8 pb-8 pt-14 flex flex-col items-center text-center space-y-4">
                  {/* Icon Container */}
                  <div className={`mt-6 w-16 h-16 rounded-2xl ${action.iconBg} backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className={`h-7 w-7 ${action.iconColor}`} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                      {action.description}
                    </p>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Invite Team Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Undang Anggota Tim
            </DialogTitle>
            <DialogDescription className="text-slate-600 leading-relaxed">
              Kirim undangan untuk bergabung dengan tim Anda melalui email
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite}>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@contoh.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsInviteDialogOpen(false)}
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Kirim Undangan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Files Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Unggah Berkas
            </DialogTitle>
            <DialogDescription className="text-slate-600 leading-relaxed">
              Bagikan dokumen penting dengan anggota tim Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload}>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label htmlFor="file" className="text-sm font-medium text-slate-700">
                  Pilih Berkas
                </Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                  required 
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Unggah Berkas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}