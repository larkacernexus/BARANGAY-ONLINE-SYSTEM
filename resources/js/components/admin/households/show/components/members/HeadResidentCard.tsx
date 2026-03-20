// resources/js/Pages/Admin/Households/Show/components/members/HeadResidentCard.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { User, Crown, ExternalLink } from 'lucide-react';
import { Resident } from '../../types';
import { getPhotoUrl, getFullName } from '../../utils/helpers';
import { PrivilegeIndicators } from '../badges';

interface HeadResidentCardProps {
    resident: Resident;
}

export const HeadResidentCard = ({ resident }: HeadResidentCardProps) => {
    const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);

    return (
        <Link 
            href={route('admin.residents.show', resident.id)}
            className="block hover:no-underline"
        >
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 overflow-hidden flex-shrink-0">
                    {photoUrl ? (
                        <img 
                            src={photoUrl}
                            alt={resident.full_name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold dark:text-gray-200">
                            {resident.full_name}
                        </p>
                        <ExternalLink className="h-3 w-3 text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        <span>{resident.age} years old</span>
                        <span>•</span>
                        <span>{resident.gender}</span>
                        <span>•</span>
                        <span>{resident.civil_status}</span>
                        {resident.occupation && (
                            <>
                                <span>•</span>
                                <span>{resident.occupation}</span>
                            </>
                        )}
                    </div>
                    
                    <PrivilegeIndicators resident={resident} />
                </div>
                <Badge className="ml-auto bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Head
                </Badge>
            </div>
        </Link>
    );
};