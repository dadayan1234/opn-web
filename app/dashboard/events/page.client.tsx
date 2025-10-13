"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format, parseISO } from "date-fns"
import { Calendar, Plus, Loader2, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, UserCheck, Search, Grid3X3, List, MapPin, Clock } from "lucide-react"

import { useEvents, useSearchEvents, useEventMutations, PaginationMeta } from "@/hooks/useEvents"
import type { Event } from "@/lib/api-service"
import { EventSearchForm, type EventSearchParams } from "@/components/events/event-search-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AttendancePopup } from "@/components/events/attendance-popup"

export default function EventsPageClient() {
  const router = useRouter()
  const [searchFilters, setSearchFilters] = useState<EventSearchParams>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")

  // State for attendance popup
  const [attendanceEvent, setAttendanceEvent] = useState<Event | null>(null)
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // opsional kalau mau trigger refetch manual


  const {
  data: eventsResponse,
  isLoading,
  isFetching,
  isError,
  error,
  refetch
    } = Object.keys(searchFilters).length > 0
      ? useSearchEvents(searchFilters)
      : useEvents(currentPage, itemsPerPage)

  const events = eventsResponse?.data ?? []
  const paginationMeta = eventsResponse?.meta ?? null


  // Get event mutations
  const { deleteEvent, createEvent, updateEvent } = useEventMutations()

  // Search events with filters
  const { data: searchResults = [], isLoading: isSearching } = useSearchEvents(
    {
      ...searchFilters,
      page: currentPage,
      limit: itemsPerPage
    },
    {
      enabled: Object.keys(searchFilters).length > 0,
    }
  )

    // ✅ PERBAIKAN: Pisahkan hasil dari kedua hook
  const mainEventsQuery = useEvents(currentPage, itemsPerPage, { refetchOnMount: false });
  const searchEventsQuery = useSearchEvents(searchFilters, { refetchOnMount: false, enabled: Object.keys(searchFilters).length > 0 });


  useEffect(() => {
  if (paginationMeta && currentPage > paginationMeta.total_pages) {
    setCurrentPage(paginationMeta.total_pages || 1)
  }
}, [paginationMeta, currentPage])


  // Handle search form submission
  const handleSearch = (filters: EventSearchParams) => {
    setSearchFilters(filters)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle search reset
  const handleResetSearch = () => {
    setSearchFilters({})
  }

  // Determine which events to display
  const displayedEvents: Event[] = eventsResponse?.data ?? []


  // Format date for display
  const formatEventDate = (dateString?: string) => {
    if (!dateString) return "Tanggal tidak tersedia"

    try {
      const date = parseISO(dateString)
      return format(date, "dd MMMM yyyy")
    } catch (e) {
      return dateString
    }
  }

  // Handle delete event
  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteEvent = () => {
  if (!eventToDelete) return

  deleteEvent.mutate(eventToDelete.id, {
    onSuccess: () => {
      setIsDeleteDialogOpen(false)
      setEventToDelete(null)
      setSearchFilters({}) // ✅ reset ke list utama
    },
  })
}


  // Handle pagination
// Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (paginationMeta && currentPage < paginationMeta.total_pages) {
      setCurrentPage(currentPage + 1)
    }
  }


  // Function to change page directly
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle opening attendance popup
  const handleOpenAttendance = (event: Event) => {
    setAttendanceEvent(event)
    setIsAttendanceOpen(true)
  }

  // Handle closing attendance popup
  const handleCloseAttendance = () => {
    setAttendanceEvent(null)
    setIsAttendanceOpen(false)
  }
