import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export function formatDurationAsTimer(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.floor((minutes % 1) * 60)
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Energy consumption constants
export const ENERGY_CONSUMPTION_RATE = 0.1 // 0.1 kW per minute (default fallback)
export const AVERAGE_BATTERY_SIZE = 50 // 50 kWh average battery
export const COST_PER_KWH = 15.0 // ₹15 per kWh

/**
 * Calculate energy consumed based on duration
 * @param durationMinutes - Duration in minutes
 * @returns Energy consumed in kWh
 */
export function calculateEnergyConsumed(durationMinutes: number): number {
  return durationMinutes * ENERGY_CONSUMPTION_RATE
}

/**
 * Calculate cost based on energy consumed
 * @param energyKWh - Energy in kWh
 * @returns Cost in rupees
 */
export function calculateCost(energyKWh: number): number {
  return energyKWh * COST_PER_KWH
}

/**
 * Calculate estimated time to full charge based on current battery level
 * @param currentBatteryPercent - Current battery percentage (0-100)
 * @param batteryCapacityKWh - Battery capacity in kWh (default: 500)
 * @returns Estimated time in minutes
 */
export function calculateEstimatedChargeTime(
  currentBatteryPercent: number,
  batteryCapacityKWh: number = AVERAGE_BATTERY_SIZE
): number {
  const energyNeeded = ((100 - currentBatteryPercent) / 100) * batteryCapacityKWh
  return Math.ceil(energyNeeded / ENERGY_CONSUMPTION_RATE)
}

/**
 * Calculate estimated cost for full charge
 * @param currentBatteryPercent - Current battery percentage (0-100)
 * @param batteryCapacityKWh - Battery capacity in kWh (default: 500)
 * @returns Estimated cost in rupees
 */
export function calculateEstimatedCost(
  currentBatteryPercent: number,
  batteryCapacityKWh: number = AVERAGE_BATTERY_SIZE
): number {
  const energyNeeded = ((100 - currentBatteryPercent) / 100) * batteryCapacityKWh
  return calculateCost(energyNeeded)
}

/**
 * Get charging session statistics based on start time
 * @param startTime - Session start time
 * @returns Current duration, energy consumed, and cost with real-time updates
 */
export function getSessionStats(startTime: string) {
  const start = new Date(startTime)
  const now = new Date()
  const totalSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)
  const durationMinutes = totalSeconds / 60 // Keep as decimal for precise calculations
  const energyConsumed = durationMinutes * ENERGY_CONSUMPTION_RATE
  const cost = energyConsumed * COST_PER_KWH
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  return {
    durationMinutes: Math.floor(durationMinutes),
    totalSeconds,
    hours,
    minutes,
    seconds,
    energyConsumed,
    cost,
    timerDisplay: hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}
