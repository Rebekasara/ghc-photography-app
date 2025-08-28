/**
 * API Optimizer for managing API requests with caching, rate limiting, and circuit breaking
 */

export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  cacheKey?: string
  priority?: 'high' | 'medium' | 'low'
  skipCache?: boolean
}

export interface RequestResult {
  success: boolean
  data?: any
  error?: string
  duration: number
  fromCache?: boolean
}

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

interface RateLimiter {
  count: number
  resetTime: number
}

interface CircuitBreaker {
  failures: number
  lastFailure: number
  isOpen: boolean
}

interface QueuedRequest {
  id: string
  config: RequestConfig
  resolve: (value: any) => void
  reject: (error: any) => void
  priority: number
  timestamp: number
}

export class APIOptimizer {
  private requestCache = new Map<string, CacheEntry>()
  private rateLimiter = new Map<string, RateLimiter>()
  private circuitBreaker = new Map<string, CircuitBreaker>()
  private requestQueue: QueuedRequest[] = []
  private isProcessingQueue = false
  
  // Rate limiting configuration per domain
  private readonly RATE_LIMITS = {
    'nominatim.openstreetmap.org': { requests: 1, window: 1000 }, // 1 req/sec
    'ipapi.co': { requests: 1000, window: 60000 }, // 1000 req/min
    'ip-api.com': { requests: 45, window: 60000 }, // 45 req/min
    'timeapi.io': { requests: 100, window: 60000 }, // 100 req/min
    'api.geonames.org': { requests: 1000, window: 3600000 }, // 1000 req/hour
  }
  
  // Circuit breaker configuration
  private readonly CIRCUIT_BREAKER_CONFIG = {
    failureThreshold: 5,
    resetTimeout: 60000 // 1 minute
  }

  /**
   * Make an optimized API request with caching, rate limiting, and circuit breaking
   */
  async request<T = any>(config: RequestConfig): Promise<T> {
    const domain = this.extractDomain(config.url)
    
    // Check cache first
    if (config.cacheKey && !config.skipCache) {
      const cached = this.getFromCache(config.cacheKey)
      if (cached) {
        return cached as T
      }
    }
    
    // Check circuit breaker
    if (this.isCircuitOpen(domain)) {
      throw new Error(`Circuit breaker is open for ${domain}`)
    }
    
    // Check rate limiting
    if (!this.checkRateLimit(domain)) {
      // Queue the request if rate limited
      return this.queueRequest<T>(config)
    }
    
    return this.executeRequest<T>(config)
  }

  /**
   * Queue a request when rate limited
   */
  private async queueRequest<T>(config: RequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: this.generateId(),
        config,
        resolve,
        reject,
        priority: this.getPriorityIndex(config.priority || 'medium'),
        timestamp: Date.now()
      }
      
      // Insert based on priority
      const insertIndex = this.requestQueue.findIndex(
        req => req.priority > queuedRequest.priority
      )
      
      if (insertIndex === -1) {
        this.requestQueue.push(queuedRequest)
      } else {
        this.requestQueue.splice(insertIndex, 0, queuedRequest)
      }
      
