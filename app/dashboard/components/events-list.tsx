"use client"

import { useState, useEffect } from "react"
import { Eye, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { Button } from "../../../components/ui/button"
import { Skeleton } from "../../../components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useToast } from "../../../components/ui/use-toast"
import { useEventMutations } from "../../../hooks/useEvents"
import { DeleteConfirmationDialog } from "../../../components/dashboard/delete-confirmation-dialog"

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  status: string
  created_at: string
  updated_at: string
  photos: any[]
  attendees: number[]
}

// Define pagination metadata interface
interface PaginationMeta {
  page: number;
  limit: number;
  total_pages: number;
  total_count?: number; // Total number of items across all pages
}

export function EventsList() {
  const router = useRouter()
  const { toast } = useToast()
  const itemsPerPage = 10 // Define number of items per page
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key to force re-fetch
  const [currentPage, setCurrentPage] = useState(1)
  // const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)

  // ambil data & meta dari useEvents

  // Get event mutations
  const { deleteEvent } = useEventMutations()

  // Function to manually refresh the events list
  const refreshEvents = () => {
    setIsLoading(true)
    setCurrentPage(1) // Reset to first page
    setRefreshKey(prevKey => prevKey + 1)
    toast({
      title: "Memperbarui data",
      description: "Sedang memuat data acara terbaru...",
    })
  }

  // Function to change page
  const changePage = (page: number) => {
    if (page < 1 || (paginationMeta && page > paginationMeta.total_pages)) {
      return
    }

    setIsLoading(true)
    setCurrentPage(page)
    setRefreshKey(prevKey => prevKey + 1)
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching events for dashboard...")

        // Get token from localStorage
        const token = localStorage.getItem('token')

        if (!token) {
          console.error("No authentication token found")
          setError("Authentication required")
          return
        }

        // Make a direct fetch call to ensure we're getting the raw response
        try {
          // Use the updated API format with pagination parameters
          const response = await fetch(`https://beopn.pemudanambangan.site/api/v1/events/?page=${currentPage}&limit=10`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }

          // Get the raw text first to inspect it
          const rawText = await response.text();
          console.log('Raw API response:', rawText);

          // Try to parse as JSON
          let responseData;
          try {
            responseData = JSON.parse(rawText);
            console.log('Parsed events data:', responseData);
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            throw new Error('Invalid JSON response from server');
          }

          // Handle the new response format with metadata
          let eventsData = [];
          let paginationMeta = null;

          console.log('Response structure:', Object.keys(responseData));

          // The new format should have data array and meta object
          if (responseData && typeof responseData === 'object') {
            // Check if the response has the expected structure
            if (Array.isArray(responseData)) {
              // If it's directly an array (old format)
              console.log('Response is an array with', responseData.length, 'items (old format)');
              eventsData = responseData;
            } else {
              // New format with data and meta
              if (Array.isArray(responseData.data)) {
                console.log('Response has data array with', responseData.data.length, 'items');
                eventsData = responseData.data;

                // Extract pagination metadata if available
                if (responseData.meta && typeof responseData.meta === 'object') {
                  paginationMeta = responseData.meta;
                  console.log('Pagination metadata:', paginationMeta);

                  // Save pagination metadata to state
                  setPaginationMeta(paginationMeta);
                }
              } else {
                // If data is not an array, look for any array in the response
                console.log('Looking for arrays in response object');
                const arrayProps = Object.entries(responseData)
                  .filter(([_, value]) => Array.isArray(value))
                  .map(([key, value]) => ({ key, length: (value as any[]).length }));

                console.log('Found array properties:', arrayProps);

                if (arrayProps.length > 0) {
                  // Use the first array found
                  const firstArrayKey = arrayProps[0].key;
                  eventsData = responseData[firstArrayKey];
                  console.log(`Using array from property '${firstArrayKey}' with ${eventsData.length} items`);
                } else {
                  console.log('No arrays found in response');
                }
              }
            }
          }

          console.log('Final processed events data:', eventsData);

          // Sort events by date (newest first)
          const sortedEvents = [...eventsData].sort((a, b) => {
            // Try to parse dates and compare them
            try {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              // Sort in descending order (newest first)
              return dateB.getTime() - dateA.getTime();
            } catch (e) {
              console.error('Error sorting dates:', e);
              return 0;
            }
          });

          console.log('Sorted events (newest first):', sortedEvents.map(e => e.date));

          // Set the events data
          // Batasi ke 10 event pertama
          setEvents(sortedEvents.slice(0, 10))

          setError(null);
        } catch (apiError) {
          console.error("API error:", apiError);
          throw apiError; // Re-throw to be caught by the outer catch block
        }
      } catch (err) {
        console.error("Error in events component:", err);
        // Don't use sample data, just show error
        setEvents([]);

        // Provide more detailed error message for debugging
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Detailed error:", errorMessage);

        setError("Gagal memuat data acara dari server");
        toast({
          title: "Error",
          description: "Gagal memuat data acara. Silakan coba lagi nanti.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [toast, refreshKey, currentPage]); // Include currentPage in dependencies

  const handleViewEvent = (event: Event) => {
  router.push(`/dashboard/events/${event.id}`)
  }

  const handleEditEvent = (event: Event) => {
  router.push(`/dashboard/events/${event.id}/edit`)
  }


  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setSelectedEvent(null)
    setShowDeleteDialog(false)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return

    try {
      await deleteEvent.mutateAsync(selectedEvent.id)
      handleCloseDeleteDialog()
      toast({
        title: "Acara dihapus",
        description: "Acara telah berhasil dihapus.",
      })

      // Refresh the events list
      setEvents(events.filter(e => e.id !== selectedEvent.id))
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: "Gagal menghapus acara. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={refreshEvents}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Coba Lagi
        </Button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada acara yang dapat ditampilkan.</p>
        <p className="text-sm mt-1 mb-4">
          {isLoading ? "Sedang memuat data..." : "Silakan buat acara baru atau refresh untuk melihat data terbaru."}
        </p>
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            className="mt-2"
            onClick={refreshEvents}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => router.push('/dashboard/events/new')}
          >
            Buat Acara Baru
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {paginationMeta && paginationMeta.total_count !== undefined
            ? `${events.length} dari ${paginationMeta.total_count} acara`
            : `${events.length} acara ditemukan`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshEvents}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-800">Nama Acara</th>
                <th className="px-6 py-4 font-semibold text-gray-800">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-gray-800">Lokasi</th>
                <th className="px-6 py-4 font-semibold text-gray-800">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{event.title}</div>
                    <div className="text-sm text-gray-600">{event.description}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {format(new Date(event.date), "dd MMMM yyyy")}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{event.location}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: event.status === "selesai" ? "#dcfce7" : "#dbeafe",
                        color: event.status === "selesai" ? "#166534" : "#1e40af",
                        border: event.status === "selesai" ? "1px solid #bbf7d0" : "1px solid #bfdbfe"
                      }}
                    >
                      {event.status === "akan datang" ? "Akan Datang" : event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/events/${event.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Delete Confirmation Dialog */}
      {selectedEvent && (
        <DeleteConfirmationDialog
          show={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Hapus Acara"
          description={`Apakah Anda yakin ingin menghapus "${selectedEvent.title}"? Tindakan ini tidak dapat dibatalkan.`}
        />
      )}
    </div>
  )
}
