"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type { Event } from "@/lib/api-service" // Updated path
import { format, parse, isValid } from "date-fns"

interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  location: string
  status?: 'akan datang' | 'selesai'
  minutes?: string
}

interface EventFormProps {
  event?: Event
  isEditing?: boolean
  onSuccess?: () => void
}

export function EventFormClient({ event, isEditing = false, onSuccess }: EventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "08:00",
    location: "",
    status: "akan datang",
    minutes: ""
  })

  // Attendees state - will be fetched from API
  const [attendees, setAttendees] = useState<any[]>([])
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true)

  // Fetch attendance data when editing an existing event
  useEffect(() => {
    if (isEditing && event?.id) {
      setIsLoadingAttendance(true)
      // Import the API client dynamically to avoid issues
      import('@/lib/api-service').then(({ eventApi, memberApi }) => { // Updated path
        // First get all members to have their names
        memberApi.getMembers()
          .then(membersData => {
            // Create a flat array of all members with their division
            const allMembers: {id: number, name: string, division: string}[] = [];
            Object.entries(membersData).forEach(([division, members]) => {
              members.forEach(member => {
                allMembers.push({
                  id: member.id,
                  name: member.full_name,
                  division: division
                });
              });
            });

            // Now get attendance data and merge with member data
            eventApi.getEventAttendance(event.id)
              .then(attendanceData => {
                console.log('Fetched attendance data:', attendanceData);

                // Check if attendanceData is an array before using map
                if (Array.isArray(attendanceData) && attendanceData.length > 0) {
                  // Enhance attendance data with member names and divisions
                  const enhancedAttendees = attendanceData.map(attendance => {
                    const member = allMembers.find(m => m.id === attendance.member_id);
                    return {
                      ...attendance,
                      name: member?.name || 'Anggota',
                      division: member?.division || 'Tidak diketahui'
                    };
                  });
                  setAttendees(enhancedAttendees);
                } else {
                  // If no attendance data, create default entries for all members
                  console.log('No attendance data found, creating default entries for all members');
                  const defaultAttendees = allMembers.map(member => ({
                    id: Date.now() + member.id, // Generate a temporary ID
                    event_id: Number(event.id),
                    member_id: member.id,
                    name: member.name,
                    division: member.division,
                    status: 'Hadir',
                    notes: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }));
                  setAttendees(defaultAttendees);
                }
              })
              .catch(error => {
                console.error('Error fetching attendance data:', error);
                // If error fetching attendance, still show all members with default status
                const defaultAttendees = allMembers.map(member => ({
                  id: Date.now() + member.id, // Generate a temporary ID
                  event_id: Number(event.id),
                  member_id: member.id,
                  name: member.name,
                  division: member.division,
                  status: 'Hadir',
                  notes: '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }));
                setAttendees(defaultAttendees);
              })
              .finally(() => {
                setIsLoadingAttendance(false);
              });
          })
          .catch(error => {
            console.error('Error fetching members data:', error);
            setIsLoadingAttendance(false);
            setAttendees([]);
          });
      });
    } else {
      // For new events, start with empty attendance list
      setAttendees([]);
      setIsLoadingAttendance(false);
    }
  }, [isEditing, event?.id])

  // Initialize form with event data if editing
  useEffect(() => {
    if (event && isEditing) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date || format(new Date(), "yyyy-MM-dd"),
        time: event.time || "08:00",
        location: event.location || "",
        status: event.status as 'akan datang' | 'selesai' || "akan datang",
        minutes: event.minutes || ""
      })
    }
  }, [event, isEditing])

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Judul acara harus diisi"
    }

    if (!formData.date) {
      newErrors.date = "Tanggal acara harus diisi"
    } else {
      try {
        // Validate date format
        const parsedDate = parse(formData.date, "yyyy-MM-dd", new Date())
        if (!isValid(parsedDate)) {
          newErrors.date = "Format tanggal tidak valid"
        }
      } catch (error) {
        newErrors.date = "Format tanggal tidak valid"
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Lokasi acara harus diisi"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      // Format the data for the API
      const eventData = {
        ...formData,
        // Ensure date is in YYYY-MM-DD format
        date: formData.date,
        // Ensure time is in HH:MM format
        time: formData.time,
        // Ensure status is lowercase and valid
        status: (formData.status || 'akan datang').toLowerCase()
      }

      // Log the exact format of date and time for debugging
      console.log('Date format:', eventData.date, 'Time format:', eventData.time)

      console.log("Submitting event data:", JSON.stringify(eventData, null, 2))

      // Use the API client to create or update the event
      const apiModule = await import('@/lib/api-service') // Updated path
      const { eventApi } = apiModule

      let result
      if (isEditing && event?.id) {
        // Update existing event
        result = await eventApi.updateEvent(event.id, eventData)
      } else {
        // Create new event
        try {
          result = await eventApi.createEvent(eventData)
        } catch (createError: any) {
          console.error("Error creating event:", createError)

          // Check for validation errors (422 status)
          if (createError.response && createError.response.status === 422) {
            const validationErrors = createError.response.data?.errors || createError.response.data?.message || 'Validation failed'
            throw new Error(`Validation error: ${typeof validationErrors === 'string' ? validationErrors : JSON.stringify(validationErrors)}`)
          }

          // Re-throw other errors
          throw createError
        }
      }

      console.log("API response:", result)

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Redirect to the event detail page
      router.push(`/dashboard/events/${result.id}`)
    } catch (error: any) {
      console.error("Error submitting form:", error)

      // Extract meaningful error message
      let errorMsg = "An error occurred while saving the event"

      if (error instanceof Error) {
        errorMsg = error.message
      } else if (error.response) {
        // Handle Axios error responses
        const responseData = error.response.data
        console.log('Error response data:', JSON.stringify(responseData, null, 2))

        if (responseData.message) {
          errorMsg = responseData.message
        } else if (responseData.detail) {
          // Handle FastAPI validation errors
          if (Array.isArray(responseData.detail)) {
            errorMsg = responseData.detail.map((err: any) => {
              // Extract field name from location path
              const field = err.loc && err.loc.length > 1 ? err.loc.slice(1).join('.') : 'unknown field'
              return `${field}: ${err.msg}`
            }).join('\n')

            // Log the full error details for debugging
            console.log('Validation errors:', responseData.detail)
          } else {
            errorMsg = responseData.detail
          }
        } else if (responseData.errors) {
          // Format validation errors
          const validationErrors = responseData.errors
          errorMsg = Object.entries(validationErrors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ')
        }
      }

      setErrorMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full border-gray-300 rounded-md shadow-sm ${errors.title ? "border-red-500" : ""}`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-500 mt-1">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full border-gray-300 rounded-md shadow-sm ${errors.date ? "border-red-500" : ""}`}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-error" : undefined}
              />
              {errors.date && (
                <p id="date-error" className="text-sm text-red-500 mt-1">
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full border-gray-300 rounded-md shadow-sm ${errors.location ? "border-red-500" : ""}`}
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? "location-error" : undefined}
            />
            {errors.location && (
              <p id="location-error" className="text-sm text-red-500 mt-1">
                {errors.location}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</Label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 pr-8 appearance-none"
              >
                <option value="akan datang">Akan Datang</option>
                <option value="selesai">Selesai</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? "Update Event" : "Create Event"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
