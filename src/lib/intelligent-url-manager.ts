import { LocationData, LocationEntry, locationDatabase } from './location-database'
import { generateSEOFriendlyURL, generateLocationSlug } from './url-utils'

export interface URLGenerationOptions {
  includeCoordinates?: boolean
  includeDate?: boolean
  shortFormat?: boolean
  customSlug?: string
}

export interface URLAnalytics {
  url: string
  location?: string
  coordinates?: string
  estimatedTraffic: 'high' | 'medium' | 'low'
  seoScore: number
  keywords: string[]
  competition: 'high' | 'medium' | 'low'
}

export interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  images?: Array<{
    loc: string
    title: string
    caption: string
  }>
}

/**
 * Intelligent URL Manager for generating SEO-friendly URLs and managing sitemaps
 */
export class IntelligentURLManager {
  private baseUrl: string
  private popularLocations: Array<LocationData & { name: string }>

  constructor(baseUrl: string = 'https://goldenhourcalculator.com') {
    this.baseUrl = baseUrl
    this.popularLocations = [
      { name: 'New York', lat: 40.7128, lng: -74.0060, country: 'United States', city: 'New York', state: 'New York' },
      { name: 'London', lat: 51.5074, lng: -0.1278, country: 'United Kingdom', city: 'London' },
      { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris' },
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo' },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney' },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'United States', city: 'Los Angeles', state: 'California' },
      { name: 'Barcelona', lat: 41.3851, lng: 2.1734, country: 'Spain', city: 'Barcelona' },
      { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates', city: 'Dubai' },
      { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore' },
      { name: 'Miami', lat: 25.7617, lng: -80.1918, country: 'United States', city: 'Miami', state: 'Florida' }
    ]
  }

  /**
   * Generate SEO-optimized URL for a location
   */
  generateURL(
    location: { lat: number; lng: number; locationName?: string },
    options: URLGenerationOptions = {}
  ): string {
    const { includeCoordinates = false, includeDate = false, shortFormat = false, customSlug } = options
    
    let urlPath = '/golden-hour'
    
    if (customSlug) {
      urlPath += `/${customSlug}`
    } else if (location.locationName) {
      const slug = generateLocationSlug(location.locationName)
      urlPath += `/${slug}`
      
      if (includeCoordinates) {
        urlPath += `/${location.lat.toFixed(4)},${location.lng.toFixed(4)}`
      }
    } else {
      // Coordinates-only URL
      urlPath += `/coordinates/${location.lat.toFixed(4)},${location.lng.toFixed(4)}`
    }
    
    if (includeDate) {
      const today = new Date().toISOString().split('T')[0]
      urlPath += `/${today}`
    }
    
    return shortFormat ? urlPath : `${this.baseUrl}${urlPath}`
  }

  /**
   * Generate comprehensive sitemap for all locations
   */
  generateComprehensiveSitemap(
    includePopularLocations: boolean = true,
    includeDatabaseLocations: boolean = true,
    includeCoordinateVariations: boolean = false
  ): string {
    const entries: SitemapEntry[] = []
    const today = new Date().toISOString().split('T')[0]
    
    // Add homepage
    entries.push({
      url: this.baseUrl,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0
    })
    
    // Add popular locations
    if (includePopularLocations) {
      this.popularLocations.forEach(location => {
        const url = this.generateURL({
          lat: location.lat,
          lng: location.lng,
          locationName: location.name
        })
        
        entries.push({
          url,
          lastmod: today,
          changefreq: 'weekly',
          priority: this.calculateURLPriority(url),
          images: [{
            loc: `${this.baseUrl}/images/locations/${generateLocationSlug(location.name)}.jpg`,
            title: `Golden Hour in ${location.name}`,
            caption: `Beautiful golden hour photography opportunities in ${location.name}, ${location.country}`
          }]
        })
        
        // Add coordinate variations if requested
        if (includeCoordinateVariations) {
          const coordUrl = this.generateURL({
            lat: location.lat,
            lng: location.lng,
            locationName: location.name
          }, { includeCoordinates: true })
          
          entries.push({
            url: coordUrl,
            lastmod: today,
            changefreq: 'monthly',
            priority: 0.6
          })
        }
      })
    }
    
    // Add database locations
    if (includeDatabaseLocations) {
      const dbLocations = locationDatabase.getPopularLocations(100)
      dbLocations.forEach(location => {
        const url = this.generateURL({
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
          locationName: location.name
        })
        
        entries.push({
          url,
          lastmod: today,
          changefreq: 'weekly',
          priority: this.calculateURLPriority(url)
        })
      })
    }
    
    // Generate XML
    const xmlEntries = entries.map(entry => {
      let xml = `  <url>
`
      xml += `    <loc>${this.escapeXML(entry.url)}</loc>
`
      xml += `    <lastmod>${entry.lastmod}</lastmod>
`
      xml += `    <changefreq>${entry.changefreq}</changefreq>
`
      xml += `    <priority>${entry.priority}</priority>
`
      
      if (entry.images) {
        entry.images.forEach(image => {
          xml += `    <image:image>
`
          xml += `      <image:loc>${this.escapeXML(image.loc)}</image:loc>
`
          xml += `      <image:title>${this.escapeXML(image.title)}</image:title>
`
          xml += `      <image:caption>${this.escapeXML(image.caption)}</image:caption>
`
          xml += `    </image:image>
`
        })
      }
      
      xml += `  </url>`
      return xml
    })
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries.join('\n')}
</urlset>`
  }

  /**
   * Analyze URL performance and SEO potential
   */
  analyzeURL(url: string): URLAnalytics {
    const location = this.extractLocationFromURL(url)
    const coordinates = this.extractCoordinatesFromURL(url)
    const seoScore = this.calculateSEOScore(url)
    const keywords = this.generateKeywords(location)
    const estimatedTraffic = this.estimateTraffic(location)
    const competition = this.assessCompetition(location)
    
    return {
      url,
      location,
      coordinates,
      estimatedTraffic,
      seoScore,
      keywords,
      competition
    }
  }

  /**
   * Generate URL redirects for common variations
   */
  generateURLRedirects(): Array<{ from: string; to: string; type: number }> {
    const redirects: Array<{ from: string; to: string; type: number }> = []
    
    // Add redirects for popular locations
    for (const location of this.popularLocations) {
      const canonicalURL = this.generateURL({
        lat: location.lat,
        lng: location.lng,
        locationName: location.name
      }, { shortFormat: true })
      
      // Common variations
      const variations = [
        location.name.toLowerCase().replace(/\s+/g, '-'),
        location.name.toLowerCase().replace(/\s+/g, '_'),
        location.name.toLowerCase().replace(/\s+/g, ''),
        generateLocationSlug(location.name)
      ]

      for (const variation of variations) {
        if (variation !== generateLocationSlug(location.name)) {
          redirects.push({
            from: `/golden-hour/${variation}`,
            to: canonicalURL,
            type: 301
          })
        }
      }
    }

    return redirects
  }

  /**
   * Get location suggestions based on partial input
   */
  getLocationSuggestions(query: string, limit: number = 10): Array<{
    name: string
    country: string
    state?: string
    coordinates: { lat: number; lng: number }
    url: string
  }> {
    // Use location database for enhanced search
    const dbSuggestions = locationDatabase.searchLocations(query, limit)
    
    if (dbSuggestions.length > 0) {
      return dbSuggestions.map(location => ({
        name: location.name,
        country: location.country,
        state: location.state,
        coordinates: location.coordinates,
        url: this.generateURL({
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
          locationName: location.name
        })
      }))
    }

    // Fallback to popular locations
    const normalizedQuery = query.toLowerCase()
    
    return this.popularLocations
      .filter(location => 
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.country.toLowerCase().includes(normalizedQuery) ||
        ('state' in location && location.state && location.state.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, limit)
      .map(location => ({
        name: location.name,
        country: location.country,
        state: 'state' in location ? location.state : undefined,
        coordinates: { lat: location.lat, lng: location.lng },
        url: this.generateURL({
          lat: location.lat,
          lng: location.lng,
          locationName: location.name
        })
      }))
  }

  /**
   * Generate robots.txt with sitemap reference
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/sitemap-locations.xml

# Optimize crawl budget
Crawl-delay: 1

# Block unnecessary paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /test/`
  }

