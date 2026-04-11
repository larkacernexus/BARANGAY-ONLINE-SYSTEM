// resources/js/Pages/Admin/Users/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
    User as UserIcon,
    Shield,
    History,
    Lock,
} from 'lucide-react';

// Import Admin Tabs Component
import { AdminTabsWithContent, AdminTabPanel } from '@/components/adminui/admin-tabs';

// Import components
import { UserHeader } from '@/components/admin/users/show/components/user-header';
import { ProfileHeader } from '@/components/admin/users/show/components/profile-header';
import { StatusBanner } from '@/components/admin/users/show/components/status-banner';
import { DeleteConfirmationDialog } from '@/components/admin/users/show/components/delete-confirmation-dialog';

// Import tab components
import { OverviewTab } from '@/components/admin/users/show/components/tabs/overview-tab';
import { PermissionsTab } from '@/components/admin/users/show/components/tabs/permissions-tab';
import { ActivityTab } from '@/components/admin/users/show/components/tabs/activity-tab';
import { SecurityTab } from '@/components/admin/users/show/components/tabs/security-tab';

// Import types and utilities
import type { UserShowProps, UserActivityLog, UserStats } from '@/types/admin/users/user-types';
import { formatDate, getFullName, getInitials, getStatusColor, getStatusIcon } from '@/components/admin/users/show/utils/helpers';

// Default empty values for optional props
const defaultStats: UserStats = {
  total_logins: 0,
  last_login: null,
  sessions_count: 0,
  permissions_count: 0,
  roles_count: 0,
  devices_count: 0,
};

