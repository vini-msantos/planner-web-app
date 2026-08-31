// Vlw gemini
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Split accented characters into base letters and accents
    .replace(/[\u0300-\u036f]/g, '') // Remove the accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-'); // Collapse whitespace and replace with hyphens
}

export function formatLine(text: string): string {
  return text
    .toString()
    .replace(/\n/g, ' ')
}

export function formatParagraph(text: string): string {
  return text
    .toString()
    .replace(/\n+/g, '\n')
}
