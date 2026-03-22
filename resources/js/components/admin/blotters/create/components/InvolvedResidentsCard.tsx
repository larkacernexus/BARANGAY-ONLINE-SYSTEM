// components/blotter/InvolvedResidentsCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Users, Search, X, User } from 'lucide-react';
import { Resident } from './BlotterTypes';

interface InvolvedResidentsCardProps {
    residents: Resident[];
    selectedResidents: Resident[];
    onToggle: (resident: Resident) => void;
}

export const InvolvedResidentsCard = ({
    residents,
    selectedResidents,
    onToggle
}: InvolvedResidentsCardProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredResidents = residents.filter(resident =>
        resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Users className="h-5 w-5" />
                    Involved Residents
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Select other residents involved in the incident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        placeholder="Search residents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                    />
                </div>
                
                {selectedResidents.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Selected:</Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedResidents.map(resident => (
                                <div 
                                    key={resident.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm"
                                >
                                    <User className="h-3 w-3" />
                                    <span className="truncate max-w-[150px]">{resident.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => onToggle(resident)}
                                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2 dark:border-gray-700">
                    {filteredResidents.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No residents found
                        </p>
                    ) : (
                        filteredResidents.map((resident) => (
                            <div 
                                key={resident.id} 
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                    selectedResidents.some(r => r.id === resident.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                                onClick={() => onToggle(resident)}
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm dark:text-gray-300 truncate">{resident.name}</div>
                                        {resident.address && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {resident.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Checkbox
                                    checked={selectedResidents.some(r => r.id === resident.id)}
                                    onCheckedChange={() => onToggle(resident)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="ml-2 flex-shrink-0"
                                />
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};