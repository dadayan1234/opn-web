"use client"

import { useCallback, useState } from "react"
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import axios from "axios"
// Corrected type imports: Removed PaginatedResponse, replaced Attendee with EventAttendance
// Added missing AttendanceFormData import
import { eventApi, memberApi, type Event, type EventFormData, type EventAttendance, type AttendanceFormData, extractErrorMessage } from "@/lib/api-service" // Updated path
import { useToast } from "@/components/ui/use-toast"
import { getSavedAttendanceData } from "@/utils/attendance-utils"

// Query keys
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: number | string) => [...eventKeys.details(), id] as const,
  attendance: (eventId: number | string) => [...eventKeys.detail(eventId), "attendance"] as const,
}

// Define pagination metadata interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total_count?: number;
  total_pages: number;
}

// Define events response interface with pagination
export interface EventsResponse {
  data: Event[];
  meta: PaginationMeta;
}

// Hook for fetching events with pagination and improved error handling
export function useEvents(
  page = 1,
  limit = 10,
  options?: Omit<UseQueryOptions<Event[], Error>, 'queryKey' | 'queryFn'>
) {
  const { toast } = useToast()
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)

  const query = useQuery<Event[], Error>({
    queryKey: eventKeys.list({ page, limit }),
    queryFn: async ({ signal }) => {
      try {
        console.log('Fetching events with page:', page, 'limit:', limit)
        const events = await eventApi.getEvents(page, limit, signal)

        // Check if we have pagination metadata in the response
        // This is handled in the API service now, but we can still access it
        // through the raw response if needed

        return events
      } catch (error) {
        console.error('Error fetching events:', error)

        // Show a toast notification for network errors
        if (axios.isAxiosError(error) && !error.response) {
          toast({
            title: "Kesalahan Jaringan",
            description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
            variant: "destructive",
          })
        }

        // Return empty array for certain errors to prevent UI from breaking
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return []
        }

        // Rethrow the error to be handled by the component
        throw error
      }
    },
    // Type error as unknown for proper type guarding
    retry: (failureCount, error: unknown) => {
      // Don't retry if the request was canceled
      if (axios.isCancel(error)) {
        return false
      }
      // Don't retry 404 errors
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      // Otherwise retry once
      return failureCount < 1
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    ...options,
  })

  return query
}

// Hook for searching events with improved error handling
export function useSearchEvents(
  searchParams: {
    keyword?: string
    date?: string
    time?: string
    status?: "akan datang" | "selesai" | string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  },
  options?: Omit<UseQueryOptions<Event[], Error>, 'queryKey' | 'queryFn'>
) {
  const { toast } = useToast()
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)

  const query = useQuery<Event[], Error>({
    queryKey: eventKeys.list(searchParams),
    queryFn: async ({ signal }) => {
      try {
        console.log('Searching events with params:', searchParams)
        const events = await eventApi.searchEvents({
          ...searchParams,
          page: searchParams.page || 1,
          limit: searchParams.limit || 10
        }, signal)

        return events
      } catch (error) {
        console.error('Error searching events:', error)

        // Show a toast notification for network errors
        if (axios.isAxiosError(error) && !error.response) {
          toast({
            title: "Kesalahan Jaringan",
            description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
            variant: "destructive",
          })
        }

        // Return empty array for certain errors to prevent UI from breaking
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return []
        }

        // Rethrow the error to be handled by the component
        throw error
      }
    },
    enabled: Object.values(searchParams).some((value) => !!value),
    // Type error as unknown for proper type guarding
    retry: (failureCount, error: unknown) => {
      // Don't retry if the request was canceled
      if (axios.isCancel(error)) {
        return false
      }
      // Don't retry 404 errors
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      // Otherwise retry once
      return failureCount < 1
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    ...options,
  })

  return query
}

