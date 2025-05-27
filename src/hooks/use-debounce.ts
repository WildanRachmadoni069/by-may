import { useState, useEffect } from "react";

/**
 * A custom hook that debounces a value for a specified delay.
 *
 * @param value - The value to be debounced
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * Example usage:
 * ```
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * // Effect runs only when debouncedSearchTerm changes
 * useEffect(() => {
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay = 500): T {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes or component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
