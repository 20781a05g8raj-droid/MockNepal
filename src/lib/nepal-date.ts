/**
 * Utility functions for Nepal timezone (Asia/Kathmandu: UTC+5:45)
 */

export function getTodayNepalDateString(): string {
  const now = new Date();
  // Format to Asia/Kathmandu YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // returns "YYYY-MM-DD"
}

export function getNepalDateTime(): Date {
  // Return current Date
  return new Date();
}

export function addDaysToNepalDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00+05:45");
  d.setDate(d.getDate() + days);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

export function isYesterdayNepalDate(dateStr: string): boolean {
  const today = getTodayNepalDateString();
  const yesterday = addDaysToNepalDate(today, -1);
  return dateStr === yesterday;
}
