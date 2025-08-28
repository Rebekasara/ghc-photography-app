// Raw OpenWeatherMap API response structure
interface OpenWeatherMapResponse {
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  visibility: number
  uvi?: number
  name: string
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  alerts?: any[]
}

interface WeatherForecast {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  clouds: {
    all: number
  }
  wind: {
    speed: number
    deg: number
  }
  visibility: number
  pop: number
  dt_txt: string
}

interface WeatherResponse {
  current: OpenWeatherMapResponse
  forecast: WeatherForecast[]
  alerts?: any[]
}

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5"

if (!WEATHER_API_KEY) {
  console.error('NEXT_PUBLIC_OPENWEATHER_API_KEY environment variable is not set')
}

class WeatherService {
  private cache = new Map<string, { data: WeatherResponse; timestamp: number }>()
  private CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  private generateCacheKey(lat: number, lon: number): string {
    // Ensure lat and lon are valid numbers before calling toFixed
    const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 0
    const safeLon = typeof lon === 'number' && !isNaN(lon) ? lon : 0
    return `${safeLat.toFixed(4)}_${safeLon.toFixed(4)}`
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GoldenHourCalculator/1.0'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        if (i === retries - 1) {
          throw error
        }
        console.warn(`Weather API retry ${i + 1} failed:`, error)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherResponse> {
    console.log('🌤️ WeatherService: getWeatherData called with coordinates:', { lat, lon })
    
    // Check if API key is available
    if (!WEATHER_API_KEY) {
      console.error('🌤️ WeatherService: API key not configured')
      throw new Error('Weather API key is not configured')
    }
    
    console.log('🌤️ WeatherService: API key available:', WEATHER_API_KEY ? 'Yes' : 'No')
    
    // Validate coordinates
    if (typeof lat !== 'number' || isNaN(lat) || typeof lon !== 'number' || isNaN(lon)) {
      console.error('🌤️ WeatherService: Invalid coordinates:', { lat, lon })
      throw new Error('Invalid coordinates provided')
    }
    
    const cacheKey = this.generateCacheKey(lat, lon)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log('🌤️ WeatherService: Using cached data for:', cacheKey)
      return cached.data
    }

    try {
      console.log('🌤️ WeatherService: Making API calls to OpenWeatherMap...')
      
      // Fetch current weather and 5-day forecast
      const [currentWeather, forecast] = await Promise.all([
        this.fetchWithRetry(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`),
        this.fetchWithRetry(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&cnt=40`)
      ])

      console.log('🌤️ WeatherService: API response received:', {
        currentTemp: currentWeather?.main?.temp,
        currentCondition: currentWeather?.weather?.[0]?.description,
        forecastCount: forecast?.list?.length
      })

      // Process and combine the data
      const weatherResponse: WeatherResponse = {
        current: currentWeather,
        forecast: forecast.list,
        alerts: currentWeather.alerts
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: weatherResponse,
        timestamp: Date.now()
      })