  // Private helper methods
  private generateDateRange(start: Date, end: Date): string[] {
    const dates: string[] = []
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  private calculateURLPriority(url: string): number {
    const location = this.extractLocationFromURL(url)
    const isPopular = this.popularLocations.some(loc => 
      url.includes(generateLocationSlug(loc.name))
    )
    
    if (url === `${this.baseUrl}/`) return 1.0
    if (isPopular) return 0.8
    if (location) return 0.6
    return 0.4
  }

  private extractLocationFromURL(url: string): string | null {
    const match = url.match(/\/golden-hour\/([^/]+)/)
    if (!match) return null
    
    const slug = match[1]
    if (slug === 'coordinates') return null
    
    return slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  private extractCoordinatesFromURL(url: string): string | null {
    const coordMatch = url.match(/(-?\d+\.\d+),(-?\d+\.\d+)/)
    return coordMatch ? `${coordMatch[1]},${coordMatch[2]}` : null
  }

  private calculateSEOScore(url: string): number {
    let score = 50 // Base score
    
    // URL structure
    if (url.includes('/golden-hour/')) score += 20
    if (url.match(/\/golden-hour\/[a-z-]+\/\d+\.\d+,\d+\.\d+/)) score += 15
    if (url.length < 100) score += 10
    if (!url.includes('coordinates')) score += 5
    
    return Math.min(100, score)
  }

  private generateKeywords(location: string | null): string[] {
    const baseKeywords = ['golden hour', 'sunrise', 'sunset', 'photography', 'magic hour']
    
    if (location) {
      return [
        ...baseKeywords,
        location.toLowerCase(),
        `${location.toLowerCase()} golden hour`,
        `${location.toLowerCase()} sunrise`,
        `${location.toLowerCase()} sunset`,
        `${location.toLowerCase()} photography`
      ]
    }
    
    return baseKeywords
  }

  private estimateTraffic(location: string | null): 'high' | 'medium' | 'low' {
    if (!location) return 'low'
    
    const highTrafficCities = ['new york', 'london', 'paris', 'tokyo', 'los angeles']
    const mediumTrafficCities = ['sydney', 'barcelona', 'dubai', 'singapore', 'miami']
    
    const locationLower = location.toLowerCase()
    
    if (highTrafficCities.some(city => locationLower.includes(city))) return 'high'
    if (mediumTrafficCities.some(city => locationLower.includes(city))) return 'medium'
    
    return 'low'
  }

  private assessCompetition(location: string | null): 'high' | 'medium' | 'low' {
    if (!location) return 'low'
    
    const highCompetitionCities = ['new york', 'london', 'paris', 'tokyo']
    const locationLower = location.toLowerCase()
    
    if (highCompetitionCities.some(city => locationLower.includes(city))) return 'high'
    
    return 'medium'
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

// Export singleton instance
export const intelligentURLManager = new IntelligentURLManager()
export { IntelligentURLManager }
export type { URLGenerationOptions, URLAnalytics, SitemapEntry }