      this.processQueue()
    })
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }
    
    this.isProcessingQueue = true
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!
      const domain = this.extractDomain(request.config.url)
      
      // Check if we can make the request now
      if (this.checkRateLimit(domain) && !this.isCircuitOpen(domain)) {
        try {
          const result = await this.executeRequest(request.config)
          request.resolve(result)
        } catch (error) {
          request.reject(error)
        }
      } else {
        // Put it back in the queue
        this.requestQueue.unshift(request)
        break
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    this.isProcessingQueue = false
    
    // Schedule next processing if queue is not empty
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 1000)
    }
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest<T>(config: RequestConfig): Promise<T> {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
      retries = 3
    } = config
    
    const domain = this.extractDomain(url)
    let lastError: Error
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GoldenHourCalculator/1.0',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Cache successful response
        if (config.cacheKey) {
          this.setCache(config.cacheKey, data, this.getCacheTTL(domain))
        }
        
        // Reset circuit breaker on success
        this.resetCircuitBreaker(domain)
        
        return data as T
      } catch (error) {
        lastError = error as Error
        
        // Record failure for circuit breaker
        this.recordFailure(domain)
        
        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.name === 'AbortError' || error.message.includes('404')) {
            break
          }
        }
      }
    }
    
    throw lastError || new Error('Request failed after all retries')
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return 'unknown'
    }
  }

  private checkRateLimit(domain: string): boolean {
    const rateLimit = this.RATE_LIMITS[domain as keyof typeof this.RATE_LIMITS]
    if (!rateLimit) return true

    const now = Date.now()
    const limiter = this.rateLimiter.get(domain)

    if (!limiter || now >= limiter.resetTime) {
      this.rateLimiter.set(domain, {
        count: 1,
        resetTime: now + rateLimit.window
      })
      return true
    }

    if (limiter.count < rateLimit.requests) {
      limiter.count++
      return true
    }

    return false
  }

  private isCircuitOpen(domain: string): boolean {
    const breaker = this.circuitBreaker.get(domain)
    if (!breaker) return false

    if (breaker.isOpen) {
      const now = Date.now()
      if (now - breaker.lastFailure > this.CIRCUIT_BREAKER_CONFIG.resetTimeout) {
        breaker.isOpen = false
        breaker.failures = 0
        return false
      }
      return true
    }

    return false
  }

  private recordFailure(domain: string): void {
    const breaker = this.circuitBreaker.get(domain) || { failures: 0, lastFailure: 0, isOpen: false }
    
    breaker.failures++
    breaker.lastFailure = Date.now()
    
    if (breaker.failures >= this.CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      breaker.isOpen = true
    }
    
    this.circuitBreaker.set(domain, breaker)
  }

  private resetCircuitBreaker(domain: string): void {
    this.circuitBreaker.delete(domain)
  }

  private getFromCache(key: string): any | null {
    const cached = this.requestCache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now > cached.timestamp + cached.ttl) {
      this.requestCache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })

    // Cleanup old cache entries
    if (this.requestCache.size > 1000) {
      this.cleanupCache()
    }
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.requestCache) {
      if (now > cached.timestamp + cached.ttl) {
        this.requestCache.delete(key)
      }
    }
  }

  private getCacheTTL(domain: string): number {
    // Different TTL based on service reliability
    const ttlMap: Record<string, number> = {
      'nominatim.openstreetmap.org': 60 * 60 * 1000, // 1 hour
      'ipapi.co': 30 * 60 * 1000, // 30 minutes
      'ip-api.com': 30 * 60 * 1000, // 30 minutes
      'timeapi.io': 60 * 60 * 1000, // 1 hour
      'api.geonames.org': 60 * 60 * 1000, // 1 hour
    }
    
    return ttlMap[domain] || 15 * 60 * 1000 // Default 15 minutes
  }

  private getPriorityIndex(priority: string): number {
    const priorities = { high: 0, medium: 1, low: 2 }
    return priorities[priority as keyof typeof priorities] || 1
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Public methods for monitoring
  getStats() {
    return {
      queueLength: this.requestQueue.length,
      cacheSize: this.requestCache.size,
      rateLimiters: Object.fromEntries(this.rateLimiter),
      circuitBreakers: Object.fromEntries(this.circuitBreaker),
    }
  }

  clearCache(): void {
    this.requestCache.clear()
  }

  // Batch multiple requests with different priorities
  async batchRequests(requests: RequestConfig[]): Promise<RequestResult[]> {
    const promises = requests.map(async (config, index) => {
      const startTime = Date.now()
      try {
        const data = await this.request(config)
        return {
          success: true,
          data,
          duration: Date.now() - startTime,
          fromCache: !!config.cacheKey && !!this.getFromCache(config.cacheKey)
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        }
      }
    })

    return Promise.allSettled(promises).then(results => 
      results.map(result => 
        result.status === 'fulfilled' ? result.value : {
          success: false,
          error: 'Promise rejected',
          duration: 0
        }
      )
    )
  }
}

// Global instance
export const apiOptimizer = new APIOptimizer()
export type { RequestConfig, RequestResult }