// Hook for fetching a single event with improved error handling
export function useEvent(id: number | string, options?: UseQueryOptions<Event>) {
  const { toast } = useToast()

  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async ({ signal }) => {
      try {
        console.log('Fetching event with ID:', id)
        return await eventApi.getEvent(id, signal)
      } catch (error) {
        console.error(`Error fetching event with ID ${id}:`, error)

        // Show a toast notification for network errors
        if (axios.isAxiosError(error)) {
          if (!error.response) {
            toast({
              title: "Kesalahan Jaringan",
              description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
              variant: "destructive",
            })
          } else if (error.response.status === 404) {
            toast({
              title: "Acara Tidak Ditemukan",
              description: `Acara dengan ID ${id} tidak ditemukan.`,
              variant: "destructive",
            })
          } else if (error.response.status === 401) {
            toast({
              title: "Akses Ditolak",
              description: "Anda perlu login untuk melihat acara ini.",
              variant: "destructive",
            })
          } else if (error.response.status === 403) {
            toast({
              title: "Akses Ditolak",
              description: "Anda tidak memiliki izin untuk melihat acara ini.",
              variant: "destructive",
            })
          } else if (error.response.status >= 500) {
            toast({
              title: "Kesalahan Server",
              description: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
              variant: "destructive",
            })
          }
        }

        // Rethrow the error to be handled by the component
        throw error
      }
    },
    // Type error as unknown for proper type guarding
    retry: (failureCount, error: unknown) => {
      // Don't retry if the request was canceled
      if (axios.isCancel(error)) {
        return false
      }
      // Don't retry 404 errors
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      // Otherwise retry up to 2 times
      return failureCount < 2
    },
    ...options,
  })
}

// Hook for fetching event attendance with improved error handling
export function useEventAttendance(
  eventId: number | string,
  // Use EventAttendance type here
  options?: Omit<UseQueryOptions<EventAttendance[], Error, EventAttendance[]>, 'queryKey' | 'queryFn'>
) {
  // No need for toast here as we're handling errors silently

  // Use EventAttendance type here
  return useQuery<EventAttendance[], Error>({
    queryKey: eventKeys.attendance(eventId),
    queryFn: async ({ signal }) => {
      try {
        console.log('Fetching attendance for event ID:', eventId)

        // Try to get attendance data from localStorage first using our utility function
        if (typeof window !== 'undefined') {
          try {
            // Get saved attendance data using our utility function
            const savedAttendanceData = getSavedAttendanceData(eventId);
            console.log(`[useEventAttendance] Loaded ${savedAttendanceData.length} saved attendance records from localStorage:`, savedAttendanceData);

            // Always fetch members data to ensure we have the latest member information
            try {
              // Get members data from the API
              const membersResponse = await memberApi.getMembers();
              console.log('[useEventAttendance] Fetched members data:', membersResponse);

              // Create a flat array of all members with their division
              const allMembers: Record<number, { name: string, division: string }> = {};
              Object.entries(membersResponse).forEach(([division, members]) => {
                members.forEach(member => {
                  if (member.id) {
                    // Always use the full name, never use the fallback format
                    allMembers[member.id] = {
                      name: member.full_name || "Tidak ada nama",
                      division: division
                    };
                  }
                });
              });

              // If we have saved attendance data, use it with the member names
              if (savedAttendanceData.length > 0) {
                // Convert the localStorage data to the expected EventAttendance format with actual names
                return savedAttendanceData.map(item => ({
                  id: item.member_id, // Use member_id as id for simplicity
                  event_id: Number(eventId),
                  member_id: item.member_id,
                  member_name: allMembers[item.member_id]?.name || "Tidak ada nama",
                  division: allMembers[item.member_id]?.division || "",
                  status: item.status,
                  notes: item.notes || "",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }));
              } else {
                // If no saved attendance data, try to fetch from API
                try {
                  // The API service will now handle all errors and return an empty array
                  // instead of throwing errors
                  const result = await eventApi.getEventAttendance(eventId, signal);

                  if (result.length > 0) {
                    // If we got attendance data from the API, return it
                    return result;
                  } else {
                    // If no attendance data from API, create default records for all members
                    console.log('[useEventAttendance] No attendance data from API, creating default records for all members');

                    // Create attendance records for all members with default values
                    const defaultAttendance: EventAttendance[] = [];
                    Object.entries(membersResponse).forEach(([division, members]) => {
                      members.forEach(member => {
                        if (member.id) {
                          defaultAttendance.push({
                            id: member.id, // Use member ID as temporary attendance record ID
                            event_id: Number(eventId),
                            member_id: member.id,
                            member_name: member.full_name || "Tidak ada nama",
                            division: division,
                            status: "Hadir", // Default status
                            notes: "",
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                          });
                        }
                      });
                    });

                    return defaultAttendance;
                  }
                } catch (apiError) {
                  console.error(`[useEventAttendance] Error fetching attendance from API for event ID ${eventId}:`, apiError);

                  // Create attendance records for all members with default values
                  const defaultAttendance: EventAttendance[] = [];
                  Object.entries(membersResponse).forEach(([division, members]) => {
                    members.forEach(member => {
                      if (member.id) {
                        defaultAttendance.push({
                          id: member.id, // Use member ID as temporary attendance record ID
                          event_id: Number(eventId),
                          member_id: member.id,
                          member_name: member.full_name || "Tidak ada nama",
                          division: division,
                          status: "Hadir", // Default status
                          notes: "",
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        });
                      }
                    });
                  });

                  return defaultAttendance;
                }
              }
            } catch (membersError) {
              console.error("[useEventAttendance] Error fetching members data:", membersError);

              // If we can't get members data but have saved attendance data, use generic names
              if (savedAttendanceData.length > 0) {
                return savedAttendanceData.map(item => ({
                  id: item.member_id,
                  event_id: Number(eventId),
                  member_id: item.member_id,
                  member_name: "Tidak ada nama", // Use a generic name
                  division: "",
                  status: item.status,
                  notes: item.notes || "",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }));
              }

              // If we can't get members data and don't have saved attendance data, try API
              try {
                const result = await eventApi.getEventAttendance(eventId, signal);
                return result;
              } catch (apiError) {
                console.error(`[useEventAttendance] Error fetching attendance from API after members error:`, apiError);
                return [];
              }
            }
          } catch (storageError) {
            console.error("[useEventAttendance] Error loading saved attendance data:", storageError);

            // Try to fetch from API as fallback
            try {
              const result = await eventApi.getEventAttendance(eventId, signal);
              return result;
            } catch (apiError) {
              console.error(`[useEventAttendance] Error fetching attendance from API after storage error:`, apiError);
              return [];
            }
          }
        } else {
          // If we're in a server-side environment, just try the API
          try {
            const result = await eventApi.getEventAttendance(eventId, signal);
            return result;
          } catch (apiError) {
            console.error(`[useEventAttendance] Error fetching attendance from API in server environment:`, apiError);
            return [];
          }
        }
      } catch (error) {
        console.error(`[useEventAttendance] Error in main try block:`, error);
        return [];
      }
    },
    // Type error as unknown for proper type guarding
    retry: (failureCount, error: unknown) => {
      // Don't retry if the request was canceled
      if (axios.isCancel(error)) {
        return false
      }
      // Don't retry 404 errors
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      // Don't retry 500+ server errors
      if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 500) {
        return false
      }
      // Otherwise retry up to 2 times
      return failureCount < 2
    },
    // Set a reasonable staleTime to prevent too frequent refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Always return empty array instead of undefined when there's an error
    placeholderData: [],
    ...options,
  })
}

