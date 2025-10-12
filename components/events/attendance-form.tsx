"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Edit, User, X } from "lucide-react"
import { useAttendanceMutations } from "@/hooks/useEvents"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSavedAttendanceData, updateAttendanceData } from "@/utils/attendance-utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AuthenticatedImage } from "@/app/components/authenticated-image"

interface Attendee {
  id: number
  event_id: number
  member_id: number
  member_name?: string
  name?: string
  division?: string
  status: string
  notes: string
  avatar?: string
  created_at?: string
  updated_at?: string
}

interface AttendanceFormProps {
  eventId: string | number
  onRefresh?: () => void
}

export function AttendanceForm({ eventId, onRefresh = () => {} }: AttendanceFormProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<number | null>(null)
  const [attendanceForm, setAttendanceForm] = useState({ status: "", notes: "" })
  const [isEditingAll, setIsEditingAll] = useState(false)
  const [bulkEditData, setBulkEditData] = useState<Record<number, { status: string, notes: string }>>({})
  const [activeTab, setActiveTab] = useState<string>("all")

  const { createOrUpdateAttendance } = useAttendanceMutations(eventId)

  const divisions = [...new Set(attendees.map(a => a.division).filter(Boolean))]

  // === Fetch Members + Attendance ===
  const loadMembersAndAttendance = useCallback(async () => {
    setIsLoadingMembers(true)
    try {
      const { memberApi, eventApi } = await import('@/lib/api-service')

      // 1) ambil data member
      const membersData = await memberApi.getMembers()
      let membersArray: any[] = []
      if (Array.isArray(membersData)) {
        membersArray = membersData
      } else if (membersData && typeof membersData === 'object') {
        membersArray = Object.values(membersData).flat()
      }

      // 2) ambil data attendance
      let attendanceData: any[] = []
      try {
        if (typeof eventApi?.getAttendance === "function") {
          attendanceData = await eventApi.getAttendance(eventId)
        } else {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://beopn.pemudanambangan.site'}/api/v1/events/${eventId}/attendance`, {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          })
          attendanceData = res.ok ? await res.json() : []
        }
      } catch {
        attendanceData = []
      }

      // 3) gabungkan kehadiran ke data member
      const attendanceMap = new Map<number, any>()
      attendanceData.forEach(a => attendanceMap.set(Number(a.member_id), a))

      const merged: Attendee[] = membersArray.map((m: any) => {
        const info = m.member_info ?? m
        const mid = Number(info?.id ?? m.id ?? 0)
        if (!mid) return null

        const record = attendanceMap.get(mid)
        return {
          id: record?.id ?? mid,
          event_id: Number(eventId),
          member_id: mid,
          member_name: info?.full_name ?? m.full_name ?? m.username ?? 'Tidak ada nama',
          name: info?.full_name ?? m.full_name ?? m.username ?? 'Tidak ada nama',
          division: info?.division ?? m.division ?? '',
          status: record?.status ?? 'Hadir',
          notes: record?.notes ?? '',
          avatar: info?.photo_url ?? m.photo_url ?? null,
          created_at: record?.created_at ?? new Date().toISOString(),
          updated_at: record?.updated_at ?? new Date().toISOString()
        }
      }).filter(Boolean) as Attendee[]

      // 4) localStorage fallback jika API kosong
      if (merged.length === 0) {
        const saved = getSavedAttendanceData(eventId)
        if (saved.length > 0) {
          merged.push(...saved.map(s => ({
            ...s,
            id: s.id ?? s.member_id,
            event_id: Number(eventId)
          })))
        }
      }

      setAttendees(merged)
    } catch (err) {
      console.error("[AttendanceForm] loadMembersAndAttendance error:", err)
      setAttendees([])
    } finally {
      setIsLoadingMembers(false)
    }
  }, [eventId])

  useEffect(() => { loadMembersAndAttendance() }, [loadMembersAndAttendance])

  // === Form handler ===
  const handleSelectAttendee = (id: number) => {
    const attendee = attendees.find(a => a.id === id)
    if (!attendee) return
    setSelectedAttendee(id)
    setAttendanceForm({
      status: attendee.status,
      notes: attendee.notes || ""
    })
  }

  const getSelectedAttendee = () => attendees.find(a => a.id === selectedAttendee) || null

  const handleSaveAttendance = async () => {
    const attendee = getSelectedAttendee()
    if (!attendee) return

    try {
      const status = ["Hadir", "Izin", "Alfa"].includes(attendanceForm.status)
        ? attendanceForm.status : "Hadir"

      const data = { member_id: attendee.member_id, status, notes: attendanceForm.notes || "" }

      // Optimistic UI
      setAttendees(prev =>
        prev.map(a => a.id === selectedAttendee ? { ...a, status, notes: data.notes } : a)
      )

      // Update ke server
      await createOrUpdateAttendance.mutateAsync([data])
      await loadMembersAndAttendance()

      // Update localStorage juga (optional)
      updateAttendanceData(eventId, [data])

      setSelectedAttendee(null)
      onRefresh?.()
    } catch (err) {
      console.error("[AttendanceForm] Error updating attendance:", err)
    }
  }

  const filteredAttendees = activeTab === "all"
    ? attendees
    : attendees.filter(a => a.division === activeTab)

  // === Render UI ===
  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>Daftar Kehadiran</CardTitle>
        </div>
        <div className="flex gap-2">
          {/* Tombol Download PDF */}
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE || "https://beopn.pemudanambangan.site"}/api/v1/events/${eventId}/attendance/pdf`,
                  {
                    headers: {
                      Accept: "*/*",
                      ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                  }
                );
                if (!res.ok) throw new Error("Gagal mengunduh file PDF");

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `attendance-event-${eventId}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error("Download PDF error:", err);
                alert("Gagal mengunduh file kehadiran");
              }
            }}
          >
            Download PDF
          </Button>

          {/* Tombol Ubah Semua */}
          {attendees.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditingAll(true);
                const init: Record<number, { status: string; notes: string }> = {};
                attendees.forEach((a) => {
                  init[a.id] = { status: a.status, notes: a.notes };
                });
                setBulkEditData(init);
              }}
            >
              <Edit className="h-4 w-4 mr-2" /> Ubah Semua
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoadingMembers ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="text-muted-foreground">Memuat data anggota...</p>
          </div>
        ) : attendees.length === 0 ? (
          <Alert>
            <AlertDescription>
              Belum ada data anggota untuk ditampilkan. Silakan tambahkan anggota terlebih dahulu.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">Semua</TabsTrigger>
                {divisions.map(division => (
                  <TabsTrigger key={division} value={division}>{division}</TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Tidak ada anggota di divisi ini
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAttendees.map((attendee) => (
                        <TableRow key={attendee.id} onClick={() => handleSelectAttendee(attendee.id)} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {attendee.avatar ? (
                                <AuthenticatedImage
                                  src={attendee.avatar}
                                  alt={attendee.member_name || attendee.name || 'Anggota'}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-xs">
                                    {(() => {
                                      const displayName = attendee.member_name || attendee.name || '';
                                      return displayName.length > 0 ? displayName[0] : '?';
                                    })()}
                                  </span>
                                </div>
                              )}
                              {attendee.member_name || attendee.name || 'Tidak ada nama'}
                            </div>
                          </TableCell>
                          <TableCell>{attendee.division || '-'}</TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${
                                attendee.status === "Hadir" ? "bg-green-100 text-green-800" :
                                attendee.status === "Izin" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}
                            >
                              {attendee.status}
                            </span>
                          </TableCell>
                          <TableCell>{attendee.notes || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Edit Attendance Dialog */}
        <Dialog open={selectedAttendee !== null} onOpenChange={(open) => !open && setSelectedAttendee(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Edit Kehadiran: {(() => {
                  const attendee = attendees.find(a => a.id === selectedAttendee);
                  return attendee ? (attendee.member_name || attendee.name || 'Tidak ada nama') : 'Tidak ada nama';
                })()}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="attendance-status">Status</Label>
                <Select
                  value={attendanceForm.status}
                  onValueChange={(value) => setAttendanceForm({...attendanceForm, status: value})}
                >
                  <SelectTrigger id="attendance-status">
                    <SelectValue placeholder="Pilih status kehadiran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hadir">Hadir</SelectItem>
                    <SelectItem value="Izin">Izin</SelectItem>
                    <SelectItem value="Alfa">Alfa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-notes">Keterangan</Label>
                <Input
                  id="attendance-notes"
                  placeholder="Masukkan keterangan"
                  value={attendanceForm.notes}
                  onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAttendee(null)}>Tutup</Button>
              <Button onClick={handleSaveAttendance} disabled={createOrUpdateAttendance.isPending}>
                {createOrUpdateAttendance.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Edit Dialog */}
        <Dialog open={isEditingAll} onOpenChange={setIsEditingAll}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Ubah Semua Kehadiran</DialogTitle>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell className="font-medium">
                        {attendee.member_name || attendee.name || 'Tidak ada nama'}
                      </TableCell>
                      <TableCell>{attendee.division || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={bulkEditData[attendee.id]?.status || attendee.status}
                          onValueChange={(value) => {
                            setBulkEditData({
                              ...bulkEditData,
                              [attendee.id]: {
                                ...bulkEditData[attendee.id],
                                status: value
                              }
                            });
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hadir">Hadir</SelectItem>
                            <SelectItem value="Izin">Izin</SelectItem>
                            <SelectItem value="Alfa">Alfa</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Masukkan keterangan"
                          value={bulkEditData[attendee.id]?.notes || attendee.notes || ''}
                          onChange={(e) => {
                            setBulkEditData({
                              ...bulkEditData,
                              [attendee.id]: {
                                ...bulkEditData[attendee.id],
                                notes: e.target.value
                              }
                            });
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingAll(false)}>Tutup</Button>
              <Button
                onClick={async () => {
                  try {
                    const updateData = Object.entries(bulkEditData).map(([id, data]) => {
                      const attendee = attendees.find(a => a.id === parseInt(id));
                      if (!attendee) return null;
                      return {
                        member_id: attendee.member_id,
                        status: data.status || 'Hadir',
                        notes: data.notes || ''
                      };
                    }).filter(Boolean);

                    if (updateData.length > 0) {
                      // Optimistic UI
                      const updatedAttendees = [...attendees];
                      updateData.forEach((data: any) => {
                        const index = updatedAttendees.findIndex(a => a.member_id === data.member_id);
                        if (index >= 0) {
                          updatedAttendees[index] = {
                            ...updatedAttendees[index],
                            status: data.status,
                            notes: data.notes || ""
                          };
                        }
                      });
                      setAttendees(updatedAttendees);

                      // Update ke server
                      await createOrUpdateAttendance.mutateAsync(updateData);

                      // Refresh data dari server
                      await loadMembersAndAttendance();

                      // LocalStorage fallback
                      updateAttendanceData(eventId, updateData);

                      setIsEditingAll(false);
                      onRefresh?.();
                    }
                  } catch (error) {
                    console.error('Error updating attendance:', error);
                    alert('Gagal memperbarui data kehadiran');
                  }
                }}
              >
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