      console.log('🌤️ WeatherService: Data cached successfully')
      return weatherResponse
    } catch (error) {
      console.error('🌤️ WeatherService: Error fetching weather data:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  async getWeatherConditions(lat: number, lon: number): Promise<{
    temp: number
    condition: string
    description: string
    clouds: number
    visibility: number
    humidity: number
    windSpeed: number
    uvIndex: number
    sunrise: Date
    sunset: Date
  }> {
    try {
      console.log('🌤️ WeatherService: getWeatherConditions called with coordinates:', { lat, lon })
      
      // Check if API key is available
      if (!WEATHER_API_KEY) {
        throw new Error('Weather API key is not configured')
      }
      
      // Validate coordinates
      if (typeof lat !== 'number' || isNaN(lat) || typeof lon !== 'number' || isNaN(lon)) {
        throw new Error('Invalid coordinates provided')
      }
      
      const weather = await this.getWeatherData(lat, lon)
      const current = weather.current

      console.log('🌤️ WeatherService: Raw weather data:', {
        temp: current.main?.temp,
        condition: current.weather?.[0]?.main,
        description: current.weather?.[0]?.description,
        clouds: current.clouds?.all,
        visibility: current.visibility,
        humidity: current.main?.humidity,
        windSpeed: current.wind?.speed,
        uvIndex: current.uvi
      })

      const processedData = {
        temp: Math.round(current.main?.temp || 0),
        condition: current.weather?.[0]?.main || 'Unknown',
        description: current.weather?.[0]?.description || 'No description',
        clouds: current.clouds?.all || 0,
        visibility: (current.visibility || 0) / 1000, // Convert to km
        humidity: current.main?.humidity || 0,
        windSpeed: current.wind?.speed || 0,
        uvIndex: current.uvi || 0,
        sunrise: new Date((current.sys?.sunrise || 0) * 1000),
        sunset: new Date((current.sys?.sunset || 0) * 1000)
      }

      console.log('🌤️ WeatherService: Processed weather conditions:', processedData)
      return processedData
    } catch (error) {
      console.error('🌤️ WeatherService: Error getting weather conditions:', error)
      throw new Error('Failed to get weather conditions')
    }
  }

  async getPhotographyConditions(lat: number, lon: number): Promise<{
    goldenHourQuality: 'excellent' | 'good' | 'fair' | 'poor'
    blueHourQuality: 'excellent' | 'good' | 'fair' | 'poor'
    overallScore: number
    recommendations: string[]
  }> {
    try {
      const conditions = await this.getWeatherConditions(lat, lon)
      
      let goldenHourScore = 100
      let blueHourScore = 100
      const recommendations: string[] = []

      // Cloud cover assessment
      if (conditions.clouds > 75) {
        goldenHourScore -= 40
        blueHourScore -= 30
        recommendations.push("Heavy cloud cover may reduce golden hour intensity")
      } else if (conditions.clouds > 50) {
        goldenHourScore -= 20
        blueHourScore -= 15
        recommendations.push("Moderate clouds may create interesting sky patterns")
      } else if (conditions.clouds > 25) {
        goldenHourScore -= 10
        blueHourScore -= 5
        recommendations.push("Light cloud cover can enhance golden hour colors")
      }

      // Visibility assessment
      if (conditions.visibility < 5) {
        goldenHourScore -= 30
        blueHourScore -= 25
        recommendations.push("Poor visibility may affect image clarity")
      } else if (conditions.visibility < 10) {
        goldenHourScore -= 15
        blueHourScore -= 10
        recommendations.push("Reduced visibility may impact distant subjects")
      }

      // Wind assessment
      if (conditions.windSpeed > 15) {
        goldenHourScore -= 20
        blueHourScore -= 15
        recommendations.push("Strong winds may cause camera shake")
      } else if (conditions.windSpeed > 8) {
        goldenHourScore -= 10
        blueHourScore -= 5
        recommendations.push("Moderate winds - consider using tripod")
      }

      // Humidity assessment
      if (conditions.humidity > 80) {
        goldenHourScore -= 15
        blueHourScore -= 10
        recommendations.push("High humidity may cause haze")
      } else if (conditions.humidity > 60) {
        goldenHourScore -= 5
        blueHourScore -= 5
        recommendations.push("Moderate humidity may add atmospheric effect")
      }

      // Weather condition assessment
      const condition = conditions.condition.toLowerCase()
      if (condition.includes('rain') || condition.includes('drizzle')) {
        goldenHourScore -= 50
        blueHourScore -= 40
        recommendations.push("Rain expected - consider protective gear")
      } else if (condition.includes('snow')) {
        goldenHourScore -= 30
        blueHourScore -= 25
        recommendations.push("Snow may create unique lighting opportunities")
      } else if (condition.includes('fog') || condition.includes('mist')) {
        goldenHourScore -= 25
        blueHourScore -= 20
        recommendations.push("Fog conditions may create atmospheric effects")
      } else if (condition.includes('clear')) {
        recommendations.push("Clear skies expected for optimal golden hour")
      }

      // Ensure scores don't go below 0
      goldenHourScore = Math.max(0, goldenHourScore)
      blueHourScore = Math.max(0, blueHourScore)

      const getQuality = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
        if (score >= 80) return 'excellent'
        if (score >= 60) return 'good'
        if (score >= 40) return 'fair'
        return 'poor'
      }

      return {
        goldenHourQuality: getQuality(goldenHourScore),
        blueHourQuality: getQuality(blueHourScore),
        overallScore: Math.round((goldenHourScore + blueHourScore) / 2),
        recommendations
      }
    } catch (error) {
      console.error('Error getting photography conditions:', error)
      return {
        goldenHourQuality: 'fair',
        blueHourQuality: 'fair',
        overallScore: 50,
        recommendations: ['Unable to assess weather conditions']
      }
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

export const weatherService = new WeatherService()
export type { OpenWeatherMapResponse, WeatherForecast, WeatherResponse }