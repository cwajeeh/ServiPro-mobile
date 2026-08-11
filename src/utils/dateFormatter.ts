/**
 * Formats a date string into a readable format: DD/MM/YYYY - HH:MM AM/PM
 * @param dateStr ISO date string or Date object
 * @returns Formatted date string or 'N/A'
 */
export const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  
  if (isNaN(d.getTime())) return 'N/A';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const time = d.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }).toUpperCase();

  return `${day}/${month}/${year} - ${time}`;
};

/**
 * Formats a date into a simpler version: DD MMM YYYY
 */
export const formatSimpleDate = (dateStr?: string | Date) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
