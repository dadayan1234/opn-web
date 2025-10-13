"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, FileText } from "lucide-react"

// Simple Enhanced StatCard Component
function StatCard({ 
  title, 
  value, 
  description, 
  trend, 
  percentage, 
  icon: Icon, 
  isLoading, 
  className = ""
}) {
  return (
    <div className={`
      relative group
      bg-white/80 backdrop-blur-sm
      rounded-xl border border-gray-200/50
      p-6 
      transition-all duration-300 ease-out
      hover:shadow-lg hover:shadow-gray-200/50
      hover:border-gray-300/60
      hover:-translate-y-0.5
      ${className}
    `}>
      
      {/* Simple gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-lg bg-gray-50/80 group-hover:bg-white/90 transition-colors duration-300">
            <Icon className="w-5 h-5 text-gray-600 group-hover:text-gray-700 transition-colors duration-300" />
          </div>
          
          {/* Simple trend indicator */}
          {trend && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${trend === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {percentage > 0 && (
                <span className="text-xs text-gray-500 font-medium">{percentage}%</span>
              )}
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
            {title}
          </h3>
          
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-950 transition-colors duration-300">
                {value}
              </div>
              <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                {description}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function RealStats() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalPhotos: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)

        // Check if token exists in localStorage
        const token = localStorage.getItem('token')

        if (!token) {
          console.error("No authentication token found")
          // Redirect to login
          window.location.href = '/login'
          return
        }

        // apiClient will automatically use the token from localStorage

        try {
          // console.log("Fetching events for stats calculation...");

          // Make a direct fetch call with the updated API format
          const response = await fetch('https://beopn.pemudanambangan.site/api/v1/events/?page=1&limit=100', {
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
          // console.log('Raw API response for stats:', rawText.substring(0, 200) + '...');

          // Try to parse as JSON
          let responseData;
          try {
            responseData = JSON.parse(rawText);
            // console.log('Parsed events data for stats:',
              typeof responseData === 'object' ?
                (Array.isArray(responseData) ?
                  `Array with ${responseData.length} items` :
                  `Object with keys: ${Object.keys(responseData).join(', ')}`) :
                typeof responseData);
          } catch (parseError) {
            console.error('Failed to parse JSON response for stats:', parseError);
            throw new Error('Invalid JSON response from server');
          }

          // Handle the new response format with metadata
          let events = [];
          let paginationMeta = null;

          // console.log('Stats: Response structure:', Object.keys(responseData));

          // The new format should have data array and meta object
          if (responseData && typeof responseData === 'object') {
            // Check if the response has the expected structure
            if (Array.isArray(responseData)) {
              // If it's directly an array (old format)
              // console.log('Stats: Response is an array with', responseData.length, 'items (old format)');
              events = responseData;
            } else {
              // New format with data and meta
              if (Array.isArray(responseData.data)) {
                // console.log('Stats: Response has data array with', responseData.data.length, 'items');
                events = responseData.data;

                // Extract pagination metadata if available
                if (responseData.meta && typeof responseData.meta === 'object') {
                  paginationMeta = responseData.meta;
                  // console.log('Stats: Pagination metadata:', paginationMeta);

                  // If we have total_pages > 1, use the total count from metadata if available
                  if (paginationMeta.total_pages && paginationMeta.total_pages > 1) {
                    // console.log(`Stats: There are ${paginationMeta.total_pages} pages of events.`);

                    // If the API provides a total count, use it instead of just the current page
                    if (paginationMeta.total_count !== undefined) {
                      // console.log(`Stats: Using total_count from metadata: ${paginationMeta.total_count}`);
                      // We'll use this later when calculating stats
                    } else {
                      // console.log(`Stats: No total_count in metadata. Current stats are based on page 1 only.`);
                    }
                  }
                }
              } else {
                // If data is not an array, look for any array in the response
                // console.log('Stats: Looking for arrays in response object');
                const arrayProps = Object.entries(responseData)
                  .filter(([_, value]) => Array.isArray(value))
                  .map(([key, value]) => ({ key, length: (value as any[]).length }));

                // console.log('Stats: Found array properties:', arrayProps);

                if (arrayProps.length > 0) {
                  // Use the first array found
                  const firstArrayKey = arrayProps[0].key;
                  events = responseData[firstArrayKey];
                  // console.log(`Stats: Using array from property '${firstArrayKey}' with ${events.length} items`);
                } else {
                  // console.log('Stats: No arrays found in response');
                }
              }
            }
          }

          // Calculate stats from real data
          // Make sure we have an array before calculating stats
          if (!Array.isArray(events)) {
            console.error('Events data is not an array:', events)
            setStats({
              totalEvents: 0,
              activeEvents: 0,
              totalPhotos: 0
            })
            return
          }

          // Calculate total events - use metadata total_count if available
          let totalEvents = events.length;

          // If we have pagination metadata with total_count, use that instead
          if (paginationMeta && paginationMeta.total_count !== undefined) {
            totalEvents = paginationMeta.total_count;
            // console.log(`Stats: Using total count from metadata: ${totalEvents}`);
          }

          // Calculate active events (status "akan datang")
          const activeEvents = events.filter(e => e.status === "akan datang").length

          // Calculate total photos across all events
          // The API returns photos array for each event
          const totalPhotos = events.reduce((acc, e) => {
            // Check if photos property exists and is an array
            if (e.photos && Array.isArray(e.photos)) {
              return acc + e.photos.length
            }
            return acc
          }, 0)

          setStats({
            totalEvents,
            activeEvents,
            totalPhotos
          })

          // console.log('Fetched real stats:', { totalEvents, activeEvents, totalPhotos })
        } catch (error) {
          console.error('Error fetching stats:', error)

          // Handle authentication error
          if (error.response?.status === 401 || (error instanceof Error && error.message.includes('401'))) {
            console.error("Authentication error, redirecting to login")

            // Clear tokens
            localStorage.removeItem('token')
            localStorage.removeToken('refreshToken')

            // Redirect to login
            window.location.href = '/login'
            return
          }

          // For other errors, set stats to 0 values
          setStats({
            totalEvents: 0,
            activeEvents: 0,
            totalPhotos: 0
          })

          // Log detailed error information for debugging
          if (error.response) {
            console.error('API error response:', {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers
            })
          } else if (error.request) {
            console.error('No response received:', error.request)
          } else {
            console.error('Error setting up request:', error.message)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <StatCard
        title="Total Acara"
        value={stats.totalEvents.toString()}
        description="Total acara"
        trend="up"
        percentage={0}
        icon={Calendar}
        isLoading={isLoading}
        accentColor="blue"
        className="hover:bg-blue-50/40"
      />
      <StatCard
        title="Acara Aktif"
        value={stats.activeEvents.toString()}
        description="Acara mendatang"
        trend="up"
        percentage={0}
        icon={Users}
        isLoading={isLoading}
        accentColor="emerald"
        className="hover:bg-emerald-50/40"
      />
      <StatCard
        title="Total Foto"
        value={stats.totalPhotos.toString()}
        description="Foto acara"
        trend="up"
        percentage={0}
        icon={FileText}
        isLoading={isLoading}
        accentColor="orange"
        className="hover:bg-orange-50/40"
      />
    </>
  )
}