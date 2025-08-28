'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { CompactSearchBar } from '@/components/CompactSearchBar'
import { GoldenHourDisplay } from '@/components/GoldenHourDisplay'
import { TimeCards } from '@/components/TimeCards'
import { locationService } from '@/lib/locationService'
import { goldenHourService } from '@/lib/goldenHourService'
import { weatherService } from '@/lib/weatherService'
import { locationDatabase } from '@/lib/locationDatabase'
import { generateSEOFriendlyURL, formatDateForURL, parseDateFromURL } from '@/lib/urlUtils'
import type { LocationData, GoldenHourData, WeatherData } from '@/types'

// Dynamic imports for performance
const EnhancedInteractiveMap = dynamic(() => import('@/components/EnhancedInteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
})

const PhotographyCalendar = dynamic(() => import('@/components/PhotographyCalendar'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

const AdvancedPhotographyFeatures = dynamic(() => import('@/components/AdvancedPhotographyFeatures'), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />,
})

const PhotographyInspiration = dynamic(() => import('@/components/PhotographyInspiration'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

interface GoldenHourCalculatorProps {
  searchParams?: {
    lat?: string
    lng?: string
    location?: string
    date?: string
  }
}

export default function GoldenHourCalculator({ searchParams }: GoldenHourCalculatorProps) {
  const router = useRouter()
  const propSearchParams = searchParams
  const clientSearchParams = useSearchParams()
  
  // Get URL parameters from either prop or client-side
  const lat = propSearchParams?.lat || clientSearchParams?.get('lat')
  const lng = propSearchParams?.lng || clientSearchParams?.get('lng')
  const locationName = propSearchParams?.location || clientSearchParams?.get('location')
  const dateParam = propSearchParams?.date || clientSearchParams?.get('date')

  // State management
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [goldenHourData, setGoldenHourData] = useState<GoldenHourData | null>(null)
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [autoDetecting, setAutoDetecting] = useState(false)
  const [autoLocation, setAutoLocation] = useState<LocationData | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  // Mark component as mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Service worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  const calculateNextGoldenHour = useCallback(
    async (locationData: LocationData, shouldUpdateURL = true) => {
      if (!locationData || !locationData.lat || !locationData.lon) {
        console.error('Invalid location data for golden hour calculation:', locationData)
        return
      }

      setLoading(true)
      setLocationError('')

      try {
        const data = await goldenHourService.calculateGoldenHour(
          Number(locationData.lat),
          Number(locationData.lon),
          date,
        )
        setGoldenHourData(data)
        
        // Fetch weather data
        await fetchWeatherData(locationData)
        
        // Update URL if requested
        if (shouldUpdateURL) {
          await updateURL(locationData, date)
        }
      } catch (error) {
        console.error('Error calculating golden hour:', error)
        setLocationError('Failed to calculate golden hour times')
      } finally {
        setLoading(false)
      }
    },
    [date],
  )

  // Process URL parameters on mount
  useEffect(() => {
    const processURLParameters = async () => {
      console.log('=== PROCESSING URL PARAMETERS ===');
      console.log('URL Parameters:', { lat, lng, locationName, dateParam });
      
      if (lat && lng) {
        console.log("Processing URL parameters for coordinates:", { lat, lng, locationName })
        const coordinates = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        }
        
        // Validate coordinates
        if (!isNaN(coordinates.lat) && !isNaN(coordinates.lng) && 
            Math.abs(coordinates.lat) <= 90 && Math.abs(coordinates.lng) <= 180) {
          
          let locationData: LocationData
          
          if (locationName) {
            // Use provided location name with coordinates
            locationData = {
              lat: coordinates.lat,
              lon: coordinates.lng,
              city: locationName,
              country: "",
              address: locationName,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          } else {
            // Try to reverse geocode the coordinates
            try {
              const reverseGeocodedLocation = await locationService.reverseGeocode(
                coordinates.lat,
                coordinates.lng
              )
              if (reverseGeocodedLocation) {
                locationData = reverseGeocodedLocation
              } else {
                // Fallback to coordinates
                locationData = {
                  lat: coordinates.lat,
                  lon: coordinates.lng,
                  city: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                  country: "",
                  address: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }
              }
            } catch (error) {
              console.error('Error reverse geocoding:', error)
              // Fallback to coordinates
              locationData = {
                lat: coordinates.lat,
                lon: coordinates.lng,
                city: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                country: "",
                address: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            }
          }
          
          if (!locationName) {
            // If no location name in URL, try to get it from coordinates
            try {
              const reverseGeocodedLocation = await locationService.reverseGeocode(
                coordinates.lat,
                coordinates.lng
              )
              if (reverseGeocodedLocation) {
                locationData = reverseGeocodedLocation
              } else {
                // Fallback to coordinates
                locationData = {
                  lat: coordinates.lat,
                  lon: coordinates.lng,
                  city: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                  country: "",
                  address: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }
              }
            } catch (error) {
              console.error('Error reverse geocoding:', error)
              // Fallback to coordinates
              locationData = {
                lat: coordinates.lat,
                lon: coordinates.lng,
                city: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                country: "",
                address: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            }
          } else {
            locationData = {
              lat: coordinates.lat,
              lon: coordinates.lng,
              city: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
              country: "",
              address: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
            setAutoLocation(locationData)
            setLocation(locationData.address)
            calculateNextGoldenHour(locationData, false)
          }
        }
      } else if (locationName && !lat && !lng) {
        console.log("Processing URL parameters for location name:", locationName)
        try {
          const geocodedLocation = await locationService.geocodeLocation(locationName)
          if (geocodedLocation) {
            console.log("Geocoded location:", geocodedLocation)
            setAutoLocation(geocodedLocation)
            setLocation(geocodedLocation.address || `${geocodedLocation.city}, ${geocodedLocation.country}`)
            calculateNextGoldenHour(geocodedLocation, false) // Don't update URL when processing URL parameters
          } else {
            console.log("Failed to geocode location:", locationName)
          }
        } catch (error) {
          console.error("Error geocoding location:", error)
        }
      } else {
        console.log("No valid URL parameters found")
      }

      if (dateParam) {
        const parsedDate = parseDateFromURL(dateParam)
        if (parsedDate) {
          setDate(dateParam)
        }
      }
    }

    processURLParameters()
  }, [lat, lng, locationName, dateParam, propSearchParams]) // Use specific values as dependencies

  useEffect(() => {
    // Only auto-detect if:
    // 1. No URL parameters are present (neither coordinates nor location name)
    // 2. We haven't already set a location
    // 3. Component is mounted
    const hasUrlParams = !!(lat && lng) || !!locationName
    
    console.log('=== AUTO-DETECT USEEFFECT TRIGGERED ===')
    console.log('Auto-detect useEffect conditions:', { 
      lat,
      lng,
      locationName,
      hasUrlParams, 
      autoLocation: !!autoLocation, 
      autoLocationValue: autoLocation,
      mounted,
      shouldAutoDetect: !hasUrlParams && !autoLocation && mounted
    })
    
    if (!hasUrlParams && !autoLocation && mounted) {
      console.log('✅ AUTO-DETECTING LOCATION...')
      autoDetectLocation()
    } else {
      console.log('❌ CONDITIONS NOT MET - Skipping auto-detection')
      console.log('Reasons:', {
        hasUrlParams: hasUrlParams ? 'URL params present' : null,
        hasAutoLocation: autoLocation ? 'Auto location already set' : null,
        notMounted: !mounted ? 'Component not mounted' : null
      })
    }
  }, [lat, lng, locationName, mounted, autoLocation]) // Include locationName in dependencies

  const updateURL = useCallback(
    async (locationData: any, selectedDate: string) => {
      if (locationData && typeof window !== "undefined") {
        const dateObj = selectedDate ? new Date(selectedDate) : new Date()
        
        // Get location name, prioritizing city over full address
        let locationName = locationData.city
        
        // If we don't have a proper city name or it's "Unknown City", try to find nearest city
        if (!locationName || locationName === "Unknown City" || locationName.includes("°")) {
          try {
            const nearestCity = await locationDatabase.findNearestCity(
              Number(locationData.lat),
              Number(locationData.lon || locationData.lng)
            )
            if (nearestCity) {
              locationName = nearestCity.name
              console.log('Using nearest city from database:', nearestCity.name)
            }
          } catch (error) {
            console.warn('Failed to find nearest city:', error)
          }
        }
        
        // Final fallback: if we still don't have a valid location name, use a generic one
        if (!locationName || locationName === "Unknown City" || locationName.includes("°")) {
          locationName = "Location"
          console.log('Using generic location name as final fallback')
        }
        
        const newURL = generateSEOFriendlyURL({
          lat: locationData.lat,
          lng: locationData.lon || locationData.lng,
          locationName,
          date: formatDateForURL(dateObj),
        })

        console.log('updateURL called:', { 
          currentPath: window.location.pathname, 
          newURL, 
          locationData,
          locationName,
          locationDataCity: locationData.city,
          locationDataAddress: locationData.address,
          inDynamicRoute: !!propSearchParams 
        })
        
        // Update URL without page reload
        if (window.location.pathname !== newURL) {
          console.log('Updating URL from', window.location.pathname, 'to', newURL)
          router.replace(newURL)
        }
      }
    },
    [router, propSearchParams],
  )

  const autoDetectLocation = useCallback(async () => {
    setAutoDetecting(true)
    setLocationError("")

    try {
      const locationData = await locationService.detectLocation()
      
      // Debug logging
      console.log('Location service returned:', locationData)
      console.log('lat type:', typeof locationData?.lat, 'value:', locationData?.lat)
      console.log('lon type:', typeof locationData?.lon, 'value:', locationData?.lon)
      
      // Validate location data before proceeding
      if (!locationData || 
          locationData.lat === null || locationData.lat === undefined || 
          locationData.lon === null || locationData.lon === undefined || 
          isNaN(Number(locationData.lat)) || isNaN(Number(locationData.lon)) ||
          Math.abs(Number(locationData.lat)) > 90 || Math.abs(Number(locationData.lon)) > 180) {
        console.warn('Invalid location data received, clearing cache and retrying:', locationData)
        console.warn('Validation details:', {
          hasLocationData: !!locationData,
          latNull: locationData?.lat === null,
          latUndefined: locationData?.lat === undefined,
          lonNull: locationData?.lon === null,
          lonUndefined: locationData?.lon === undefined,
          latNaN: isNaN(Number(locationData?.lat)),
          lonNaN: isNaN(Number(locationData?.lon)),
          latOutOfRange: Math.abs(Number(locationData?.lat)) > 90,
          lonOutOfRange: Math.abs(Number(locationData?.lon)) > 180
        })
        
        // Clear potentially corrupted cache and retry once
        locationService.clearCache()
        const retryLocationData = await locationService.detectLocation(true)
        
        if (!retryLocationData || 
            retryLocationData.lat === null || retryLocationData.lat === undefined || 
            retryLocationData.lon === null || retryLocationData.lon === undefined || 
            isNaN(Number(retryLocationData.lat)) || isNaN(Number(retryLocationData.lon)) ||
            Math.abs(Number(retryLocationData.lat)) > 90 || Math.abs(Number(retryLocationData.lon)) > 180) {
          console.error('Retry also failed, using fallback location')
          setLocationError("Unable to detect location automatically. Using default location.")
          return
        }
        
        console.log('Retry successful:', retryLocationData)
        setAutoLocation(retryLocationData)
        setLocation(retryLocationData.address || `${retryLocationData.city}, ${retryLocationData.country}`)
        calculateNextGoldenHour(retryLocationData, true)
        return
      }
      
      setAutoLocation(locationData)
      setLocation(locationData.address || `${locationData.city}, ${locationData.country}`)
      calculateNextGoldenHour(locationData, true)
    } catch (error) {
      console.error("Error detecting location:", error)
      setLocationError("Unable to detect location automatically. Please enter manually.")
    } finally {
      setAutoDetecting(false)
    }
  }, [])

  const fetchWeatherData = useCallback(async (locationData: LocationData) => {
    setWeatherLoading(true)
    try {
      // Validate coordinates before making API calls
      if (!locationData || 
          locationData.lat === null || locationData.lat === undefined || 
          locationData.lon === null || locationData.lon === undefined || 
          isNaN(Number(locationData.lat)) || isNaN(Number(locationData.lon)) ||
          Math.abs(Number(locationData.lat)) > 90 || Math.abs(Number(locationData.lon)) > 180) {
        console.warn('Invalid coordinates for weather data:', locationData)
        return
      }
      
      const weather = await weatherService.getWeatherData(
        Number(locationData.lat),
        Number(locationData.lon)
      )
      setWeatherData(weather)
    } catch (error) {
      console.error('Error fetching weather data:', error)
      // Don't set error state for weather as it's not critical
    } finally {
      setWeatherLoading(false)
    }
  }, [])

  const handleLocationSelect = useCallback(
    async (selectedLocation: LocationData) => {
      console.log('Location selected:', selectedLocation)
      
      // Validate the selected location
      if (!selectedLocation || 
          selectedLocation.lat === null || selectedLocation.lat === undefined || 
          selectedLocation.lon === null || selectedLocation.lon === undefined || 
          isNaN(Number(selectedLocation.lat)) || isNaN(Number(selectedLocation.lon)) ||
          Math.abs(Number(selectedLocation.lat)) > 90 || Math.abs(Number(selectedLocation.lon)) > 180) {
        console.error('Invalid location selected:', selectedLocation)
        setLocationError('Invalid location selected. Please try again.')
        return
      }
      
      setAutoLocation(selectedLocation)
      setLocation(selectedLocation.address || `${selectedLocation.city}, ${selectedLocation.country}`)
      await calculateNextGoldenHour(selectedLocation, true)
    },
    [calculateNextGoldenHour],
  )

  const handleDateChange = useCallback(
    async (newDate: string) => {
      setDate(newDate)
      if (autoLocation) {
        await calculateNextGoldenHour(autoLocation, true)
      }
    },
    [autoLocation, calculateNextGoldenHour],
  )

  const handleMapLocationSelect = useCallback(
    async (lat: number, lng: number) => {
      console.log('Map location selected:', { lat, lng })
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        console.error('Invalid coordinates from map:', { lat, lng })
        return
      }
      
      try {
        // Try to reverse geocode the coordinates
        const locationData = await locationService.reverseGeocode(lat, lng)
        if (locationData) {
          await handleLocationSelect(locationData)
        } else {
          // Fallback to coordinates
          const fallbackLocation: LocationData = {
            lat,
            lon: lng,
            city: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            country: '',
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
          await handleLocationSelect(fallbackLocation)
        }
      } catch (error) {
        console.error('Error processing map location:', error)
        // Fallback to coordinates
        const fallbackLocation: LocationData = {
          lat,
          lon: lng,
          city: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          country: '',
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
        await handleLocationSelect(fallbackLocation)
      }
    },
    [handleLocationSelect],
  )

  // Memoized components for performance
  const memoizedSearchBar = useMemo(
    () => (
      <CompactSearchBar
        onLocationSelect={handleLocationSelect}
        onAutoDetect={autoDetectLocation}
        isAutoDetecting={autoDetecting}
        currentLocation={location}
        error={locationError}
      />
    ),
    [handleLocationSelect, autoDetectLocation, autoDetecting, location, locationError],
  )

  const memoizedGoldenHourDisplay = useMemo(
    () => (
      <GoldenHourDisplay
        data={goldenHourData}
        loading={loading}
        location={autoLocation}
        date={date}
        onDateChange={handleDateChange}
        weatherData={weatherData}
        weatherLoading={weatherLoading}
        currentTime={currentTime}
      />
    ),
    [goldenHourData, loading, autoLocation, date, handleDateChange, weatherData, weatherLoading, currentTime],
  )

  const memoizedTimeCards = useMemo(
    () => (
      <TimeCards
        data={goldenHourData}
        loading={loading}
        weatherData={weatherData}
        currentTime={currentTime}
      />
    ),
    [goldenHourData, loading, weatherData, currentTime],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            Golden Hour Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the perfect lighting for your photography with precise golden hour, blue hour, and sunrise/sunset times.
          </p>
        </div>

        {/* Search Bar */}
        {memoizedSearchBar}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Golden Hour Display */}
          <div className="space-y-6">
            {memoizedGoldenHourDisplay}
            {memoizedTimeCards}
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <EnhancedInteractiveMap
              location={autoLocation}
              onLocationSelect={handleMapLocationSelect}
              goldenHourData={goldenHourData}
              date={date}
            />
          </div>
        </div>

        {/* Calendar */}
        <PhotographyCalendar
          location={autoLocation}
          selectedDate={date}
          onDateSelect={handleDateChange}
        />

        {/* Advanced Features */}
        <AdvancedPhotographyFeatures
          location={autoLocation}
          goldenHourData={goldenHourData}
          weatherData={weatherData}
          date={date}
        />

        {/* Photography Inspiration */}
        <PhotographyInspiration location={autoLocation} />
      </div>
    </div>
  )
}
