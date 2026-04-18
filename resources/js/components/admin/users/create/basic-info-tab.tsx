// components/admin/users/create/basic-info-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { User, Mail, Phone, Briefcase, Building, Hash, Sparkles, HelpCircle, Shield } from 'lucide-react';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    roles: any[];
    departments: any[];
    selectedRole: any;
    selectedDepartment: any;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onGenerateUsername?: () => void; // Make optional for edit mode
    isSubmitting: boolean;
    user?: any; // Add optional user prop for edit mode
}

export function BasicInfoTab({
    formData,
    errors,
    roles,
    departments,
    selectedRole,
    selectedDepartment,
    onInputChange,
    onSelectChange,
    onGenerateUsername,
    isSubmitting,
    user // Add this parameter
}: BasicInfoTabProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="first_name" className="dark:text-gray-300">
                        First Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={onInputChange}
                            placeholder="Juan"
                            className={`pl-10 ${errors.first_name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.first_name && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="last_name" className="dark:text-gray-300">
                        Last Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={onInputChange}
                            placeholder="Dela Cruz"
                            className={`pl-10 ${errors.last_name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.last_name && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-gray-300">
                        Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={onInputChange}
                            placeholder="juan@example.com"
                            className={`pl-10 ${errors.email ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-1 dark:text-gray-300">
                        Username <span className="text-red-500">*</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger type="button">
                                    <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                    <p>Unique username for login (min. 3 characters)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={onInputChange}
                                placeholder="juan.delacruz"
                                className={`pl-10 ${errors.username ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                disabled={isSubmitting}
                            />
                        </div>
                        {onGenerateUsername && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={onGenerateUsername}
                                disabled={!formData.first_name || !formData.last_name || isSubmitting}
                                title="Generate from name"
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Sparkles className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {errors.username && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="contact_number" className="dark:text-gray-300">Contact Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="contact_number"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={onInputChange}
                            placeholder="09123456789"
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position" className="dark:text-gray-300">Position/Title</Label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={onInputChange}
                            placeholder="Barangay Secretary"
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="department_id" className="dark:text-gray-300">Department</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
                        <Select
                            value={formData.department_id}
                            onValueChange={(value) => onSelectChange('department_id', value)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                <SelectItem value="" className="dark:text-gray-300">No department</SelectItem>
                                {Array.isArray(departments) && departments.map((dept) => (
                                    dept && dept.id && (
                                        <SelectItem key={dept.id} value={dept.id.toString()} className="dark:text-gray-300">
                                            {dept.name}
                                        </SelectItem>
                                    )
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role_id" className="dark:text-gray-300">
                        User Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.role_id}
                        onValueChange={(value) => onSelectChange('role_id', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.role_id ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {Array.isArray(roles) && roles.map((role) => (
                                role && role.id && (
                                    <SelectItem key={role.id} value={role.id.toString()} className="dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            {role.name}
                                        </div>
                                    </SelectItem>
                                )
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.role_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.role_id}</p>
                    )}
                </div>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📝 About User Accounts</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Username will be used for login credentials</li>
                            <li>Role determines default permissions and access level</li>
                            <li>You can assign additional permissions in the next step</li>
                            <li>Department helps organize users by team</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}