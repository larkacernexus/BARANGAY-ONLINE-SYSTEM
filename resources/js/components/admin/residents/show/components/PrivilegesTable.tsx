// UI Components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Icons
import { 
    IdCard, 
    Percent, 
    Calendar, 
    CalendarDays, 
    BadgeCheck, 
    ShieldX,
    Trash2
} from 'lucide-react';

// Types and Utils
import { ResidentPrivilege } from '@/types/admin/residents/residents-types'; // Updated import path
import {
    getPrivilegeIconName,
    getPrivilegeIcon,
    getDiscountPercentage,
    getPrivilegeStatusColor
} from '@/components/admin/residents/show/utils/badge-utils';
import { formatDate } from '@/components/admin/residents/show/utils/helpers';

interface PrivilegesTableProps {
    privileges: ResidentPrivilege[];
    onRemove?: (privilegeId: number) => void;
}

export const PrivilegesTable = ({ privileges, onRemove }: PrivilegesTableProps) => {
    const getStatusBadge = (privilege: ResidentPrivilege) => {
        const statusText = {
            active: 'Active',
            expiring_soon: 'Expiring Soon',
            expired: 'Expired',
            pending: 'Pending'
        };

        // Get status from privilege or from pivot
        const status = privilege.status || privilege.pivot?.status || 'pending';
        
        return (
            <Badge className={`${getPrivilegeStatusColor(status)} border`}>
                {statusText[status as keyof typeof statusText] || status}
            </Badge>
        );
    };

    // Helper function to get privilege name safely
    const getPrivilegeName = (privilege: ResidentPrivilege) => {
        return privilege.privilege?.name || privilege.privilege_name || 'Unknown Benefit';
    };

    // Helper function to get privilege code safely
    const getPrivilegeCode = (privilege: ResidentPrivilege) => {
        return privilege.privilege?.code || privilege.privilege_code || '';
    };

    // Helper function to get ID number safely
    const getIdNumber = (privilege: ResidentPrivilege) => {
        return privilege.id_number || privilege.pivot?.id_number || null;
    };

    // Helper function to get issued date safely
    const getIssuedDate = (privilege: ResidentPrivilege) => {
        return privilege.issued_date || privilege.pivot?.granted_at || null;
    };

    // Helper function to get expiry date safely
    const getExpiryDate = (privilege: ResidentPrivilege) => {
        return privilege.expiry_date || privilege.pivot?.valid_until || null;
    };

    // Helper function to get verified status safely
    const getVerifiedStatus = (privilege: ResidentPrivilege) => {
        return privilege.verified_at || privilege.pivot?.verified_at || null;
    };

    return (
        <div className="rounded-md border dark:border-gray-700">
            <Table>
                <TableHeader>
                    <TableRow className="dark:border-gray-700 hover:bg-transparent">
                        <TableHead className="dark:text-gray-300">Benefit</TableHead>
                        <TableHead className="dark:text-gray-300">ID Number</TableHead>
                        <TableHead className="dark:text-gray-300">Discount</TableHead>
                        <TableHead className="dark:text-gray-300">Issued Date</TableHead>
                        <TableHead className="dark:text-gray-300">Expiry Date</TableHead>
                        <TableHead className="dark:text-gray-300">Status</TableHead>
                        <TableHead className="dark:text-gray-300">Verified</TableHead>
                        {onRemove && <TableHead className="dark:text-gray-300">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {privileges.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={onRemove ? 8 : 7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No benefits assigned to this resident
                            </TableCell>
                        </TableRow>
                    ) : (
                        privileges.map((privilege) => {
                            const discount = getDiscountPercentage(privilege);
                            const iconName = getPrivilegeIconName(privilege);
                            const IconComponent = getPrivilegeIcon(iconName);
                            const idNumber = getIdNumber(privilege);
                            const issuedDate = getIssuedDate(privilege);
                            const expiryDate = getExpiryDate(privilege);
                            const verifiedAt = getVerifiedStatus(privilege);
                            const status = privilege.status || privilege.pivot?.status || 'pending';

                            return (
                                <TableRow key={privilege.id} className="dark:border-gray-700">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                                                <IconComponent className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="font-medium dark:text-gray-200">
                                                    {getPrivilegeName(privilege)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {getPrivilegeCode(privilege)}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {idNumber ? (
                                            <div className="flex items-center gap-1">
                                                <IdCard className="h-3 w-3 text-gray-400" />
                                                <span className="font-mono text-sm dark:text-gray-300">{idNumber}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {discount ? (
                                            <Badge variant="secondary" className={`${getPrivilegeStatusColor(status)} font-bold`}>
                                                <Percent className="h-3 w-3 mr-1" />
                                                {discount}%
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {issuedDate ? (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-gray-400" />
                                                <span className="text-sm dark:text-gray-300">{formatDate(issuedDate)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {expiryDate ? (
                                            <div className="flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3 text-gray-400" />
                                                <span className={`text-sm ${
                                                    status === 'expired' ? 'text-red-600 dark:text-red-400 font-medium' :
                                                    status === 'expiring_soon' ? 'text-yellow-600 dark:text-yellow-400 font-medium' :
                                                    'dark:text-gray-300'
                                                }`}>
                                                    {formatDate(expiryDate)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(privilege)}
                                    </TableCell>
                                    <TableCell>
                                        {verifiedAt ? (
                                            <div className="flex items-center gap-1">
                                                <BadgeCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(verifiedAt)}
                                                </span>
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                                <ShieldX className="h-3 w-3 mr-1" />
                                                Unverified
                                            </Badge>
                                        )}
                                    </TableCell>
                                    {onRemove && (
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onRemove(privilege.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};