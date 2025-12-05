import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = (url: string) =>
  fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  }).then((r) => r.json());

export function formatCurrency(number: number, minimumFractionDigits?: number, maximumFractionDigits?: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: minimumFractionDigits ? minimumFractionDigits : 2,
    maximumFractionDigits: maximumFractionDigits ? maximumFractionDigits : 2,
  }).format(number / 10000);
}

export function formatCurrencyInput(str: string) {
  const cleanStr = str.replace(/,/g, '');
  const float = parseFloat(cleanStr);
  return float.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function parseCurrencyInput(str: string) {
  const cleanStr = str.replace(/,/g, '');
  return Math.trunc(parseFloat(cleanStr) * 10000);
}

export function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}

export function getInitials(name: string): string {
  const words = name.split(/[ _-]+/).filter((word) => word.length > 0);
  if (words.length === 0) return '';

  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words.length > 1 ? words[words.length - 1].charAt(0).toUpperCase() : '';

  return firstInitial + lastInitial;
}

export function formatDateToString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateParam(startDate: Date, endDate: Date) {
  if (endDate) {
    return `${formatDateToString(startDate)}_${formatDateToString(endDate)}`;
  } else {
    return formatDateToString(startDate);
  }
}

export function parseDateParam(period: string) {
  const dates = period.split('_');

  return {
    startDate: dates[0],
    endDate: dates[1],
  };
}

export function cleanNumberInput(input: string, decimalPlaces: number) {
  const cleanNumber = input.replace(/,/g, '');
  const roundedNumber = parseFloat(cleanNumber).toFixed(decimalPlaces);
  const formattedNumber = parseFloat(roundedNumber).toLocaleString(undefined, {
    maximumFractionDigits: decimalPlaces,
  });
  return formattedNumber;
}

export function getCurrentMonthPeriod(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0));

  return { startDate, endDate };
}

export function calculatePercentageDifference(q1: number, q2: number): number {
  const difference = q2 - q1;
  const percentageDifference = (difference / Math.abs(q1)) * 100;
  return percentageDifference;
}

export function darkenHexColor(hex: string, percentage: number) {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Convert the hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Darken each component by the specified percentage
  r = Math.max(0, Math.floor(r * (1 - percentage / 100)));
  g = Math.max(0, Math.floor(g * (1 - percentage / 100)));
  b = Math.max(0, Math.floor(b * (1 - percentage / 100)));

  // Convert back to hex
  const newHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

  return newHex;
}

export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