export default function UserShow({ 
  user, 
  activityLogs = [], 
  stats = defaultStats,
  can = {}
}: UserShowProps) {
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Safe access with fallbacks
  const fullName = getFullName(user);
  const userRole = user.role;
  const userPermissions = user.permissions || [];
  const rolePermissions = userRole?.permissions || [];
  const totalPermissions = userPermissions.length + rolePermissions.length;
  const has2FA = !!user.two_factor_confirmed_at;
  const isActive = user.status === 'active';
  const needsPasswordChange = user.require_password_change || false;

  // Memoized handlers for better performance
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(user.email);
    setEmailCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setEmailCopied(false), 2000);
  }, [user.email]);

  const handleResetPassword = useCallback(() => {
    if (confirm(`Send password reset email to ${fullName}?`)) {
      setIsResettingPassword(true);
      router.post(`/users/${user.id}/reset-password`, {}, {
        onSuccess: () => {
          toast.success('Password reset email sent');
          setIsResettingPassword(false);
        },
        onError: () => {
          toast.error('Failed to send reset email');
          setIsResettingPassword(false);
        }
      });
    }
  }, [user.id, fullName]);

  const handleToggleStatus = useCallback(() => {
    const newStatus = isActive ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} ${fullName}?`)) {
      router.put(`/users/${user.id}`, { status: newStatus }, {
        onSuccess: () => {
          toast.success(`User ${action}d successfully`);
        },
        onError: () => {
          toast.error(`Failed to ${action} user`);
        }
      });
    }
  }, [user.id, fullName, isActive]);

  const handleLogoutAllSessions = useCallback(() => {
    if (confirm(`Log out all sessions for ${fullName}? This will end all active sessions except the current one.`)) {
      setIsLoggingOutAll(true);
      router.post(`/users/${user.id}/logout-all`, {}, {
        onSuccess: () => {
          toast.success('All other sessions logged out');
          setIsLoggingOutAll(false);
        },
        onError: () => {
          toast.error('Failed to log out sessions');
          setIsLoggingOutAll(false);
        }
      });
    }
  }, [user.id, fullName]);

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    router.delete(`/users/${user.id}`, {
      onSuccess: () => {
        toast.success('User deleted successfully');
        router.visit('/users');
      },
      onError: () => {
        toast.error('Failed to delete user');
        setIsDeleting(false);
        setShowDeleteDialog(false);
      }
    });
  }, [user.id]);

  const handleToggle2FA = useCallback(() => {
    const action = has2FA ? 'disable' : 'enable';
    if (confirm(`Are you sure you want to ${action} two-factor authentication for ${fullName}?`)) {
      router.post(`/users/${user.id}/toggle-2fa`, {}, {
        onSuccess: () => {
          toast.success(`2FA ${action}d successfully`);
        },
        onError: () => {
          toast.error(`Failed to ${action} 2FA`);
        }
      });
    }
  }, [user.id, fullName, has2FA]);

  const handleEdit = useCallback(() => {
    router.visit(`/users/${user.id}/edit`);
  }, [user.id]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Tab definitions
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <UserIcon className="h-4 w-4" />,
    },
    { 
      id: 'permissions', 
      label: 'Permissions', 
      icon: <Shield className="h-4 w-4" />,
      count: totalPermissions
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: <History className="h-4 w-4" />,
      count: activityLogs.length
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: <Lock className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <Head title={`User: ${fullName}`} />
      
      <AppLayout
        title="User Profile"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Users', href: '/users' },
          { title: fullName, href: '#' }
        ]}
      >
        <div className="space-y-6">
          {/* Header with Actions */}
          <UserHeader
            user={user}
            onCopyLink={handleCopyLink}
            onPrint={handlePrint}
            onEdit={handleEdit}
            onResetPassword={handleResetPassword}
            onToggleStatus={handleToggleStatus}
            onToggle2FA={handleToggle2FA}
            onDelete={() => setShowDeleteDialog(true)}
            copied={copied}
            isResettingPassword={isResettingPassword}
            isActive={isActive}
            has2FA={has2FA}
            canEdit={can.edit_user}
            canDelete={can.delete_user}
          />

          {/* Status Banner - For users requiring attention */}
          {needsPasswordChange && (
            <StatusBanner
              user={user}
              onResetPassword={handleResetPassword}
              isResettingPassword={isResettingPassword}
            />
          )}

          {/* Profile Header */}
          <ProfileHeader
            user={user}
            fullName={fullName}
            getInitials={getInitials}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />

          {/* Admin Tabs Component */}
          <AdminTabsWithContent
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underlined"
            size="md"
            scrollable={true}
            showCountBadges={true}
            lazyLoad={true}
          >
            <AdminTabPanel value="overview">
              <OverviewTab
                user={user}
                stats={stats}
                emailCopied={emailCopied}
                onCopyEmail={handleCopyEmail}
                onResetPassword={handleResetPassword}
                onToggleStatus={handleToggleStatus}
                onLogoutAll={handleLogoutAllSessions}
                onDelete={() => setShowDeleteDialog(true)}
                formatDate={formatDate}
                isResettingPassword={isResettingPassword}
                isLoggingOutAll={isLoggingOutAll}
              />
            </AdminTabPanel>

            <AdminTabPanel value="permissions">
              <PermissionsTab
                user={user}
                role={userRole}
                userPermissions={userPermissions}
                rolePermissions={rolePermissions}
              />
            </AdminTabPanel>

            <AdminTabPanel value="activity">
              <ActivityTab
                user={user}
                activityLogs={activityLogs}
                stats={stats}
                onLogoutAll={handleLogoutAllSessions}
                isLoggingOutAll={isLoggingOutAll}
                formatDate={formatDate}
              />
            </AdminTabPanel>

            <AdminTabPanel value="security">
              <SecurityTab
                user={user}
                onResetPassword={handleResetPassword}
                onToggle2FA={handleToggle2FA}
                onDelete={() => setShowDeleteDialog(true)}
                isResettingPassword={isResettingPassword}
                formatDate={formatDate}
                has2FA={has2FA}
              />
            </AdminTabPanel>
          </AdminTabsWithContent>

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            userName={fullName}
            isDeleting={isDeleting}
            onDelete={handleDelete}
          />
        </div>
      </AppLayout>
    </>
  );
}