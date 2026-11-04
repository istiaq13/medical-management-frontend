import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Extracts a user-friendly, robust error message from any API error or exception.
 * Handles Zod field validation errors, backend ApiError response format, and network errors.
 */
export function getErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!error) return fallbackMessage;

  const data = error.response?.data;

  // 1. If backend returns an array of validation errors ({ errors: [...] })
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstErr = data.errors[0];
    if (typeof firstErr === 'string') return firstErr;
    if (firstErr?.message) {
      const field = firstErr.field ? `${firstErr.field}: ` : '';
      return `${field}${firstErr.message}`;
    }
  }

  // 2. If backend returns a direct message string
  if (typeof data?.message === 'string' && data.message.trim() !== '') {
    return data.message;
  }

  // 3. If standard axios error message
  if (typeof error.message === 'string' && error.message.trim() !== '') {
    if (error.message.includes('Network Error')) {
      return 'Network connection error. Please verify backend connectivity.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please check your network and try again.';
    }
    return error.message;
  }

  return fallbackMessage;
}