// Hook for attendance mutations
export function useAttendanceMutations(eventId: number | string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const createOrUpdateAttendance = useMutation({
    mutationFn: async (attendanceData: AttendanceFormData[]) => {
      console.log(`[useAttendanceMutations] Saving attendance for event ${eventId}:`, attendanceData);

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token tidak tersedia. Silakan login kembali.")
      }

      const url = `https://beopn.penaku.site/api/v1/events/${eventId}/attendance`

      // Kirim satu per satu
      for (const record of attendanceData) {
        const payload = [{
          member_id: record.member_id,
          status: record.status || "Hadir",
          notes: record.notes || ""
        }]

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const text = await res.text().catch(() => "")
          console.error(`Gagal update attendance untuk member ${record.member_id}`, text)
          throw new Error(`Gagal update kehadiran untuk member ${record.member_id}`)
        }
      }

      return true
    },
    onSuccess: () => {
      console.log(`[useAttendanceMutations] Successfully saved attendance for event ${eventId}`);

      // Invalidate agar daftar kehadiran diperbarui
      queryClient.invalidateQueries({ queryKey: eventKeys.attendance(eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })

      toast({
        title: "Berhasil",
        description: "Data kehadiran berhasil disimpan",
      })
    },
    onError: (error) => {
      console.error(`[useAttendanceMutations] Error saving attendance for event ${eventId}:`, error);

      let errorMessage = "Terjadi kesalahan saat menyimpan data kehadiran";
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Gagal",
        description: errorMessage,
        variant: "destructive",
      })
    }
  })

  return { createOrUpdateAttendance }
}


