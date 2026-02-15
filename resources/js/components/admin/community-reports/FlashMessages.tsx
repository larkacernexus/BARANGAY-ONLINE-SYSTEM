import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface FlashMessagesProps {
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}

export default function FlashMessages({ flash }: FlashMessagesProps) {
    if (!flash) return null;

    return (
        <>
            {flash.success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <div>
                            <p className="text-green-800 font-medium">Success</p>
                            <p className="text-green-700 text-sm mt-1">{flash.success}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash.error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                        <div>
                            <p className="text-red-800 font-medium">Error</p>
                            <p className="text-red-700 text-sm mt-1">{flash.error}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash.warning && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                        <div>
                            <p className="text-yellow-800 font-medium">Warning</p>
                            <p className="text-yellow-700 text-sm mt-1">{flash.warning}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash.info && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <Info className="h-5 w-5 text-blue-400 mr-3" />
                        <div>
                            <p className="text-blue-800 font-medium">Info</p>
                            <p className="text-blue-700 text-sm mt-1">{flash.info}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}