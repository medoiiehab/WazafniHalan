import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDirection = (text: string): "rtl" | "ltr" => {
  if (!text) return "ltr";

  // Remove ALL HTML tags and entities
  const plainText = text
    .replace(/<[^>]+>/g, '')  // Remove HTML tags
    .replace(/&[a-z]+;/g, '') // Remove HTML entities (&nbsp;, &lt;, etc.)
    .trim();

  if (plainText.length === 0) return "ltr";

  const arabicPattern = /[\u0600-\u06FF]/;
  // Check the first non-whitespace characters
  return arabicPattern.test(plainText.slice(0, 20)) ? "rtl" : "ltr";
};