// Hook for creating, updating, and deleting events
export function useEventMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // CREATE
  const createEvent = useMutation({
    mutationFn: async (data: EventFormData) => {
      console.log('Creating event with data:', data)
      return await eventApi.createEvent(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      // queryClient.invalidateQueries({ queryKey: eventKeys.search() }) // refresh pencarian juga
      toast({
        title: "Berhasil",
        description: "Acara berhasil dibuat",
      })
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error)
      toast({
        title: "Gagal Membuat Acara",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // UPDATE
  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<EventFormData> }) => {
      console.log('Updating event:', { id, data })
      return await eventApi.updateEvent(id, data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      // queryClient.invalidateQueries({ queryKey: eventKeys.search() })
      toast({
        title: "Berhasil",
        description: "Acara berhasil diperbarui",
      })
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error)
      toast({
        title: "Gagal Memperbarui Acara",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // DELETE (dengan optimistic update)
  const deleteEvent = useMutation({
    mutationFn: async (id: number | string) => {
      console.log('Deleting event with ID:', id)
      return await eventApi.deleteEvent(id)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() })

      const previousEvents = queryClient.getQueryData(eventKeys.lists())

      queryClient.setQueryData(eventKeys.lists(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((event: Event) => event.id !== id),
        }
      })

      return { previousEvents }
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Acara berhasil dihapus",
      })
    },
    onError: (error, _, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(eventKeys.lists(), context.previousEvents)
      }
      const errorMessage = extractErrorMessage(error)
      toast({
        title: "Gagal Menghapus Acara",
        description: errorMessage,
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      // queryClient.invalidateQueries({ queryKey: eventKeys.search() })
    },
  })

  // Upload photos mutation
  const uploadPhotos = useMutation({
    mutationFn: ({
      eventId,
      files,
      onProgress,
    }: {
      eventId: number | string
      files: File[]
      onProgress?: (percentage: number) => void
    }) => {
      // Log the event ID for debugging
      console.log('[useEvents] uploadPhotos mutation called with eventId:', eventId, 'Type:', typeof eventId)

      // Ensure eventId is a valid number
      const numericEventId = Number(eventId)
      console.log('[useEvents] Converted event ID:', numericEventId, 'isNaN:', isNaN(numericEventId))

      if (isNaN(numericEventId) || numericEventId <= 0) {
        console.error('[useEvents] Invalid event ID (not a valid positive number):', eventId)
        throw new Error('ID acara tidak valid. Silakan coba lagi atau muat ulang halaman.')
      }

      // Call the API with the validated numeric event ID
      return eventApi.uploadEventPhotos(numericEventId, files, onProgress)
    },
    onSuccess: (_, { eventId }) => {
      console.log('[useEvents] Upload photos success for event ID:', eventId)
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      toast({
        title: "Berhasil",
        description: "Foto berhasil diunggah",
      })
    },
    onError: (error) => {
      console.error('[useEvents] Upload photos error:', error)
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    uploadPhotos,
  }
}

// Hook for optimistic event operations
export function useOptimisticEvent(eventId: number | string) {
  const queryClient = useQueryClient()
  const [isOptimistic, setIsOptimistic] = useState(false)

  // Get the current event data
  const currentEvent = queryClient.getQueryData<Event>(eventKeys.detail(eventId))

  // Optimistically update the event
  const optimisticallyUpdateEvent = useCallback(
    (updatedFields: Partial<Event>) => {
      if (!currentEvent) return

      setIsOptimistic(true)

      // Update the event in the cache
      queryClient.setQueryData(eventKeys.detail(eventId), {
        ...currentEvent,
        ...updatedFields,
        // Mark as optimistic update
        _optimistic: true,
      })

      return () => {
        // Revert function
        queryClient.setQueryData(eventKeys.detail(eventId), currentEvent)
        setIsOptimistic(false)
      }
    },
    [currentEvent, eventId, queryClient],
  )

  return {
    isOptimistic,
    optimisticallyUpdateEvent,
  }
}
