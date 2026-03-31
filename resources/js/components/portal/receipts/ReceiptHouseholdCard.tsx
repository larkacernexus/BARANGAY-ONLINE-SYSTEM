// components/residentui/receipts/ReceiptHouseholdCard.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, User, Phone, Mail, Mail as MailIcon } from 'lucide-react';
import { HouseholdData } from '@/types/portal/receipts/receipt.types';

interface ReceiptHouseholdCardProps {
    household: HouseholdData;
    onEmailSummary?: () => void;
}

export const ReceiptHouseholdCard = ({ household, onEmailSummary }: ReceiptHouseholdCardProps) => {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                            <Home className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {household.head_name}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {household.household_number} • {household.address}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {household.contact_number || 'No contact'}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {household.member_count} members
                                </span>
                                {household.email && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {household.email}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {onEmailSummary && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEmailSummary}
                                className="gap-2 rounded-xl"
                            >
                                <MailIcon className="h-4 w-4" />
                                Email Summary
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};