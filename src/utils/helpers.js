export function formatViews(count) {
  if (!count && count !== 0) return '0 views';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getErrorMessage(err, fallback = 'An error occurred') {
  if (!err) return fallback;

  // 1. Check if backend returned structured JSON with a message
  if (err.response?.data?.message && typeof err.response.data.message === 'string') {
    return err.response.data.message;
  }

  // 2. Check if backend returned error or errors field in JSON
  if (err.response?.data?.error && typeof err.response.data.error === 'string') {
    return err.response.data.error;
  }
  if (Array.isArray(err.response?.data?.errors) && err.response.data.errors.length > 0) {
    const firstErr = err.response.data.errors[0];
    if (typeof firstErr === 'string') return firstErr;
    if (firstErr?.message) return firstErr.message;
  }

  // 3. Check if backend returned a string (e.g., rate-limiter message or Express HTML error)
  if (typeof err.response?.data === 'string') {
    const rawData = err.response.data.trim();

    // 3a. If it's an Express HTML error page, extract the clean error text
    if (rawData.startsWith('<') || rawData.includes('<pre>') || rawData.includes('<!DOCTYPE')) {
      const preMatch = rawData.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      const preContent = preMatch ? preMatch[1] : rawData;

      const cleaned = preContent
        .split(/<br\s*\/?>|\n/i)[0]
        .replace(/Error:\s*/i, '')
        .replace(/<[^>]*>/g, '')
        .trim();

      if (cleaned && cleaned.length > 0 && cleaned.length < 200 && !cleaned.toLowerCase().startsWith('cannot ')) {
        return cleaned;
      }
    } else if (rawData.length > 0 && rawData.length < 300) {
      // 3b. Plain text string from rate-limit or backend (e.g. "Too many login attempts")
      return rawData;
    }
  }

  // 4. Fallback to friendly messages based on HTTP status codes
  const status = err.response?.status;
  if (status === 429) {
    return 'Too many requests. Please wait a few minutes before trying again.';
  }
  if (status === 409) {
    return 'A user with this email or username already exists.';
  }
  if (status === 401) {
    return 'Incorrect credentials or session expired. Please sign in again.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  if (status === 413) {
    return 'File size is too large. Please select a smaller file.';
  }
  if (status === 400) {
    return 'Invalid input details. Please verify your entries and try again.';
  }
  if (status >= 500) {
    return 'Server error. Please try again later.';
  }

  // 5. Network connection errors
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return 'Cannot connect to server. Please ensure the backend is running.';
  }

  // 6. Avoid returning raw technical Axios error messages like "Request failed with status code 429"
  if (typeof err.message === 'string' && !err.message.toLowerCase().includes('request failed with status code')) {
    return err.message;
  }

  return fallback;
}