// console.log("eventsResponse:", eventsResponse)
// console.log("paginationMeta:", paginationMeta)
// console.log("isLoading:", isLoading, "isFetching:", isFetching)


  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded-2xl w-64"></div>
                <div className="h-6 bg-gray-200 rounded-xl w-96"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-2xl w-40"></div>
            </div>
            
            {/* Search Section Skeleton */}
            <div className="bg-white/70 rounded-3xl p-6 space-y-4">
              <div className="h-12 bg-gray-200 rounded-2xl w-full"></div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
              </div>
            </div>
            
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/80 rounded-3xl p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 max-w-md mx-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <Calendar className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {error instanceof Error ? error.message : "Gagal memuat data acara. Silakan coba lagi."}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Daftar Acara
            </h1>
            <p className="text-gray-600 text-lg">Kelola dan pantau semua acara Anda dalam satu tempat</p>
          </div>
          
          <button
            onClick={() => router.push("/dashboard/events/new")}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Buat Acara Baru</span>
            </div>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 space-y-6">
          
          {/* EventSearchForm - Filter Asli */}
          <div>
            <EventSearchForm
              onSearch={handleSearch}
              isSearching={isSearching}
              onReset={handleResetSearch}
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex justify-end">
            <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === "grid" 
                    ? "bg-blue-100 text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === "table" 
                    ? "bg-blue-100 text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Search State */}
        {displayedEvents.length === 0 && !isLoading && isFetching && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <span className="text-lg text-gray-600">Mencari acara...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching &&
          displayedEvents.length === 0 &&
          !isLoading &&
          !isFetching && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Tidak ada acara ditemukan</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {Object.keys(searchFilters).length > 0 
                ? "Tidak ada acara yang sesuai dengan pencarian Anda." 
                : "Belum ada acara yang dibuat."}
            </p>
            {Object.keys(searchFilters).length > 0 ? (
              <button
                onClick={handleResetSearch}
                className="bg-white text-blue-600 px-6 py-3 rounded-2xl border border-blue-200 hover:bg-blue-50 transition-all duration-300 shadow-sm"
              >
                Hapus Pencarian
              </button>
            ) : (
              <button 
                onClick={() => router.push("/dashboard/events/new")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5 inline" />
                Buat Acara Pertama
              </button>
            )}
          </div>
        )}

        {/* Events Display */}
        {!isSearching && displayedEvents.length > 0 && (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl border border-white/20 hover:border-blue-200/50 transition-all duration-500 transform hover:-translate-y-2"
                  >
                    {/* Event Header */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {event.title}
                      </h3>
                      
                      {/* Date and Time */}
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm">{formatEventDate(event.date)}</span>
                        {event.time && (
                          <>
                            <Clock className="h-4 w-4 ml-4 mr-2 text-blue-500" />
                            <span className="text-sm">{event.time}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Location */}
                      {event.location && (
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      )}
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {event.description}
                      </p>
                      
                      {/* Status Badge */}
                      <div className="flex items-center mb-6">
                        <span 
                          className="px-4 py-2 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: event.status === "selesai" ? "#dcfce7" : "#dbeafe",
                            color: event.status === "selesai" ? "#166534" : "#1e40af",
                            border: event.status === "selesai" ? "1px solid #bbf7d0" : "1px solid #bfdbfe"
                          }}
                        >
                          {event.status === "akan datang" ? "Akan Datang" : event.status === "selesai" ? "Selesai" : event.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => router.push(`/dashboard/events/${event.id}`)}
                        className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                      </button>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                        <TableHead className="text-gray-800 font-semibold py-6">Nama Acara</TableHead>
                        <TableHead className="text-gray-800 font-semibold py-6 hidden sm:table-cell">Tanggal</TableHead>
                        <TableHead className="text-gray-800 font-semibold py-6 hidden md:table-cell">Lokasi</TableHead>
                        <TableHead className="text-gray-800 font-semibold py-6">Status</TableHead>
                        <TableHead className="text-right text-gray-800 font-semibold py-6">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100">
                      {displayedEvents.map((event) => (
                        <TableRow key={event.id} className="hover:bg-blue-50/50 transition-colors duration-300">
                          <TableCell className="py-6">
                            <div>
                              <div className="font-semibold text-gray-800 mb-1">{event.title}</div>
                              <div className="text-sm text-gray-600 line-clamp-1">{event.description}</div>
                              <div className="sm:hidden text-xs text-gray-500 mt-2">
                                {formatEventDate(event.date)}
                                {event.time && ` • ${event.time}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 hidden sm:table-cell">
                            <div className="text-gray-700">
                              <div className="font-medium">{formatEventDate(event.date)}</div>
                              {event.time && <div className="text-sm text-gray-500">{event.time}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="py-6 hidden md:table-cell">
                            <div className="text-gray-600">{event.location}</div>
                          </TableCell>
                          <TableCell className="py-6">
                            <span 
                              className="px-3 py-2 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: event.status === "selesai" ? "#dcfce7" : "#dbeafe",
                                color: event.status === "selesai" ? "#166534" : "#1e40af",
                                border: event.status === "selesai" ? "1px solid #bbf7d0" : "1px solid #bfdbfe"
                              }}
                            >
                              {event.status === "akan datang" ? "Akan Datang" : event.status === "selesai" ? "Selesai" : event.status}
                            </span>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => router.push(`/dashboard/events/${event.id}`)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEvent(event)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Pagination - Only show when not using search filters */}
            {Object.keys(searchFilters).length === 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">
                    Menampilkan {displayedEvents.length} acara
                  </span>
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20 bg-white border-gray-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Tombol Sebelumnya */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={isLoading || isFetching || currentPage <= 1}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  {/* Info halaman */}
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium">
                    Halaman {currentPage} dari {paginationMeta?.total_pages ?? 1}
                  </span>

                  {/* Tombol Selanjutnya */}
                  <button
                    onClick={handleNextPage}
                    disabled={
                      isLoading ||
                      isFetching ||
                      !paginationMeta ||
                      currentPage >= (paginationMeta.total_pages ?? 1)
                    }
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </div>

              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
            <AlertDialogHeader className="text-center pb-6">
              <AlertDialogTitle className="text-2xl font-bold text-gray-800 mb-2">
                Hapus Acara
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 text-lg leading-relaxed">
                Apakah Anda yakin ingin menghapus acara "{eventToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
              <AlertDialogCancel className="flex-1 rounded-2xl border-gray-200 hover:bg-gray-50">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteEvent} 
                disabled={deleteEvent.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 rounded-2xl"
              >
                {deleteEvent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Attendance Popup */}
        {attendanceEvent && (
          <AttendancePopup
            eventId={attendanceEvent.id}
            eventName={attendanceEvent.title}
            open={isAttendanceOpen}
            onClose={handleCloseAttendance}
          />
        )}
      </div>
    </div>
  )
}