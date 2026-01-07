// components/user-info.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function UserInfo({ user }: { user: any }) {
  // Get the initials function
  const getInitials = useInitials();
  
  // Safely get user data with fallbacks
  const userName = user?.name || user?.first_name || 'User';
  const userEmail = user?.email || '';
  
  // Get initials safely - check if getInitials is a function
  let initials = 'U';
  try {
    if (typeof getInitials === 'function') {
      initials = getInitials(userName) || 'U';
    }
  } catch (error) {
    console.error('Error getting initials:', error);
    initials = userName.charAt(0).toUpperCase() || 'U';
  }
  
  return (
    <>
      <Avatar className="h-8 w-8 overflow-hidden rounded-full">
        {user?.avatar && (
          <AvatarImage src={user.avatar} alt={userName} />
        )}
        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{userName}</span>
        {userEmail && (
          <span className="truncate text-xs text-muted-foreground">
            {userEmail}
          </span>
        )}
      </div>
    </>
  );
}