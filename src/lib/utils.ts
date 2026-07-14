import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatNumber(num: number | undefined | null) {
  if (num == null) return "0"
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M"
  if (num >= 1000) return (num / 1000).toFixed(2) + "K"
  return Number.isInteger(num) ? num.toString() : num.toFixed(2)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function generateId() {
  return crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15)
}
