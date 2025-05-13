// Format currency in Indonesian Rupiah
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'N/A';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

// Format date and time
export const formatDateTime = (dateString, type = 'datetime') => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    
    if (type === 'date') {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
    
    if (isToday) {
      return `Today, ${new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date)}`;
    }
    
    if (isYesterday) {
      return `Yesterday, ${new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date)}`;
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date Error';
  }
};

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'N/A';
  
  return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(decimals)}%`;
};

// Format weight in grams
export const formatWeight = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'N/A';
  
  return `${numValue.toFixed(decimals)} ${numValue === 1 ? 'gram' : 'grams'}`;
};
