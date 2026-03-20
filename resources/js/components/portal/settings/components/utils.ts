export const getInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return '??';
  }
  
  return name
    .trim()
    .split(' ')
    .map(part => part[0])
    .filter(char => char && char.match(/[a-zA-ZÀ-ÿ]/))
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';
};

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

export const calculateAge = (birthDate: string | undefined | null): number | null => {
  if (!birthDate) return null;
  
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    console.error('Age calculation error:', error);
    return null;
  }
};

export const getAvatarUrl = (photoPath?: string): string | null => {
  if (!photoPath) return null;
  
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  if (photoPath.startsWith('/')) {
    return photoPath;
  }
  
  return `/storage/${photoPath}`;
};